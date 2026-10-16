'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, PhoneCall, ShieldAlert, ArrowRight } from 'lucide-react';
import { useEWS } from '@/lib/EWSContext';

export const EmergencyBanner: React.FC = () => {
  const { isDangerCondition, dangerReason, activeStatus, currentWaterLevel } = useEWS();

  if (!isDangerCondition) return null;

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white p-3.5 sm:p-4.5 shadow-md border-2 border-rose-300 animate-alert-pulse">
      <div className="flex items-start gap-2.5 sm:gap-3.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/40 shadow-inner">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full whitespace-nowrap">
              Siaga Darurat
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold bg-white text-rose-700 px-2 py-0.5 rounded-full whitespace-nowrap">
              Level: {currentWaterLevel} cm
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black mt-1 leading-snug break-words">
            {activeStatus.name ? `Kondisi ${activeStatus.name}` : 'Potensi Kenaikan Air Kritis'}
          </h3>

          <p className="text-xs text-white/95 mt-1 font-medium leading-relaxed break-words">
            {dangerReason || 'Ketinggian air telah memasuki batas siaga bahaya. Harap waspada dan amankan barang berharga.'}
          </p>

          <div className="mt-3 flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-2">
            <a
              href="tel:112"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white text-rose-700 hover:bg-slate-100 active:scale-95 text-xs font-black shadow-xs transition-all text-center"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>Hubungi BPBD 112</span>
            </a>

            <Link
              href="/darurat"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-black/25 hover:bg-black/35 text-white active:scale-95 text-xs font-bold border border-white/30 transition-all text-center"
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Panduan Evakuasi</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
