import { useState, useEffect } from "react";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "../utils/vapid";

const PushNotificationManager = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Check if service worker and push manager are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      console.log("🔍 Vérification du statut des notifications...");

      // Vérifier si les notifications sont supportées
      if (typeof window === "undefined" || !("Notification" in window)) {
        console.log("❌ Notifications non supportées");
        setIsSupported(false);
        return;
      }

      // Vérifier les permissions
      const permission = Notification.permission;
      console.log("📋 Permission actuelle:", permission);

      if (permission === "denied") {
        console.log("❌ Notifications bloquées par l'utilisateur");
        setIsSupported(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      console.log("✅ Service worker prêt:", registration);

      const existingSubscription =
        await registration.pushManager.getSubscription();

      console.log(
        "📱 Subscription existante:",
        existingSubscription ? "Oui" : "Non"
      );

      setIsSubscribed(!!existingSubscription);
      setSubscription(existingSubscription);
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du statut:", error);
      setIsSupported(false);
    }
  };

  const subscribeToPush = async () => {
    if (!isSupported) {
      window.showToast?.({
        message:
          "Les notifications push ne sont pas supportées sur votre navigateur",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔔 Début de l'abonnement aux notifications...");

      // Vérifier les permissions d'abord
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "denied"
      ) {
        throw new Error(
          "Les notifications sont bloquées. Veuillez les autoriser dans les paramètres de votre navigateur."
        );
      }

      console.log("📱 Enregistrement du service worker...");
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("✅ Service worker enregistré:", registration);

      // Attendre que le service worker soit actif
      if (registration.installing || registration.waiting) {
        console.log("⏳ Attente de l'activation du service worker...");
        await new Promise((resolve) => {
          const serviceWorker = registration.installing || registration.waiting;
          serviceWorker.addEventListener("statechange", () => {
            if (serviceWorker.state === "activated") {
              console.log("✅ Service worker activé");
              resolve();
            }
          });
        });
      }

      console.log("🔍 Vérification du service worker actif...");
      const activeRegistration = await navigator.serviceWorker.ready;
      console.log("✅ Service worker prêt:", activeRegistration);

      const existingSubscription =
        await activeRegistration.pushManager.getSubscription();

      if (existingSubscription) {
        console.log("🔄 Désabonnement de l'ancienne subscription...");
        await existingSubscription.unsubscribe();
      }

      console.log("🔑 Création de la nouvelle subscription...");
      const newSubscription = await activeRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log("✅ Nouvelle subscription créée:", newSubscription);

      // Save subscription to database
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error(
          "Vous devez être connecté pour activer les notifications"
        );
      }

      console.log("💾 Sauvegarde de la subscription en base...");
      const response = await fetch("/api/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: newSubscription,
          userId: userId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Subscription sauvegardée:", result);

        setIsSubscribed(true);
        setSubscription(newSubscription);
        window.showToast?.({
          message: "Notifications activées ! 🎉",
          type: "success",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Erreur lors de la sauvegarde:", errorData);
        throw new Error(
          `Erreur serveur: ${errorData.error || response.statusText}`
        );
      }
    } catch (error) {
      console.error("❌ Erreur détaillée lors de l'abonnement:", error);

      // Messages d'erreur plus spécifiques
      let errorMessage = "Erreur lors de l'activation des notifications";

      if (error.message.includes("bloquées")) {
        errorMessage =
          "Les notifications sont bloquées. Veuillez les autoriser dans les paramètres de votre navigateur.";
      } else if (error.message.includes("connecté")) {
        errorMessage =
          "Vous devez être connecté pour activer les notifications";
      } else if (error.message.includes("serveur")) {
        errorMessage = error.message;
      } else if (error.name === "NotAllowedError") {
        errorMessage =
          "Permission refusée. Veuillez autoriser les notifications.";
      } else if (error.name === "NotSupportedError") {
        errorMessage =
          "Les notifications push ne sont pas supportées sur votre appareil.";
      } else if (error.name === "InvalidStateError") {
        errorMessage = "État invalide. Veuillez réessayer.";
      } else if (error.name === "NetworkError") {
        errorMessage = "Erreur réseau. Vérifiez votre connexion internet.";
      }

      window.showToast?.({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
      setSubscription(null);
      window.showToast?.({
        message: "Notifications désactivées",
        type: "info",
      });
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      window.showToast?.({
        message: "Erreur lors de la désactivation",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          padding: "20px",
          margin: "16px 0",
          marginBottom: "90px",
          border: "1px solid rgba(255, 200, 220, 0.3)",
          boxShadow: "0 4px 20px rgba(255, 200, 220, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "24px" }}>⚠️</span>
          <div>
            <h3
              style={{
                margin: "0 0 4px 0",
                fontSize: "18px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              Notifications non disponibles
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#666",
                lineHeight: "1.4",
              }}
            >
              {typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "denied"
                ? "Les notifications sont bloquées. Veuillez les autoriser dans les paramètres de votre navigateur."
                : "Les notifications push ne sont pas supportées sur votre appareil ou navigateur."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "20px",
        margin: "16px 0",
        marginBottom: "90px",
        border: "1px solid rgba(255, 200, 220, 0.3)",
        boxShadow: "0 4px 20px rgba(255, 200, 220, 0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <span style={{ fontSize: "24px" }}>{isSubscribed ? "🔔" : "🔕"}</span>
        <div>
          <h3
            style={{
              margin: "0 0 4px 0",
              fontSize: "18px",
              fontWeight: 600,
              color: "#333",
            }}
          >
            Notifications Push
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#666",
              lineHeight: "1.4",
            }}
          >
            {isSubscribed
              ? "Recevez des notifications pour les événements importants"
              : "Activez les notifications pour ne manquer aucun événement"}
          </p>
        </div>
      </div>

      <button
        onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
        disabled={isLoading}
        style={{
          background: isSubscribed
            ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)"
            : "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          opacity: isLoading ? 0.7 : 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(255, 64, 129, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }
        }}
      >
        {isLoading ? (
          <>
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderTop: "2px solid #fff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            {isSubscribed ? "Désactivation..." : "Activation..."}
          </>
        ) : (
          <>{isSubscribed ? "🔕 Désactiver" : "🔔 Activer"}</>
        )}
      </button>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PushNotificationManager;
