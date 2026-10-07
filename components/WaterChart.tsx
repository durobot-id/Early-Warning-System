'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { LineChart as ChartIcon } from 'lucide-react';
import { HistoryPoint } from '@/lib/types';
import { formatDateTimeID } from '@/lib/utils';

interface WaterChartProps {
  history: HistoryPoint[];
  siagaThreshold?: number;
}

type TimeFilter = '1h' | '3h' | '6h' | '12h' | '24h' | 'all';

export const WaterChart: React.FC<WaterChartProps> = ({
  history,
  siagaThreshold = 20,
}) => {
  const [filter, setFilter] = useState<TimeFilter>('1h');

  // Filter titik data berdasarkan pilihan rentang waktu
  const filteredData = useMemo(() => {
    if (!history || history.length === 0) return [];
    const now = Date.now();

    const hoursMap: Record<TimeFilter, number> = {
      '1h': 1,
      '3h': 3,
      '6h': 6,
      '12h': 12,
      '24h': 24,
      'all': 9999,
    };

    const maxMs = hoursMap[filter] * 60 * 60 * 1000;
    const items = history.filter((p) => now - p.timestamp <= maxMs);

    // Jika filter waktu menghasilkan terlalu sedikit data, fallback ke semua yang ada
    const activeItems = items.length >= 2 ? items : history;

    return activeItems.map((point) => {
      const d = new Date(point.timestamp);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      return {
        time: timeStr,
        fullTime: formatDateTimeID(point.timestamp),
        level: point.water_level_cm,
      };
    });
  }, [history, filter]);

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ChartIcon className="w-4 h-4 text-blue-500" />
            Grafik Ketinggian Air
          </h3>
        </div>
        <div className="h-52 flex items-center justify-center text-slate-400 text-xs font-medium">
          Belum ada riwayat ketinggian air.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <ChartIcon className="w-4 h-4 text-blue-500" />
          Grafik Ketinggian Air
        </h3>

        {/* Filter tombol 1j, 3j, 6j, 12j, 24j */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {(['1h', '3h', '6h', '12h', '24h'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === f
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.replace('h', ' Jam')}
            </button>
          ))}
        </div>
      </div>

      <div className="h-60 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              unit=" cm"
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg">
                      <p className="text-slate-300 text-[10px]">{data.fullTime}</p>
                      <p className="font-bold text-base text-blue-400 mt-0.5">
                        {data.level} cm
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {siagaThreshold && (
              <ReferenceLine
                y={siagaThreshold}
                stroke="#FFD600"
                strokeDasharray="4 4"
                label={{
                  value: 'Batas Siaga',
                  fill: '#D97706',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="level"
              stroke="#2196F3"
              strokeWidth={3}
              dot={{ r: 2, fill: '#2196F3' }}
              activeDot={{ r: 6, fill: '#1E88E5' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <span>Menampilkan {filteredData.length} titik data sensor</span>
        <span>Garis putus-putus kuning: Ambang batas Siaga ({siagaThreshold} cm)</span>
      </div>
    </div>
  );
};
