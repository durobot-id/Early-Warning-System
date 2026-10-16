'use client';

import React, { useState, useEffect } from 'react';
import { Send, Smartphone, RefreshCw, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

export const OperatorBroadcastPanel: React.FC = () => {
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    success: boolean;
    sent?: number;
    failed?: number;
    message?: string;
  } | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/push');
      const data = await res.json();
      if (typeof data.subscriberCount === 'number') {
        setSubscriberCount(data.subscriberCount);
      }
    } catch (e) {
      console.warn('Failed to fetch push status:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = async () => {
    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'broadcast',
          title: 'PERINGATAN DARURAT: Status Siaga Banjir!',
          message: 'Ketinggian air telah mencapai ambang batas siaga. Harap segera amankan barang berharga!',
          severity: 'danger',
          water_level_cm: 25,
          force: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBroadcastResult({
          success: true,
          sent: data.sent ?? 0,
          failed: data.failed ?? 0,
          message: `Berhasil dikirim ke ${data.sent ?? 0} perangkat HP!`,
        });
      } else {
        setBroadcastResult({
          success: false,
          message: data.error || 'Gagal mengirim push notification.',
        });
      }
    } catch (err: any) {
      setBroadcastResult({
        success: false,
        message: err?.message || 'Koneksi ke server push gagal.',
      });
    } finally {
      setIsBroadcasting(false);
      fetchStatus();
    }
  };

  return (
    <section className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Panel Operator & Uji Demo Presentasi
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Kirim Web Push langsung dari laptop ke semua HP audiens/penguji (walau aplikasi di HP tertutup).
            </p>
          </div>
        </div>

        {/* Counter HP Terhubung */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <Smartphone className="w-4 h-4 text-indigo-500" />
            <span>
              {isLoading ? '...' : subscriberCount}{' '}
              <span className="text-slate-400 font-normal">HP terdaftar</span>
            </span>
          </div>

          <button
            onClick={fetchStatus}
            disabled={isLoading}
            title="Muat ulang jumlah perangkat"
            className="p-1.5 text-slate-400 hover:text-slate-600 active:scale-95 transition-all rounded-lg hover:bg-slate-100"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-600 space-y-1.5">
        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          Langkah Uji Demo Presentasi:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1 leading-relaxed">
          <li>Sambungkan HP penguji/dosen ke WiFi atau Hotspot yang sama dengan laptop.</li>
          <li>Buka web EWS di HP Chrome, klik <strong>&quot;Aktifkan Notifikasi&quot;</strong> sampai muncul status Terhubung.</li>
          <li>Tutup browser di HP (keluar dari aplikasi / kunci layar).</li>
          <li>Tekan tombol di bawah ini: HP akan bergetar dan menampilkan peringatan darurat.</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <button
          onClick={handleBroadcast}
          disabled={isBroadcasting || subscriberCount === 0}
          className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className={`w-4 h-4 ${isBroadcasting ? 'animate-bounce' : ''}`} />
          <span>
            {isBroadcasting
              ? 'Mengirim Peringatan ke HP...'
              : `Kirim Siaga Darurat ke Seluruh HP (${subscriberCount})`}
          </span>
        </button>
      </div>

      {broadcastResult && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            broadcastResult.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {broadcastResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{broadcastResult.message}</span>
        </div>
      )}
    </section>
  );
};
