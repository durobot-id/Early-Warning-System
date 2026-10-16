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
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'deteksi-banjir-3b39c.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '514911417842',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:514911417842:web:a830ab7e2f4d76e553676b',
};

export const FIREBASE_DB_URL = firebaseConfig.databaseURL;

export const FIREBASE_VAPID_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  'BKUekbtOu0xQeILxjHZsb0xxFF8mxKiN-F3g2-zpK2tXBHsaGA8iHB-_VgTv4eeq56_K39c1f75vObbp1ipWn58';

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
 * Mendaftarkan FCM Service Worker dan mengambil FCM Token perangkat
 */
export async function requestFCMToken(): Promise<{ token: string | null; error?: string }> {
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

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { token: null, error: 'Izin notifikasi ditolak oleh pengguna' };
    }

    // Daftarkan service worker khusus FCM
    let swRegistration: ServiceWorkerRegistration;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;
    } else {
      return { token: null, error: 'Service Worker tidak didukung di browser ini' };
    }

    const messaging = await getFCMInstance();
    if (!messaging) {
      return { token: null, error: 'Gagal inisialisasi modul FCM Messaging' };
    }

    const token = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      try {
        localStorage.setItem('ews_fcm_token', token);
      } catch (e) {}
      return { token };
    } else {
      return { token: null, error: 'Tidak dapat menghasilkan token FCM' };
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
