import { HistoryPoint, PredictionResult, WeatherData } from './types';

export interface PredictionInput {
  currentWaterLevel: number;
  history: HistoryPoint[];
  weather?: WeatherData | null;
  isDeviceOnline?: boolean;
}

/**
 * Model Prediksi MVP: Statistik / Time-series trend + Korelasi Cuaca BMKG
 * Sesuai PRD Bagian 21, 22, 23, 55, 56, 57
 */
export function calculatePrediction({
  currentWaterLevel,
  history,
  weather,
  isDeviceOnline = true,
}: PredictionInput): PredictionResult {
  // Batasan 1: Jika alat offline
  if (!isDeviceOnline) {
    return {
      direction: 'stable',
      predictedChangeCm: 0,
      predictedLevelCm: currentWaterLevel,
      hoursAhead: 2,
      confidence: 0,
      isAvailable: false,
      reason: 'Prediksi tidak tersedia karena alat offline.',
    };
  }

  // Batasan 2: Data historis terlalu sedikit
  if (!history || history.length < 3) {
    return {
      direction: 'stable',
      predictedChangeCm: 0,
      predictedLevelCm: currentWaterLevel,
      hoursAhead: 2,
      confidence: 0,
      isAvailable: false,
      reason: 'Prediksi belum tersedia. Dibutuhkan lebih banyak data historis.',
    };
  }

  // Urutkan history berdasarkan timestamp
  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);

  // Ambil hingga 10 titik terakhir untuk menangkap tren saat ini
  const recentPoints = sorted.slice(-10);
  
  // Hitung perbedaan rata-rata per interval
  let totalDelta = 0;
  for (let i = 1; i < recentPoints.length; i++) {
    totalDelta += recentPoints[i].water_level_cm - recentPoints[i - 1].water_level_cm;
  }
  const avgDelta = totalDelta / (recentPoints.length - 1);

  // Perkiraan rentang proyeksi 2 jam ke depan
  // Mengasumsikan tren berlanjut dengan faktor peredaman (damping factor)
  let rawChange = avgDelta * 4; // estimasi 4x interval delta

  // Analisis pengaruh cuaca BMKG
  let weatherFactor = 0;
  let weatherConfidenceBoost = 0;

  if (weather) {
    const condition = (weather.condition || '').toLowerCase();
    const isHeavyRain = condition.includes('lebat') || condition.includes('petir');
    const isModerateRain = condition.includes('sedang') || condition.includes('hujan');
    const isLightRain = condition.includes('ringan');

    if (isHeavyRain) {
      weatherFactor += 3.5;
      weatherConfidenceBoost += 0.15;
    } else if (isModerateRain) {
      weatherFactor += 2.0;
      weatherConfidenceBoost += 0.10;
    } else if (isLightRain) {
      weatherFactor += 0.8;
      weatherConfidenceBoost += 0.05;
    } else if (condition.includes('cerah')) {
      weatherFactor -= 0.5;
      weatherConfidenceBoost += 0.05;
    }

    // Korelasi jika trend naik bersamaan dengan hujan
    if (avgDelta > 0 && (isHeavyRain || isModerateRain)) {
      weatherConfidenceBoost += 0.10;
    }
  }

  const finalChangeCm = Math.round((rawChange + weatherFactor) * 10) / 10;
  const predictedLevelCm = Math.max(0, Math.round((currentWaterLevel + finalChangeCm) * 10) / 10);

  // Tentukan direction
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (finalChangeCm >= 0.5) {
    direction = 'up';
  } else if (finalChangeCm <= -0.5) {
    direction = 'down';
  }

  // Hitung confidence (0.50 s/d 0.95)
  let baseConfidence = 0.65;
  if (recentPoints.length >= 8) baseConfidence += 0.10;
  let confidence = Math.min(0.95, Math.max(0.40, baseConfidence + weatherConfidenceBoost));
  confidence = Math.round(confidence * 100) / 100;

  return {
    direction,
    predictedChangeCm: Math.abs(finalChangeCm),
    predictedLevelCm,
    hoursAhead: 2,
    confidence,
    isAvailable: true,
  };
}
