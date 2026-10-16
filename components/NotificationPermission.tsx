'use client';

import React from 'react';
import {
  BellRing,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { useEWS } from '@/lib/EWSContext';

export const NotificationPermissionCard: React.FC = () => {
  const {
    fcmPermission,
    isRequestingFCM,
    requestNotificationPermission,
  } = useEWS();

  // 1. Browser tidak mendukung
  if (fcmPermission === 'unsupported') {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Browser ini belum mendukung Web Push Notifications. Buka aplikasi di Google Chrome, Edge, atau Firefox untuk menerima peringatan siaga banjir.
        </p>
      </div>
    );
  }

  // 2. Izin diblokir
  if (fcmPermission === 'denied') {
    return (
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">Izin Notifikasi Diblokir di Browser</p>
          <p className="mt-0.5 text-amber-700 leading-relaxed break-words">
            Izin notifikasi saat ini diblokir di peramban Anda. Klik ikon gembok di sebelah kiri alamat web untuk mengubah status menjadi <strong>Izinkan</strong> agar alarm darurat dapat berbunyi.
          </p>
        </div>
      </div>
    );
  }

  // 3. Izin sudah aktif (granted) - Tampilan bersih, rapi, dan informatif
  if (fcmPermission === 'granted') {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Peringatan Siaga Otomatis Aktif
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Terhubung
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed break-words">
              Perangkat siap menerima alarm sirine dan notifikasi pop-up otomatis saat ketinggian air naik ke batas siaga.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. State default (belum meminta izin)
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <BellRing className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            Aktifkan Peringatan Siaga Otomatis
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
            Terima alarm suara dan notifikasi darurat langsung ke HP Anda setiap kali ketinggian air naik ke batas bahaya.
          </p>
        </div>
      </div>

      <button
        onClick={() => requestNotificationPermission()}
        disabled={isRequestingFCM}
        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all whitespace-nowrap self-start sm:self-center disabled:opacity-60"
      >
        {isRequestingFCM ? 'Menghubungkan...' : 'Aktifkan Notifikasi'}
      </button>
    </div>
  );
};
