'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
  // FCM Push Notification
  fcmToken: string | null;
  fcmPermission: NotificationPermission | 'unsupported';
  isRequestingFCM: boolean;
  requestNotificationPermission: () => Promise<string | null>;
  foregroundAlert: { title: string; body: string } | null;
  dismissForegroundAlert: () => void;
}

const EWSContext = createContext<EWSContextType | null>(null);

export const EWSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<EWSAppData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);

  // FCM States
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmPermission, setFcmPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isRequestingFCM, setIsRequestingFCM] = useState<boolean>(false);
  const [foregroundAlert, setForegroundAlert] = useState<{ title: string; body: string } | null>(null);

  // Subscribe Firebase Realtime Data & FCM SW Setup
  useEffect(() => {
    // Daftarkan Service Worker PWA & FCM SW
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch((err) => {
        console.warn('FCM SW registration error:', err);
      });
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA SW registration error:', err);
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

    setFcmPermission(Notification.permission);

    // Cek token tersimpan
    try {
      const savedToken = localStorage.getItem('ews_fcm_token');
      if (savedToken) {
        setFcmToken(savedToken);
      }
    } catch (e) {}

    // Pasang listener pesan foreground
    let unsubFCM: (() => void) | null = null;
    onFCMMessage((payload) => {
      console.log('[EWSContext] Foreground FCM message received:', payload);
      const title = payload.notification?.title || payload.data?.title || 'Peringatan EWS';
      const body =
        payload.notification?.body ||
        payload.data?.body ||
        payload.data?.message ||
        'Terdeteksi perubahan status ketinggian air sensor.';

      setForegroundAlert({ title, body });

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch (e) {}
      }
    }).then((unsub) => {
      unsubFCM = unsub;
    });

    return () => {
      if (unsubFCM) unsubFCM();
    };
  }, []);

  // Fungsi Request Izin FCM
  const requestNotificationPermission = async (): Promise<string | null> => {
    setIsRequestingFCM(true);
    try {
      const res = await requestFCMToken();
      if (res.token) {
        setFcmToken(res.token);
        setFcmPermission('granted');
        return res.token;
      } else {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          setFcmPermission(Notification.permission);
        }
        return null;
      }
    } catch (e) {
      console.error('Failed to request notification permission:', e);
      return null;
    } finally {
      setIsRequestingFCM(false);
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
    requestNotificationPermission,
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
