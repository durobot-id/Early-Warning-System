'use client';

import React from 'react';
import { Waves, Bell, Download, RefreshCw, Radio } from 'lucide-react';
import { DeviceOnlineState } from '@/lib/types';

interface HeaderProps {
  isRealtimeConnected: boolean;
  deviceState: DeviceOnlineState;
  onOpenNotifications: () => void;
  onInstallClick: () => void;
  canInstallPwa: boolean;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  isRealtimeConnected,
  deviceState,
  onOpenNotifications,
  onInstallClick,
  canInstallPwa,
  unreadCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Judul */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
                EWS
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Early Warning System</p>
          </div>
        </div>

        {/* Status Sistem & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Status Koneksi */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                deviceState === 'ONLINE'
                  ? 'bg-emerald-500 animate-pulse'
                  : deviceState === 'WARNING'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span>
              {deviceState === 'ONLINE' ? 'Sistem Online' : deviceState === 'WARNING' ? 'Tertunda' : 'Offline'}
            </span>
          </div>

          {/* Tombol Install PWA jika browser mendukung */}
          {canInstallPwa && (
            <button
              onClick={onInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all"
              title="Pasang aplikasi ke perangkat"
              aria-label="Install EWS PWA"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Install App</span>
            </button>
          )}

          {/* Tombol Bell Notifikasi */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            aria-label="Lihat Riwayat Notifikasi"
            title="Riwayat Peringatan"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
