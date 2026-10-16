// Firebase Cloud Messaging & PWA Service Worker untuk EWS Early Warning System
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const CACHE_NAME = 'ews-fcm-cache-v1';
const STATIC_ASSETS = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

// PWA Cache Lifecycle
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbPEmMPHlCE74a2ydIHhpli6qI_vfvOQA",
  authDomain: "deteksi-banjir-3b39c.firebaseapp.com",
  databaseURL: "https://deteksi-banjir-3b39c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "deteksi-banjir-3b39c",
  storageBucket: "deteksi-banjir-3b39c.appspot.com",
  messagingSenderId: "514911417842",
  appId: "1:514911417842:web:a830ab7e2f4d76e553676b"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handler notifikasi saat aplikasi berada di latar belakang (background / closed)
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Menerima pesan latar belakang:', payload);

    const title =
      payload.notification?.title ||
      payload.data?.title ||
      'Peringatan Dini Banjir EWS';

    const body =
      payload.notification?.body ||
      payload.data?.body ||
      payload.data?.message ||
      'Terdeteksi kenaikan volume air pada sensor. Harap waspada!';

    const notificationOptions = {
      body: body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [300, 100, 300, 100, 400],
      tag: 'ews-flood-fcm-alert',
      renotify: true,
      data: {
        url: payload.data?.url || '/',
        timestamp: Date.now(),
      },
      actions: [
        { action: 'open', title: 'Buka Pantauan' },
        { action: 'close', title: 'Tutup' },
      ],
    };

    return self.registration.showNotification(title, notificationOptions);
  });
} catch (e) {
  console.warn('Firebase messaging init in SW warning:', e);
}

// Fallback listener push umum jika payload raw
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const raw = event.data.json();
    if (raw.notification || raw.data) {
      // Ditangani oleh messaging.onBackgroundMessage
      return;
    }
  } catch (err) {
    // Pesan teks biasa
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Peringatan Dini EWS', {
        body: text,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [200, 100, 200],
      })
    );
  }
});

// Listener klik notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
