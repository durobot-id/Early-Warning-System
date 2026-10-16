'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Compass, ShieldAlert, Waves } from 'lucide-react';
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
    <div className="w-full h-[320px] sm:h-[380px] rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400">
      <Compass className="w-8 h-8 animate-spin mb-2" />
      <span className="text-xs font-medium">Memuat Peta Lokasi & Radius...</span>
    </div>
  ),
});

export const MapView: React.FC<MapViewProps> = ({ info, status, waterLevel }) => {
  const slope = info.kemiringan || 10.5;
  const radiusM = calculateTrigFloodRadius(waterLevel, slope);
  const siagaRadiusM = calculateTrigFloodRadius(20, slope);
  const regionLabel = info.region_name || 'Wilayah Sensor';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
      {/* Header Card Peta */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-600" />
          Peta Lokasi & Radius Luapan
        </h3>
        <span className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full shadow-xs">
          Radius: {radiusM} meter
        </span>
      </div>

      {/* Frame Kontainer Peta dengan Overlay Terapung */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200">
        <DynamicMapInner info={info} status={status} waterLevel={waterLevel} />

        {/* Panel Informasi Mengambang di Dalam Peta */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 shadow-md text-xs space-y-1.5 pointer-events-auto">
          <div className="flex items-center justify-between gap-4 text-slate-500">
            <span>Radius Luapan:</span>
            <strong className="text-sm font-black text-blue-600">{radiusM} m</strong>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-500">
            <span>Tinggi Air:</span>
            <strong className="text-slate-800">{waterLevel} cm</strong>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-500">
            <span>Status:</span>
            <strong className="font-bold" style={{ color: status.color || '#2196F3' }}>
              {status.name}
            </strong>
          </div>
        </div>

        {/* Legenda Mengambang di Pojok Kiri Bawah Peta */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-[10px] space-y-1 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
            <span>Area Luapan Saat Ini ({radiusM}m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-400 border-dashed" />
            <span>Batas Siaga ({siagaRadiusM}m)</span>
          </div>
        </div>
      </div>

      {/* Footer Card */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-1.5">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Lokasi: <strong>{regionLabel}</strong> ({info.latitude}, {info.longitude})</span>
        </span>
        <span className="text-slate-400">
          Radius luapan air dihitung otomatis mengikuti elevasi lapangan
        </span>
      </div>
    </div>
  );
};
