// Configuration VAPID pour les notifications push
export const VAPID_PUBLIC_KEY =
  "BInzKFIkdJ5js3aBJbZfpJ-JT7Yyqoj0QNMHt8hQLCyRiGUhEu3Al4WbVROXfUaQ02zZeL6RO4UuaMP2lLYbiGA";
export const VAPID_PRIVATE_KEY = "rtfNQU4_zsaJVLRIpEtoCM6p9Jyvv_BtEwGtH0gRxcQ";

// Fonction utilitaire pour convertir la clé publique en Uint8Array
export function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Vérifier si les clés VAPID sont valides
export function validateVapidKeys() {
  if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.length < 80) {
    console.error("❌ Clé VAPID publique invalide");
    return false;
  }

  if (!VAPID_PRIVATE_KEY || VAPID_PRIVATE_KEY.length < 40) {
    console.error("❌ Clé VAPID privée invalide");
    return false;
  }

  console.log("✅ Clés VAPID valides");
  return true;
}
