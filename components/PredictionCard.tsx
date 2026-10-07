'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info, Sparkles } from 'lucide-react';
import { PredictionResult } from '@/lib/types';

interface PredictionCardProps {
  prediction: PredictionResult;
  currentLevel: number;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  currentLevel,
}) => {
  if (!prediction.isAvailable) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Prediksi Ketinggian
          </span>
          <span className="text-xs text-slate-400">Model MVP</span>
        </div>

        <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <Info className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-slate-600">
            {prediction.reason || 'Prediksi belum tersedia. Menunggu data sensor mencukupi.'}
          </p>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          * Estimasi menggunakan data tren historis & ramalan cuaca.
        </p>
      </div>
    );
  }

  const isUp = prediction.direction === 'up';
  const isDown = prediction.direction === 'down';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          Prediksi Ketinggian
        </span>
        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          Confidence {Math.round(prediction.confidence * 100)}%
        </span>
      </div>

      <div className="my-3">
        {/* Status Perkiraan Naik/Turun */}
        <div className="flex items-center gap-2 mb-1.5">
          {isUp && (
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}
          {isDown && (
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}
          {!isUp && !isDown && (
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Minus className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Air diperkirakan {isUp ? 'NAIK' : isDown ? 'TURUN' : 'STABIL'}
            </h3>
            <p className="text-xs font-semibold text-slate-600">
              {isUp ? `+${prediction.predictedChangeCm}` : isDown ? `-${prediction.predictedChangeCm}` : '0'}{' '}
              cm dalam ±{prediction.hoursAhead} jam
            </p>
          </div>
        </div>

        {/* Level Perkiraan */}
        <div className="mt-2.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Estimasi Level:</span>
          <span className="font-bold text-slate-800">
            {currentLevel} cm → <span className={isUp ? 'text-rose-600 font-extrabold' : 'text-slate-900'}>{prediction.predictedLevelCm} cm</span>
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
        * Nilai di atas merupakan perkiraan berdasarkan tren statistik & cuaca, bukan jaminan pasti.
      </div>
    </div>
  );
};
