'use client';

import React from 'react';
import {
  CloudRain,
  Wind,
  Droplet,
  Compass,
  Sun,
  CloudSun,
  CloudLightning,
  CloudFog,
  Cloud,
} from 'lucide-react';
import { WeatherData } from '@/lib/types';

interface WeatherCardProps {
  weather: WeatherData | null;
  isLoading?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, isLoading }) => {
  const getWeatherIcon = (keyOrCondition: string, className: string = 'w-6 h-6') => {
    const text = (keyOrCondition || '').toLowerCase();
    if (text.includes('thunder') || text.includes('petir')) {
      return <CloudLightning className={`${className} text-amber-500`} />;
    }
    if (text.includes('rain') || text.includes('hujan') || text.includes('drizzle') || text.includes('gerimis')) {
      return <CloudRain className={`${className} text-blue-500`} />;
    }
    if (text.includes('sun') || text.includes('cerah berawan') || text.includes('cloud-sun')) {
      return <CloudSun className={`${className} text-amber-500`} />;
    }
    if (text === 'cerah') {
      return <Sun className={`${className} text-amber-500`} />;
    }
    if (text.includes('fog') || text.includes('kabut')) {
      return <CloudFog className={`${className} text-slate-400`} />;
    }
    return <Cloud className={`${className} text-slate-400`} />;
  };

  if (isLoading || !weather) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-200 rounded w-2/3 mb-3"></div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="h-12 bg-slate-100 rounded"></div>
          <div className="h-12 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <CloudRain className="w-3.5 h-3.5 text-blue-500" />
          Cuaca BMKG
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          {weather.locationName}
        </span>
      </div>

      <div className="my-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-1.5">
              <span>{weather.condition}</span>
            </h3>
            <p className="text-3xl font-black text-blue-600 mt-1">
              {weather.temperature}°C
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            {getWeatherIcon(weather.condition, 'w-8 h-8')}
          </div>
        </div>

        {/* Metrik Kelembaban & Angin */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-slate-400 block text-[10px] flex items-center gap-1">
              <Droplet className="w-3 h-3 text-blue-400" />
              Kelembapan
            </span>
            <span className="font-bold text-slate-800 mt-0.5 block">{weather.humidity}%</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-slate-400 block text-[10px] flex items-center gap-1">
              <Wind className="w-3 h-3 text-slate-400" />
              Angin
            </span>
            <span className="font-bold text-slate-800 mt-0.5 block">{weather.windSpeed} km/h</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-slate-400 block text-[10px] flex items-center gap-1">
              <Compass className="w-3 h-3 text-slate-400" />
              Arah
            </span>
            <span className="font-bold text-slate-800 mt-0.5 block truncate">{weather.windDirection}</span>
          </div>
        </div>

        {/* Hourly Forecast */}
        {weather.hourly && weather.hourly.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Prakiraan Jam Berikutnya
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {weather.hourly.map((item, idx) => (
                <div key={idx} className="bg-slate-50/80 rounded-xl p-1.5 text-center flex flex-col items-center">
                  <span className="text-[10px] font-medium text-slate-400 block">{item.time}</span>
                  <div className="my-1">
                    {getWeatherIcon(item.icon || item.condition, 'w-4 h-4')}
                  </div>
                  <span className="text-xs font-bold text-slate-700 block">{item.temp}°</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 text-[10px] text-slate-400 text-right">
        Data BMKG Meteorologi Terbuka
      </div>
    </div>
  );
};
