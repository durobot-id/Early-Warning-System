'use client';

import React from 'react';
import { Bell, AlertTriangle, TrendingUp, CheckCircle, Radio, Send } from 'lucide-react';
import { EWSNotification } from '@/lib/types';
import { formatDateTimeID } from '@/lib/utils';

interface NotificationHistoryProps {
  notifications: EWSNotification[];
  onSendTestNotification?: () => void;
  isSendingTest?: boolean;
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  notifications,
  onSendTestNotification,
  isSendingTest = false,
}) => {
  const getSeverityIcon = (severity: string, title: string) => {
    if (severity === 'danger' || title.toLowerCase().includes('siaga')) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (severity === 'warning' || title.toLowerCase().includes('meningkat')) {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-4 h-4" />
        </div>
      );
    }
    if (severity === 'info' || title.toLowerCase().includes('terkendali')) {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-blue-500" />
          Riwayat Notifikasi
        </h3>

        {onSendTestNotification && (
          <button
            onClick={onSendTestNotification}
            disabled={isSendingTest}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 active:scale-95 transition-all disabled:opacity-50"
            title="Tes kirim Push Alert ke perangkat Anda"
          >
            <Send className="w-3 h-3" />
            <span>{isSendingTest ? 'Mengirim...' : 'Tes Push Alert'}</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs font-medium">
          Belum ada peringatan yang tercatat.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/60 transition-colors"
            >
              {getSeverityIcon(item.severity, item.title)}

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatDateTimeID(item.timestamp, false)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {item.message}
                </p>
                {item.water_level_cm > 0 && (
                  <span className="inline-block mt-1 text-[11px] font-semibold text-blue-600">
                    Level: {item.water_level_cm} cm
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
