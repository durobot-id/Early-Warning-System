import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format timestamp ke format waktu Indonesia (WIB)
 * Contoh: 07 Okt 2026, 21:30 atau 21:30:25
 */
export function formatDateTimeID(timestamp: number | Date, includeDate: boolean = true): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return "Tidak tersedia";

  if (includeDate) {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * Format relative time (misal: "10 detik lalu", "2 menit lalu")
 */
export function formatRelativeTimeID(timestamp: number): string {
  if (!timestamp) return "Belum ada data";
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return "Baru saja";
  if (diffSec < 60) return `${diffSec} detik lalu`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}

/**
 * Format koordinat desimal
 */
export function formatCoordinate(val?: number): string {
  if (val === undefined || isNaN(val)) return "Tidak tersedia";
  return val.toFixed(5);
}
