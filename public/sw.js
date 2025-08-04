// Service Worker for Push Notifications
const CACHE_NAME = "dodo-ensemble-v1";

// Install event - simplified cache
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - simplified activation
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
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
    silent: true,
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

// Message event for communication with main app
self.addEventListener("message", (event) => {
  console.log("Message received in SW:", event);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
