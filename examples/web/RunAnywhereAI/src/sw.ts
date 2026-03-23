/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any[];
};

// ---------------------------------------------------------------------------
// Precaching
// ---------------------------------------------------------------------------

precacheAndRoute(self.__WB_MANIFEST);

// ---------------------------------------------------------------------------
// Cross-Origin Isolation (COI) logic
// Adapted from coi-serviceworker.js
// ---------------------------------------------------------------------------

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    // Navigation requests (HTML pages): inject COOP + COEP headers
    event.respondWith(
      fetch(request).then((response) => {
        const headers = new Headers(response.headers);
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
    );
  } else if (request.url.startsWith(self.location.origin)) {
    // Same-origin requests: pass through unchanged
    // But we might need to handle WASM files specifically if they are large or need special headers
    return;
  } else {
    // Cross-origin requests: re-fetch and inject CORP header
    event.respondWith(
      fetch(request.url, { mode: 'cors', credentials: 'omit' })
        .then((response) => {
          const headers = new Headers(response.headers);
          headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        })
        .catch(() => fetch(request))
    );
  }
});
