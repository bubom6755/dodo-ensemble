import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import BottomNavigation from "../components/BottomNavigation";
import ToastContainer from "../components/ToastContainer";
import AnimatedCard from "../components/AnimatedCard";
import AnimatedButton from "../components/AnimatedButton";
import PushNotificationManager from "../components/PushNotificationManager";
import AdminPanel from "../components/AdminPanel";

// ---------------------------------------------------
// START OF UPDATED STYLE CONSTANTS
// ---------------------------------------------------

const mobileMainBg = {
  minHeight: "100vh",
  background:
    "radial-gradient(1200px 800px at 50% -10%, rgba(255,182,219,0.35), transparent), linear-gradient(135deg, #fff7fb 0%, #ffeef8 100%)",
  padding: "0 8px",
  boxSizing: "border-box",
  maxWidth: "100vw",
  width: "100%",
  margin: "0 auto",
  color: "#4a4a4a",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif",
};

const mobileCard = {
  background: "#ffffff",
  borderRadius: 20,
  boxShadow: "0 6px 24px rgba(255, 200, 220, 0.4)",
  border: "1px solid #ffd6ef",
  padding: 24,
  margin: "16px 0",
  width: "100%",
  maxWidth: "min(600px, 100vw)",
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
  transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out, background 0.3s ease-out",
  animation: "fadeInUp 0.4s ease-out",
};

const mobileCardHover = {
  transform: "translateY(-3px)",
  background: "#ffffff",
  boxShadow: "0 14px 40px rgba(255, 200, 220, 0.45)",
};

const bigBtn = {
  background: "linear-gradient(90deg, #ff80ab 0%, #ff4081 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 36,
  fontSize: 20,
  fontWeight: 700,
  padding: "1.2rem 2.8rem",
  margin: "0 18px 0 0",
  boxShadow: "0 8px 18px rgba(255, 64, 129, 0.28)",
  cursor: "pointer",
  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out, filter 0.2s ease-out",
  outline: "none",
  position: "relative",
  overflow: "hidden",
};

const bigBtnHover = {
  transform: "translateY(-2px) scale(1.02)",
  boxShadow: "0 12px 26px rgba(255, 64, 129, 0.35)",
  filter: "saturate(1.1)",
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
  boxShadow: "0 6px 16px rgba(255, 64, 129, 0.28)",
  cursor: "pointer",
  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
  outline: "none",
};

const mobileBtnHover = {
  transform: "translateY(-2px) scale(1.01)",
  boxShadow: "0 10px 22px rgba(255, 64, 129, 0.35)",
};

const mobileBtnActive = {
  transform: "scale(0.98)",
  boxShadow: "0 2px 8px rgba(255, 64, 129, 0.25)",
};

const closeBtn = {
  ...mobileBtn,
  background: "#fff",
  color: "#ff4081",
  border: "1.5px solid #ff80ab",
  boxShadow: "none",
  fontSize: 16,
  padding: "0.8rem 0",
};

const closeBtnHover = {
  background: "#fce4ec",
  color: "#d0488f",
  transform: "none",
  boxShadow: "0 2px 8px rgba(255, 200, 220, 0.4)",
};

const closeBtnActive = {
  background: "#f8bbd0",
};

const sectionTitle = {
  color: "#d0488f",
  fontWeight: 800,
  fontSize: 26,
  marginBottom: 12,
  marginTop: 0,
  textAlign: "center",
  fontFamily: "Playfair Display, Georgia, serif",
  letterSpacing: 0.2,
};

const mobileInput = {
  padding: 16,
  borderRadius: 10,
  border: "1px solid #ffd6ef",
  fontSize: 18,
  marginBottom: 16,
  background: "#fff8fc",
  width: "100%",
  boxSizing: "border-box",
  color: "#4a4a4a",
  transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
};

const mobileTextarea = {
  ...mobileInput,
  minHeight: 100,
  maxHeight: 250,
  fontFamily: "inherit",
  fontSize: 16,
  resize: "vertical",
  marginBottom: 16,
  color: "#4a4a4a",
};

const labelStyle = {
  fontWeight: 600,
  color: "#d0488f",
  marginRight: 8,
  display: "block",
  marginBottom: 6,
  fontSize: 16,
};

const answerIcon = {
  Oui: "😊", // More sakura-themed emojis
  Non: "😫", // A wilted rose for contrast
};

const calendarStyle = {
  background: "#ffffff",
  borderRadius: 20,
  boxShadow: "0 6px 24px rgba(255, 200, 220, 0.4)",
  border: "1px solid rgba(255,214,239,0.8)",
  padding: 28,
  maxWidth: "min(600px, 100vw)",
};
const calendarHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  color: "#ff4081",
  fontWeight: 700,
  fontSize: 22,
};
const calendarGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 6,
  padding: 6,
};
const dayCell = {
  minHeight: 60,
  borderRadius: 14,
  background: "#fff",
  textAlign: "center",
  fontSize: 16,
  color: "#888",
  cursor: "pointer",
  position: "relative",
  transition:
    "background 0.2s ease-in-out, transform 0.12s ease-out, box-shadow 0.12s ease-out",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  border: "1px solid #ffd6ef",
  boxShadow: "0 2px 8px rgba(255, 200, 220, 0.18)",
};
const dayCellEvent = {
  ...dayCell,
  background: "#fff6f9",
  color: "#d0488f",
  fontWeight: 700,
  border: "1.5px solid #ffcdd2",
  boxShadow: "0 4px 12px rgba(255, 200, 220, 0.26)",
};
const todayCell = {
  ...dayCell,
  border: "2px solid #ff80ab",
  background: "linear-gradient(135deg, #fff0fa 0%, #fff6fb 100%)",
  fontWeight: 800,
  color: "#d0488f",
  boxShadow: "0 6px 16px rgba(255, 128, 171, 0.25)",
};
const eventDot = {
  width: 6,
  height: 6,
  borderRadius: 3,
  background: "#ff4081",
  position: "absolute",
  left: "50%",
  bottom: 6,
  transform: "translateX(-50%)",
  boxShadow: "0 0 4px rgba(255, 64, 129, 0.35)",
};

const eventCountBadge = {
  position: "absolute",
  left: "50%",
  bottom: 2,
  transform: "translateX(-50%)",
  background: "#ff4081",
  color: "#fff",
  borderRadius: 8,
  padding: "0 5px",
  height: 14,
  minWidth: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 9,
  fontWeight: 700,
  lineHeight: 1,
  boxShadow: "0 1px 3px rgba(255, 64, 129, 0.25)",
  border: "1px solid #ffcdd2",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.35)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(6px)",
};
const modalBox = {
  background: "linear-gradient(180deg, #ffffff 0%, #fff8fc 100%)",
  borderRadius: 18,
  boxShadow: "0 14px 44px rgba(255, 200, 220, 0.35)",
  border: "1px solid #ffd6ef",
  padding: 16,
  width: "92vw",
  maxWidth: 380,
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  zIndex: 1001,
};

const toastStyle = {
  position: "fixed",
  top: 24,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#ffebee",
  color: "#d0488f",
  border: `1.5px solid #ffcdd2`,
  borderRadius: 12,
  padding: "12px 32px",
  fontWeight: 600,
  fontSize: 17,
  boxShadow: "0 4px 16px rgba(255, 200, 220, 0.4)",
  zIndex: 2000,
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
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [dayEvents, setDayEvents] = useState([]);
  const [dayEventsDate, setDayEventsDate] = useState("");
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Citation depuis la BDD
  const [citation, setCitation] = useState(
    "L'amour, c'est prendre soin l'un de l'autre chaque jour."
  );
  const [editCitation, setEditCitation] = useState(false);
  const [citationInput, setCitationInput] = useState("");
  const [citationId, setCitationId] = useState(null);
  const [citationLoading, setCitationLoading] = useState(false);

  // Fonction utilitaire pour afficher une notification
  function showToast(message, type = "pink") {
    if (window.showToast) {
      window.showToast({ message, type });
    }
  }

  // Fonction utilitaire pour incrémenter le nombre de relances
  function incrementReminder(eventId, userId) {
    setReminders((prev) => {
      const key = `${eventId}_${userId}`;
      return { ...prev, [key]: (prev[key] || 0) + 1 };
    });
  }

  // Fonction pour ouvrir le panel admin
  const handleAdminClick = () => {
    setShowAdminPanel(true);
  };

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

  useEffect(() => {
    async function fetchCitation() {
      setCitationLoading(true);
      const { data, error } = await supabase
        .from("citation")
        .select("id, text")
        .order("updated_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setCitation(data[0].text);
        setCitationInput(data[0].text);
        setCitationId(data[0].id);
      }
      setCitationLoading(false);
    }
    fetchCitation();
  }, []);

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

  function openDayEventsModal(dateStr) {
    const list = eventsByDate[dateStr] || [];
    setDayEvents(list);
    setDayEventsDate(dateStr);
    setShowDayEventsModal(true);
  }

  function closeDayEventsModal() {
    setShowDayEventsModal(false);
    setDayEvents([]);
    setDayEventsDate("");
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
      // Notification automatique pour le nouvel événement
      const otherUser = ALL_USERS.find((u) => u !== userId);
      const eventDate = new Date(dateStr);
      const formattedDate = eventDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      sendNativePushNotification({
        title: "Nouvel événement créé !",
        message: `${displayUserName(userId)} a créé un nouvel événement : "${
          eventForm.title
        }" le ${formattedDate}${eventForm.time ? ` à ${eventForm.time}` : ""}`,
        targetUserId: otherUser,
      });

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
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  }
  // Tri des événements d'un même jour par heure croissante (si présente)
  for (const dateKey in eventsByDate) {
    eventsByDate[dateKey].sort((a, b) => {
      const aHas = !!a.time;
      const bHas = !!b.time;
      if (aHas && bHas) return a.time.localeCompare(b.time);
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return 0;
    });
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
  // Cherche la raison du 'Non' si elle existe
  let nonReason = null;
  let nonUser = null;
  if (nbReponses > 0) {
    const nonResp = allTodayResponses.find(
      (r) => r.answer === "Non" && r.reason && r.reason.trim() !== ""
    );
    if (nonResp) {
      nonReason = nonResp.reason;
      nonUser = displayUserName(nonResp.user_id);
    }
  }
  if (nbReponses === ALL_USERS.length) {
    // Les deux ont répondu
    if (Object.values(responsesMap).some((ans) => ans === "Non")) {
      mainMessage = nonReason
        ? `Non, pas ce soir car ${nonUser} ${nonReason}`
        : "Non, pas ce soir.";
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
      mainMessage = nonReason
        ? `Non, pas ce soir car ${nonUser} ${nonReason}`
        : "Non, pas ce soir.";
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

  async function handleSaveCitation() {
    if (!citationInput.trim()) return;
    setCitationLoading(true);
    await supabase.from("citation").upsert(
      {
        id: citationId,
        text: citationInput,
        updated_at: new Date().toISOString(),
      },
      { onConflict: ["id"] }
    );
    setEditCitation(false);
    setCitation(citationInput);
    setCitationLoading(false);
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
      await supabase.from("push_subscriptions").upsert({
        user_id: userId,
        subscription: sub,
        updated_at: new Date().toISOString(),
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
        setSubJson("");
        setShowSubJson(true);
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
        year: "numeric",
      })
      .replace(/^(.)/, (c) => c.toUpperCase());
  }

  // Fonction pour calculer le temps restant jusqu'à un événement
  function getTimeUntilEvent(eventDate, eventTime) {
    const now = new Date();
    const eventDateTime = new Date(eventDate);

    if (eventTime) {
      const [hours, minutes] = eventTime.split(":");
      eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      // Si pas d'heure, on considère 18h00 par défaut
      eventDateTime.setHours(18, 0, 0, 0);
    }

    const diff = eventDateTime - now;

    if (diff <= 0) {
      return {
        isPast: true,
        text: "Aujourd'hui",
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return {
        isPast: false,
        text: `${days} jour${days > 1 ? "s" : ""}`,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      };
    } else if (hours > 0) {
      return {
        isPast: false,
        text: `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`,
        days: 0,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      };
    } else {
      return {
        isPast: false,
        text: `${minutes}min`,
        days: 0,
        hours: 0,
        minutes: minutes,
        seconds: seconds,
      };
    }
  }

  // Fonction pour vérifier si un événement mystère est passé et doit être dévoilé
  function isMysteryEventRevealed(event) {
    if (!event.is_mystery) return false;

    const now = new Date();
    const eventDateTime = new Date(event.date);

    if (event.time) {
      const [hours, minutes] = event.time.split(":");
      eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      // Si pas d'heure, on considère 18h00 par défaut
      eventDateTime.setHours(18, 0, 0, 0);
    }

    return now >= eventDateTime;
  }

  // Fonction pour obtenir les événements à venir les plus proches
  function getUpcomingEvents() {
    const now = new Date();
    const today = toLocalDateString(now);

    const futureEvents = events.filter((event) => {
      const eventDate = event.date;
      if (eventDate < today) return false;
      if (eventDate === today && event.time) {
        const [hours, minutes] = event.time.split(":").map(Number);
        const eventTime = new Date();
        eventTime.setHours(hours, minutes, 0, 0);
        return eventTime > now;
      }
      return true;
    });

    const toDateTime = (e) => {
      const dt = new Date(e.date);
      if (e.time) {
        const [h, m] = e.time.split(":").map(Number);
        dt.setHours(h, m, 0, 0);
      } else {
        // Par défaut 18:00 si pas d'heure
        dt.setHours(18, 0, 0, 0);
      }
      return dt;
    };

    futureEvents.sort((a, b) => toDateTime(a) - toDateTime(b));
    return futureEvents.slice(0, 1);
  }

  const upcomingEvents = getUpcomingEvents();

  // Statistiques rapides pour le bandeau d'accueil
  const monthEventCount = events.length;
  const todayEventsCount = (eventsByDate[todayStr]?.length || 0);
  let nextEventLabel = "Aucun";
  if (upcomingEvents.length > 0) {
    const ue = upcomingEvents[0];
    const tu = getTimeUntilEvent(ue.date, ue.time);
    nextEventLabel = tu.isPast ? "Aujourd'hui" : tu.text;
  }

  // État pour forcer le re-render du compte à rebours
  const [countdownTick, setCountdownTick] = useState(0);

  // Effet pour mettre à jour le compte à rebours chaque seconde
  useEffect(() => {
    if (upcomingEvents.length > 0) {
      const interval = setInterval(() => {
        setCountdownTick((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [upcomingEvents.length]);

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
      <ToastContainer />
      <main
        style={{
          width: "100%",
          maxWidth: "min(600px, 100vw)", // Plus large sur les grands écrans, mais pas plus que 600px
          margin: "auto",
          padding: 0,
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          boxSizing: "border-box",
          paddingBottom: 200, // Increased padding to make push notifications accessible
        }}
      >
        {/* En-tête supprimé selon demande */}
        <div
          style={{
            ...mobileCard,
            marginTop: 16,
            textAlign: "center",
            background: "linear-gradient(135deg, #fff8fc 0%, #ffeef8 100%)",
            border: "1px solid #ffd6ef",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={() => setBtnHover("card1")} // Using btnHover state for card hover
          onMouseLeave={() => setBtnHover("")}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background:
                "linear-gradient(90deg, #ff80ab 0%, #ff4081 50%, #ff80ab 100%)",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          ></div>
          <h1
            style={{
              color: "#d0488f",
              fontSize: 28,
              margin: "18px 0 24px 0",
              letterSpacing: 0.3,
              fontWeight: 800,
            }}
          >
            Tu dors avec moi ce soir ?
          </h1>
          <div style={{ fontSize: 16, color: "#888", marginBottom: 18 }}>
            <span style={{ color: "#ff80ab", fontWeight: 700 }}>
              {formatDateFr(toLocalDateString(new Date()))}
            </span>
          </div>
          {/* métriques retirées pour une esthétique plus épurée */}
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
        </div>
        {/* Barre d'actions rapides supprimée selon demande */}
        {/* CALENDRIER EVENEMENTS */}
        <h2 style={{ ...sectionTitle, marginTop: 18, marginBottom: 10 }}>Calendrier</h2>
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
            <span
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: "#d0488f",
              }}
            >
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
                style={{ fontWeight: 700, color: "#d0488f", padding: 6, fontSize: 13 }}
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
              const hasEvent = (eventsByDate[dateStr]?.length || 0) > 0;
              return (
                <div
                  key={dateStr}
                  style={
                    isToday ? todayCell : hasEvent ? dayCellEvent : dayCell
                  }
                  onClick={() =>
                    hasEvent
                      ? (eventsByDate[dateStr].length === 1
                          ? openEventModal(eventsByDate[dateStr][0])
                          : openDayEventsModal(dateStr))
                      : openEventForm(dateStr)
                  }
                  title={
                    hasEvent
                      ? (eventsByDate[dateStr].length === 1
                          ? eventsByDate[dateStr][0].title
                          : `${eventsByDate[dateStr].length} événements`)
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
                  {hasEvent && (
                    (eventsByDate[dateStr]?.length || 0) > 1 ? (
                      <div style={eventCountBadge}>+{eventsByDate[dateStr].length}</div>
                    ) : (
                      <div style={eventDot}></div>
                    )
                  )}
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

        {/* HORLOGE NUMÉRIQUE - COMPTE À REBOURS */}
        {upcomingEvents.length > 0 && (
          <section
            style={{
              ...mobileCard,
              marginTop: 16,
              background: "linear-gradient(135deg, #fff8fc 0%, #ffeef8 100%)",
              border: "1px solid #ffd6ef",
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background:
                  "linear-gradient(90deg, #ff80ab 0%, #ff4081 50%, #ff80ab 100%)",
                animation: "shimmer 2s ease-in-out infinite",
              }}
            ></div>

            {upcomingEvents.map((event) => {
              const timeUntil = getTimeUntilEvent(event.date, event.time);
              const isToday = event.date === toLocalDateString(new Date());

              return (
                <div key={event.id}>
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: 12,
                    }}
                  >
                    <h3
                      style={{
                        color: "#d0488f",
                        fontSize: 16,
                        fontWeight: 700,
                        margin: "0 0 2px 0",
                      }}
                    >
                      Prochain événement
                    </h3>
                    <p
                      style={{
                        color: "#b86fa5",
                        fontSize: 14,
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {event.is_mystery && !isMysteryEventRevealed(event)
                        ? "Événement mystère"
                        : event.title}
                    </p>
                  </div>

                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 12,
                      padding: "16px 12px",
                      border: "2px solid #ffd6ef",
                      marginBottom: 12,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(255, 200, 220, 0.4)";
                      e.currentTarget.style.borderColor = "#ff80ab";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#ffd6ef";
                    }}
                    onClick={() => openEventModal(event)}
                  >
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#ff4081",
                        marginBottom: 6,
                        fontFamily: "monospace",
                        letterSpacing: "1px",
                      }}
                    >
                      {timeUntil.isPast
                        ? "MAINTENANT"
                        : timeUntil.days > 0
                        ? `${timeUntil.days
                            .toString()
                            .padStart(2, "0")}:${timeUntil.hours
                            .toString()
                            .padStart(2, "0")}:${timeUntil.minutes
                            .toString()
                            .padStart(2, "0")}:${timeUntil.seconds
                            .toString()
                            .padStart(2, "0")}`
                        : timeUntil.hours > 0
                        ? `${timeUntil.hours
                            .toString()
                            .padStart(2, "0")}:${timeUntil.minutes
                            .toString()
                            .padStart(2, "0")}:${timeUntil.seconds
                            .toString()
                            .padStart(2, "0")}`
                        : `${timeUntil.minutes
                            .toString()
                            .padStart(2, "0")}:${timeUntil.seconds
                            .toString()
                            .padStart(2, "0")}`}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#b86fa5",
                      fontWeight: 600,
                    }}
                  >
                    📅 {formatDateFr(event.date)}
                    {event.time && (
                      <span style={{ marginLeft: 8 }}>⏰ {event.time}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* MODAL DETAILS EVENEMENT */}
        {showEventModal && modalEvent && (
          <div style={modalOverlay} onClick={closeEventModal}>
            <div
              style={{
                ...modalBox,
                padding: 0,
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  background: "linear-gradient(90deg, #fff8fc 0%, #ffffff 100%)",
                  padding: "16px 18px 10px 18px",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  borderBottom: "1px solid #f3d6e7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 22, color: "#d0488f" }}>📅</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 18,
                      color: "#d0488f",
                      marginBottom: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {modalEvent.is_mystery &&
                    !isMysteryEventRevealed(modalEvent)
                      ? "Événement mystère"
                      : modalEvent.title}
                  </div>
                  <div
                    style={{ color: "#b86fa5", fontSize: 13, fontWeight: 600 }}
                  >
                    {formatDateFr(modalEvent.date)}
                    {modalEvent.time && (
                      <span style={{ marginLeft: 8 }}>{modalEvent.time}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeEventModal}
                  style={{
                    background: "#fff",
                    border: "1px solid #ffd6ef",
                    fontSize: 16,
                    color: "#d0488f",
                    cursor: "pointer",
                    padding: "4px 10px",
                    borderRadius: 999,
                  }}
                  title="Fermer"
                >
                  Fermer
                </button>
              </div>
              {/* Body */}
              <div style={{ padding: "12px 14px 14px 14px", overflowY: "auto" }}>
                {/* Lieu */}
                {modalEvent.location &&
                  (!modalEvent.is_mystery ||
                    isMysteryEventRevealed(modalEvent)) && (
                    <div
                      style={{
                        color: "#b86fa5",
                        fontSize: 15,
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontWeight: 500,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>📍</span>
                      <span style={{ overflowWrap: "anywhere" }}>
                        {modalEvent.location}
                      </span>
                    </div>
                  )}
                {/* Description */}
                {modalEvent.description &&
                  (!modalEvent.is_mystery ||
                    isMysteryEventRevealed(modalEvent)) && (
                    <div
                      style={{
                        color: "#4a4a4a",
                        fontSize: 14,
                        marginBottom: 10,
                        background: "#fff",
                        border: "1px solid #ffd6ef",
                        borderRadius: 10,
                        padding: "12px 12px",
                        fontWeight: 500,
                        wordBreak: "break-word",
                      }}
                    >
                      {modalEvent.description}
                    </div>
                  )}
                {/* Mystère non révélé */}
                {modalEvent.is_mystery &&
                  !isMysteryEventRevealed(modalEvent) && (
                    <div
                      style={{
                        background: "rgba(33, 150, 243, 0.08)",
                        border: "1px solid rgba(33, 150, 243, 0.13)",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 8,
                        color: "#1976d2",
                        fontSize: 13,
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      🎭 Cet événement est un mystère ! Les détails seront
                      révélés au moment venu.
                    </div>
                  )}
                {/* Créateur */}
                <div
                  style={{
                    marginTop: 12,
                    color: "#b86fa5",
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: "right",
                    borderTop: "1px dashed #f3d6e7",
                    paddingTop: 8,
                  }}
                >
                  👤 {displayUserName(modalEvent.user_id)}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* MODALE LISTE ÉVÉNEMENTS DU JOUR */}
        {showDayEventsModal && (
          <div style={modalOverlay} onClick={closeDayEventsModal}>
            <div
              style={{ ...modalBox, padding: 0, overflow: "hidden" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  background: "linear-gradient(90deg, #ffeef8 0%, #fff 100%)",
                  padding: "20px 28px 12px 28px",
                  borderTopLeftRadius: 22,
                  borderTopRightRadius: 22,
                  borderBottom: "1px solid #f3d6e7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 22, color: "#d0488f", fontWeight: 700 }}>
                  {formatDateFr(dayEventsDate)}
                </div>
                <button
                  onClick={closeDayEventsModal}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 22,
                    color: "#b86fa5",
                    cursor: "pointer",
                    padding: 8,
                    lineHeight: 1,
                    transition: "color 0.15s",
                  }}
                  title="Fermer"
                >
                  ×
                </button>
              </div>
              <div style={{ padding: "8px 8px 8px 8px", maxHeight: "70vh", overflowY: "auto" }}>
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      closeDayEventsModal();
                      openEventModal(ev);
                    }}
                    style={{
                      margin: "8px 12px",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #ffd6ef",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#fff8fc";
                      e.currentTarget.style.borderColor = "#ff80ab";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.borderColor = "#ffd6ef";
                    }}
                  >
                    <div style={{ color: "#d0488f", fontWeight: 700, fontSize: 16 }}>
                      {ev.is_mystery && !isMysteryEventRevealed(ev) ? "Événement mystère" : ev.title}
                    </div>
                    <div style={{ color: "#b86fa5", fontSize: 13, marginTop: 4 }}>
                      {ev.time ? `⏰ ${ev.time}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* FORMULAIRE AJOUT EVENEMENT */}
        {showEventForm && (
          <div style={modalOverlay} onClick={closeEventForm}>
            <form
              style={{ ...modalBox }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={submitEventForm}
            >
              <div
                style={{
                  background: "linear-gradient(90deg, #fff8fc 0%, #ffffff 100%)",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid #ffd6ef",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ color: "#d0488f", fontWeight: 800, fontSize: 16 }}>
                  Nouvel événement
                </div>
                <button
                  type="button"
                  onClick={closeEventForm}
                  style={{
                    background: "#fff",
                    border: "1px solid #ffd6ef",
                    color: "#d0488f",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Fermer
                </button>
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ ...labelStyle, fontSize: 14, marginBottom: 4 }}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={eventForm.date}
                  onChange={handleEventFormChange}
                  style={mobileInput}
                  required
                />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ ...labelStyle, fontSize: 14, marginBottom: 4 }}>Titre</label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  style={mobileInput}
                  required
                />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ ...labelStyle, fontSize: 14, marginBottom: 4 }}>Heure</label>
                <input
                  type="time"
                  name="time"
                  value={eventForm.time}
                  onChange={handleEventFormChange}
                  style={mobileInput}
                />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ ...labelStyle, fontSize: 14, marginBottom: 4 }}>Lieu</label>
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventFormChange}
                  style={mobileInput}
                />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ ...labelStyle, fontSize: 14, marginBottom: 4 }}>Description</label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  style={{ ...mobileInput, minHeight: 48, width: "100%" }}
                />
              </div>
              {eventFormError && (
                <div style={{ color: "red", marginBottom: 12 }}>
                  {eventFormError}
                </div>
              )}
              <div style={{ marginTop: 10 }}>
                <button
                  type="submit"
                  style={{ ...bigBtn, width: "100%", fontSize: 16, padding: "0.9rem 1.2rem" }}
                  onMouseEnter={() => setBtnHover("submitEvent")}
                  onMouseLeave={() => setBtnHover("")}
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={closeEventForm}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#d0488f",
                    fontWeight: 600,
                    marginTop: 8,
                    width: "100%",
                    cursor: "pointer",
                  }}
                >
                  Annuler
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
          maxWidth: "min(600px, 100vw)", // Plus large sur les grands écrans, mais pas plus que 600px
          margin: "0 auto",
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
        {/* Citation en bas, modifiable uniquement par Victor */}
        <div
          style={{
            marginTop: 8,
            marginBottom: 8,
            minHeight: 40,
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff8fc",
              border: "1.5px solid #ffd6ef",
              borderRadius: 14,
              padding: editCitation ? "18px 18px 14px 18px" : "12px 18px",
              minWidth: 220,
              maxWidth: 420,
              margin: "0 auto",
              display: "inline-block",
              boxShadow: editCitation ? "0 2px 12px #ffd6ef33" : "none",
              transition: "box-shadow 0.2s",
            }}
          >
            {citationLoading ? (
              <span style={{ color: "#b86fa5", fontWeight: 600, fontSize: 16 }}>
                Chargement...
              </span>
            ) : userId === "victor" ? (
              editCitation ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <input
                    type="text"
                    value={citationInput}
                    onChange={(e) => setCitationInput(e.target.value)}
                    onBlur={() => {
                      if (citationInput.trim() && citationInput !== citation)
                        handleSaveCitation();
                      setEditCitation(false);
                    }}
                    autoFocus
                    style={{
                      fontSize: 16,
                      padding: 10,
                      borderRadius: 8,
                      border: "1.5px solid #ffd6ef",
                      width: "100%",
                      marginBottom: 10,
                      background: "#fff",
                      textAlign: "center",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "center",
                    }}
                  >
                    <button
                      style={{
                        ...closeBtn,
                        fontSize: 15,
                        padding: "0.6rem 1.5rem",
                        borderRadius: 18,
                        minWidth: 90,
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setEditCitation(false);
                        setCitationInput(citation);
                      }}
                      disabled={citationLoading}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      color: "#b86fa5",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer",
                      borderBottom: "1px dashed #b86fa5",
                    }}
                    title="Cliquez pour modifier"
                    onClick={() => setEditCitation(true)}
                  >
                    {citation}
                  </span>
                </div>
              )
            ) : (
              <span style={{ color: "#b86fa5", fontWeight: 600, fontSize: 16 }}>
                {citation}
              </span>
            )}
          </div>
        </div>
      </div>
      <BottomNavigation activePage="home" onAdminClick={handleAdminClick} />
      <PushNotificationManager />
      {showAdminPanel && (
        <AdminPanel userId={userId} onClose={() => setShowAdminPanel(false)} />
      )}
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

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
