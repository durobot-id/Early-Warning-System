'use client';

import React, { useState } from 'react';
import { BellRing, Check, Copy, ShieldAlert, CheckCircle2, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface NotificationPermissionProps {
  permission: NotificationPermission | 'unsupported';
  onRequestPermission: () => void;
  isLoading?: boolean;
  fcmToken?: string | null;
  onSendTestNotification?: () => void;
  isSendingTest?: boolean;
}

export const NotificationPermissionCard: React.FC<NotificationPermissionProps> = ({
  permission,
  onRequestPermission,
  isLoading = false,
  fcmToken = null,
  onSendTestNotification,
  isSendingTest = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showTokenDetails, setShowTokenDetails] = useState<boolean>(false);

  const handleCopyToken = () => {
    if (!fcmToken) return;
    navigator.clipboard.writeText(fcmToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (permission === 'unsupported') {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Browser ini belum mendukung Web Push Notifications. Gunakan browser Google Chrome, Edge, atau Firefox untuk menerima peringatan siaga.
        </p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">Izin Notifikasi Diblokir di Browser</p>
          <p className="mt-0.5 text-amber-700 leading-relaxed break-words">
            Anda telah memblokir izin notifikasi. Untuk menerima peringatan siaga banjir saat aplikasi ditutup, aktifkan izin pada setelan situs/browser Anda.
          </p>
        </div>
      </div>
    );
  }

  // Jika izin sudah diberikan (granted)
  if (permission === 'granted') {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-900 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Peringatan Siaga FCM Aktif
              </h4>
              <p className="text-[11px] text-emerald-700">
                Perangkat terdaftar untuk menerima push alert saat status bahaya.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSendTestNotification && (
              <button
                onClick={onSendTestNotification}
                disabled={isSendingTest}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] shadow-xs transition-all disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{isSendingTest ? 'Mengirim...' : 'Tes Alert'}</span>
              </button>
            )}

            {fcmToken && (
              <button
                onClick={() => setShowTokenDetails(!showTokenDetails)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-200 font-semibold text-[11px] hover:bg-emerald-100/50 transition-colors"
                title="Lihat Detail Token FCM"
              >
                <span>Token FCM</span>
                {showTokenDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Detail Token FCM untuk pengujian di Firebase Console */}
        {showTokenDetails && fcmToken && (
          <div className="p-3 bg-white rounded-xl border border-emerald-200/90 space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700">
                FCM Device Registration Token:
              </span>
              <button
                onClick={handleCopyToken}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 px-2 py-0.5 rounded-md hover:bg-blue-50"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Token</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg break-all select-all border border-slate-100">
              {fcmToken}
            </p>
            <p className="text-[10px] text-slate-500 leading-normal">
              Gunakan token ini jika Anda ingin menguji kirim pesan siaga khusus perangkat ini langsung dari menu <b>Firebase Console -&gt; Cloud Messaging</b>.
            </p>
          </div>
        )}
      </div>
    );
  }

  // State default (belum meminta izin)
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <BellRing className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            Aktifkan Peringatan Siaga Banjir
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
            Terima notifikasi darurat langsung dari Firebase ke HP Anda ketika sensor mendeteksi potensi banjir atau kenaikan air kritis.
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
