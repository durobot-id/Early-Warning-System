import webpush from 'web-push';
import { EWSNotification, NotificationSeverity } from './types';

// Default VAPID key pairs untuk testing/development jika env belum diset
const DEFAULT_VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const DEFAULT_VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || 'UUxI4O84qE3c76_U5x4-2H5aLz_e0vDqM8c9tP0kH7M';
const VAPID_SUBJECT = 'mailto:operator-ews@example.com';

try {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    DEFAULT_VAPID_PUBLIC,
    DEFAULT_VAPID_PRIVATE
  );
} catch (e) {
  console.warn('VAPID setup warning:', e);
}

// In-memory store untuk subscription jika Firebase DB belum terhubung
const inMemorySubscriptions: Map<string, any> = new Map();

// Anti-spam cooldown cache: map of conditionKey -> timestamp
const notificationCooldowns: Map<string, number> = new Map();
const COOLDOWN_DURATION_MS = 15 * 60 * 1000; // 15 menit sesuai PRD #26

/**
 * Cek apakah notifikasi diizinkan dikirim berdasarkan cooldown anti-spam
 */
export function shouldSendNotification(fingerprint: string): boolean {
  const lastSent = notificationCooldowns.get(fingerprint);
  const now = Date.now();
  if (lastSent && (now - lastSent) < COOLDOWN_DURATION_MS) {
    return false; // Sedang cooldown
  }
  notificationCooldowns.set(fingerprint, now);
  return true;
}

/**
 * Simpan Web Push Subscription
 */
export async function savePushSubscription(sub: any): Promise<boolean> {
  if (!sub || !sub.endpoint) return false;
  const id = Buffer.from(sub.endpoint).toString('base64').slice(-32);
  inMemorySubscriptions.set(id, {
    ...sub,
    created_at: Date.now(),
  });
  return true;
}

/**
 * Kirim web push ke seluruh subscriber terdaftar
 */
export async function dispatchWebPush(notification: {
  title: string;
  message: string;
  severity?: NotificationSeverity;
  water_level_cm?: number;
}): Promise<{ sent: number; failed: number }> {
  let sentCount = 0;
  let failedCount = 0;

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.message,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: {
      url: '/',
      severity: notification.severity || 'warning',
      water_level_cm: notification.water_level_cm,
      timestamp: Date.now(),
    },
  });

  const subs = Array.from(inMemorySubscriptions.values());

  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, payload);
      sentCount++;
    } catch (err: any) {
      failedCount++;
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Hapus subscription expired
        const id = Buffer.from(sub.endpoint).toString('base64').slice(-32);
        inMemorySubscriptions.delete(id);
      }
    }
  }

  return { sent: sentCount, failed: failedCount };
}
