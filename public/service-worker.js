/**
 * @fileoverview Service Worker pour Fare Calculator PWA
 * 
 * Fonctionnalités :
 * - Cache statique des assets (HTML, CSS, JS)
 * - Cache dynamique des API responses
 * - Stratégie Network First pour les API
 * - Stratégie Cache First pour les assets
 * - Offline fallback
 * - Mise à jour automatique
 */

const CACHE_VERSION = 'fare-calculator-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Assets à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/taxi-logo-v2.png',
];

// Durée de vie du cache API (24 heures)
const API_CACHE_DURATION = 24 * 60 * 60 * 1000;

// Installation - Mise en cache des assets statiques
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installation...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Service Worker: Mise en cache des assets statiques');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('✅ Service Worker: Installation terminée');
      return self.skipWaiting(); // Activer immédiatement
    })
  );
});

// Activation - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activation...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('fare-calculator-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('🗑️ Service Worker: Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation terminée');
      return self.clients.claim(); // Prendre le contrôle immédiatement
    })
  );
});

// Fetch - Stratégies de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // ⚠️ NE PAS intercepter Nominatim - cause des problèmes CORS
  // Nominatim doit passer directement sans interception du SW
  if (url.hostname.includes('nominatim')) {
    return; // Laisser passer sans interception
  }

  // Stratégie pour les API externes (Mapbox seulement)
  if (url.hostname.includes('mapbox.com')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Stratégie pour les API Django (backend)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Stratégie pour les assets statiques (JS, CSS, images)
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE));
    return;
  }

  // Stratégie pour la navigation (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
    return;
  }

  // Par défaut : Network First
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
});

// Stratégie: Network First (avec fallback cache)
async function networkFirstWithCache(request, cacheName) {
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request);
    
    // Si succès, mettre en cache
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📶 Service Worker: Réseau indisponible, utilisation du cache');
    
    // Si échec réseau, chercher dans le cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si pas en cache et c'est une navigation, retourner la page d'accueil
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    // Sinon, retourner une réponse d'erreur
    return new Response('Contenu non disponible hors ligne', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain',
      }),
    });
  }
}

// Stratégie: Cache First (avec fallback réseau)
async function cacheFirstWithNetwork(request, cacheName) {
  // Chercher d'abord dans le cache
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Si pas en cache, aller sur le réseau
  try {
    const networkResponse = await fetch(request);
    
    // Mettre en cache pour la prochaine fois
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ Service Worker: Impossible de récupérer:', request.url);
    return new Response('Contenu non disponible', {
      status: 404,
      statusText: 'Not Found',
    });
  }
}

// Messages - Communication avec le client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Service Worker: Skip waiting demandé');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ Service Worker: Nettoyage cache demandé');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('fare-calculator-'))
            .map((name) => caches.delete(name))
        );
      })
    );
  }
});

// Notification de mise à jour disponible
self.addEventListener('controllerchange', () => {
  console.log('🔄 Service Worker: Nouveau contrôleur activé');
});

console.log('✅ Service Worker chargé:', CACHE_VERSION);
