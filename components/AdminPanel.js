import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const VAPID_PUBLIC_KEY =
  "BInzKFIkdJ5js3aBJbZfpJ-JT7Yyqoj0QNMHt8hQLCyRiGUhEu3Al4WbVROXfUaQ02zZeL6RO4UuaMP2lLYbiGA";

const AdminPanel = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [globalNotifTitle, setGlobalNotifTitle] = useState("");
  const [globalNotifMsg, setGlobalNotifMsg] = useState("");
  const [showSubJson, setShowSubJson] = useState(false);
  const [subJson, setSubJson] = useState("");

  // Styles
  const panelStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.8)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(8px)",
  };

  const contentStyle = {
    background: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    padding: 0,
    maxWidth: "min(500px, 90vw)",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #ff4081 0%, #d0488f 100%)",
    color: "#fff",
    padding: "20px 24px",
    borderRadius: "20px 20px 0 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const tabStyle = {
    padding: "12px 20px",
    background: "none",
    border: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 600,
    borderBottom: "3px solid transparent",
    transition: "all 0.2s ease",
  };

  const activeTabStyle = {
    ...tabStyle,
    color: "#ff4081",
    borderBottomColor: "#ff4081",
  };

  const buttonStyle = {
    background: "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    margin: "8px 0",
    width: "100%",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 16,
    marginBottom: 12,
    boxSizing: "border-box",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: 80,
    resize: "vertical",
  };

  // Fonctions
  const sendGlobalNotification = async () => {
    if (!globalNotifTitle.trim() || !globalNotifMsg.trim()) {
      alert("Titre et message requis");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "victor",
          title: globalNotifTitle,
          body: globalNotifMsg,
        }),
      });

      if (response.ok) {
        alert("Notification envoyée à Victor !");
        setGlobalNotifTitle("");
        setGlobalNotifMsg("");
      } else {
        alert("Erreur lors de l'envoi");
      }
    } catch (error) {
      alert("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationToAlyssia = async () => {
    if (!globalNotifTitle.trim() || !globalNotifMsg.trim()) {
      alert("Titre et message requis");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "alyssia",
          title: globalNotifTitle,
          body: globalNotifMsg,
        }),
      });

      if (response.ok) {
        alert("Notification envoyée à Alyssia !");
        setGlobalNotifTitle("");
        setGlobalNotifMsg("");
      } else {
        alert("Erreur lors de l'envoi");
      }
    } catch (error) {
      alert("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const resetTodayResponses = async () => {
    if (
      !window.confirm("Remettre à zéro la réponse du jour pour tout le monde ?")
    ) {
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase
        .from("responses")
        .delete()
        .eq("date", today);

      if (error) {
        alert("Erreur lors du reset");
      } else {
        alert("Réponses du jour remises à zéro !");
      }
    } catch (error) {
      alert("Erreur lors du reset");
    } finally {
      setLoading(false);
    }
  };

  const copyMySubscription = async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Notifications push non supportées");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        alert("Aucune subscription trouvée");
        return;
      }
      await navigator.clipboard.writeText(JSON.stringify(sub));
      alert("Subscription copiée dans le presse-papier !");
    } catch (e) {
      alert("Erreur lors de la copie");
    }
  };

  const showMySubscription = async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Notifications push non supportées");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        alert("Aucune subscription trouvée");
        return;
      }
      setSubJson(JSON.stringify(sub, null, 2));
      setShowSubJson(true);
    } catch (e) {
      alert("Erreur lors de la récupération");
    }
  };

  const forceSubscribeToPush = async () => {
    setLoading(true);
    try {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("Notifications push non supportées");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Permission refusée");
        return;
      }
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }
      await supabase.from("push_subscriptions").upsert({
        user_id: userId,
        subscription: sub,
        updated_at: new Date().toISOString(),
      });
      alert("Notifications activées !");
    } catch (e) {
      alert("Erreur lors de l'abonnement");
    } finally {
      setLoading(false);
    }
  };

  const triggerEventReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/check-event-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  };

  const renderNotificationsTab = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ color: "#ff4081", marginBottom: 16 }}>
        🔔 Gestion des notifications
      </h3>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Titre de la notification"
          value={globalNotifTitle}
          onChange={(e) => setGlobalNotifTitle(e.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="Message de la notification"
          value={globalNotifMsg}
          onChange={(e) => setGlobalNotifMsg(e.target.value)}
          style={textareaStyle}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={buttonStyle}
            onClick={sendNotificationToAlyssia}
            disabled={loading}
          >
            Envoyer à Alyssia
          </button>
          <button
            style={buttonStyle}
            onClick={sendGlobalNotification}
            disabled={loading}
          >
            Envoyer à Victor
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h4 style={{ color: "#666", marginBottom: 12 }}>
          🔧 Outils de développement
        </h4>
        <button style={buttonStyle} onClick={forceSubscribeToPush}>
          Forcer l'abonnement aux notifications
        </button>
        <button style={buttonStyle} onClick={copyMySubscription}>
          Copier ma subscription
        </button>
        <button style={buttonStyle} onClick={showMySubscription}>
          Afficher ma subscription
        </button>
        <button style={buttonStyle} onClick={triggerEventReminders}>
          Déclencher les rappels d'événements
        </button>
      </div>

      {showSubJson && (
        <div style={{ marginTop: 16 }}>
          <textarea
            style={textareaStyle}
            value={subJson}
            readOnly
            onFocus={(e) => e.target.select()}
          />
          <button
            style={{ ...buttonStyle, background: "#666" }}
            onClick={() => setShowSubJson(false)}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );

  const renderResetTab = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ color: "#ff4081", marginBottom: 16 }}>
        🔄 Gestion des données
      </h3>

      <div style={{ marginBottom: 20 }}>
        <h4 style={{ color: "#666", marginBottom: 12 }}>Réponses du jour</h4>
        <p style={{ color: "#888", marginBottom: 16 }}>
          Remet à zéro toutes les réponses du jour pour permettre de
          recommencer.
        </p>
        <button
          style={dangerButtonStyle}
          onClick={resetTodayResponses}
          disabled={loading}
        >
          {loading
            ? "Reset en cours..."
            : "Remettre à zéro les réponses du jour"}
        </button>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ color: "#ff4081", marginBottom: 16 }}>📊 Statistiques</h3>

      <div
        style={{
          background: "#f8f9fa",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h4 style={{ color: "#666", marginBottom: 8 }}>
          Utilisateurs connectés
        </h4>
        <p style={{ color: "#888", margin: 0 }}>Victor et Alyssia</p>
      </div>

      <div
        style={{
          background: "#f8f9fa",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h4 style={{ color: "#666", marginBottom: 8 }}>Notifications</h4>
        <p style={{ color: "#888", margin: 0 }}>
          Système de notifications push actif
        </p>
      </div>

      <div style={{ background: "#f8f9fa", borderRadius: 12, padding: 16 }}>
        <h4 style={{ color: "#666", marginBottom: 8 }}>Base de données</h4>
        <p style={{ color: "#888", margin: 0 }}>Supabase - Connecté</p>
      </div>
    </div>
  );

  return (
    <div style={panelStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 20 }}>🔧 Panel Admin - Victor</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 24,
              cursor: "pointer",
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
          <button
            style={activeTab === "notifications" ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
          <button
            style={activeTab === "reset" ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab("reset")}
          >
            Reset
          </button>
          <button
            style={activeTab === "stats" ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab("stats")}
          >
            Stats
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {activeTab === "notifications" && renderNotificationsTab()}
          {activeTab === "reset" && renderResetTab()}
          {activeTab === "stats" && renderStatsTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
