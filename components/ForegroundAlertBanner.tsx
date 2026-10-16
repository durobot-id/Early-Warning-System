'use client';

import React from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEWS } from '@/lib/EWSContext';

export const ForegroundAlertBanner: React.FC = () => {
  const { foregroundAlert, dismissForegroundAlert } = useEWS();

  if (!foregroundAlert) return null;

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-50 animate-bounce-in shadow-xl">
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-rose-500/50 shadow-2xl flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full">
              Pemberitahuan Masuk
            </span>
            <button
              onClick={dismissForegroundAlert}
              className="text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug break-words">
            {foregroundAlert.title}
          </h4>

          <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">
            {foregroundAlert.body}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <Link
              href="/darurat"
              onClick={dismissForegroundAlert}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 underline underline-offset-2"
            >
              <span>Buka Menu Darurat</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
