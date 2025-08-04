// Service Worker for Push Notifications
const CACHE_NAME = "dodo-ensemble-v1";

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/static/js/bundle.js",
        "/static/css/main.css",
      ]);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event - handle push notifications
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  let notificationData = {
    title: "Dodo Ensemble",
    body: "Vous avez une nouvelle notification !",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "dodo-notification",
    requireInteraction: false,
    actions: [
      {
        action: "open",
        title: "Ouvrir",
        icon: "/icon-72x72.png",
      },
      {
        action: "close",
        title: "Fermer",
        icon: "/icon-72x72.png",
      },
    ],
    data: {
      url: "/",
      timestamp: Date.now(),
    },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
      };
    } catch (error) {
      console.error("Error parsing push data:", error);
    }
  }

  const options = {
    ...notificationData,
    vibrate: [200, 100, 200],
    sound: "/notification-sound.mp3", // Optional sound file
    silent: true, // Set to false if you have a sound file
    requireInteraction: false,
    renotify: true,
    tag: "dodo-notification",
    actions: notificationData.actions,
    data: notificationData.data,
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Open the app or specific page
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (
            client.url.includes(event.notification.data?.url || "/") &&
            "focus" in client
          ) {
            return client.focus();
          }
        }

        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data?.url || "/");
        }
      })
  );
});

// Background sync for offline functionality
self.addEventListener("sync", (event) => {
  console.log("Background sync:", event);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync tasks
      console.log("Background sync task")
    );
  }
});

// Message event for communication with main app
self.addEventListener("message", (event) => {
  console.log("Message received in SW:", event);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch event for offline support
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip non-GET requests and external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page if available
        return caches.match("/offline.html");
      })
  );
});
