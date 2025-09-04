// Intelligent Service Worker with Smart Caching Strategy
// Implements: [CRITICAL PRIORITY 8: Production Console Log Eradication]

// Simple logger for service worker (no external dependencies)
const logger = {
  error: (message, ...args) => {
    // In production, we could send to a logging service
    // For now, we'll be silent in production
    if (process.env.NODE_ENV !== 'production') {
      console.error(message, ...args);
    }
  },
  log: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message, ...args);
    }
  },
};

const CACHE_VERSION = 'shabra-os-v2.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Cache strategies for different content types
const CACHE_STRATEGIES = {
  STATIC: 'cache-first', // CSS, JS, images, fonts
  DYNAMIC: 'network-first', // API responses, user data
  HTML: 'stale-while-revalidate', // Page content
};

// Static assets that can be cached aggressively
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/images/shabra-logo.jpg',
];

// API routes that should never be cached
const API_ROUTES = [
  '/api/content-slots',
  '/api/projects',
  '/api/tasks',
  '/api/stories',
  '/api/story-types',
  '/api/users',
  '/api/attendance',
];

// Install event - cache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Create other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE),
    ])
      .then(() => {
        // Force the waiting service worker to become active
        self.skipWaiting();
      })
      .catch(error => {
        logger.error('Service Worker install failed:', error);
        // Don't fail the install if caching fails
        return Promise.resolve();
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete old caches that don't match current version
            if (!cacheName.startsWith(CACHE_VERSION)) {
              logger.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .catch(error => {
        logger.error('Service Worker activation failed:', error);
      })
  );
});

// Intelligent fetch event with different strategies for different content types
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on request type
  if (isAPIRequest(url)) {
    // API routes - network first, never cache
    event.respondWith(networkFirstStrategy(request));
  } else if (isStaticAsset(url)) {
    // Static assets - cache first
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (isHTMLPage(url)) {
    // HTML pages - stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE));
  } else {
    // Default - network first
    event.respondWith(networkFirstStrategy(request));
  }
});

// Helper functions to determine request types
function isAPIRequest(url) {
  return (
    API_ROUTES.some(route => url.pathname.startsWith(route)) ||
    url.pathname.startsWith('/api/')
  );
}

function isStaticAsset(url) {
  return (
    STATIC_ASSETS.some(asset => url.pathname === asset) ||
    url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|woff|woff2|ttf|eot|ico)$/)
  );
}

function isHTMLPage(url) {
  return (
    url.pathname === '/' ||
    !url.pathname.includes('.') ||
    url.pathname.endsWith('/')
  );
}

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    logger.error('Cache first strategy failed:', error);
    // Return cached version if available, even if stale
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network First Strategy - for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Don't cache API responses
      return networkResponse;
    }
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    logger.error('Network first strategy failed:', error);
    // Try to return cached version as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return error response
    return new Response('Network error', { status: 503 });
  }
}

// Stale While Revalidate Strategy - for HTML pages
async function staleWhileRevalidateStrategy(request, cacheName) {
  try {
    // Try to get cached version first
    const cachedResponse = await caches.match(request);

    // Fetch fresh version in background
    const fetchPromise = fetch(request)
      .then(async networkResponse => {
        if (networkResponse.ok) {
          const cache = await caches.open(cacheName);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      })
      .catch(error => {
        logger.error('Background fetch failed:', error);
      });

    // Return cached version immediately if available
    if (cachedResponse) {
      return cachedResponse;
    }

    // Wait for network response if no cache
    return await fetchPromise;
  } catch (error) {
    logger.error('Stale while revalidate strategy failed:', error);
    // Return cached version as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Enhanced message handling for cache management
self.addEventListener('message', event => {
  const { type, data } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHES':
      clearAllCaches();
      break;

    case 'INVALIDATE_CONTENT':
      invalidateContentCache(data.contentType);
      break;

    case 'UPDATE_CACHE_VERSION':
      updateCacheVersion(data.newVersion);
      break;

    default:
      logger.log('Unknown message type:', type);
  }
});

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    logger.log('All caches cleared successfully');

    // Notify clients that caches were cleared
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'CACHES_CLEARED' });
    });
  } catch (error) {
    logger.error('Failed to clear caches:', error);
  }
}

// Invalidate specific content type caches
async function invalidateContentCache(contentType) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const keys = await cache.keys();

    // Clear cached responses for the specified content type
    const contentKeys = keys.filter(key => {
      const url = new URL(key.url);
      return (
        url.pathname.includes(contentType) || url.pathname.startsWith('/api/')
      );
    });

    await Promise.all(contentKeys.map(key => cache.delete(key)));

    logger.log(`Cache invalidated for content type: ${contentType}`);

    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CONTENT_CACHE_INVALIDATED',
        contentType,
      });
    });
  } catch (error) {
    logger.error('Failed to invalidate content cache:', error);
  }
}

// Update cache version
async function updateCacheVersion(newVersion) {
  try {
    // Clear old caches
    await clearAllCaches();

    // Update version
    CACHE_VERSION = newVersion;

    logger.log(`Cache version updated to: ${newVersion}`);
  } catch (error) {
    logger.error('Failed to update cache version:', error);
  }
}

// Enhanced error handling
self.addEventListener('error', event => {
  logger.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  logger.error('Service Worker unhandled rejection:', event.reason);
});

// Periodic cache cleanup
setInterval(
  async () => {
    try {
      const cache = await caches.open(DYNAMIC_CACHE);
      const keys = await cache.keys();

      // Remove old entries (older than 1 hour)
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const responseDate = new Date(dateHeader).getTime();
            if (responseDate < oneHourAgo) {
              await cache.delete(key);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Periodic cache cleanup failed:', error);
    }
  },
  30 * 60 * 1000
); // Run every 30 minutes
