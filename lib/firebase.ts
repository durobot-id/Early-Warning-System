import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getMessaging, getToken, onMessage, Messaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDbPEmMPHlCE74a2ydIHhpli6qI_vfvOQA',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'deteksi-banjir-3b39c.firebaseapp.com',
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    'https://deteksi-banjir-3b39c-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'deteksi-banjir-3b39c',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'deteksi-banjir-3b39c.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '514911417842',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:514911417842:web:a830ab7e2f4d76e553676b',
};

export const FIREBASE_DB_URL = firebaseConfig.databaseURL;

export const FIREBASE_VAPID_KEY =
  (process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  'BAzhBx6G1NaLexCR4KTE3s4wBxSNp251IbjKaZHeBsArphyUlfJmyEUZaVz2QSrQIiKHOMDZ28jj127eK_yfPNQ').trim();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.databaseURL && firebaseConfig.databaseURL.includes('deteksi-banjir-3b39c')
);

let db: Database | null = null;

try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getDatabase(app);
} catch (error) {
  console.warn('Firebase initialization warning:', error);
}

export { db };

/**
 * Inisialisasi dan ambil instance FCM Messaging jika browser mendukung
 */
export async function getFCMInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;
  const supported = await isSupported();
  if (!supported) return null;
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return getMessaging(app);
  } catch (err) {
    console.warn('FCM getMessaging warning:', err);
    return null;
  }
}

/**
 * Mendaftarkan Service Worker dan menghasilkan FCM Registration Token perangkat
 */
export async function requestFCMToken(forceRefresh: boolean = false): Promise<{ token: string | null; error?: string }> {
  if (typeof window === 'undefined') {
    return { token: null, error: 'Window tidak tersedia di environment server' };
  }

  if (!('Notification' in window)) {
    return { token: null, error: 'Browser ini tidak mendukung fitur Web Push Notification' };
  }

  const supported = await isSupported();
  if (!supported) {
    return { token: null, error: 'Firebase Cloud Messaging tidak didukung pada browser ini' };
  }

  // Jika sudah ada di cache dan tidak forceRefresh
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem('ews_fcm_token');
      if (cached && cached.length > 20) {
        console.log('[FCM] Menggunakan token dari cache perangkat.');
        return { token: cached };
      }
    } catch (e) {}
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { token: null, error: 'Izin notifikasi ditolak oleh pengguna' };
    }

    if (!('serviceWorker' in navigator)) {
      return { token: null, error: 'Service Worker tidak didukung di browser ini' };
    }

    // Daftarkan service worker khusus FCM
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    const messaging = await getFCMInstance();
    if (!messaging) {
      return { token: null, error: 'Gagal menginisialisasi modul FCM Messaging' };
    }

    console.log('[FCM] Meminta token dari Firebase dengan VAPID key...');
    const token = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log('[FCM] Token berhasil dibuat:', token);
      try {
        localStorage.setItem('ews_fcm_token', token);
      } catch (e) {}
      return { token };
    } else {
      return { token: null, error: 'Firebase tidak mengembalikan token perangkat' };
    }
  } catch (err: any) {
    console.error('Error saat request FCM token:', err);
    return { token: null, error: err?.message || 'Gagal meminta izin FCM' };
  }
}

/**
 * Listener notifikasi FCM ketika aplikasi sedang dibuka di layar (foreground)
 */
export async function onFCMMessage(callback: (payload: any) => void): Promise<(() => void) | null> {
  const messaging = await getFCMInstance();
  if (!messaging) return null;
  return onMessage(messaging, callback);
}
