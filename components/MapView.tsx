'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Compass, Triangle, Waves, AlertTriangle } from 'lucide-react';
import { FirebaseInfo, FloodStatusConfig } from '@/lib/types';
import { calculateTrigFloodRadius } from '@/lib/firebase-service';

interface MapViewProps {
  info: FirebaseInfo;
  status: FloodStatusConfig;
  waterLevel: number;
}

const DynamicMapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] sm:h-[360px] rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400">
      <Compass className="w-8 h-8 animate-spin mb-2" />
      <span className="text-xs font-medium">Memuat Peta Lokasi & Radius Trigonometri...</span>
    </div>
  ),
});

export const MapView: React.FC<MapViewProps> = ({ info, status, waterLevel }) => {
  const slope = info.kemiringan || 10.5;
  const radiusM = calculateTrigFloodRadius(waterLevel, slope);
  const siagaRadiusM = calculateTrigFloodRadius(20, slope);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      {/* Header Card Peta */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-500" />
          Peta Lokasi & Radius Luapan
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
            <Triangle className="w-3 h-3" />
            Kemiringan: {slope}°
          </span>
          <span className="text-xs font-bold text-white bg-blue-600 px-2.5 py-0.5 rounded-full shadow-xs">
            Radius: {radiusM} meter
          </span>
        </div>
      </div>

      {/* Frame Kontainer Peta dengan Overlay Terapung */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200">
        <DynamicMapInner info={info} status={status} waterLevel={waterLevel} />

        {/* Panel Informasi Mengambang di Dalam Peta */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/80 shadow-md text-xs space-y-1 pointer-events-auto">
          <div className="flex items-center justify-between gap-3 text-slate-500">
            <span>Radius Banjir:</span>
            <strong className="text-sm font-extrabold text-blue-600">{radiusM} m</strong>
          </div>
          <div className="flex items-center justify-between gap-3 text-slate-500">
            <span>Tinggi Air:</span>
            <strong className="text-slate-800">{waterLevel} cm</strong>
          </div>
          <div className="flex items-center justify-between gap-3 text-slate-500">
            <span>Kemiringan:</span>
            <strong className="text-amber-700">{slope}°</strong>
          </div>
          <div className="pt-1 mt-1 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
            R = {waterLevel} × tan({slope}°) × 10
          </div>
        </div>

        {/* Legenda Mengambang di Pojok Kiri Bawah Peta */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/85 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-[10px] space-y-1 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
            <span>Lingkaran Solid: Luapan Saat Ini ({radiusM}m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-400 border-dashed" />
            <span>Garis Kuning: Batas Potensi Siaga ({siagaRadiusM}m)</span>
          </div>
        </div>
      </div>

      {/* Footer Card */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-1.5">
        <span>Wilayah: <strong>{info.region_name}</strong> ({info.latitude}, {info.longitude})</span>
        <span className="text-slate-400 italic">
          Rumus: R = Air ({waterLevel} cm) × tan({slope}°) × 10 = {radiusM}m
        </span>
      </div>
    </div>
  );
};
