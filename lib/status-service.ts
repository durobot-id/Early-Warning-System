import { FloodStatusConfig } from './types';

export const DEFAULT_STATUS_CONFIGS: FloodStatusConfig[] = [
  {
    name: 'Genangan',
    min_cm: 0,
    color: '#2196F3',
    icon: 'drop',
    blink: false,
    relay: false,
  },
  {
    name: 'Terkendali',
    min_cm: 10,
    color: '#4CAF50',
    icon: 'check',
    blink: false,
    relay: false,
  },
  {
    name: 'Siaga',
    min_cm: 20,
    color: '#FFD600',
    icon: 'warning',
    blink: true,
    relay: true,
  },
];

/**
 * Menghitung status banjir berdasarkan ketinggian air dan daftar konfigurasi status.
 * Mengikuti logika PRD Bagian 11:
 * Urutkan berdasarkan min_cm ascending, status terakhir yang memenuhi waterLevel >= status.min_cm
 * menjadi status aktif.
 */
export function calculateFloodStatus(
  waterLevel: number,
  statusConfigs: FloodStatusConfig[] = DEFAULT_STATUS_CONFIGS
): FloodStatusConfig {
  if (!statusConfigs || statusConfigs.length === 0) {
    return DEFAULT_STATUS_CONFIGS[0];
  }

  // Urutkan status berdasarkan min_cm ascending
  const sorted = [...statusConfigs].sort((a, b) => a.min_cm - b.min_cm);

  let activeStatus = sorted[0];

  for (const status of sorted) {
    if (waterLevel >= status.min_cm) {
      activeStatus = status;
    }
  }

  return activeStatus;
}

/**
 * Helper deskripsi status untuk UI
 */
export function getStatusDescription(statusName: string): string {
  const normalized = statusName.toLowerCase();
  if (normalized.includes('siaga')) {
    return 'Ketinggian air telah memasuki batas siaga! Harap waspada potensi kenaikan.';
  }
  if (normalized.includes('terkendali') || normalized.includes('aman')) {
    return 'Kondisi air saat ini masih aman dan dalam batas normal.';
  }
  if (normalized.includes('genangan')) {
    return 'Ketinggian air berada pada level genangan awal.';
  }
  if (normalized.includes('bahaya')) {
    return 'Ketinggian air kritis! Evakuasi dan peringatan dini diaktifkan.';
  }
  return 'Monitoring ketinggian air secara berkala.';
}
