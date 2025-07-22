import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

// ---------------------------------------------------
// START OF UPDATED STYLE CONSTANTS
// ---------------------------------------------------

const mobileMainBg = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)", // Lighter pinks
  padding: "0 8px",
  boxSizing: "border-box",
  maxWidth: 420,
  width: "100%",
  margin: "0 auto",
};

const mobileCard = {
  background: "#ffffff", // Pure white for a crisp look
  borderRadius: 20, // Slightly more rounded
  boxShadow: "0 6px 24px rgba(255, 200, 220, 0.4)", // A softer, more spread-out shadow
  padding: 24, // Slightly more padding for breathability
  margin: "24px 0", // More margin top/bottom
  width: "100%",
  maxWidth: 480,
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
  transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out", // Smooth transition for hover
};

const mobileCardHover = {
  transform: "translateY(-4px)",
  boxShadow: "0 10px 30px rgba(255, 200, 220, 0.6)",
};

const bigBtn = {
  background: "linear-gradient(90deg, #ff80ab 0%, #ff4081 100%)", // Stronger, vibrant pink
  color: "#fff", // White text for contrast
  border: "none",
  borderRadius: 36, // More rounded, pill-like
  fontSize: 20, // Slightly larger font
  fontWeight: 700,
  padding: "1.2rem 2.8rem", // More padding
  margin: "0 18px 0 0",
  boxShadow: "0 4px 12px rgba(255, 64, 129, 0.4)", // Deeper, more noticeable shadow
  cursor: "pointer",
  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out", // Smoother transition
  outline: "none",
  position: "relative",
  overflow: "hidden",
};

const bigBtnHover = {
  transform: "translateY(-2px) scale(1.02)", // Lift and slightly scale
  boxShadow: "0 8px 20px rgba(255, 64, 129, 0.6)", // More pronounced shadow
};

const mobileBtn = {
  background: "linear-gradient(90deg, #ff80ab 0%, #ff4081 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 36,
  fontSize: 18,
  fontWeight: 700,
  padding: "1.1rem 0",
  margin: "0 0 16px 0",
  width: "100%",
  boxShadow: "0 4px 12px rgba(255, 64, 129, 0.4)",
  cursor: "pointer",
  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
  outline: "none",
};

const mobileBtnHover = {
  transform: "translateY(-2px) scale(1.01)",
  boxShadow: "0 8px 20px rgba(255, 64, 129, 0.6)",
};

const mobileBtnActive = {
  transform: "scale(0.98)",
  boxShadow: "0 2px 8px rgba(255, 64, 129, 0.3)",
};

const closeBtn = {
  ...mobileBtn,
  background: "#fff",
  color: "#ff4081", // Use the primary pink for border/text
  border: "1.5px solid #ff80ab", // Thicker, more visible border
  boxShadow: "none", // No shadow
  fontSize: 16,
  padding: "0.8rem 0",
};

const closeBtnHover = {
  background: "#fce4ec", // Light pink on hover
  color: "#d0488f",
  transform: "none", // Remove lift effect for close buttons
  boxShadow: "0 2px 8px rgba(255, 200, 220, 0.4)", // Subtle shadow on hover
};

const closeBtnActive = {
  background: "#f8bbd0",
};

const sectionTitle = {
  color: "#d0488f", // Use a more vibrant pink for titles
  fontWeight: 700,
  fontSize: 24, // Slightly larger
  marginBottom: 12,
  marginTop: 0,
  textAlign: "center",
};

const mobileInput = {
  padding: 16,
  borderRadius: 10, // Slightly more rounded
  border: "1px solid #ffcccb", // Softer, light pink border
  fontSize: 18,
  marginBottom: 16, // More spacing
  background: "#fff8fb", // Very light pink background
  width: "100%",
  boxSizing: "border-box",
  color: "#4a4a4a", // Darker text for readability
  transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
};

const mobileTextarea = {
  ...mobileInput,
  minHeight: 100, // Make it a bit shorter by default, still resizable
  maxHeight: 250,
  fontFamily: "inherit",
  fontSize: 16,
  resize: "vertical",
  marginBottom: 16,
  color: "#4a4a4a",
};

const labelStyle = {
  fontWeight: 600,
  color: "#d0488f", // Consistent label color
  marginRight: 8,
  display: "block", // Make labels block level for better stacking with inputs
  marginBottom: 6,
  fontSize: 16,
};

const answerIcon = {
  Oui: "😊", // More sakura-themed emojis
  Non: "😫", // A wilted rose for contrast
};

const calendarStyle = {
  background: "#ffffff",
  borderRadius: 20, // Consistent rounded corners
  boxShadow: "0 6px 24px rgba(255, 200, 220, 0.4)", // Consistent shadow
  padding: 28, // More padding
  margin: "32px auto 0 auto",
  maxWidth: 420,
};
const calendarHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20, // More space
  color: "#ff4081", // Stronger color for month/year
  fontWeight: 700,
  fontSize: 22,
};
const calendarGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 4,
};
const dayCell = {
  minHeight: 52, // Taller cells
  borderRadius: 10, // Rounded cells
  background: "#fefefe", // Very light background
  textAlign: "center",
  fontSize: 17,
  color: "#888",
  cursor: "pointer",
  position: "relative",
  transition:
    "background 0.2s ease-in-out, transform 0.1s ease-out, box-shadow 0.1s ease-out",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
};
const dayCellEvent = {
  ...dayCell,
  background: "#ffebee", // Softer event background
  color: "#d0488f",
  fontWeight: 700,
  border: "1.5px solid #ffcdd2", // Softer border
};
const todayCell = {
  ...dayCell,
  border: "2px solid #ff80ab", // Stronger border for today
  background: "#fff0fa", // Light pink for today
  fontWeight: 700,
  color: "#d0488f",
};
const eventDot = {
  width: 8,
  height: 8,
  borderRadius: 4,
  background: "#ff4081", // Vibrant dot for event
  position: "absolute",
  left: "50%",
  bottom: 8, // More space from bottom
  transform: "translateX(-50%)",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.25)", // Slightly darker overlay
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(4px)", // Subtle blur for the background
  // Add animation via CSS module or global CSS if needed
  // animation: "fadeIn 0.3s ease-out",
};
const modalBox = {
  background: "#ffffff",
  borderRadius: 20,
  boxShadow: "0 10px 40px rgba(184, 111, 165, 0.3)", // Deeper, more spread shadow
  padding: 36, // More padding
  minWidth: 340,
  maxWidth: 400,
  zIndex: 1001,
  // Add animation via CSS module or global CSS if needed
  // animation: "slideInFromTop 0.3s ease-out",
};

const toastStyle = {
  position: "fixed",
  top: 24,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#ffebee", // Light pink background for toast
  color: "#d0488f", // Default color for text
  border: `1.5px solid #ffcdd2`, // Softer border
  borderRadius: 12,
  padding: "12px 32px",
  fontWeight: 600,
  fontSize: 17,
  boxShadow: "0 4px 16px rgba(255, 200, 220, 0.4)",
  zIndex: 2000,
  // Animations would need to be handled via global CSS or a library that supports keyframes in JS.
  // animation: "slideInTop 0.3s ease-out, fadeOut 0.3s ease-out 2.7s forwards",
};

// ---------------------------------------------------
// END OF UPDATED STYLE CONSTANTS
// ---------------------------------------------------

// Ajout d'une constante pour la liste des utilisateurs (fixe)
const ALL_USERS = ["victor", "alyssia"];

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [answer, setAnswer] = useState(null);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [todayResponse, setTodayResponse] = useState(null); // This state seems unused, consider removing if not needed.
  const [btnHover, setBtnHover] = useState(""); // For bigBtn hover effects
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
  const [allTodayResponses, setAllTodayResponses] = useState([]);
  const [eventResponses, setEventResponses] = useState([]);
  const [eventComment, setEventComment] = useState("");
  const [toast, setToast] = useState(null);
  const [reminders, setReminders] = useState({});
  const [reminderMsg, setReminderMsg] = useState("");
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
      // Notif push à l'autre utilisateur selon son état de réponse
      const otherUser = ALL_USERS.find((u) => u !== userId);
      const otherHasAnswered = allTodayResponses.find(
        (r) => r.user_id === otherUser
      );
      const senderName = displayUserName(userId);
      if (!otherHasAnswered) {
        // Option 1 : l'autre n'a pas encore répondu
        sendNativePushNotification({
          title: `Réponse du jour !`,
          message: `${senderName} a répondu à la question du jour. À ton tour de répondre !`,
          targetUserId: otherUser,
        });
      } else {
        // Option 2 : l'autre a déjà répondu
        sendNativePushNotification({
          title: `Réponse du jour !`,
          message: `${senderName} a répondu à la question du jour. Viens voir la réponse !`,
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
    // This function is defined but not used.
    return ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][d];
  }
  // Fonction utilitaire pour formater une date locale en YYYY-MM-DD (évite le bug UTC)
  function toLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const monthDays = getMonthDays(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth()
  );
  const firstWeekday = (calendarMonth.getDay() + 6) % 7; // Lundi=0
  const todayStr = toLocalDateString(new Date());
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
    const otherUser = ALL_USERS.find((u) => u !== userId);
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

  // Fonction utilitaire pour formater la date en français
  function formatDateFr(dateStr) {
    const date = new Date(dateStr);
    return date
      .toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
      .replace(/^(.)/, (c) => c.toUpperCase());
  }

  return (
    <div style={mobileMainBg}>
      {/* Global CSS for animations:
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInFromTop {
            from { transform: translateY(-50px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes slideInTop {
            from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `}</style>
      */}
      {toast && <div style={toastStyle}>{toast.message}</div>}
      {notifEnabled && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            background: "#ffebee",
            color: "#d0488f",
            border: "1.5px solid #ffcdd2",
            borderRadius: 12,
            padding: "10px 22px",
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 2px 16px rgba(255, 200, 220, 0.4)",
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
          boxSizing: "border-box",
          paddingBottom: 80,
        }}
      >
        <div
          style={{ ...mobileCard, marginTop: 24, textAlign: "center" }}
          onMouseEnter={() => setBtnHover("card1")} // Using btnHover state for card hover
          onMouseLeave={() => setBtnHover("")}
        >
          <h1
            style={{ color: "#ff4081", fontSize: 28, margin: "18px 0 24px 0" }}
          >
            Tu dors avec moi ce soir ?
          </h1>
          <div style={{ fontSize: 16, color: "#888", marginBottom: 18 }}>
            <span style={{ color: "#ff80ab" }}>
              {formatDateFr(toLocalDateString(new Date()))}
            </span>
          </div>
          {loading ? (
            <div style={{ color: "#ff80ab", fontSize: 20, margin: "24px 0" }}>
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
              {mainIcon && (
                <span
                  style={{ fontSize: 38, marginBottom: 20 }}
                  className={mainIcon === "⏳" ? "hourglass-animated" : ""}
                >
                  {mainIcon}
                </span>
              )}
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
                Oui {answerIcon["Oui"]}
              </button>
              <button
                style={
                  btnHover === "non" ? { ...bigBtn, ...bigBtnHover } : bigBtn
                }
                onMouseEnter={() => setBtnHover("non")}
                onMouseLeave={() => setBtnHover("")}
                onClick={() => handleAnswer(false)}
              >
                Non {answerIcon["Non"]}
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
                style={{
                  ...mobileInput,
                  width: "calc(100% - 120px)",
                  display: "inline-block",
                  verticalAlign: "middle",
                  marginBottom: 0,
                }}
                placeholder="Expliquez en quelques mots..."
              />
              <button
                style={{
                  ...bigBtn,
                  fontSize: 17,
                  padding: "0.6rem 1.5rem",
                  marginLeft: 10,
                  verticalAlign: "middle",
                  marginTop: 15,
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
                  color: "#ff80ab",
                  border: "1.5px solid #ff80ab",
                  boxShadow: "none",
                  fontSize: 18,
                }}
                onMouseEnter={() => setBtnHover("reset")}
                onMouseLeave={() => setBtnHover("")}
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
                background: "#fce4ec", // Lighter button for navigation
                color: "#ff80ab",
                boxShadow: "none",
                border: "1px solid #ffcdd2",
              }}
              onMouseEnter={() => setBtnHover("prevMonth")}
              onMouseLeave={() => setBtnHover("")}
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
            <span style={{ fontWeight: 700, fontSize: 20, color: "#ff4081" }}>
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
                background: "#fce4ec",
                color: "#ff80ab",
                boxShadow: "none",
                border: "1px solid #ffcdd2",
              }}
              onMouseEnter={() => setBtnHover("nextMonth")}
              onMouseLeave={() => setBtnHover("")}
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
                style={{ fontWeight: 600, color: "#ff80ab", padding: 4 }}
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
              const dateStr = toLocalDateString(d);
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
                  onMouseEnter={(e) => {
                    if (!isToday && !hasEvent) {
                      e.currentTarget.style.background = "#fff0fa"; // Hover for non-event, non-today
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(255, 200, 220, 0.3)";
                    } else if (hasEvent) {
                      e.currentTarget.style.background = "#ffedf5"; // Hover for event
                      e.currentTarget.style.transform = "scale(1.03)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isToday && !hasEvent) {
                      e.currentTarget.style.background = dayCell.background;
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    } else if (hasEvent) {
                      e.currentTarget.style.background =
                        dayCellEvent.background;
                      e.currentTarget.style.transform = "none";
                    }
                  }}
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
              onMouseEnter={() => setBtnHover("addEvent")}
              onMouseLeave={() => setBtnHover("")}
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
                boxShadow: "0 8px 40px rgba(184, 111, 165, 0.5)",
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
                        transition: "transform 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "none")
                      }
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
                  {ALL_USERS.map((uid) => {
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
                              {resp.answer === "Oui" ? "🌸 Oui" : "🥀 Non"}
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
                            : bigBtn.background, // Use original background if not selected
                          color: eventResponses.find(
                            (r) => r.user_id === userId && r.answer === "Oui"
                          )
                            ? "#d0488f"
                            : bigBtn.color,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform =
                            bigBtnHover.transform)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "none")
                        }
                      >
                        Oui 🌸
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
                            : bigBtn.background, // Use original background if not selected
                          color: eventResponses.find(
                            (r) => r.user_id === userId && r.answer === "Non"
                          )
                            ? "#d0488f"
                            : bigBtn.color,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform =
                            bigBtnHover.transform)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "none")
                        }
                      >
                        Non 🥀
                      </button>
                    </div>
                    <textarea
                      placeholder="Ajouter un commentaire (facultatif)"
                      value={eventComment}
                      onChange={(e) => setEventComment(e.target.value)}
                      style={{
                        ...mobileInput,
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
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform =
                          bigBtnHover.transform)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "none")
                      }
                    >
                      Enregistrer
                    </button>
                    {/* Bouton Relancer */}
                    {(() => {
                      const otherUser = ALL_USERS.find((u) => u !== userId);
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
                                ...mobileInput,
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
                              onMouseEnter={(e) => {
                                if (reminderCount < maxReminders) {
                                  e.currentTarget.style.transform =
                                    bigBtnHover.transform;
                                }
                              }}
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "none")
                              }
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
              <h2 style={{ color: "#ff4081", fontSize: 20, marginBottom: 16 }}>
                Nouvel événement
              </h2>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={eventForm.date}
                  onChange={handleEventFormChange}
                  style={mobileInput}
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
                  style={mobileInput}
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
                  style={mobileInput}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Lieu</label>
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventFormChange}
                  style={mobileInput}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  style={{ ...mobileInput, minHeight: 60, width: "100%" }}
                />
              </div>
              {eventFormError && (
                <div style={{ color: "red", marginBottom: 12 }}>
                  {eventFormError}
                </div>
              )}
              <div style={{ textAlign: "right" }}>
                <button
                  type="button"
                  style={{
                    ...closeBtn, // Use the new closeBtn style
                    marginRight: 10,
                  }}
                  onMouseEnter={() => setBtnHover("cancelEvent")}
                  onMouseLeave={() => setBtnHover("")}
                  onClick={closeEventForm}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ ...bigBtn, fontSize: 16 }}
                  onMouseEnter={() => setBtnHover("submitEvent")}
                  onMouseLeave={() => setBtnHover("")}
                >
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
          maxWidth: 420,
          margin: "0 auto",
          marginTop: 80,
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 18,
          boxShadow: "0 2px 16px rgba(255, 200, 220, 0.3)",
          padding: 18,
          boxSizing: "border-box",
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
            <button
              style={closeBtn}
              onMouseEnter={() => setBtnHover("closeJson")}
              onMouseLeave={() => setBtnHover("")}
              onClick={() => setShowSubJson(false)}
            >
              Fermer
            </button>
          </div>
        )}
        <button
          style={mobileBtn}
          onMouseEnter={() => setBtnHover("acceptNotifs")}
          onMouseLeave={() => setBtnHover("")}
          onClick={forceSubscribeToPush}
        >
          Accepter les notifications
        </button>
        <button
          style={mobileBtn}
          onMouseEnter={() => setBtnHover("copySub")}
          onMouseLeave={() => setBtnHover("")}
          onClick={copyMySubscription}
        >
          Copier ma subscription
        </button>
        <button
          style={mobileBtn}
          onMouseEnter={() => setBtnHover("showSub")}
          onMouseLeave={() => setBtnHover("")}
          onClick={showMySubscription}
        >
          Afficher ma subscription
        </button>
        {!showGlobalNotif ? (
          <button
            style={mobileBtn}
            onMouseEnter={() => setBtnHover("showGlobalNotif")}
            onMouseLeave={() => setBtnHover("")}
            onClick={() => setShowGlobalNotif(true)}
          >
            Notifications globales
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
                onMouseEnter={() => setBtnHover("cancelGlobalNotif")}
                onMouseLeave={() => setBtnHover("")}
                onClick={() => setShowGlobalNotif(false)}
              >
                Annuler
              </button>
              <button
                style={mobileBtn}
                onMouseEnter={() => setBtnHover("sendGlobalNotif")}
                onMouseLeave={() => setBtnHover("")}
                onClick={sendGlobalNotification}
              >
                Envoyer
              </button>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes hourglass-flip {
          0% {
            transform: rotate(0deg);
            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
          40% {
            transform: rotate(180deg);
            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
          50% {
            transform: rotate(180deg);
          }
          90% {
            transform: rotate(360deg);
            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .hourglass-animated {
          display: inline-block;
          animation: hourglass-flip 2.2s infinite;
          transform-origin: 50% 60%;
        }
      `}</style>
    </div>
  );
}
