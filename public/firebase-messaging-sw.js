// Firebase Cloud Messaging Service Worker untuk EWS Early Warning System
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDbPEmMPHlCE74a2ydIHhpli6qI_vfvOQA",
  authDomain: "deteksi-banjir-3b39c.firebaseapp.com",
  databaseURL: "https://deteksi-banjir-3b39c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "deteksi-banjir-3b39c",
  storageBucket: "deteksi-banjir-3b39c.appspot.com",
  messagingSenderId: "514911417842",
  appId: "1:514911417842:web:a830ab7e2f4d76e553676b"
};

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
