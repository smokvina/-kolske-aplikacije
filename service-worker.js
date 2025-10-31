// service-worker.js

self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('New notification', data);
  const options = {
    body: data.body,
    icon: './icon.png', // You can add an icon for the notification
    badge: './badge.png' // And a badge
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('install', event => {
  console.log('Service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service worker activated');
});
