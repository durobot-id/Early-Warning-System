'use client';

import React from 'react';
import { Activity, Bell, TrendingUp, Send, Clock, BarChart2 } from 'lucide-react';
import { useEWS } from '@/lib/EWSContext';
import { WaterChart } from '@/components/WaterChart';
import { NotificationHistory } from '@/components/NotificationHistory';

export default function RiwayatPage() {
  const { appData, currentWaterLevel } = useEWS();

  if (!appData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-600">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-700">Memuat Riwayat Sensor...</p>
      </div>
    );
  }

  // Ringkasan Statistik
  const history = appData.history || [];
  const maxLevel = history.length > 0 ? Math.max(...history.map((h) => h.water_level_cm)) : currentWaterLevel;
  const minLevel = history.length > 0 ? Math.min(...history.map((h) => h.water_level_cm)) : currentWaterLevel;
  const avgLevel =
    history.length > 0
      ? Math.round((history.reduce((acc, h) => acc + h.water_level_cm, 0) / history.length) * 10) / 10
      : currentWaterLevel;

  const siagaThreshold =
    appData.statuses.find((s) => s.name.toLowerCase().includes('siaga'))?.min_cm || 20;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">
                Riwayat & Analisis
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Grafik Ketinggian Air & Log Peringatan
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {history.length} Record
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Ringkasan Statistik Kartu */}
        <section className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tertinggi</span>
            <span className="text-lg font-black text-rose-600 mt-0.5 block">{maxLevel} cm</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rata-Rata</span>
            <span className="text-lg font-black text-blue-600 mt-0.5 block">{avgLevel} cm</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Terendah</span>
            <span className="text-lg font-black text-emerald-600 mt-0.5 block">{minLevel} cm</span>
          </div>
        </section>

        {/* Grafik Ketinggian Air */}
        <section aria-label="Grafik">
          <WaterChart history={history} siagaThreshold={siagaThreshold} />
        </section>

        {/* Riwayat Notifikasi */}
        <section aria-label="Riwayat Notifikasi">
          <NotificationHistory notifications={appData.notifications} />
        </section>
      </main>
    </div>
  );
}
