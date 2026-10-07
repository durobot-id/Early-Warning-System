'use client';

import React from 'react';
import { BellRing, Check, ShieldAlert } from 'lucide-react';

interface NotificationPermissionProps {
  permission: NotificationPermission;
  onRequestPermission: () => void;
  isLoading?: boolean;
}

export const NotificationPermissionCard: React.FC<NotificationPermissionProps> = ({
  permission,
  onRequestPermission,
  isLoading = false,
}) => {
  if (permission === 'granted') {
    return null; // Izin sudah aktif, sembunyikan card
  }

  if (permission === 'denied') {
    return (
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Notifikasi Diblokir oleh Browser</p>
          <p className="mt-0.5 text-amber-700">
            Anda telah memblokir izin notifikasi. Untuk menerima peringatan siaga banjir saat aplikasi tertutup, aktifkan izin pada setelan browser Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <BellRing className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Aktifkan Peringatan Siaga
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
            Izinkan EWS mengirimkan push alert ke perangkat Anda jika ketinggian air meningkat atau memasuki batas siaga banjir.
          </p>
        </div>
      </div>

      <button
        onClick={onRequestPermission}
        disabled={isLoading}
        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all whitespace-nowrap self-start sm:self-center disabled:opacity-60"
      >
        {isLoading ? 'Mengaktifkan...' : 'Aktifkan Notifikasi'}
      </button>
    </div>
  );
};
