'use client';

import React from 'react';
import { FloodStatusConfig } from '@/lib/types';
import { getStatusDescription } from '@/lib/status-service';
import { AlertTriangle, CheckCircle2, Droplets, ShieldAlert, AlertOctagon } from 'lucide-react';

interface FloodStatusCardProps {
  status: FloodStatusConfig;
  waterLevel: number;
}

export const FloodStatusCard: React.FC<FloodStatusCardProps> = ({ status, waterLevel }) => {
  const getIcon = () => {
    const iconKey = (status.icon || '').toLowerCase();
    const nameKey = (status.name || '').toLowerCase();

    if (iconKey.includes('warn') || nameKey.includes('siaga') || nameKey.includes('waspada')) {
      return <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />;
    }
    if (iconKey.includes('check') || nameKey.includes('terkendali') || nameKey.includes('aman')) {
      return <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />;
    }
    if (iconKey.includes('drop') || nameKey.includes('genangan')) {
      return <Droplets className="w-8 h-8 sm:w-10 sm:h-10 text-white" />;
    }
    return <AlertOctagon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />;
  };

  const isBlinking = Boolean(status.blink);
  const color = status.color || '#2196F3';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white shadow-sm transition-all duration-300 ${
        isBlinking ? 'animate-alert-pulse ring-4 ring-amber-400/40' : ''
      }`}
      style={{
        backgroundColor: color,
      }}
    >
      {/* Background radial pattern subtle */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider bg-black/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Status Banjir
            </span>
            {isBlinking && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight capitalize drop-shadow-xs">
            {status.name}
          </h2>
          <p className="text-sm sm:text-base text-white/95 font-medium max-w-xl leading-snug">
            {getStatusDescription(status.name)}
          </p>
        </div>

        {/* Icon Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-inner">
          {getIcon()}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between text-xs sm:text-sm font-medium text-white/90 gap-2">
        <span>Batas Minimum Level: {status.min_cm} cm</span>
        <span>Posisi Level Saat Ini: <strong className="text-white font-bold">{waterLevel} cm</strong></span>
      </div>
    </div>
  );
};
