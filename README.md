# EWS — Early Warning System (PWA)

Aplikasi web dan Progressive Web App (PWA) **Early Warning System (EWS)** untuk pemantauan ketinggian air dan sistem peringatan dini potensi banjir secara realtime berbasis **Next.js**, **Firebase Realtime Database**, data meteorologi **BMKG**, dan **Web Push Notifications**.

---

## 🌟 Fitur Utama

1. **Pemantauan Realtime**:
   - Terhubung langsung dengan Firebase Realtime Database (`onValue` listener).
   - Indikator ketinggian air terkini dengan kalkulasi selisih kenaikan/penurunan (cm).
   - Data freshness realtime (indikator LIVE & relative time).

2. **Status Banjir Dinamis**:
   - Status otomatis dihitung dari konfigurasi Firebase `/statuses`:
     - `Genangan` (0 cm)
     - `Terkendali` (10 cm)
     - `Siaga` (20 cm, animasi pulse)
   - Warna dan ikon status mengikuti konfigurasi database.

3. **Prediksi Tren Ketinggian Air**:
   - Model MVP berbasis tren time-series statistik dikombinasikan dengan ramalan cuaca BMKG.
   - Menghasilkan arah pergerakan (*Naik / Turun / Stabil*), estimasi perubahan cm dalam 2 jam ke depan, dan tingkat kepercayaan (*Confidence %*).
   - Fallback otomatis jika data belum mencukupi atau sensor offline.

4. **Prakiraan Cuaca BMKG**:
   - Mengambil data meteorologi berdasarkan koordinat sensor.
   - Diproses via endpoint server-side `/api/weather` dengan in-memory caching untuk mencegah CORS & rate-limiting.
   - Menampilkan kondisi, temperatur, kelembaban, kecepatan/arah angin, dan estimasi jam berikutnya.

5. **Peta Interaktif & Radius Bahaya**:
   - Peta Leaflet + OpenStreetMap (SSR safe).
   - Menampilkan pin lokasi sensor dan lingkaran radius potensi banjir (500 meter).

6. **Grafik Historis Interaktif**:
   - Line chart responsif berbasis Recharts.
   - Filter rentang waktu: 1 Jam, 3 Jam, 6 Jam, 12 Jam, 24 Jam.
   - Garis penanda ambang batas Siaga.

7. **Progressive Web App (PWA) & Web Push**:
   - Dapat di-install ke layar utama ponsel (Android / iOS) atau desktop.
   - Menggunakan Service Worker (`public/sw.js`) dan Push API dengan VAPID keys.
   - Dilengkapi sistem anti-spam cooldown (15 menit) untuk notifikasi siaga.

8. **Kalibrasi Sensor**:
   - Modal konfirmasi kalibrasi.
   - Memperbarui `/config/calibrate = true` di Firebase dengan pelacakan status (`idle`, `processing`, `ok`, `failed`).

---

## 🚀 Memulai Proyek Secara Lokal

### 1. Prasyarat
- **Node.js**: Versi 18+ atau 20+
- **NPM**: Versi 9+

### 2. Konfigurasi Environment Variables
Salin file `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel kredensial Firebase Anda:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

> **Catatan:** Jika variabel Firebase dibiarkan kosong, aplikasi otomatis berjalan dalam **Mode Simulasi Realtime** sehingga Anda tetap dapat meninjau antarmuka, grafik dinamis, peta, dan seluruh fungsionalitas UI.

### 3. Menjalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 4. Build untuk Production
```bash
npm run build
npm run start
```

---

## ☁️ Deployment ke Vercel

1. Push kode ke repository GitHub.
2. Buka dashboard [Vercel](https://vercel.com) dan impor repository proyek ini.
3. Masukkan seluruh variabel lingkungan dari `.env.local` pada menu **Project Settings → Environment Variables**.
4. Klik **Deploy**.

---

## 📂 Struktur Database Firebase yang Didukung

```text
/
├── config/
│   ├── calibrate: false
│   ├── calibrate_status: "ok"
│   ├── calibrated_at: 1775573400000
│   ├── history_interval_s: 1
│   ├── history_max: 50
│   ├── relay_duration_s: 5
│   └── sensor_height_cm: 58.996
│
├── statuses/
│   ├── 0: { name: "Genangan", min_cm: 0, color: "#2196F3", icon: "drop", blink: false }
│   ├── 1: { name: "Terkendali", min_cm: 10, color: "#4CAF50", icon: "check", blink: false }
│   └── 2: { name: "Siaga", min_cm: 20, color: "#FFD600", icon: "warning", blink: true }
│
├── device/
│   ├── id: "EWS-001"
│   ├── name: "EWS Malang 01"
│   ├── online: true
│   ├── last_seen: 1775573400000
│   ├── network: "WiFi"
│   ├── signal_strength: -62
│   ├── latitude: -7.9826
│   ├── longitude: 112.6308
│   ├── region: "Malang"
│   └── flood_radius_m: 500
│
├── sensor/
│   ├── water_level_cm: 15.4
│   └── timestamp: 1775573400000
│
├── history/
│   └── [timestamp_key]: { water_level_cm: 15.4, timestamp: 1775573400000 }
│
└── notifications/
    └── [notification_id]: { id, type, title, message, severity, water_level_cm, timestamp }
```
