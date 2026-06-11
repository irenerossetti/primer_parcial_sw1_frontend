/**
 * Service Worker para PWA - Modo Offline
 * Permite que la aplicación web funcione sin conexión
 */

const CACHE_NAME = 'workflow-pwa-v1';
const DATA_CACHE_NAME = 'workflow-data-v1';

// Archivos a cachear en la instalación
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/polyfills.js',
  '/runtime.js',
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Interceptar solicitudes de red
self.addEventListener('fetch', (event) => {
  // Solo cachear solicitudes GET
  if (event.request.method !== 'GET') {
    return;
  }

  const { url } = event.request;
  
  // Estrategia para APIs: Network First, fallback a Cache
  if (url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // Si la respuesta es válida, cachearla
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Si falla la red, buscar en cache
            return cache.match(event.request);
          });
      })
    );
    return;
  }
  
  // Estrategia para recursos estáticos: Cache First, fallback a Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Sincronización en background
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-tramites') {
    event.waitUntil(syncTramites());
  }
});

// Función para sincronizar trámites pendientes
async function syncTramites() {
  try {
    console.log('[ServiceWorker] Syncing tramites...');
    
    // Obtener operaciones pendientes de IndexedDB
    const pendingOps = await getPendingOperations();
    
    for (const op of pendingOps) {
      try {
        await fetch(op.url, {
          method: op.method,
          headers: op.headers,
          body: JSON.stringify(op.data),
        });
        
        // Si tuvo éxito, eliminar de pendientes
        await removePendingOperation(op.id);
        console.log('[ServiceWorker] Synced operation:', op.id);
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync:', op.id, error);
      }
    }
    
    console.log('[ServiceWorker] Sync complete');
  } catch (error) {
    console.error('[ServiceWorker] Sync error:', error);
  }
}

// Helpers para IndexedDB (simulado - necesita implementación real)
async function getPendingOperations() {
  // En producción, esto leería de IndexedDB
  return [];
}

async function removePendingOperation(id) {
  // En producción, esto eliminaría de IndexedDB
  console.log('[ServiceWorker] Removing pending operation:', id);
}

// Notificaciones Push
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push Received.');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Workflow Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    data: data.url || '/',
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click Received.');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
