'use client';

import React from 'react';
import { Map, MapPin, Compass, Shield, Activity, Waves } from 'lucide-react';
import { useEWS } from '@/lib/EWSContext';
import { MapView } from '@/components/MapView';

export default function PetaPage() {
  const { appData, activeStatus, currentWaterLevel, floodRadiusM } = useEWS();

  if (!appData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-600">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-700">Memuat Peta Pemantauan...</p>
      </div>
    );
  }

  const regionLabel = appData.info.region_name || 'Wilayah Sensor';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Halaman */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">
                Peta & Radius Banjir
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Pemantauan Lokasi & Estimasi Luapan Air
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-white bg-blue-600 px-3 py-1 rounded-full shadow-xs">
            {floodRadiusM} meter
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Peta Utama */}
        <section aria-label="Peta Interaktif">
          <MapView
            info={appData.info}
            status={activeStatus}
            waterLevel={currentWaterLevel}
          />
        </section>

        {/* Ringkasan Parameter Pantauan Area */}
        <section className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            Ringkasan Cakupan Wilayah
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Wilayah Pantau</span>
              <strong className="text-slate-800 text-sm block mt-0.5 truncate">{regionLabel}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Radius Luapan Air</span>
              <strong className="text-blue-600 text-sm block mt-0.5">{floodRadiusM} meter</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Tinggi Air Saat Ini</span>
              <strong className="text-slate-800 text-sm block mt-0.5">{currentWaterLevel} cm</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Status Banjir</span>
              <strong
                className="text-sm block mt-0.5 font-bold"
                style={{ color: activeStatus.color || '#2196F3' }}
              >
                {activeStatus.name}
              </strong>
            </div>
          </div>
        </section>

        {/* Informasi Koordinat Titik Alat */}
        <section className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs space-y-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-slate-600" />
            Koordinat Geografis Alat
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Latitude</span>
              <strong className="text-slate-800 font-mono">{appData.info.latitude}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Longitude</span>
              <strong className="text-slate-800 font-mono">{appData.info.longitude}</strong>
            </div>
          </div>
          {appData.info.bmkg_adm4 && (
            <p className="text-[11px] text-slate-400">
              Kode Wilayah BMKG: <span className="font-mono text-slate-600 font-semibold">{appData.info.bmkg_adm4}</span>
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
