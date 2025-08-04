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
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();
      setIsSubscribed(!!existingSubscription);
      setSubscription(existingSubscription);
    } catch (error) {
      console.error("Error checking subscription status:", error);
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
      const registration = await navigator.serviceWorker.register("/sw.js");
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Save subscription to database
      const userId = localStorage.getItem("userId");
      if (!userId) {
        window.showToast?.({
          message: "Vous devez être connecté pour activer les notifications",
          type: "error",
        });
        return;
      }

      const response = await fetch("/api/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: newSubscription,
          userId: userId,
        }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setSubscription(newSubscription);
        window.showToast?.({
          message: "Notifications activées ! 🎉",
          type: "success",
        });
      } else {
        throw new Error("Failed to save subscription");
      }
    } catch (error) {
      console.error("Error subscribing to push:", error);
      window.showToast?.({
        message: "Erreur lors de l'activation des notifications",
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
    return null;
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
