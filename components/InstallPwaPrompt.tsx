'use client';

import React from 'react';
import { Smartphone, Share, PlusSquare, X } from 'lucide-react';

interface InstallPwaPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isIos: boolean;
}

export const InstallPwaPrompt: React.FC<InstallPwaPromptProps> = ({
  isOpen,
  onClose,
  onInstall,
  isIos,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900">
          📱 Install EWS ke Perangkat
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Pasang EWS sebagai aplikasi di layar utama ponsel atau komputer Anda untuk akses cepat dan notifikasi siaga realtime.
        </p>

        {isIos ? (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs text-slate-700">
            <p className="font-semibold text-slate-800">Petunjuk Pemasangan iOS / Safari:</p>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">1</span>
              <span>Ketuk ikon bagikan <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> di Safari.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">2</span>
              <span>Pilih <strong className="font-semibold">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700" />.</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Nanti Saja
            </button>
            <button
              onClick={onInstall}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs transition-all"
            >
              Install Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
