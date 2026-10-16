'use client';

import React from 'react';
import { FloodStatusConfig } from '@/lib/types';
import { getStatusDescription } from '@/lib/status-service';
import { AlertTriangle, CheckCircle2, Droplets, AlertOctagon } from 'lucide-react';

interface FloodStatusCardProps {
  status: FloodStatusConfig;
  waterLevel: number;
}

export const FloodStatusCard: React.FC<FloodStatusCardProps> = ({ status, waterLevel }) => {
  const getIcon = () => {
    const iconKey = (status.icon || '').toLowerCase();
    const nameKey = (status.name || '').toLowerCase();

    if (iconKey.includes('warn') || nameKey.includes('siaga') || nameKey.includes('waspada')) {
      return <AlertTriangle className="w-7 h-7 sm:w-9 sm:h-9 text-white" />;
    }
    if (iconKey.includes('check') || nameKey.includes('terkendali') || nameKey.includes('aman')) {
      return <CheckCircle2 className="w-7 h-7 sm:w-9 sm:h-9 text-white" />;
    }
    if (iconKey.includes('drop') || nameKey.includes('genangan')) {
      return <Droplets className="w-7 h-7 sm:w-9 sm:h-9 text-white" />;
    }
    return <AlertOctagon className="w-7 h-7 sm:w-9 sm:h-9 text-white" />;
  };

  const isBlinking = Boolean(status.blink);
  const color = status.color || '#2196F3';

  return (
    <div
      className={`relative w-full max-w-full overflow-hidden rounded-2xl p-4 sm:p-5 text-white shadow-sm transition-all duration-300 ${
        isBlinking ? 'animate-alert-pulse ring-4 ring-amber-400/40' : ''
      }`}
      style={{
        backgroundColor: color,
      }}
    >
      {/* Background radial pattern subtle */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/15 px-2 py-0.5 rounded-full backdrop-blur-xs whitespace-nowrap">
              Status Banjir
            </span>
            {isBlinking && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight capitalize drop-shadow-xs break-words">
            {status.name}
          </h2>

          <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed break-words line-clamp-2 sm:line-clamp-none">
            {getStatusDescription(status.name)}
          </p>
        </div>

        {/* Icon Badge */}
        <div className="w-13 h-13 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-inner">
          {getIcon()}
        </div>
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-white/20 flex flex-wrap items-center justify-between text-[11px] sm:text-xs font-medium text-white/90 gap-1.5">
        <span>Batas Min: <strong>{status.min_cm} cm</strong></span>
        <span>Level Saat Ini: <strong className="text-white font-extrabold">{waterLevel} cm</strong></span>
      </div>
    </div>
  );
};
