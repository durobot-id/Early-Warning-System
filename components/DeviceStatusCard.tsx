'use client';

import React from 'react';
import { Wifi, Cpu, Zap, Activity } from 'lucide-react';
import { DeviceOnlineState, FirebaseLive } from '@/lib/types';
import { formatRelativeTimeID } from '@/lib/utils';

interface DeviceStatusCardProps {
  deviceState: DeviceOnlineState;
  live: FirebaseLive;
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({ deviceState, live }) => {
  const getStatusBadge = () => {
    switch (deviceState) {
      case 'ONLINE':
        return {
          label: 'ONLINE',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'WARNING':
        return {
          label: 'TERTUNDA',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'OFFLINE':
      default:
        return {
          label: 'OFFLINE',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          Status Sensor & Hardware
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
      </div>

      <div className="my-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-slate-400" />
            Sinyal WiFi
          </span>
          <span className="font-semibold text-slate-800">
            {live.wifi_rssi !== undefined ? `${live.wifi_rssi} dBm` : 'Tidak tersedia'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-slate-400" />
            Sensor Hardware
          </span>
          <span className={`font-semibold ${live.sensor_ok ? 'text-emerald-600' : 'text-rose-600'}`}>
            {live.sensor_ok ? 'Berfungsi Normal (OK)' : 'Periksa Sensor'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-slate-400" />
            Status Relay
          </span>
          <span className={`font-semibold px-2 py-0.5 rounded text-xs ${live.relay_on ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
            {live.relay_on ? 'AKTIF (ON)' : 'STANDBY (OFF)'}
          </span>
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span>Heartbeat Sensor:</span>
        <span className="font-medium text-slate-700">
          {formatRelativeTimeID(live.updated_at)}
        </span>
      </div>
    </div>
  );
};
