/**
 * Service Worker for Ayurvritta PWA
 * Provides offline support, caching, and push notifications
 */

const CACHE_NAME = 'ayurvritta-v1';
const STATIC_CACHE = 'ayurvritta-static-v1';
const DYNAMIC_CACHE = 'ayurvritta-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html',
];

// Pages to cache for offline
const OFFLINE_PAGES = [
    '/',
    '/#/services',
    '/#/about',
    '/#/booking',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[ServiceWorker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys
                        .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                        .map((key) => caches.delete(key))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (url.origin !== location.origin) return;

    // Skip API calls (let them go to network)
    if (url.pathname.startsWith('/api')) return;

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached response and update cache in background
                    event.waitUntil(updateCache(request));
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Cache the new response
                        if (networkResponse.ok) {
                            const responseClone = networkResponse.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then((cache) => cache.put(request, responseClone));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed, return offline page for navigation
                        if (request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Update cache in background
async function updateCache(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            await cache.put(request, response);
        }
    } catch (e) {
        // Network error, ignore
    }
}

// Push notification event
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received');

    let data = {
        title: 'Ayurvritta',
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: { url: '/' },
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            vibrate: [200, 100, 200],
            tag: data.tag || 'default',
            data: data.data,
            actions: data.actions || [
                { action: 'open', title: 'Open' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
        })
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked');

    event.notification.close();

    if (event.action === 'dismiss') return;

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if already open
                for (const client of windowClients) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Background sync event (for offline form submissions)
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Sync event:', event.tag);

    if (event.tag === 'booking-sync') {
        event.waitUntil(syncBookings());
    }
});

// Sync pending bookings
async function syncBookings() {
    try {
        // Get pending bookings from IndexedDB
        const db = await openDB();
        const bookings = await db.getAll('pending-bookings');

        for (const booking of bookings) {
            try {
                // Send to server
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(booking),
                });

                if (response.ok) {
                    await db.delete('pending-bookings', booking.id);
                }
            } catch (e) {
                console.error('[ServiceWorker] Booking sync failed:', e);
            }
        }
    } catch (e) {
        console.error('[ServiceWorker] Sync error:', e);
    }
}

// Simple IndexedDB wrapper
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ayurvritta-offline', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            resolve({
                getAll: (store) => new Promise((res, rej) => {
                    const tx = db.transaction(store, 'readonly');
                    const req = tx.objectStore(store).getAll();
                    req.onsuccess = () => res(req.result);
                    req.onerror = () => rej(req.error);
                }),
                delete: (store, key) => new Promise((res, rej) => {
                    const tx = db.transaction(store, 'readwrite');
                    const req = tx.objectStore(store).delete(key);
                    req.onsuccess = () => res();
                    req.onerror = () => rej(req.error);
                }),
            });
        };

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('pending-bookings')) {
                db.createObjectStore('pending-bookings', { keyPath: 'id' });
            }
        };
    });
}

console.log('[ServiceWorker] Script loaded');
