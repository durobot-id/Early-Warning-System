'use client';

import React from 'react';
import { Sliders, MapPin, Gauge, ShieldCheck, Clock, Radio, Cpu, Triangle } from 'lucide-react';
import { FirebaseInfo, FirebaseLive, FirebaseConfig, DeviceOnlineState } from '@/lib/types';
import { formatCoordinate, formatDateTimeID } from '@/lib/utils';
import { calculateTrigFloodRadius } from '@/lib/firebase-service';

interface DeviceInfoCardProps {
  info: FirebaseInfo;
  live: FirebaseLive;
  config: FirebaseConfig;
  deviceState: DeviceOnlineState;
}

export const DeviceInfoCard: React.FC<DeviceInfoCardProps> = ({
  info,
  live,
  config,
  deviceState,
}) => {
  const slope = info.kemiringan || 10.5;
  const calculatedRadius = calculateTrigFloodRadius(live.water_level_cm, slope);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-blue-500" />
          Informasi Alat & Konfigurasi
        </h3>
        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">
          BMKG ADM4: {info.bmkg_adm4}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs sm:text-sm">
        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Wilayah Sensor</span>
          <span className="font-semibold text-slate-900">{info.region_name}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Status Koneksi</span>
          <span className={`font-bold ${deviceState === 'ONLINE' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {deviceState}
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Kemiringan Dataran</span>
          <span className="font-bold text-amber-700 flex items-center gap-1">
            <Triangle className="w-3.5 h-3.5" />
            {slope}°
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Radius Luapan Trigonometri</span>
          <span className="font-bold text-blue-600">
            {calculatedRadius} meter
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Koordinat (Lat, Lon)</span>
          <span className="font-mono text-slate-800">
            {formatCoordinate(info.latitude)}, {formatCoordinate(info.longitude)}
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Sinyal WiFi (RSSI)</span>
          <span className="font-semibold text-slate-900">
            {live.wifi_rssi} dBm
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Tinggi Sensor Fisik</span>
          <span className="font-semibold text-slate-900">
            {config.sensor_height_cm} cm
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Jarak Bacaan (Distance)</span>
          <span className="font-semibold text-blue-600">
            {live.distance_cm} cm
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Status Kalibrasi</span>
          <span className="font-semibold text-emerald-600 uppercase">
            {config.calibrate_status === 'ok' ? 'OK' : config.calibrate_status}
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500">Waktu Kalibrasi</span>
          <span className="text-slate-700">
            {config.calibrated_at ? formatDateTimeID(config.calibrated_at) : 'Tidak tersedia'}
          </span>
        </div>
      </div>
    </div>
  );
};
