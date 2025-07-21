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

  useEffect(() => {
    if (!router.isReady) return;
    let userFromUrl = router.query.user;
    if (typeof userFromUrl === "string" && userFromUrl.trim() !== "") {
      setUserId(userFromUrl);
      localStorage.setItem("userId", userFromUrl);
    } else {
      const stored = localStorage.getItem("userId");
      if (stored && stored.trim() !== "") {
        setUserId(stored);
      } else {
        alert("Aucun utilisateur défini. Ajoutez ?user=victor à l'URL.");
      }
    }
  }, [router.isReady, router.query.user]);

  useEffect(() => {
    if (userId) fetchTodayResponse();
  }, [userId]);

  useEffect(() => {
    fetchEvents();
  }, [calendarMonth]);

  async function fetchTodayResponse() {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();
    if (error && error.code !== "PGRST116") setTodayResponse(null);
    else setTodayResponse(data);
    setLoading(false);
  }

  async function handleAnswer(ans) {
    setAnswer(ans);
    if (!ans) {
      setShowReasonInput(true);
    } else {
      await saveResponse(ans, "");
      setShowReasonInput(false);
      fetchTodayResponse();
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
    fetchTodayResponse();
  }

  async function submitReason() {
    await saveResponse(answer, reason);
    setReason("");
    setShowReasonInput(false);
    fetchTodayResponse();
  }

  // RESET pour Victor : supprime la réponse du jour pour tous
  async function resetToday() {
    if (
      !window.confirm("Remettre à zéro la réponse du jour pour tout le monde ?")
    )
      return;
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("responses").delete().eq("date", today);
    fetchTodayResponse();
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
    const { error } = await supabase.from("events").upsert({
      date: eventForm.date,
      title: eventForm.title,
      description: eventForm.description,
      time: eventForm.time,
      location: eventForm.location,
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

  return (
    <div style={mainBg}>
      <main
        style={{
          maxWidth: 420,
          margin: "auto",
          padding: 0,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ ...cardStyle, marginTop: 36, textAlign: "center" }}>
          {userId && (
            <div
              style={{
                fontWeight: 700,
                fontSize: 26,
                color: "#b86fa5",
                marginBottom: 8,
              }}
            >
              Bonjour {displayName} !
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
          ) : todayResponse ? (
            <div
              style={{
                fontSize: 38,
                fontWeight: 700,
                color: todayResponse.answer === "Oui" ? "#d0488f" : "#888",
                margin: "32px 0 24px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {answerIcon[todayResponse.answer] || ""}
              <span style={{ marginTop: 8 }}>
                {todayResponse.answer === "Oui"
                  ? "Oui, on dort ensemble !"
                  : "Non, pas ce soir."}
              </span>
              {todayResponse.reason && (
                <span
                  style={{
                    color: "#b86fa5",
                    fontSize: 16,
                    marginTop: 8,
                    fontStyle: "italic",
                  }}
                >
                  — {todayResponse.reason}
                </span>
              )}
            </div>
          ) : (
            <div style={{ color: "#888", fontSize: 20, margin: "24px 0" }}>
              Pas encore de réponse aujourd'hui.
            </div>
          )}
          {!todayResponse && (
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
            <div style={modalBox} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ color: "#d0488f", fontSize: 22, marginBottom: 8 }}>
                {modalEvent.title}
              </h2>
              <div style={{ color: "#b86fa5", marginBottom: 8 }}>
                {modalEvent.date}
                {modalEvent.time && " à " + modalEvent.time}
              </div>
              {modalEvent.location && (
                <div style={{ color: "#888", marginBottom: 8 }}>
                  📍 {modalEvent.location}
                </div>
              )}
              {modalEvent.description && (
                <div style={{ color: "#444", marginBottom: 12 }}>
                  {modalEvent.description}
                </div>
              )}
              <button
                style={{ ...bigBtn, fontSize: 16, padding: "0.5rem 1.2rem" }}
                onClick={closeEventModal}
              >
                Fermer
              </button>
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
    </div>
  );
}
