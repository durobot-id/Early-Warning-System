'use client';

import React, { useState } from 'react';
import { Sliders, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  status: 'idle' | 'processing' | 'success' | 'failed' | 'timeout';
  statusMessage?: string;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  status,
  statusMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 transform transition-all scale-100">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <Sliders className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          Kalibrasi Sensor
        </h3>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Pastikan kondisi fisik sensor dan batas nol telah sesuai dengan level permukaan sebelum memulai kalibrasi.
        </p>

        {/* Status display */}
        {status === 'processing' && (
          <div className="my-4 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2.5 text-xs font-semibold text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Sedang melakukan kalibrasi pada sensor...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="my-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{statusMessage || 'Kalibrasi berhasil! Sensor telah diperbarui.'}</span>
          </div>
        )}

        {status === 'failed' && (
          <div className="my-4 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2.5 text-xs font-semibold text-rose-700">
            <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{statusMessage || 'Kalibrasi gagal. Periksa koneksi sensor.'}</span>
          </div>
        )}

        {status === 'timeout' && (
          <div className="my-4 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-2.5 text-xs font-semibold text-amber-700">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Sensor tidak merespons. Waktu permintaan habis.</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'processing'}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
          >
            {status === 'success' ? 'Tutup' : 'Batal'}
          </button>

          {status !== 'success' && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={status === 'processing'}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              {status === 'processing' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Mulai Kalibrasi</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
