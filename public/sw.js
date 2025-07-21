self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.getNotifications().then((notifs) => {
      if (notifs.length > 0) return;
      return self.registration.showNotification(data.title || "Notification", {
        body: data.body,
        icon: "/icon-192x192.png", // adapte à ton app
        data: data,
      });
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        clientList[0].focus();
      } else {
        clients.openWindow("/");
      }
    })
  );
});
