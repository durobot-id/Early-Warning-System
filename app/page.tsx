'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { FloodStatusCard } from '@/components/FloodStatusCard';
import { WaterLevelCard } from '@/components/WaterLevelCard';
import { PredictionCard } from '@/components/PredictionCard';
import { WeatherCard } from '@/components/WeatherCard';
import { DeviceStatusCard } from '@/components/DeviceStatusCard';
import { DeviceInfoCard } from '@/components/DeviceInfoCard';
import { MapView } from '@/components/MapView';
import { WaterChart } from '@/components/WaterChart';
import { NotificationHistory } from '@/components/NotificationHistory';
import { CalibrationModal } from '@/components/CalibrationModal';
import { InstallPwaPrompt } from '@/components/InstallPwaPrompt';
import { NotificationPermissionCard } from '@/components/NotificationPermission';

import {
  subscribeToEWSData,
  determineDeviceState,
  EWSAppData,
} from '@/lib/firebase-service';
import { calculateFloodStatus } from '@/lib/status-service';
import { calculatePrediction } from '@/lib/prediction-service';
import { WeatherData } from '@/lib/types';
import { Wrench } from 'lucide-react';

export default function HomePage() {
  // 1. Data State dari Firebase
  const [appData, setAppData] = useState<EWSAppData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);

  // 2. State PWA & Notifikasi
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
  const [isIosDevice, setIsIosDevice] = useState<boolean>(false);
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>('default');
  const [isRegisteringPush, setIsRegisteringPush] = useState<boolean>(false);
  const [isSendingTestPush, setIsSendingTestPush] = useState<boolean>(false);

  // 3. State Kalibrasi
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState<boolean>(false);
  const [calibrationStatus, setCalibrationStatus] = useState<
    'idle' | 'processing' | 'success' | 'failed' | 'timeout'
  >('idle');
  const [calibrationMsg, setCalibrationMsg] = useState<string>('');

  // Setup Listener Firebase Realtime & Service Worker
  useEffect(() => {
    // Daftarkan service worker untuk PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('EWS Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });

      if ('Notification' in window) {
        setNotificationPerm(Notification.permission);
      }

      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIosDevice(isIos);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Subscribe Firebase Realtime Data Aktual
    const unsubscribe = subscribeToEWSData((data) => {
      setAppData(data);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      unsubscribe();
    };
  }, []);

  // Fetch Cuaca BMKG berdasarkan info lokasi dari Firebase
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

  // Handle Permintaan Izin Push Notification
  const handleRequestPushPermission = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Browser ini tidak mendukung Push Notification.');
      return;
    }

    try {
      setIsRegisteringPush(true);
      const permission = await Notification.requestPermission();
      setNotificationPerm(permission);

      if (permission === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        const keyRes = await fetch('/api/push');
        const { publicKey } = await keyRes.json();

        if (publicKey) {
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });

          await fetch('/api/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'subscribe',
              subscription: sub,
            }),
          });
        }
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    } finally {
      setIsRegisteringPush(false);
    }
  };

  // Handle Tes Kirim Push Alert
  const handleSendTestPush = async () => {
    try {
      setIsSendingTestPush(true);
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'broadcast',
          force: true,
          title: '⚠️ Tes Peringatan EWS',
          message: `Sistem EWS ${appData?.info?.region_name || 'Cisarua'} berhasil terhubung ke perangkat Anda!`,
          severity: 'warning',
          water_level_cm: appData?.live?.water_level_cm || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Notifikasi tes berhasil dikirim ke perangkat Anda!');
      }
    } catch (e) {
      alert('Gagal mengirimkan notifikasi tes.');
    } finally {
      setIsSendingTestPush(false);
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } else {
      setShowInstallPrompt(true);
    }
  };

  const handleTriggerCalibration = async () => {
    setCalibrationStatus('processing');
    try {
      const res = await fetch('/api/calibration', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCalibrationStatus('success');
        setCalibrationMsg(data.message || 'Sensor berhasil dikalibrasi!');
      } else {
        setCalibrationStatus('failed');
        setCalibrationMsg(data.message || 'Sensor gagal merespons');
      }
    } catch (err: any) {
      setCalibrationStatus('failed');
      setCalibrationMsg('Gagal menghubungkan ke server kalibrasi');
    }
  };

  // 4. Kalkulasi Data Berdasarkan Realtime Firebase
  const currentWaterLevel = appData?.live?.water_level_cm ?? 0;
  const previousWaterLevel = appData?.previousWaterLevel ?? 0;
  const sensorTimestamp = appData?.live?.updated_at ?? Date.now();
  const deviceState = determineDeviceState(sensorTimestamp);

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

  if (!appData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-600">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-700">Menghubungkan ke Firebase Realtime Database...</p>
        <p className="text-xs text-slate-400 mt-1">Mengambil data live sensor Cisarua</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-slate-50">
      {/* 1. Header */}
      <Header
        isRealtimeConnected={appData.isRealtimeConnected}
        deviceState={deviceState}
        onOpenNotifications={() => {
          const el = document.getElementById('notification-history-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onInstallClick={() => setShowInstallPrompt(true)}
        canInstallPwa={Boolean(deferredPrompt || isIosDevice)}
        unreadCount={appData.notifications.length}
      />

      <main className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        {/* Indikator Status Terhubung ke Firebase Aktual */}
        <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong>Terhubung Realtime ke Firebase:</strong> Memantau sensor <code>{appData.info.region_name}</code> (ADM4: {appData.info.bmkg_adm4})
            </span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
            Live Database
          </span>
        </div>

        {/* 2. Notification Permission Prompt Card */}
        <NotificationPermissionCard
          permission={notificationPerm}
          onRequestPermission={handleRequestPushPermission}
          isLoading={isRegisteringPush}
        />

        {/* 3. Hero Card: Flood Status */}
        <section aria-label="Status Banjir">
          <FloodStatusCard
            status={activeStatus}
            waterLevel={currentWaterLevel}
          />
        </section>

        {/* 4. Grid Ketinggian Air & Prediksi */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <WaterLevelCard
            currentLevel={currentWaterLevel}
            previousLevel={previousWaterLevel}
            timestamp={sensorTimestamp}
            sensorHeight={appData.config.sensor_height_cm}
          />

          <PredictionCard
            prediction={prediction}
            currentLevel={currentWaterLevel}
          />

          <DeviceStatusCard
            deviceState={deviceState}
            live={appData.live}
          />
        </section>

        {/* 5. Grid Cuaca BMKG & Peta Lokasi */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WeatherCard
            weather={weather}
            isLoading={isWeatherLoading}
          />

          <MapView
            info={appData.info}
            status={activeStatus}
            waterLevel={currentWaterLevel}
          />
        </section>

        {/* 6. Grafik Riwayat Ketinggian Air (50 Data Points dari Firebase) */}
        <section aria-label="Grafik Ketinggian Air">
          <WaterChart
            history={appData.history}
            siagaThreshold={
              appData.statuses.find((s) => s.name.toLowerCase().includes('siaga'))?.min_cm || 20
            }
          />
        </section>

        {/* 7. Grid Informasi Alat & Riwayat Notifikasi */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DeviceInfoCard
            info={appData.info}
            live={appData.live}
            config={appData.config}
            deviceState={deviceState}
          />

          <div id="notification-history-section">
            <NotificationHistory
              notifications={appData.notifications}
              onSendTestNotification={handleSendTestPush}
              isSendingTest={isSendingTestPush}
            />
          </div>
        </section>

        {/* 8. Tombol Kalibrasi Sensor Card */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Kalibrasi Sensor Ketinggian
              </h4>
              <p className="text-xs text-slate-500">
                Lakukan penyesuaian titik nol sensor jika terjadi perubahan fisik pada lapangan.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setCalibrationStatus('idle');
              setCalibrationMsg('');
              setIsCalibrationModalOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
          >
            Kalibrasi Sensor
          </button>
        </section>
      </main>

      <CalibrationModal
        isOpen={isCalibrationModalOpen}
        onClose={() => setIsCalibrationModalOpen(false)}
        onConfirm={handleTriggerCalibration}
        status={calibrationStatus}
        statusMessage={calibrationMsg}
      />

      <InstallPwaPrompt
        isOpen={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
        onInstall={handleInstallPwa}
        isIos={isIosDevice}
      />
    </div>
  );
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
