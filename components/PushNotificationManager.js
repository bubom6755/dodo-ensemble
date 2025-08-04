import { useState, useEffect } from "react";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "../utils/vapid";

const PushNotificationManager = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  // Fonction pour ajouter des logs à l'interface
  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = { message, type, timestamp };
    setLogs((prev) => [...prev, newLog]);
    // Garder seulement les 20 derniers logs
    if (logs.length > 20) {
      setLogs((prev) => prev.slice(-20));
    }
  };

  useEffect(() => {
    // Check if service worker and push manager are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      // Vérification spécifique pour Safari iOS
      const isSafariIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent);

      if (isSafariIOS) {
        console.log("⚠️ Safari iOS détecté - notifications push limitées");
        // Sur Safari iOS, les notifications push ne fonctionnent que si l'app est installée en PWA
        if (window.navigator.standalone) {
          console.log("✅ App installée en PWA - notifications supportées");
          setIsSupported(true);
          checkSubscriptionStatus();
        } else {
          console.log(
            "❌ App non installée en PWA - notifications non supportées sur Safari iOS"
          );
          setIsSupported(false);
        }
      } else {
        console.log("✅ Navigateur supporté - notifications disponibles");
        setIsSupported(true);
        checkSubscriptionStatus();
      }
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      addLog("🔍 Vérification du statut des notifications...", "info");

      // Vérifier si les notifications sont supportées
      if (typeof window === "undefined" || !("Notification" in window)) {
        addLog("❌ Notifications non supportées", "error");
        setIsSupported(false);
        return;
      }

      // Vérifier les permissions
      const permission = Notification.permission;
      addLog(`📋 Permission actuelle: ${permission}`, "info");

      if (permission === "denied") {
        addLog("❌ Notifications bloquées", "error");
        setIsSupported(false);
        return;
      }

      // Vérifier si on a déjà une subscription
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();

      addLog(
        `📱 Subscription existante: ${existingSubscription ? "Oui" : "Non"}`,
        "info"
      );

      setIsSubscribed(!!existingSubscription);
      setSubscription(existingSubscription);
    } catch (error) {
      addLog(`❌ Erreur: ${error.message}`, "error");
      setIsSupported(false);
    }
  };

  const resetServiceWorker = async () => {
    try {
      addLog("🔄 Réinitialisation du service worker...", "info");
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
      addLog("✅ Service workers supprimés", "success");
    } catch (error) {
      addLog(
        `❌ Erreur lors de la réinitialisation: ${error.message}`,
        "error"
      );
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
      addLog("🔔 Début de l'abonnement aux notifications...", "info");

      // Demander la permission d'abord
      addLog("📋 Demande d'autorisation...", "info");
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error("Permission refusée pour les notifications");
      }

      addLog("✅ Permission accordée", "success");

      // Enregistrer le service worker
      addLog("📱 Enregistrement du service worker...", "info");
      const registration = await navigator.serviceWorker.register("/sw.js");
      addLog("✅ Service worker enregistré", "success");

      // Créer la subscription
      addLog("🔑 Création de la subscription...", "info");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      addLog("✅ Subscription créée", "success");

      // Sauvegarder en base
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error(
          "Vous devez être connecté pour activer les notifications"
        );
      }

      addLog("💾 Sauvegarde en base...", "info");
      const response = await fetch("/api/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription,
          userId: userId,
        }),
      });

      if (response.ok) {
        addLog("✅ Notifications activées avec succès !", "success");
        setIsSubscribed(true);
        setSubscription(subscription);
        window.showToast?.({
          message: "Notifications activées ! 🎉",
          type: "success",
        });
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      addLog(`❌ Erreur: ${error.message}`, "error");
      window.showToast?.({
        message: error.message,
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
              {(() => {
                if (
                  typeof window !== "undefined" &&
                  "Notification" in window &&
                  Notification.permission === "denied"
                ) {
                  return "Les notifications sont bloquées. Veuillez les autoriser dans les paramètres de votre navigateur.";
                }

                // Vérification Safari iOS
                const isSafariIOS =
                  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                  /Safari/.test(navigator.userAgent) &&
                  !/Chrome/.test(navigator.userAgent);
                if (isSafariIOS && !window.navigator.standalone) {
                  return "Sur Safari iOS, les notifications push ne fonctionnent que si l'app est installée. Utilisez le bouton 'Partager' puis 'Sur l'écran d'accueil'.";
                }

                return "Les notifications push ne sont pas supportées sur votre appareil ou navigateur.";
              })()}
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

      {/* Bouton pour afficher/masquer les logs */}
      <button
        onClick={() => setShowLogs(!showLogs)}
        style={{
          background: "none",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12px",
          color: "#666",
          cursor: "pointer",
          marginTop: "12px",
          width: "100%",
        }}
      >
        {showLogs ? "📋 Masquer les logs" : "📋 Afficher les logs"}
      </button>

      {/* Affichage des logs */}
      {showLogs && logs.length > 0 && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            background: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
            maxHeight: "200px",
            overflowY: "auto",
            fontSize: "11px",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{ marginBottom: "8px", fontWeight: "bold", color: "#333" }}
          >
            📋 Logs détaillés ({logs.length} entrées)
          </div>
          {logs.map((log, index) => (
            <div
              key={index}
              style={{
                marginBottom: "4px",
                padding: "2px 0",
                borderBottom: "1px solid #eee",
                color:
                  log.type === "error"
                    ? "#dc3545"
                    : log.type === "success"
                    ? "#28a745"
                    : "#666",
              }}
            >
              <span style={{ color: "#999", fontSize: "10px" }}>
                {log.timestamp}
              </span>
              <span style={{ marginLeft: "8px" }}>{log.message}</span>
            </div>
          ))}
        </div>
      )}

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
