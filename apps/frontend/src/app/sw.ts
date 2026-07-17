import { precacheAndRoute } from 'serwist/precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
  (self as any).skipWaiting();
});

self.addEventListener('activate', (event) => {
  (event as any).waitUntil((self as any).clients.claim());
});

self.addEventListener('fetch', (event) => {
  if ((event as any).request.mode === 'navigate') {
    (event as any).respondWith(
      fetch((event as any).request).catch(() => {
        return (caches as any).match('/');
      })
    );
  }
});
