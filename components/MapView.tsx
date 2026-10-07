'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Compass, Triangle } from 'lucide-react';
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
    <div className="w-full h-[280px] sm:h-[340px] rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400">
      <Compass className="w-8 h-8 animate-spin mb-2" />
      <span className="text-xs font-medium">Memuat Peta Lokasi & Radius Trigonometri...</span>
    </div>
  ),
});

export const MapView: React.FC<MapViewProps> = ({ info, status, waterLevel }) => {
  const slope = info.kemiringan || 10.5;
  const radiusM = calculateTrigFloodRadius(waterLevel, slope);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
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
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
            Radius: {radiusM} meter
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200">
        <DynamicMapInner info={info} status={status} waterLevel={waterLevel} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-1.5">
        <span>Wilayah: <strong>{info.region_name}</strong> ({info.latitude}, {info.longitude})</span>
        <span className="text-slate-400 italic">
          Rumus: R = Air ({waterLevel} cm) × tan({slope}°) = {radiusM}m
        </span>
      </div>
    </div>
  );
};
