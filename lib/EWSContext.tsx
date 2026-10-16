'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  subscribeToEWSData,
  determineDeviceState,
  calculateTrigFloodRadius,
  EWSAppData,
} from './firebase-service';
import { calculateFloodStatus } from './status-service';
import { calculatePrediction } from './prediction-service';
import { WeatherData, PredictionResult, FloodStatusConfig, DeviceOnlineState } from './types';
import { requestFCMToken, onFCMMessage } from './firebase';
import { playAlertSound } from './utils';

interface EWSContextType {
  appData: EWSAppData | null;
  weather: WeatherData | null;
  isWeatherLoading: boolean;
  activeStatus: FloodStatusConfig;
  prediction: PredictionResult;
  deviceState: DeviceOnlineState;
  floodRadiusM: number;
  currentWaterLevel: number;
  previousWaterLevel: number;
  isDangerCondition: boolean;
  dangerReason: string;
  // Push Notification & FCM
  fcmToken: string | null;
  fcmPermission: NotificationPermission | 'unsupported';
  isRequestingFCM: boolean;
  fcmError: string | null;
  requestNotificationPermission: (forceRefresh?: boolean) => Promise<string | null>;
  sendTestAlert: () => Promise<boolean>;
  isSendingTestAlert: boolean;
  testAlertSuccess: boolean;
  foregroundAlert: { title: string; body: string } | null;
  dismissForegroundAlert: () => void;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function registerLocalPushSubscription(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    const res = await fetch('/api/push');
    const { publicKey } = await res.json();
    if (!publicKey) return false;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    if (sub) {
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          subscription: sub,
        }),
      });
      console.log('[WebPush] Perangkat berhasil terdaftar di server laptop!');
      return true;
    }
  } catch (e) {
    console.warn('[WebPush] Register subscription note:', e);
  }
  return false;
}

const EWSContext = createContext<EWSContextType | null>(null);

export const EWSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<EWSAppData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);

  // FCM & Push States
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmPermission, setFcmPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isRequestingFCM, setIsRequestingFCM] = useState<boolean>(false);
  const [fcmError, setFcmError] = useState<string | null>(null);
  const [isSendingTestAlert, setIsSendingTestAlert] = useState<boolean>(false);
  const [testAlertSuccess, setTestAlertSuccess] = useState<boolean>(false);
  const [foregroundAlert, setForegroundAlert] = useState<{ title: string; body: string } | null>(null);

  // Daftarkan Service Worker FCM & PWA
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch((err) => {
        console.warn('FCM SW registration error:', err);
      });
    }

    const unsubscribe = subscribeToEWSData((data) => {
      setAppData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Cek Status Izin Notifikasi & Listener Foreground FCM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      setFcmPermission('unsupported');
      return;
    }

    const currentPerm = Notification.permission;
    setFcmPermission(currentPerm);

    // Cek cache lokal
    try {
      const savedToken = localStorage.getItem('ews_fcm_token');
      if (savedToken) {
        setFcmToken(savedToken);
      }
    } catch (e) {}

    // Jika sudah diizinkan, coba ambil token FCM
    if (currentPerm === 'granted') {
      registerLocalPushSubscription();
      requestFCMToken().then((res) => {
        if (res.token) {
          setFcmToken(res.token);
          setFcmError(null);
          try {
            fetch('https://asia-southeast1-deteksi-banjir-3b39c.cloudfunctions.net/subscribeToFloodAlerts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: res.token }),
            }).catch(() => {});
          } catch (e) {}
        } else if (res.error) {
          setFcmError(res.error);
        }
      });
    }

    // Pasang listener pesan foreground FCM
    let unsubFCM: (() => void) | null = null;
    onFCMMessage((payload) => {
      console.log('[EWSContext] Foreground FCM message received:', payload);
      const title = payload.notification?.title || payload.data?.title || 'Peringatan EWS';
      const body =
        payload.notification?.body ||
        payload.data?.body ||
        payload.data?.message ||
        'Terdeteksi perubahan status ketinggian air sensor.';

      triggerSystemNotification(title, body, true);
    }).then((unsub) => {
      unsubFCM = unsub;
    });

    return () => {
      if (unsubFCM) unsubFCM();
    };
  }, []);

  // Fungsi memicu notifikasi sistem (suara, getar, pop-up browser, dan in-app alert)
  const triggerSystemNotification = async (title: string, body: string, isEmergency: boolean = false) => {
    // 1. Suara Alarm
    playAlertSound(isEmergency);

    // 2. Getaran HP
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(isEmergency ? [400, 200, 400, 200, 600] : [200, 100, 200]);
      } catch (e) {}
    }

    // 3. Notifikasi Sistem Layar / HP
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(title, {
            body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [400, 200, 400, 200, 600],
            tag: isEmergency ? 'ews-danger-alert' : 'ews-test-alert',
            renotify: true,
            data: { url: '/' },
          } as any);
        } catch (e) {
          try {
            new Notification(title, { body, icon: '/icons/icon-192.png' });
          } catch (err) {}
        }
      } else {
        try {
          new Notification(title, { body, icon: '/icons/icon-192.png' });
        } catch (err) {}
      }
    }

    // 4. In-App Banner
    setForegroundAlert({ title, body });
  };

  // Fungsi Request / Refresh Izin Notifikasi
  const requestNotificationPermission = async (forceRefresh: boolean = false): Promise<string | null> => {
    setIsRequestingFCM(true);
    setFcmError(null);
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        setFcmPermission(permission);
        if (permission === 'granted') {
          playAlertSound(false);
          registerLocalPushSubscription();
        }
      }

      const res = await requestFCMToken(forceRefresh);
      if (res.token) {
        setFcmToken(res.token);
        setFcmPermission('granted');
        setFcmError(null);

        // Daftarkan token ke topik flood_alerts di Cloud Function
        try {
          fetch('https://asia-southeast1-deteksi-banjir-3b39c.cloudfunctions.net/subscribeToFloodAlerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: res.token }),
          }).catch(() => {});
        } catch (e) {}

        return res.token;
      } else {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          setFcmPermission(Notification.permission);
        }
        if (res.error) {
          setFcmError(res.error);
        }
        return null;
      }
    } catch (e: any) {
      console.error('Failed to request notification permission:', e);
      setFcmError(e?.message || 'Gagal meminta izin notifikasi');
      return null;
    } finally {
      setIsRequestingFCM(false);
    }
  };

  // Fungsi Kirim Tes Alert
  const sendTestAlert = async (): Promise<boolean> => {
    setIsSendingTestAlert(true);
    setTestAlertSuccess(false);

    try {
      const title = 'Uji Coba Peringatan Dini EWS';
      const body = `Sistem EWS ${appData?.info?.region_name || 'Banjir'} terhubung! Sensor mendeteksi ketinggian ${currentWaterLevel} cm.`;

      await triggerSystemNotification(title, body, false);
      setTestAlertSuccess(true);
      return true;
    } catch (err) {
      console.error('Error triggering test alert:', err);
      return false;
    } finally {
      setIsSendingTestAlert(false);
    }
  };

  const dismissForegroundAlert = () => {
    setForegroundAlert(null);
  };

  // Fetch Cuaca BMKG
  useEffect(() => {
    async function loadWeather() {
      try {
        setIsWeatherLoading(true);
        const lat = appData?.info?.latitude ?? -6.68;
        const lon = appData?.info?.longitude ?? 106.9383;
        const region = appData?.info?.region_name ?? 'Cisarua';
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&region=${encodeURIComponent(region)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setWeather(json.data);
        }
      } catch (err) {
        console.error('Failed to load BMKG weather:', err);
      } finally {
        setIsWeatherLoading(false);
      }
    }

    if (appData) {
      loadWeather();
    }
  }, [appData?.info?.latitude, appData?.info?.longitude, appData?.info?.region_name]);

  const currentWaterLevel = appData?.live?.water_level_cm ?? 0;
  const previousWaterLevel = appData?.previousWaterLevel ?? 0;
  const sensorTimestamp = appData?.live?.updated_at ?? Date.now();
  const deviceState = determineDeviceState(sensorTimestamp);
  const slope = appData?.info?.kemiringan ?? 10.5;

  const floodRadiusM = useMemo(() => {
    return calculateTrigFloodRadius(currentWaterLevel, slope);
  }, [currentWaterLevel, slope]);

  const activeStatus = useMemo(() => {
    return calculateFloodStatus(currentWaterLevel, appData?.statuses);
  }, [currentWaterLevel, appData?.statuses]);

  const prediction = useMemo(() => {
    return calculatePrediction({
      currentWaterLevel,
      history: appData?.history ?? [],
      weather,
      isDeviceOnline: deviceState !== 'OFFLINE',
    });
  }, [currentWaterLevel, appData?.history, weather, deviceState]);

  // Evaluasi Kondisi Bahaya
  const { isDangerCondition, dangerReason } = useMemo(() => {
    const statusName = (activeStatus.name || '').toLowerCase();
    const isStatusCritical =
      statusName.includes('siaga') ||
      statusName.includes('bahaya') ||
      statusName.includes('evakuasi') ||
      currentWaterLevel >= 20;

    if (isStatusCritical) {
      return {
        isDangerCondition: true,
        dangerReason: `Status alat saat ini "${activeStatus.name}" dengan ketinggian ${currentWaterLevel} cm. Potensi luapan luas segera!`,
      };
    }

    // Cek potensi kenaikan dari prediksi
    if (prediction.isAvailable && prediction.predictedLevelCm >= 20 && prediction.direction === 'up') {
      return {
        isDangerCondition: true,
        dangerReason: `Peringatan! Prediksi menunjukkan air diperkirakan naik ke ${prediction.predictedLevelCm} cm (mencapai batas Siaga) dalam waktu ±${prediction.hoursAhead} jam.`,
      };
    }

    return { isDangerCondition: false, dangerReason: '' };
  }, [activeStatus, currentWaterLevel, prediction]);

  // PEMANTAUAN OTOMATIS: Berdering & Notifikasi saat sensor mendeteksi bahaya/siaga
  const lastAlarmRef = useRef<{ isDanger: boolean; level: number; lastFiredTime: number } | null>(null);

  useEffect(() => {
    if (!appData) return;

    if (!lastAlarmRef.current) {
      lastAlarmRef.current = {
        isDanger: isDangerCondition,
        level: currentWaterLevel,
        lastFiredTime: isDangerCondition ? Date.now() : 0,
      };
      return;
    }

    const prev = lastAlarmRef.current;
    const now = Date.now();
    const enteredDanger = !prev.isDanger && isDangerCondition;
    const waterRoseInDanger = isDangerCondition && currentWaterLevel > prev.level;
    const cooldownPassed = now - prev.lastFiredTime > 3 * 60 * 1000; // 3 menit cooldown

    if (enteredDanger || (waterRoseInDanger && cooldownPassed)) {
      triggerSystemNotification(
        `Peringatan Dini: Status ${activeStatus.name} (${currentWaterLevel} cm)`,
        dangerReason || `Ketinggian air naik ke ${currentWaterLevel} cm. Harap waspada dan siaga!`,
        true
      );

      // Kirim push notification ke seluruh HP terdaftar via WebPush server lokal
      try {
        fetch('/api/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'broadcast',
            title: `Peringatan Dini: Status ${activeStatus.name} (${currentWaterLevel} cm)`,
            message: dangerReason || `Ketinggian air naik ke ${currentWaterLevel} cm. Harap waspada dan siaga!`,
            severity: 'danger',
            water_level_cm: currentWaterLevel,
            force: true,
          }),
        }).catch((e) => console.warn('[EWSContext] push broadcast error:', e));
      } catch (err) {}

      lastAlarmRef.current = {
        isDanger: isDangerCondition,
        level: currentWaterLevel,
        lastFiredTime: now,
      };
    } else {
      lastAlarmRef.current.isDanger = isDangerCondition;
      lastAlarmRef.current.level = currentWaterLevel;
    }
  }, [isDangerCondition, currentWaterLevel, activeStatus.name, dangerReason, appData]);

  const value = {
    appData,
    weather,
    isWeatherLoading,
    activeStatus,
    prediction,
    deviceState,
    floodRadiusM,
    currentWaterLevel,
    previousWaterLevel,
    isDangerCondition,
    dangerReason,
    fcmToken,
    fcmPermission,
    isRequestingFCM,
    fcmError,
    requestNotificationPermission,
    sendTestAlert,
    isSendingTestAlert,
    testAlertSuccess,
    foregroundAlert,
    dismissForegroundAlert,
  };

  return <EWSContext.Provider value={value}>{children}</EWSContext.Provider>;
};

export function useEWS(): EWSContextType {
  const context = useContext(EWSContext);
  if (!context) {
    throw new Error('useEWS must be used within an EWSProvider');
  }
  return context;
}
