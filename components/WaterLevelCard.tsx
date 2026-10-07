'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Minus, Activity, Radio } from 'lucide-react';
import { formatRelativeTimeID } from '@/lib/utils';

interface WaterLevelCardProps {
  currentLevel: number;
  previousLevel: number;
  timestamp: number;
  sensorHeight?: number;
}

export const WaterLevelCard: React.FC<WaterLevelCardProps> = ({
  currentLevel,
  previousLevel,
  timestamp,
  sensorHeight,
}) => {
  const delta = Math.round((currentLevel - previousLevel) * 10) / 10;
  const isUp = delta > 0.05;
  const isDown = delta < -0.05;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Ketinggian Air
        </span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      <div className="my-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {currentLevel}
          </span>
          <span className="text-lg font-bold text-slate-500">cm</span>
        </div>

        {/* Delta change */}
        <div className="mt-2 flex items-center gap-2">
          {isUp && (
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              +{delta} cm
            </span>
          )}
          {isDown && (
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              {delta} cm
            </span>
          )}
          {!isUp && !isDown && (
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              <Minus className="w-3.5 h-3.5" />
              Stabil
            </span>
          )}
          <span className="text-xs text-slate-400">dari data sebelumnya</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{formatRelativeTimeID(timestamp)}</span>
        {sensorHeight && (
          <span className="text-slate-400">Tinggi Sensor: {sensorHeight} cm</span>
        )}
      </div>
    </div>
  );
};
