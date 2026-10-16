import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import { NotificationSeverity } from './types';

// Default VAPID key pairs untuk pengiriman Web Push dari Laptop/Server
const DEFAULT_VAPID_PUBLIC =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BEGI9yTkREPCrQDT6_MnKH5iKYD6TqakHY7LStUL12iE1dBHQV-iZFvAOUhu_pfygxRSXyddQNE2S6ceo6_oaKU';
const DEFAULT_VAPID_PRIVATE =
  process.env.VAPID_PRIVATE_KEY || 'BAanFF5pN-3gDsivFL_HNJN4ci0TkjQlprmTBxj-cRk';
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

// Penyimpanan persistent subscription perangkat di laptop (folder data/subscriptions.json)
const DATA_DIR = path.join(process.cwd(), 'data');
const SUBS_FILE = path.join(DATA_DIR, 'subscriptions.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadSubscriptions(): Map<string, any> {
  ensureDataDir();
  try {
    if (fs.existsSync(SUBS_FILE)) {
      const content = fs.readFileSync(SUBS_FILE, 'utf-8');
      const data = JSON.parse(content);
      return new Map(Object.entries(data));
    }
  } catch (e) {
    console.warn('Gagal membaca data/subscriptions.json:', e);
  }
  return new Map();
}

function persistSubscriptions(map: Map<string, any>) {
  ensureDataDir();
  try {
    const obj = Object.fromEntries(map);
    fs.writeFileSync(SUBS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Gagal menyimpan data/subscriptions.json:', e);
  }
}

// Anti-spam cooldown cache
const notificationCooldowns: Map<string, number> = new Map();
const COOLDOWN_DURATION_MS = 3 * 60 * 1000; // 3 menit cooldown

export function shouldSendNotification(fingerprint: string): boolean {
  const lastSent = notificationCooldowns.get(fingerprint);
  const now = Date.now();
  if (lastSent && now - lastSent < COOLDOWN_DURATION_MS) {
    return false;
  }
  notificationCooldowns.set(fingerprint, now);
  return true;
}

/**
 * Simpan Web Push Subscription perangkat ke file JSON di laptop
 */
export async function savePushSubscription(sub: any): Promise<boolean> {
  if (!sub || !sub.endpoint) return false;
  const subs = loadSubscriptions();
  const id = Buffer.from(sub.endpoint).toString('base64').slice(-32);
  subs.set(id, {
    ...sub,
    created_at: Date.now(),
  });
  persistSubscriptions(subs);
  console.log(`[Push Server] Subscription HP baru tersimpan! Total perangkat aktif: ${subs.size}`);
  return true;
}

/**
 * Dapatkan jumlah perangkat HP yang telah mendaftar
 */
export function getSubscriptionsCount(): number {
  const subs = loadSubscriptions();
  return subs.size;
}

/**
 * Kirim Web Push dari laptop ke SELURUH HP pengguna terdaftar (bahkan saat aplikasi ditutup)
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

  const subs = loadSubscriptions();
  const entries = Array.from(subs.entries());

  console.log(`[Push Server] Mengirim push alert ke ${entries.length} perangkat terdaftar...`);

  for (const [id, sub] of entries) {
    try {
      await webpush.sendNotification(sub, payload);
      sentCount++;
      console.log(`[Push Server] ✅ Berhasil terkirim ke perangkat: ${id}`);
    } catch (err: any) {
      failedCount++;
      console.warn(`[Push Server] ❌ Gagal kirim ke ${id}:`, err?.message || err);
      if (err.statusCode === 410 || err.statusCode === 404) {
        subs.delete(id);
      }
    }
  }

  persistSubscriptions(subs);
  return { sent: sentCount, failed: failedCount };
}
