'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  subscribeToEWSData,
  determineDeviceState,
  calculateTrigFloodRadius,
  EWSAppData,
} from './firebase-service';
import { calculateFloodStatus } from './status-service';
import { calculatePrediction } from './prediction-service';
import { WeatherData, PredictionResult, FloodStatusConfig, DeviceOnlineState } from './types';

interface EWSContextType {
  appData: EWSAppData | null;
  weather: WeatherData | null;
  isWeatherLoading: boolean;
  activeStatus: FloodStatusConfig;
  prediction: PredictionResult;
  deviceState: DeviceOnlineState;
  floodRadiusM: number;
  currentWaterLevel: number;
  previousWaterLevel: number;
  isDangerCondition: boolean;
  dangerReason: string;
}

const EWSContext = createContext<EWSContextType | null>(null);

export const EWSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<EWSAppData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);

  // Subscribe Firebase Realtime Data
  useEffect(() => {
    // Daftarkan Service Worker PWA jika ada
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    const unsubscribe = subscribeToEWSData((data) => {
      setAppData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch Cuaca BMKG
  useEffect(() => {
    async function loadWeather() {
      try {
        setIsWeatherLoading(true);
        const lat = appData?.info?.latitude ?? -6.68;
        const lon = appData?.info?.longitude ?? 106.9383;
        const region = appData?.info?.region_name ?? 'Cisarua';
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&region=${encodeURIComponent(region)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setWeather(json.data);
        }
      } catch (err) {
        console.error('Failed to load BMKG weather:', err);
      } finally {
        setIsWeatherLoading(false);
      }
    }

    if (appData) {
      loadWeather();
    }
  }, [appData?.info?.latitude, appData?.info?.longitude, appData?.info?.region_name]);

  const currentWaterLevel = appData?.live?.water_level_cm ?? 0;
  const previousWaterLevel = appData?.previousWaterLevel ?? 0;
  const sensorTimestamp = appData?.live?.updated_at ?? Date.now();
  const deviceState = determineDeviceState(sensorTimestamp);
  const slope = appData?.info?.kemiringan ?? 10.5;

  const floodRadiusM = useMemo(() => {
    return calculateTrigFloodRadius(currentWaterLevel, slope);
  }, [currentWaterLevel, slope]);

  const activeStatus = useMemo(() => {
    return calculateFloodStatus(currentWaterLevel, appData?.statuses);
  }, [currentWaterLevel, appData?.statuses]);

  const prediction = useMemo(() => {
    return calculatePrediction({
      currentWaterLevel,
      history: appData?.history ?? [],
      weather,
      isDeviceOnline: deviceState !== 'OFFLINE',
    });
  }, [currentWaterLevel, appData?.history, weather, deviceState]);

  // Evaluasi Kondisi Bahaya:
  // Terpenuhi jika status aktif tergolong bahaya (nama mengandung Siaga/Bahaya/Evakuasi atau level >= 20 cm)
  // ATAU jika prediksi level air dalam 2 jam ke depan mencapai level bahaya (>= 20 cm)
  const { isDangerCondition, dangerReason } = useMemo(() => {
    const statusName = (activeStatus.name || '').toLowerCase();
    const isStatusCritical =
      statusName.includes('siaga') ||
      statusName.includes('bahaya') ||
      statusName.includes('evakuasi') ||
      currentWaterLevel >= 20;

    if (isStatusCritical) {
      return {
        isDangerCondition: true,
        dangerReason: `Status alat saat ini "${activeStatus.name}" dengan ketinggian ${currentWaterLevel} cm. Potensi luapan luas segera!`,
      };
    }

    // Cek potensi kenaikan dari prediksi
    if (prediction.isAvailable && prediction.predictedLevelCm >= 20 && prediction.direction === 'up') {
      return {
        isDangerCondition: true,
        dangerReason: `Peringatan! Prediksi menunjukkan air diperkirakan naik ke ${prediction.predictedLevelCm} cm (mencapai batas Siaga) dalam waktu ±${prediction.hoursAhead} jam.`,
      };
    }

    return { isDangerCondition: false, dangerReason: '' };
  }, [activeStatus, currentWaterLevel, prediction]);

  const value = {
    appData,
    weather,
    isWeatherLoading,
    activeStatus,
    prediction,
    deviceState,
    floodRadiusM,
    currentWaterLevel,
    previousWaterLevel,
    isDangerCondition,
    dangerReason,
  };

  return <EWSContext.Provider value={value}>{children}</EWSContext.Provider>;
};

export function useEWS(): EWSContextType {
  const context = useContext(EWSContext);
  if (!context) {
    throw new Error('useEWS must be used within an EWSProvider');
  }
  return context;
}
