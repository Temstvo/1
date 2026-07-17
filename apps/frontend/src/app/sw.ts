import { precacheAndRoute } from "@serwist/precaching";

precacheAndRoute((self as any).__SW_MANIFEST);

self.addEventListener("install", () => {
  (self as any).skipWaiting();
});

self.addEventListener("activate", (event) => {
  (event as any).waitUntil((self as any).clients.claim());
});

self.addEventListener("fetch", (event) => {
  if ((event as any).request.mode === "navigate") {
    (event as any).respondWith(
      fetch((event as any).request).catch(() => {
        return caches.match("/");
      })
    );
  }
});
