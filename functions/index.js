const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp({
  databaseURL: "https://deteksi-banjir-3b39c-default-rtdb.asia-southeast1.firebasedatabase.app"
});

/**
 * 1. Endpoint HTTP untuk mendaftarkan token HP pengguna ke topik 'flood_alerts'
 * Semua HP yang subscribe ke topik ini akan menerima push saat sensor mendeteksi bahaya.
 */
exports.subscribeToFloodAlerts = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    // CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: "FCM token is required" });
    }

    try {
      const response = await admin.messaging().subscribeToTopic(token, "flood_alerts");
      console.log(`[FCM] Token berhasil didaftarkan ke topik 'flood_alerts':`, response);
      return res.status(200).json({ success: true, message: "Berhasil mendaftar ke topik peringatan darurat", response });
    } catch (error) {
      console.error("[FCM] Gagal mendaftarkan token ke topik:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

/**
 * 2. Trigger Otomatis saat Ketinggian Air Berubah di Firebase Realtime Database
 * Berjalan otomatis 24 jam di server Google tanpa perlu HP atau laptop membuka web!
 */
exports.onWaterLevelChange = functions
  .region("asia-southeast1")
  .database.instance("deteksi-banjir-3b39c-default-rtdb")
  .ref("/live/water_level_cm")
  .onUpdate(async (change, context) => {
    const beforeLevel = change.before.val() || 0;
    const afterLevel = change.after.val() || 0;

    console.log(`[EWS Watcher] Perubahan ketinggian air: ${beforeLevel} cm -> ${afterLevel} cm`);

    // Batas bahaya: air >= 20 cm
    const isNowDanger = afterLevel >= 20;
    const wasDanger = beforeLevel >= 20;

    // Trigger notifikasi jika:
    // a. Baru saja memasuki batas bahaya (sebelumnya < 20, sekarang >= 20)
    // b. Atau air terus naik di atas kondisi bahaya (kenaikan >= 5 cm dari level sebelumnya)
    const enteredDanger = isNowDanger && !wasDanger;
    const roseSignificantlyInDanger = isNowDanger && (afterLevel - beforeLevel >= 5);

    if (enteredDanger || roseSignificantlyInDanger) {
      console.log(`[ALERT] Air meluap ke level ${afterLevel} cm! Menyiarkan push notification ke seluruh HP...`);

      // Ambil nama wilayah dari database jika tersedia
      let regionName = "Wilayah Pantauan";
      try {
        const infoSnap = await admin.database().ref("/info/region_name").once("value");
        if (infoSnap.exists() && infoSnap.val()) {
          regionName = infoSnap.val();
        }
      } catch (e) {
        console.warn("Gagal membaca region_name:", e);
      }

      const message = {
        topic: "flood_alerts",
        notification: {
          title: `PERINGATAN BANJIR: ${regionName.toUpperCase()}`,
          body: `Debit air terdeteksi naik ke ${afterLevel} cm! Harap waspada dan segera amankan barang berharga ke tempat tinggi.`,
        },
        data: {
          url: "/",
          level: String(afterLevel),
          timestamp: String(Date.now()),
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            priority: "max",
            channelId: "flood_alerts_channel",
          },
        },
        webpush: {
          headers: {
            Urgency: "high",
          },
          notification: {
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            vibrate: [400, 200, 400, 200, 600],
            requireInteraction: true,
          },
        },
      };

      try {
        const sendResult = await admin.messaging().send(message);
        console.log("[FCM Broadcast Sukses] Push notification terkirim ke semua perangkat:", sendResult);
      } catch (err) {
        console.error("[FCM Broadcast Gagal] Terjadi kesalahan pengiriman:", err);
      }
    }
  });
