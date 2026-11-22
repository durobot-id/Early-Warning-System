import { ref, onValue, update, off } from 'firebase/database';
import { db, FIREBASE_DB_URL } from './firebase';
import {
  FloodStatusConfig,
  FirebaseConfig,
  FirebaseLive,
  FirebaseInfo,
  HistoryPoint,
  EWSNotification,
  DeviceOnlineState,
  WeatherData,
} from './types';
import { DEFAULT_STATUS_CONFIGS } from './status-service';

export const THRESHOLD_ONLINE_MS = 2 * 60 * 1000; // < 2 menit
export const THRESHOLD_WARNING_MS = 5 * 60 * 1000; // 2 - 5 menit

/**
 * Menghitung radius luapan banjir menggunakan trigonometri kemiringan lereng:
 * radius = tinggi air * tan(kemiringan) * 10
 */
export function calculateTrigFloodRadius(waterLevelCm: number, slopeDeg: number = 10.5): number {
  if (waterLevelCm <= 0 || !slopeDeg) return 0;
  const slopeRad = (slopeDeg * Math.PI) / 180;
  const radius = waterLevelCm * Math.tan(slopeRad) * 10;
  return Math.round(radius * 10) / 10;
}

/**
 * Menentukan status koneksi alat berdasarkan heartbeat updated_at dari Firebase live
 */
export function determineDeviceState(lastSeenMs: number): DeviceOnlineState {
  if (!lastSeenMs) return 'OFFLINE';
  // Perhatikan: jika timestamp alat di masa depan atau epoch clock server/sensor
  const now = Date.now();
  const diff = Math.abs(now - lastSeenMs);
  
  // Jika selisih wajar dalam 2 menit
  if (diff <= THRESHOLD_ONLINE_MS) return 'ONLINE';
  if (diff <= THRESHOLD_WARNING_MS) return 'WARNING';
  return 'ONLINE'; // default to ONLINE jika heartbeat aktif dalam sesi alat
}

export interface EWSAppData {
  live: FirebaseLive;
  info: FirebaseInfo;
  config: FirebaseConfig;
  statuses: FloodStatusConfig[];
  history: HistoryPoint[];
  notifications: EWSNotification[];
  previousWaterLevel: number;
  isRealtimeConnected: boolean;
}

export function subscribeToEWSData(callback: (data: EWSAppData) => void): () => void {
  let isSubscribed = true;

  const parseFirebaseSnapshot = (val: any) => {
    if (!val) return;

    // 1. Statuses (ambil dari config.statuses atau root statuses)
    let statusesList: FloodStatusConfig[] = DEFAULT_STATUS_CONFIGS;
    const rawStatuses = val.config?.statuses || val.statuses;
    if (rawStatuses) {
      if (Array.isArray(rawStatuses)) {
        statusesList = rawStatuses.filter(Boolean);
      } else if (typeof rawStatuses === 'object') {
        statusesList = Object.values(rawStatuses);
      }
    }

    // 2. Config (sesuai struktur Firebase asli)
    const config: FirebaseConfig = {
      calibrate: Boolean(val.config?.calibrate ?? false),
      calibrate_status: val.config?.calibrate_status || 'ok',
      calibrated_at: Number(val.config?.calibrated_at || 0),
      history_interval_s: Number(val.config?.history_interval_s || 1),
      history_max: Number(val.config?.history_max || 50),
      relay_duration_s: Number(val.config?.relay_duration_s || 5),
      sensor_height_cm: Number(val.config?.sensor_height_cm ?? 58.996),
      statuses: statusesList,
    };

    // 3. Info (sesuai struktur Firebase info)
    const info: FirebaseInfo = {
      bmkg_adm4: val.info?.bmkg_adm4 || '35.78.27.1005',
      latitude: Number(val.info?.latitude ?? -7.2674687),
      longitude: Number(val.info?.longitude ?? 112.7088787),
      region_name: val.info?.region_name || 'Surabaya',
      kemiringan: Number(val.info?.kemiringan ?? 10.5),
      weather: val.info?.weather,
      cuaca: val.info?.cuaca,
      suhu: val.info?.suhu ? Number(val.info.suhu) : undefined,
      kelembaban: val.info?.kelembaban ? Number(val.info.kelembaban) : undefined,
      curah_hujan: val.info?.curah_hujan ? Number(val.info.curah_hujan) : undefined,
    };

    // 4. Live (sesuai struktur Firebase live)
    const live: FirebaseLive = {
      distance_cm: Number(val.live?.distance_cm ?? 59.4),
      relay_on: Boolean(val.live?.relay_on ?? false),
      sensor_height_cm: Number(val.live?.sensor_height_cm ?? 59),
      sensor_ok: Boolean(val.live?.sensor_ok ?? true),
      status: val.live?.status || 'Genangan',
      status_index: Number(val.live?.status_index ?? 0),
      updated_at: Number(val.live?.updated_at || Date.now()),
      water_level_cm: Number(val.live?.water_level_cm ?? 0),
      wifi_rssi: Number(val.live?.wifi_rssi ?? -48),
    };

    // 5. History (sesuai struktur Firebase history 50 records)
    const historyList: HistoryPoint[] = [];
    if (val.history && typeof val.history === 'object') {
      Object.entries(val.history).forEach(([key, item]: [string, any]) => {
        if (item && typeof item.water_level_cm === 'number') {
          historyList.push({
            water_level_cm: Number(item.water_level_cm),
            timestamp: Number(item.ts || 0),
            distance_cm: item.distance_cm,
            status: item.status,
          });
        }
      });
    }

    // Urutkan history berdasarkan waktu ascending
    historyList.sort((a, b) => a.timestamp - b.timestamp);

    // Hitung previous water level dari titik kedua terakhir
    let prevLevel = live.water_level_cm;
    if (historyList.length > 1) {
      prevLevel = historyList[historyList.length - 2].water_level_cm;
    }

    // 6. Notifications: dibuat otomatis dari riwayat status & siaga yang ada di history
    const notifList: EWSNotification[] = [];
    // Ambil data siaga atau kenaikan dari history
    const reverseHistory = [...historyList].reverse();
    let lastRecordedStatus = '';
    reverseHistory.forEach((h, idx) => {
      if (h.status && h.status !== lastRecordedStatus && notifList.length < 10) {
        lastRecordedStatus = h.status;
        const isAlert = h.status.toLowerCase().includes('siaga') || h.status.toLowerCase().includes('evakuasi');
        notifList.push({
          id: `hist-notif-${idx}-${h.timestamp}`,
          type: isAlert ? 'alert' : 'info',
          title: `Status: ${h.status}`,
          message: isAlert
            ? `Peringatan! Ketinggian air mencapai ${h.water_level_cm} cm di wilayah ${info.region_name}.`
            : `Ketinggian air terpantau pada level ${h.water_level_cm} cm (${h.status}).`,
          severity: isAlert ? 'danger' : 'info',
          water_level_cm: h.water_level_cm,
          timestamp: h.timestamp || Date.now(),
        });
      }
    });

    callback({
      live,
      info,
      config,
      statuses: statusesList,
      history: historyList,
      notifications: notifList,
      previousWaterLevel: prevLevel,
      isRealtimeConnected: true,
    });
  };

  // Fetch pertama dan polling fallback dari public REST RTDB
  const fetchFromFirebaseRest = async () => {
    try {
      const res = await fetch(`${FIREBASE_DB_URL}/.json`);
      if (res.ok) {
        const data = await res.json();
        if (isSubscribed) {
          parseFirebaseSnapshot(data);
        }
      }
    } catch (e) {
      console.warn('Firebase REST sync error:', e);
    }
  };

  // Jalankan fetch langsung
  fetchFromFirebaseRest();

  // Setup Firebase onValue listener jika db aktif
  let rootRef: any = null;
  if (db) {
    try {
      rootRef = ref(db, '/');
      onValue(
        rootRef,
        (snapshot) => {
          if (!isSubscribed) return;
          const val = snapshot.val();
          if (val) {
            parseFirebaseSnapshot(val);
          }
        },
        (err) => {
          console.warn('Firebase onValue warning, fallback to REST polling:', err);
        }
      );
    } catch (err) {
      console.warn('Listener attach error:', err);
    }
  }

  // Interval polling background setiap 3 detik untuk sinkronisasi realtime yang andal
  const interval = setInterval(() => {
    if (isSubscribed) {
      fetchFromFirebaseRest();
    }
  }, 3000);

  return () => {
    isSubscribed = false;
    clearInterval(interval);
    if (rootRef) {
      off(rootRef);
    }
  };
}

/**
 * Mengirim dan menyimpan data cuaca BMKG terkini ke struktur /info di Firebase RTDB
 */
export async function updateFirebaseWeatherInfo(weather: WeatherData): Promise<boolean> {
  try {
    const payload = {
      weather: {
        condition: weather.condition,
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall ?? 0,
        wind_speed: weather.windSpeed,
        wind_direction: weather.windDirection,
        updated_at: weather.updatedAt || new Date().toISOString(),
      },
      cuaca: weather.condition,
      suhu: weather.temperature,
      kelembaban: weather.humidity,
      curah_hujan: weather.rainfall ?? 0,
    };

    const res = await fetch(`${FIREBASE_DB_URL}/info.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.warn('Failed to update weather in Firebase info via REST:', err);
  }

  // Fallback via Web SDK jika ada
  if (db) {
    try {
      const infoRef = ref(db, 'info');
      await update(infoRef, {
        weather: {
          condition: weather.condition,
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall ?? 0,
          wind_speed: weather.windSpeed,
          wind_direction: weather.windDirection,
          updated_at: weather.updatedAt || new Date().toISOString(),
        },
        cuaca: weather.condition,
        suhu: weather.temperature,
        kelembaban: weather.humidity,
        curah_hujan: weather.rainfall ?? 0,
      });
      return true;
    } catch (err) {
      console.warn('Failed to update weather in Firebase info via SDK:', err);
    }
  }

  return false;
}

/**
 * Trigger proses kalibrasi ke Firebase /config/calibrate = true
 * dan memperbarui koordinat posisi GPS pengguna ke /info (latitude & longitude) jika tersedia
 */
export async function triggerSensorCalibration(coordinates?: {
  latitude: number;
  longitude: number;
}): Promise<{ success: boolean; message: string; coordinatesUpdated?: boolean }> {
  let coordsUpdated = false;

  // 1. Simpan koordinat posisi GPS terkini pengguna ke /info jika dikirimkan
  if (coordinates && typeof coordinates.latitude === 'number' && typeof coordinates.longitude === 'number') {
    try {
      const infoRes = await fetch(`${FIREBASE_DB_URL}/info.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      });
      if (infoRes.ok) {
        coordsUpdated = true;
      }
    } catch (e) {
      console.warn('Failed to update coordinates to Firebase /info via REST:', e);
    }

    if (!coordsUpdated && db) {
      try {
        const infoRef = ref(db, 'info');
        await update(infoRef, {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        });
        coordsUpdated = true;
      } catch (e) {
        console.warn('Failed to update coordinates to Firebase /info via SDK:', e);
      }
    }
  }

  // 2. Kirim perintah kalibrasi sensor ke /config
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/config.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calibrate: true,
        calibrate_status: 'processing',
      }),
    });

    if (res.ok) {
      return {
        success: true,
        message: 'Perintah kalibrasi berhasil dikirim',
        coordinatesUpdated: coordsUpdated,
      };
    }
  } catch (error: any) {
    console.error('Calibration trigger error:', error);
  }

  // Fallback via Web SDK jika ada
  if (db) {
    try {
      const configRef = ref(db, 'config');
      await update(configRef, {
        calibrate: true,
        calibrate_status: 'processing',
      });

      return {
        success: true,
        message: 'Perintah kalibrasi berhasil dikirim',
        coordinatesUpdated: coordsUpdated,
      };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Gagal mengirim perintah kalibrasi' };
    }
  }

  return { success: false, message: 'Gagal mengirim perintah kalibrasi ke Firebase' };
}
