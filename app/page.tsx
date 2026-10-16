'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Waves,
  Download,
  MapPin,
  TrendingUp,
  AlertTriangle,
  PhoneCall,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Activity,
  CloudRain,
} from 'lucide-react';
import { useEWS } from '@/lib/EWSContext';
import { FloodStatusCard } from '@/components/FloodStatusCard';
import { WaterLevelCard } from '@/components/WaterLevelCard';
import { PredictionCard } from '@/components/PredictionCard';
import { WeatherCard } from '@/components/WeatherCard';
import { DeviceStatusCard } from '@/components/DeviceStatusCard';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { InstallPwaPrompt } from '@/components/InstallPwaPrompt';
import { NotificationPermissionCard } from '@/components/NotificationPermission';

export default function HomePage() {
  const {
    appData,
    weather,
    isWeatherLoading,
    activeStatus,
    prediction,
    deviceState,
    currentWaterLevel,
    previousWaterLevel,
    floodRadiusM,
  } = useEWS();

  // PWA State
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);


  if (!appData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-600">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-700">Menghubungkan ke Sistem EWS...</p>
        <p className="text-xs text-slate-400 mt-1">Sinkronisasi data sensor realtime</p>
      </div>
    );
  }

  const sensorTimestamp = appData.live?.updated_at ?? Date.now();
  const regionLabel = appData.info.region_name || 'Wilayah Sensor';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Mobile-First Ringkas */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-xs">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
                  EWS
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">
                  {regionLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Early Warning System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Online Heartbeat */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  deviceState === 'ONLINE'
                    ? 'bg-emerald-500 animate-pulse'
                    : deviceState === 'WARNING'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              <span>{deviceState}</span>
            </div>

            {/* Tombol Install App */}
            <button
              onClick={() => setShowInstallPrompt(true)}
              className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 active:scale-95 transition-all"
              title="Pasang sebagai Aplikasi (PWA)"
              aria-label="Install App"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Beranda: Fokus Bagian Vital */}
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* 1. Banner Peringatan Darurat / Bahaya Otomatis */}
        <EmergencyBanner />

        {/* 2. Hero Card Status Banjir (Paling Penting!) */}
        <section aria-label="Status Banjir Utama">
          <FloodStatusCard
            status={activeStatus}
            waterLevel={currentWaterLevel}
          />
        </section>

        {/* 3. Grid Ketinggian Air & Prediksi Air */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
        </section>

        {/* 4. Banner Pintas Peta & Radius Luapan */}
        <Link
          href="/peta"
          className="block bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Pantauan Geospasial
                </span>
                <h3 className="text-sm font-bold text-white leading-tight">
                  Radius Luapan Air: {floodRadiusM} meter
                </h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Lokasi: {regionLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl border border-white/30 shrink-0">
              <span>Buka Peta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>

        {/* 5. Cuaca BMKG Terdekat */}
        <section aria-label="Prakiraan Cuaca">
          <WeatherCard
            weather={weather}
            isLoading={isWeatherLoading}
          />
        </section>

        {/* 6. Status Hardware & Jaringan */}
        <section aria-label="Status Alat">
          <DeviceStatusCard
            deviceState={deviceState}
            live={appData.live}
          />
        </section>

        {/* 7. Quick Actions Card: Edukasi & Bantuan Darurat */}
        <section className="grid grid-cols-2 gap-2.5">
          <Link
            href="/edukasi"
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Edukasi Bencana</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">7 Video & Mitigasi</p>
            </div>
          </Link>

          <Link
            href="/darurat"
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Kontak Darurat</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Panggilan Darurat 112</p>
            </div>
          </Link>
        </section>

        {/* Pengaturan Izin & Token FCM */}
        <NotificationPermissionCard />
      </main>

      {/* Modal Install PWA */}
      <InstallPwaPrompt
        isOpen={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
        onInstall={() => setShowInstallPrompt(false)}
        isIos={false}
      />
    </div>
  );
}

