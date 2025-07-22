import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

const mainBg = {
  minHeight: "100vh",
  background: "#fff",
  padding: 0,
};

const cardStyle = {
  background: "#f8f8fa",
  borderRadius: 18,
  boxShadow: "0 2px 16px #e5e5e555",
  padding: 28,
  marginBottom: 28,
  marginTop: 0,
};

const bigBtn = {
  background: "linear-gradient(90deg, #ffeef8 0%, #f8f8fa 100%)",
  color: "#d0488f",
  border: "none",
  borderRadius: 32,
  fontSize: 22,
  fontWeight: 700,
  padding: "1.1rem 2.5rem",
  margin: "0 18px 0 0",
  boxShadow: "0 2px 8px #ffd6ef22",
  cursor: "pointer",
  transition: "transform 0.1s, box-shadow 0.1s",
};

const bigBtnHover = {
  transform: "scale(1.05)",
  boxShadow: "0 4px 16px #ffd6ef44",
};

const sectionTitle = {
  color: "#b86fa5",
  fontWeight: 700,
  fontSize: 22,
  marginBottom: 10,
  marginTop: 0,
};

const inputStyle = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #eee",
  fontSize: 16,
  marginRight: 10,
  background: "#fff",
};

const labelStyle = {
  fontWeight: 600,
  color: "#b86fa5",
  marginRight: 8,
};

const answerIcon = {
  Oui: "💗",
  Non: "💔",
};

const calendarStyle = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 12px #e5e5e533",
  padding: 20,
  margin: "32px auto 0 auto",
  maxWidth: 420,
};
const calendarHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};
const calendarGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 4,
};
const dayCell = {
  minHeight: 48,
  borderRadius: 8,
  background: "#f8f8fa",
  textAlign: "center",
  fontSize: 16,
  color: "#888",
  cursor: "pointer",
  position: "relative",
  transition: "background 0.15s",
};
const dayCellEvent = {
  ...dayCell,
  background: "#ffeef8",
  color: "#d0488f",
  fontWeight: 700,
  border: "1.5px solid #ffd6ef",
};
const todayCell = {
  ...dayCell,
  border: "2px solid #b86fa5",
  background: "#fff0fa",
};
const eventDot = {
  width: 8,
  height: 8,
  borderRadius: 4,
  background: "#d0488f",
  position: "absolute",
  left: "50%",
  bottom: 6,
  transform: "translateX(-50%)",
};
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.18)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const modalBox = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 4px 32px #b86fa555",
  padding: 32,
  minWidth: 320,
  maxWidth: 380,
  zIndex: 1001,
};

// Ajout d'une constante pour la liste des utilisateurs (fixe)
const ALL_USERS = ["victor", "alyssia"];

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [answer, setAnswer] = useState(null);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [todayResponse, setTodayResponse] = useState(null);
  const [btnHover, setBtnHover] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    date: "",
    title: "",
    description: "",
    time: "",
    location: "",
  });
  const [eventFormError, setEventFormError] = useState("");
  // Ajoute un state pour stocker toutes les réponses du jour
  const [allTodayResponses, setAllTodayResponses] = useState([]);
  // Ajoute un state pour stocker les réponses aux événements
  const [eventResponses, setEventResponses] = useState([]);
  // Ajoute le champ comment dans la gestion des réponses aux événements
  const [eventComment, setEventComment] = useState("");
  // Ajoute un state pour la notification
  const [toast, setToast] = useState(null);
  // Ajoute un state pour suivre le nombre de relances par event et user
  const [reminders, setReminders] = useState({}); // { [eventId_userId]: count }
  const [reminderMsg, setReminderMsg] = useState("");
  // Ajoute le formulaire de notification globale en bas de la page
  const [showGlobalNotif, setShowGlobalNotif] = useState(false);
  const [globalNotifTitle, setGlobalNotifTitle] = useState("");
  const [globalNotifMsg, setGlobalNotifMsg] = useState("");
  const [userName, setUserName] = useState("");
  const [showSubJson, setShowSubJson] = useState(false);
  const [subJson, setSubJson] = useState("");

  // Fonction utilitaire pour afficher une notification
  function showToast(message, color = "#d0488f") {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  }

  // Fonction utilitaire pour incrémenter le nombre de relances
  function incrementReminder(eventId, userId) {
    setReminders((prev) => {
      const key = `${eventId}_${userId}`;
      return { ...prev, [key]: (prev[key] || 0) + 1 };
    });
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userId");
      if (!stored || stored.trim() === "") {
        router.replace("/login");
      } else {
        setUserId(stored);
        // Récupère le prénom depuis Supabase
        supabase
          .from("users")
          .select("name")
          .eq("user_id", stored)
          .single()
          .then(({ data }) => {
            if (data && data.name) setUserName(data.name);
            else setUserName(stored);
          });
      }
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchTodayResponses();
    }
  }, [userId]);

  useEffect(() => {
    fetchEvents();
  }, [calendarMonth]);

  // Nouvelle fonction pour récupérer toutes les réponses du jour
  async function fetchTodayResponses() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .in("user_id", ALL_USERS)
      .eq("date", today);
    if (!error)
      setAllTodayResponses(
        (data || []).filter((r) => ALL_USERS.includes(r.user_id))
      );
    setLoading(false);
  }

  // Ajoute l'envoi de notification push lors de la réponse du jour
  async function handleAnswer(ans) {
    setAnswer(ans);
    if (!ans) {
      setShowReasonInput(true);
    } else {
      await saveResponse(ans, "");
      setShowReasonInput(false);
      fetchTodayResponses();
      // Notif push à l'autre utilisateur si pas encore répondu
      const otherUser = ["victor", "alyssia"].find((u) => u !== userId);
      const otherHasAnswered = allTodayResponses.find(
        (r) => r.user_id === otherUser
      );
      if (!otherHasAnswered) {
        sendNativePushNotification({
          title: `Réponse du jour !`,
          message: `${displayUserName(userId)} a répondu "${
            ans ? "Oui" : "Non"
          }" à la question du jour.`,
          targetUserId: otherUser,
        });
      }
    }
  }

  async function saveResponse(ans, reasonText) {
    const today = new Date().toISOString().split("T")[0];
    if (!userId) {
      alert("Aucun utilisateur défini. Ajoutez ?user=victor à l'URL.");
      return;
    }
    await supabase.from("responses").upsert(
      {
        user_id: userId,
        date: today,
        answer: ans ? "Oui" : "Non",
        reason: reasonText,
      },
      {
        onConflict: ["user_id", "date"],
        returning: "minimal",
      }
    );
    fetchTodayResponses(); // Update allTodayResponses
  }

  async function submitReason() {
    await saveResponse(answer, reason);
    setReason("");
    setShowReasonInput(false);
    fetchTodayResponses(); // Update allTodayResponses
  }

  // RESET pour Victor : supprime la réponse du jour pour tous
  async function resetToday() {
    if (
      !window.confirm("Remettre à zéro la réponse du jour pour tout le monde ?")
    )
      return;
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("responses").delete().eq("date", today);
    fetchTodayResponses(); // Update allTodayResponses
  }

  async function fetchEvents() {
    // Récupère tous les événements du mois affiché
    const start = new Date(calendarMonth);
    const end = new Date(calendarMonth);
    end.setMonth(end.getMonth() + 1);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", start.toISOString().split("T")[0])
      .lt("date", end.toISOString().split("T")[0])
      .order("date", { ascending: true });
    if (!error) setEvents(data);
  }

  function openEventModal(event) {
    setModalEvent(event);
    setShowEventModal(true);
  }
  function closeEventModal() {
    setShowEventModal(false);
    setModalEvent(null);
  }
  function openEventForm(date) {
    setEventForm({ date, title: "", description: "", time: "", location: "" });
    setShowEventForm(true);
    setEventFormError("");
  }
  function closeEventForm() {
    setShowEventForm(false);
    setEventFormError("");
  }
  function handleEventFormChange(e) {
    setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  }
  async function submitEventForm(e) {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) {
      setEventFormError("Titre et date obligatoires");
      return;
    }
    // Corrige la date pour éviter le décalage (prend la date telle quelle, sans timezone)
    const dateStr = eventForm.date;
    const { error } = await supabase.from("events").upsert({
      date: dateStr,
      title: eventForm.title,
      description: eventForm.description,
      time: eventForm.time,
      location: eventForm.location,
      user_id: userId,
    });
    if (error) {
      setEventFormError("Erreur lors de l'enregistrement");
    } else {
      setShowEventForm(false);
      fetchEvents();
    }
  }

  // Génération du calendrier
  function getMonthDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }
  function getWeekdayShort(d) {
    return ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][d];
  }
  const monthDays = getMonthDays(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth()
  );
  const firstWeekday = (calendarMonth.getDay() + 6) % 7; // Lundi=0
  const todayStr = new Date().toISOString().split("T")[0];
  // Map des événements par date
  const eventsByDate = {};
  for (const ev of events) {
    eventsByDate[ev.date] = ev;
  }

  const displayName = userId
    ? userId.charAt(0).toUpperCase() + userId.slice(1)
    : "";
  const today = new Date().toISOString().split("T")[0];

  // Affichage logique du message principal (corrigé)
  let mainMessage = null;
  let mainColor = "#888";
  let mainIcon = null;
  // On ne considère que les réponses des deux users attendus
  const responsesMap = {};
  allTodayResponses.forEach((r) => {
    responsesMap[r.user_id] = r.answer;
  });
  const nbReponses = Object.keys(responsesMap).length;
  if (nbReponses === ALL_USERS.length) {
    // Les deux ont répondu
    if (Object.values(responsesMap).some((ans) => ans === "Non")) {
      mainMessage = "Non, pas ce soir.";
      mainColor = "#888";
      mainIcon = answerIcon["Non"];
    } else if (Object.values(responsesMap).every((ans) => ans === "Oui")) {
      mainMessage = "Oui, on dort ensemble !";
      mainColor = "#d0488f";
      mainIcon = answerIcon["Oui"];
    } else {
      mainMessage = "En attente de la réponse de l'autre...";
      mainColor = "#b86fa5";
      mainIcon = "⏳";
    }
  } else if (nbReponses > 0) {
    if (Object.values(responsesMap).some((ans) => ans === "Non")) {
      mainMessage = "Non, pas ce soir.";
      mainColor = "#888";
      mainIcon = answerIcon["Non"];
    } else {
      mainMessage = "En attente de la réponse de l'autre...";
      mainColor = "#b86fa5";
      mainIcon = "⏳";
    }
  } else {
    mainMessage = "Pas encore de réponse aujourd'hui.";
    mainColor = "#888";
    mainIcon = null;
  }

  // Ajoute une fonction utilitaire pour afficher le prénom
  function displayUserName(userId) {
    if (userId === "victor") return "Victor";
    if (userId === "alyssia") return "Alyssia";
    return userId;
  }

  // Ajoute un effet pour charger les réponses de l'event sélectionné
  useEffect(() => {
    if (showEventModal && modalEvent) {
      fetchEventResponses(modalEvent.id);
    }
  }, [showEventModal, modalEvent]);

  // Quand on ouvre la popup, pré-remplir le commentaire si l'utilisateur a déjà répondu
  useEffect(() => {
    if (showEventModal && modalEvent) {
      fetchEventResponses(modalEvent.id);
      const resp = eventResponses.find((r) => r.user_id === userId);
      setEventComment(resp ? resp.comment || "" : "");
    }
    // eslint-disable-next-line
  }, [showEventModal, modalEvent, userId]);

  async function fetchEventResponses(eventId) {
    const { data, error } = await supabase
      .from("event_responses")
      .select("*")
      .eq("event_id", eventId);
    if (!error) setEventResponses(data || []);
  }

  // Modification de la fonction de réponse à un événement pour inclure le commentaire
  async function handleEventAnswer(answer) {
    if (!modalEvent) return;
    await supabase.from("event_responses").upsert({
      event_id: modalEvent.id,
      user_id: userId,
      answer,
      comment: eventComment,
      created_at: new Date().toISOString(),
    });
    fetchEventResponses(modalEvent.id);
    showToast("Réponse enregistrée !");
    // Envoie une notification à l'autre utilisateur
    const otherUser = ["victor", "alyssia"].find((u) => u !== userId);
    sendNativePushNotification({
      title: `Nouvelle réponse à l'événement`,
      message: `${displayUserName(
        userId
      )} a répondu "${answer}" à l'événement : ${modalEvent.title}`,
      targetUserId: otherUser,
    });
  }

  async function handleDeleteEvent() {
    if (!modalEvent) return;
    if (!window.confirm("Supprimer cet événement ?")) return;
    await supabase.from("events").delete().eq("id", modalEvent.id);
    setShowEventModal(false);
    fetchEvents();
    showToast("Événement supprimé.", "#b86fa5");
  }

  // Supprime tout le code OneSignal (useEffect, sendOneSignalNotification, etc)
  // Ajoute la fonction d'envoi de notification push native via l'API Next.js
  async function sendNativePushNotification({ title, message, targetUserId }) {
    try {
      await fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, title, body: message }),
      });
      showToast("Notification envoyée !", "#b86fa5");
    } catch (e) {
      showToast("Erreur lors de l'envoi de la notification", "red");
    }
  }

  // Affiche un effet visuel/bouton si notifications activées
  const [notifEnabled, setNotifEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setNotifEnabled(!!sub);
      });
    });
  }, []);

  async function sendGlobalNotification() {
    if (!globalNotifTitle.trim() || !globalNotifMsg.trim()) {
      showToast("Titre et message requis", "red");
      return;
    }
    await Promise.all(
      ALL_USERS.map((uid) =>
        sendNativePushNotification({
          title: globalNotifTitle,
          message: globalNotifMsg,
          targetUserId: uid,
        })
      )
    );
    showToast("Notification envoyée à tous !", "#b86fa5");
    setShowGlobalNotif(false);
    setGlobalNotifTitle("");
    setGlobalNotifMsg("");
  }

  const VAPID_PUBLIC_KEY =
    "BInzKFIkdJ5js3aBJbZfpJ-JT7Yyqoj0QNMHt8hQLCyRiGUhEu3Al4WbVROXfUaQ02zZeL6RO4UuaMP2lLYbiGA";

  async function forceSubscribeToPush() {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      showToast("Notifications push non supportées", "red");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        showToast("Permission refusée", "red");
        return;
      }
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }
      const userId = localStorage.getItem("userId");
      await fetch("/api/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, userId }),
      });
      showToast("Notifications activées !", "#b86fa5");
    } catch (e) {
      showToast("Erreur lors de l'abonnement", "red");
    }
  }
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  async function copyMySubscription() {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      showToast("Notifications push non supportées", "red");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        showToast("Aucune subscription trouvée", "red");
        return;
      }
      await navigator.clipboard.writeText(JSON.stringify(sub));
      showToast("Subscription copiée dans le presse-papier !", "#b86fa5");
    } catch (e) {
      showToast("Erreur lors de la copie", "red");
    }
  }

  async function showMySubscription() {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      showToast("Notifications push non supportées", "red");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        showToast("Aucune subscription trouvée", "red");
        setSubJson("");
        setShowSubJson(true);
        return;
      }
      setSubJson(JSON.stringify(sub, null, 2));
      setShowSubJson(true);
    } catch (e) {
      showToast("Erreur lors de la récupération", "red");
      setSubJson("");
      setShowSubJson(true);
    }
  }

  // Styles mobile-first améliorés
  const mobileMainBg = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%)",
    padding: "0 8px",
    boxSizing: "border-box",
  };
  const mobileCard = {
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 2px 16px #ffd6ef33",
    padding: 20,
    margin: "18px 0",
    width: "100%",
    maxWidth: 480,
    marginLeft: "auto",
    marginRight: "auto",
    boxSizing: "border-box",
  };
  const mobileBtn = {
    background: "linear-gradient(90deg, #ffeef8 0%, #fff0fa 100%)",
    color: "#d0488f",
    border: "none",
    borderRadius: 32,
    fontSize: 19,
    fontWeight: 700,
    padding: "1.1rem 0",
    margin: "0 0 14px 0",
    width: "100%",
    boxShadow: "0 2px 8px #ffd6ef22",
    cursor: "pointer",
    transition: "transform 0.1s, box-shadow 0.1s",
    outline: "none",
  };
  const mobileInput = {
    padding: 16,
    borderRadius: 8,
    border: "1px solid #ffd6ef",
    fontSize: 18,
    marginBottom: 14,
    background: "#fff8fc",
    width: "100%",
    boxSizing: "border-box",
  };
  const mobileTextarea = {
    ...mobileInput,
    minHeight: 120,
    maxHeight: 200,
    fontFamily: "monospace",
    fontSize: 15,
    resize: "vertical",
    marginBottom: 10,
    color: "#b86fa5",
  };
  const closeBtn = {
    ...mobileBtn,
    background: "#fff",
    color: "#b86fa5",
    border: "1px solid #b86fa5",
    margin: 0,
    fontSize: 16,
    padding: "0.7rem 0",
  };

  return (
    <div style={mobileMainBg}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff0fa",
            color: toast.color,
            border: `1.5px solid ${toast.color}`,
            borderRadius: 12,
            padding: "12px 32px",
            fontWeight: 600,
            fontSize: 17,
            boxShadow: "0 2px 16px #ffd6ef55",
            zIndex: 2000,
            transition: "opacity 0.3s",
          }}
        >
          {toast.message}
        </div>
      )}
      {notifEnabled && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            background: "#fff0fa",
            color: "#d0488f",
            border: "1.5px solid #d0488f",
            borderRadius: 12,
            padding: "10px 22px",
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 2px 16px #ffd6ef55",
            zIndex: 2000,
          }}
        >
          Notifications activées !
        </div>
      )}
      <main
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "auto",
          padding: 0,
          fontFamily: "sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <div style={{ ...mobileCard, marginTop: 24, textAlign: "center" }}>
          {userName && (
            <div
              style={{
                fontWeight: 700,
                fontSize: 24,
                color: "#b86fa5",
                marginBottom: 8,
              }}
            >
              Bonjour {userName} !
            </div>
          )}
          <h1
            style={{ color: "#b86fa5", fontSize: 28, margin: "18px 0 24px 0" }}
          >
            Dors-tu avec moi ce soir ?
          </h1>
          <div style={{ fontSize: 16, color: "#888", marginBottom: 18 }}>
            <span style={{ color: "#b86fa5" }}>{today}</span>
          </div>
          {loading ? (
            <div style={{ color: "#b86fa5", fontSize: 20, margin: "24px 0" }}>
              Chargement...
            </div>
          ) : (
            <div
              style={{
                fontSize: 38,
                fontWeight: 700,
                color: mainColor,
                margin: "32px 0 24px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mainIcon && <span style={{ fontSize: 38 }}>{mainIcon}</span>}
              <span style={{ marginTop: 8 }}>{mainMessage}</span>
            </div>
          )}
          {/* Affiche les boutons de réponse seulement si l'utilisateur n'a pas encore répondu */}
          {!allTodayResponses.some((r) => r.user_id === userId) && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <button
                style={
                  btnHover === "oui" ? { ...bigBtn, ...bigBtnHover } : bigBtn
                }
                onMouseEnter={() => setBtnHover("oui")}
                onMouseLeave={() => setBtnHover("")}
                onClick={() => handleAnswer(true)}
              >
                Oui 💗
              </button>
              <button
                style={
                  btnHover === "non" ? { ...bigBtn, ...bigBtnHover } : bigBtn
                }
                onMouseEnter={() => setBtnHover("non")}
                onMouseLeave={() => setBtnHover("")}
                onClick={() => handleAnswer(false)}
              >
                Non 💔
              </button>
            </div>
          )}
          {showReasonInput && (
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Pourquoi ?</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ ...inputStyle, width: "60%" }}
                placeholder="Expliquez en quelques mots..."
              />
              <button
                style={{
                  ...bigBtn,
                  fontSize: 17,
                  padding: "0.6rem 1.5rem",
                  marginLeft: 10,
                }}
                onClick={submitReason}
              >
                Valider
              </button>
            </div>
          )}
          {userId === "victor" && (
            <div style={{ marginTop: 32 }}>
              <button
                style={{
                  ...bigBtn,
                  background: "#fff",
                  color: "#b86fa5",
                  border: "1px solid #b86fa5",
                  boxShadow: "none",
                  fontSize: 18,
                }}
                onClick={resetToday}
              >
                Remettre à zéro la réponse du jour
              </button>
            </div>
          )}
        </div>
        {/* CALENDRIER EVENEMENTS */}
        <section style={calendarStyle}>
          <div style={calendarHeader}>
            <button
              style={{
                ...bigBtn,
                fontSize: 16,
                padding: "0.3rem 1rem",
                margin: 0,
              }}
              onClick={() =>
                setCalendarMonth(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() - 1,
                    1
                  )
                )
              }
            >
              ◀
            </button>
            <span style={{ fontWeight: 700, fontSize: 20, color: "#b86fa5" }}>
              {calendarMonth.toLocaleString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              style={{
                ...bigBtn,
                fontSize: 16,
                padding: "0.3rem 1rem",
                margin: 0,
              }}
              onClick={() =>
                setCalendarMonth(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() + 1,
                    1
                  )
                )
              }
            >
              ▶
            </button>
          </div>
          <div style={calendarGrid}>
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <div
                key={d}
                style={{ fontWeight: 600, color: "#b86fa5", padding: 4 }}
              >
                {d}
              </div>
            ))}
            {/* Jours vides avant le 1er */}
            {Array(firstWeekday)
              .fill(0)
              .map((_, i) => (
                <div key={"empty-" + i}></div>
              ))}
            {/* Jours du mois */}
            {monthDays.map((d) => {
              const dateStr = d.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const hasEvent = !!eventsByDate[dateStr];
              return (
                <div
                  key={dateStr}
                  style={
                    isToday ? todayCell : hasEvent ? dayCellEvent : dayCell
                  }
                  onClick={() =>
                    hasEvent
                      ? openEventModal(eventsByDate[dateStr])
                      : openEventForm(dateStr)
                  }
                  title={
                    hasEvent
                      ? eventsByDate[dateStr].title
                      : "Ajouter un événement"
                  }
                >
                  {d.getDate()}
                  {hasEvent && <div style={eventDot}></div>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <button
              style={{ ...bigBtn, fontSize: 16, padding: "0.6rem 1.5rem" }}
              onClick={() => openEventForm(todayStr)}
            >
              Ajouter un événement
            </button>
          </div>
        </section>
        {/* MODAL DETAILS EVENEMENT */}
        {showEventModal && modalEvent && (
          <div style={modalOverlay} onClick={closeEventModal}>
            <div
              style={{
                ...modalBox,
                maxWidth: 420,
                padding: 0,
                overflow: "hidden",
                boxShadow: "0 8px 40px #b86fa555",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  background: "linear-gradient(90deg, #ffeef8 0%, #fff 100%)",
                  padding: "24px 32px 18px 32px",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  borderBottom: "1px solid #f3d6e7",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ fontSize: 32, color: "#d0488f" }}>📅</div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 22,
                      color: "#d0488f",
                      marginBottom: 2,
                    }}
                  >
                    {modalEvent.title}
                  </div>
                  <div
                    style={{ color: "#b86fa5", fontSize: 16, fontWeight: 500 }}
                  >
                    {modalEvent.date}{" "}
                    {modalEvent.time && (
                      <span style={{ marginLeft: 8 }}>
                        ⏰ {modalEvent.time}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeEventModal}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    fontSize: 26,
                    color: "#b86fa5",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                    transition: "color 0.15s",
                  }}
                  title="Fermer"
                >
                  ×
                </button>
              </div>
              <div style={{ padding: "22px 32px 18px 32px" }}>
                {modalEvent.location && (
                  <div
                    style={{
                      color: "#b86fa5",
                      fontSize: 16,
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>📍</span>
                    <span>{modalEvent.location}</span>
                  </div>
                )}
                {modalEvent.description && (
                  <div
                    style={{
                      color: "#444",
                      fontSize: 16,
                      marginBottom: 18,
                      background: "#fff8fc",
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                        color: "#b86fa5",
                        marginRight: 8,
                      }}
                    >
                      📝
                    </span>
                    {modalEvent.description}
                  </div>
                )}
                <div
                  style={{
                    borderTop: "1px solid #f3d6e7",
                    margin: "18px 0 0 0",
                    paddingTop: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18, color: "#b86fa5" }}>👤</span>
                  <span style={{ color: "#b86fa5", fontWeight: 600 }}>
                    Créé par {displayUserName(modalEvent.user_id)}
                  </span>
                  {/* Bouton supprimer visible uniquement pour le créateur */}
                  {modalEvent.user_id === userId && (
                    <button
                      onClick={handleDeleteEvent}
                      style={{
                        marginLeft: 16,
                        background: "#fff0fa",
                        color: "#d0488f",
                        border: "1px solid #ffd6ef",
                        borderRadius: 8,
                        padding: "6px 14px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                {/* Affichage des réponses Oui/Non */}
                <div
                  style={{
                    marginTop: 18,
                    marginBottom: 8,
                    display: "flex",
                    gap: 18,
                    alignItems: "center",
                  }}
                >
                  {["victor", "alyssia"].map((uid) => {
                    const resp = eventResponses.find((r) => r.user_id === uid);
                    return (
                      <div
                        key={uid}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#f8f8fa",
                          borderRadius: 8,
                          padding: "6px 12px",
                        }}
                      >
                        <span style={{ color: "#b86fa5", fontWeight: 600 }}>
                          {displayUserName(uid)}
                        </span>
                        {resp ? (
                          <>
                            <span style={{ fontSize: 18, marginLeft: 4 }}>
                              {resp.answer === "Oui" ? "💗 Oui" : "💔 Non"}
                            </span>
                            {resp.comment && (
                              <span
                                style={{
                                  color: "#b86fa5",
                                  fontSize: 14,
                                  marginLeft: 8,
                                }}
                              >
                                🗨️ {resp.comment}
                              </span>
                            )}
                          </>
                        ) : (
                          <span
                            style={{
                              color: "#bbb",
                              fontSize: 15,
                              marginLeft: 4,
                            }}
                          >
                            —
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Si ce n'est pas le créateur, proposer Oui/Non + commentaire, même si déjà répondu */}
                {modalEvent.user_id !== userId && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                      <button
                        onClick={() => handleEventAnswer("Oui")}
                        style={{
                          ...bigBtn,
                          fontSize: 16,
                          background: eventResponses.find(
                            (r) => r.user_id === userId && r.answer === "Oui"
                          )
                            ? "#ffeef8"
                            : undefined,
                          color: eventResponses.find(
                            (r) => r.user_id === userId && r.answer === "Oui"
                          )
                            ? "#d0488f"
                            : undefined,
                        }}
                      >
                        Oui 💗
                      </button>
                      <button
                        onClick={() => handleEventAnswer("Non")}
                        style={{
                          ...bigBtn,
                          fontSize: 16,
                          background: eventResponses.find(
                            (r) => r.user_id === userId && r.answer === "Non"
                          )
                            ? "#ffeef8"
                            : undefined,
                          color: eventResponses.find(
                            (r) => r.user_id === userId && r.answer === "Non"
                          )
                            ? "#d0488f"
                            : undefined,
                        }}
                      >
                        Non 💔
                      </button>
                    </div>
                    <textarea
                      placeholder="Ajouter un commentaire (facultatif)"
                      value={eventComment}
                      onChange={(e) => setEventComment(e.target.value)}
                      style={{
                        ...inputStyle,
                        width: "100%",
                        minHeight: 40,
                        marginBottom: 8,
                      }}
                    />
                    <button
                      onClick={() =>
                        handleEventAnswer(
                          eventResponses.find((r) => r.user_id === userId)
                            ?.answer || "Oui"
                        )
                      }
                      style={{
                        ...bigBtn,
                        fontSize: 15,
                        padding: "0.5rem 1.2rem",
                      }}
                    >
                      Enregistrer
                    </button>
                    {/* Bouton Relancer */}
                    {(() => {
                      const otherUser = ["victor", "alyssia"].find(
                        (u) => u !== userId
                      );
                      const otherHasAnswered = eventResponses.find(
                        (r) => r.user_id === otherUser
                      );
                      const reminderKey = modalEvent.id + "_" + userId;
                      const reminderCount = reminders[reminderKey] || 0;
                      const maxReminders = 2;
                      if (!otherHasAnswered) {
                        return (
                          <div style={{ marginTop: 12 }}>
                            <textarea
                              placeholder="Message de rappel personnalisé"
                              value={reminderMsg}
                              onChange={(e) => setReminderMsg(e.target.value)}
                              style={{
                                ...inputStyle,
                                width: "100%",
                                minHeight: 32,
                                marginBottom: 6,
                              }}
                              maxLength={120}
                            />
                            <button
                              onClick={() => {
                                sendNativePushNotification({
                                  title: `Petit rappel 💬`,
                                  message: reminderMsg.trim()
                                    ? reminderMsg
                                    : `${displayUserName(
                                        userId
                                      )} te rappelle de répondre à l'événement : ${
                                        modalEvent.title
                                      }`,
                                  targetUserId: otherUser,
                                });
                                showToast("Rappel envoyé !", "#b86fa5");
                                incrementReminder(modalEvent.id, userId);
                                setReminderMsg("");
                              }}
                              style={{
                                ...bigBtn,
                                fontSize: 15,
                                background: "#fff0fa",
                                color: "#b86fa5",
                                border: "1px solid #b86fa5",
                                marginTop: 2,
                                opacity:
                                  reminderCount >= maxReminders ? 0.5 : 1,
                                cursor:
                                  reminderCount >= maxReminders
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              disabled={reminderCount >= maxReminders}
                            >
                              Relancer {displayUserName(otherUser)} (
                              {maxReminders - reminderCount} restant
                              {maxReminders - reminderCount > 1 ? "s" : ""})
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* FORMULAIRE AJOUT EVENEMENT */}
        {showEventForm && (
          <div style={modalOverlay} onClick={closeEventForm}>
            <form
              style={modalBox}
              onClick={(e) => e.stopPropagation()}
              onSubmit={submitEventForm}
            >
              <h2 style={{ color: "#b86fa5", fontSize: 20, marginBottom: 12 }}>
                Nouvel événement
              </h2>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={eventForm.date}
                  onChange={handleEventFormChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Titre</label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Heure</label>
                <input
                  type="time"
                  name="time"
                  value={eventForm.time}
                  onChange={handleEventFormChange}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Lieu</label>
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventFormChange}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  style={{ ...inputStyle, minHeight: 60, width: "100%" }}
                />
              </div>
              {eventFormError && (
                <div style={{ color: "red", marginBottom: 8 }}>
                  {eventFormError}
                </div>
              )}
              <div style={{ textAlign: "right" }}>
                <button
                  type="button"
                  style={{
                    ...bigBtn,
                    background: "#fff",
                    color: "#b86fa5",
                    border: "1px solid #b86fa5",
                    boxShadow: "none",
                    fontSize: 16,
                    marginRight: 10,
                  }}
                  onClick={closeEventForm}
                >
                  Annuler
                </button>
                <button type="submit" style={{ ...bigBtn, fontSize: 16 }}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      {/* Zone d'actions en bas */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          marginTop: 80,
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 18,
          boxShadow: "0 2px 16px #ffd6ef33",
          padding: 18,
        }}
      >
        {showSubJson && (
          <div style={{ width: "100%", marginBottom: 16 }}>
            <textarea
              style={mobileTextarea}
              value={subJson}
              readOnly
              onFocus={(e) => e.target.select()}
            />
            <button style={closeBtn} onClick={() => setShowSubJson(false)}>
              Fermer
            </button>
          </div>
        )}
        <button style={mobileBtn} onClick={forceSubscribeToPush}>
          Accepter les notifications
        </button>
        <button style={mobileBtn} onClick={copyMySubscription}>
          Copier ma subscription
        </button>
        <button style={mobileBtn} onClick={showMySubscription}>
          Afficher ma subscription
        </button>
        {!showGlobalNotif ? (
          <button style={mobileBtn} onClick={() => setShowGlobalNotif(true)}>
            Notifications
          </button>
        ) : (
          <div
            style={{
              width: "100%",
              background: "#fff8fc",
              border: "1px solid #ffd6ef",
              borderRadius: 12,
              padding: 14,
              minWidth: 260,
              marginTop: 10,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Titre"
                value={globalNotifTitle}
                onChange={(e) => setGlobalNotifTitle(e.target.value)}
                style={{ ...mobileInput, marginBottom: 8 }}
              />
              <textarea
                placeholder="Message"
                value={globalNotifMsg}
                onChange={(e) => setGlobalNotifMsg(e.target.value)}
                style={{ ...mobileInput, minHeight: 40 }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                width: "100%",
              }}
            >
              <button
                style={{ ...closeBtn, marginBottom: 8 }}
                onClick={() => setShowGlobalNotif(false)}
              >
                Annuler
              </button>
              <button style={mobileBtn} onClick={sendGlobalNotification}>
                Envoyer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
