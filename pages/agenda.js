import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import BottomNavigation from "../components/BottomNavigation";

// Réutilisation des styles constants
const mobileMainBg = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
  padding: "0 8px",
  boxSizing: "border-box",
  maxWidth: 420,
  width: "100%",
  margin: "0 auto",
};

const mobileCard = {
  background: "#ffffff",
  borderRadius: 20,
  boxShadow: "0 6px 24px rgba(255, 200, 220, 0.4)",
  padding: 24,
  margin: "24px 0",
  width: "100%",
  maxWidth: 480,
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
  transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
};

const bigBtn = {
  background: "linear-gradient(90deg, #ff80ab 0%, #ff4081 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 36,
  fontSize: 18,
  fontWeight: 700,
  padding: "1rem 2rem",
  margin: "8px 0",
  boxShadow: "0 4px 12px rgba(255, 64, 129, 0.4)",
  cursor: "pointer",
  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
  outline: "none",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.25)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(4px)",
};

const modalBox = {
  background: "#ffffff",
  borderRadius: 20,
  boxShadow: "0 10px 40px rgba(184, 111, 165, 0.3)",
  padding: 36,
  minWidth: 340,
  maxWidth: 400,
  zIndex: 1001,
};

export default function Agenda() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
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
  const [eventResponses, setEventResponses] = useState([]);
  const [eventComment, setEventComment] = useState("");
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" ou "list"

  // Fonction utilitaire pour afficher une notification
  function showToast(message, color = "#d0488f") {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userId");
      if (!stored || stored.trim() === "") {
        router.replace("/login");
      } else {
        setUserId(stored);
      }
    }
  }, [router]);

  useEffect(() => {
    fetchEvents();
  }, [calendarMonth]);

  async function fetchEvents() {
    const start = new Date(calendarMonth);
    const end = new Date(calendarMonth);
    end.setMonth(end.getMonth() + 1);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", start.toISOString().split("T")[0])
      .lt("date", end.toISOString().split("T")[0])
      .order("date", { ascending: true });
    if (!error) setEvents(data || []);
  }

  function toLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

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

  function displayUserName(userId) {
    if (userId === "victor") return "Victor";
    if (userId === "alyssia") return "Alyssia";
    return userId;
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
      user_id: userId,
    });
    if (error) {
      setEventFormError("Erreur lors de l'enregistrement");
    } else {
      setShowEventForm(false);
      fetchEvents();
      showToast("Événement créé !");
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

  const monthDays = getMonthDays(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth()
  );
  const firstWeekday = (calendarMonth.getDay() + 6) % 7; // Lundi=0
  const todayStr = toLocalDateString(new Date());
  const eventsByDate = {};
  for (const ev of events) {
    eventsByDate[ev.date] = ev;
  }

  // Tri des événements par date pour la vue liste
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div style={mobileMainBg}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ffebee",
            color: "#d0488f",
            border: "1.5px solid #ffcdd2",
            borderRadius: 12,
            padding: "12px 32px",
            fontWeight: 600,
            fontSize: 17,
            boxShadow: "0 4px 16px rgba(255, 200, 220, 0.4)",
            zIndex: 2000,
          }}
        >
          {toast.message}
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
          paddingBottom: 100, // Espace pour la navigation
        }}
      >
        {/* Header avec titre et boutons de vue */}
        <div style={{ ...mobileCard, marginTop: 24, textAlign: "center" }}>
          <h1
            style={{ color: "#ff4081", fontSize: 28, margin: "18px 0 24px 0" }}
          >
            📅 Agenda
          </h1>

          {/* Boutons de vue */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <button
              style={{
                ...bigBtn,
                fontSize: 16,
                padding: "0.8rem 1.5rem",
                background:
                  viewMode === "calendar" ? bigBtn.background : "#fff",
                color: viewMode === "calendar" ? "#fff" : "#ff4081",
                border:
                  viewMode === "calendar" ? "none" : "1.5px solid #ff80ab",
              }}
              onClick={() => setViewMode("calendar")}
            >
              📅 Calendrier
            </button>
            <button
              style={{
                ...bigBtn,
                fontSize: 16,
                padding: "0.8rem 1.5rem",
                background: viewMode === "list" ? bigBtn.background : "#fff",
                color: viewMode === "list" ? "#fff" : "#ff4081",
                border: viewMode === "list" ? "none" : "1.5px solid #ff80ab",
              }}
              onClick={() => setViewMode("list")}
            >
              📋 Liste
            </button>
          </div>

          {/* Navigation du mois */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              color: "#ff4081",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
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
            <span style={{ fontWeight: 700, fontSize: 18, color: "#ff4081" }}>
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
        </div>

        {/* Vue Calendrier */}
        {viewMode === "calendar" && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              boxShadow: "0 6px 24px rgba(255, 200, 220, 0.4)",
              padding: 28,
              margin: "0 auto",
              maxWidth: 420,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 4,
              }}
            >
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                <div
                  key={d}
                  style={{
                    fontWeight: 600,
                    color: "#ff80ab",
                    padding: 4,
                    textAlign: "center",
                  }}
                >
                  {d}
                </div>
              ))}
              {Array(firstWeekday)
                .fill(0)
                .map((_, i) => (
                  <div key={"empty-" + i}></div>
                ))}
              {monthDays.map((d) => {
                const dateStr = toLocalDateString(d);
                const isToday = dateStr === todayStr;
                const hasEvent = !!eventsByDate[dateStr];
                return (
                  <div
                    key={dateStr}
                    style={{
                      minHeight: 52,
                      borderRadius: 10,
                      background: isToday
                        ? "#fff0fa"
                        : hasEvent
                        ? "#ffebee"
                        : "#fefefe",
                      textAlign: "center",
                      fontSize: 17,
                      color: isToday
                        ? "#d0488f"
                        : hasEvent
                        ? "#d0488f"
                        : "#888",
                      cursor: "pointer",
                      position: "relative",
                      transition:
                        "background 0.2s ease-in-out, transform 0.1s ease-out",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      fontWeight: isToday || hasEvent ? 700 : 500,
                      border: isToday
                        ? "2px solid #ff80ab"
                        : hasEvent
                        ? "1.5px solid #ffcdd2"
                        : "none",
                    }}
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
                        e.currentTarget.style.background = "#fff0fa";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      } else if (hasEvent) {
                        e.currentTarget.style.transform = "scale(1.03)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isToday && !hasEvent) {
                        e.currentTarget.style.background = "#fefefe";
                        e.currentTarget.style.transform = "none";
                      } else if (hasEvent) {
                        e.currentTarget.style.transform = "none";
                      }
                    }}
                  >
                    {d.getDate()}
                    {hasEvent && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          background: "#ff4081",
                          position: "absolute",
                          left: "50%",
                          bottom: 8,
                          transform: "translateX(-50%)",
                        }}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vue Liste */}
        {viewMode === "list" && (
          <div style={{ marginBottom: 20 }}>
            {sortedEvents.length === 0 ? (
              <div style={{ ...mobileCard, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                <h3 style={{ color: "#ff4081", marginBottom: 8 }}>
                  Aucun événement
                </h3>
                <p style={{ color: "#888", marginBottom: 20 }}>
                  Aucun événement prévu pour ce mois
                </p>
                <button style={bigBtn} onClick={() => openEventForm(todayStr)}>
                  Créer un événement
                </button>
              </div>
            ) : (
              sortedEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    ...mobileCard,
                    cursor: "pointer",
                    transition: "transform 0.2s ease-out",
                  }}
                  onClick={() => openEventModal(event)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
                        borderRadius: 12,
                        padding: "12px",
                        color: "white",
                        fontSize: 20,
                        minWidth: 48,
                        textAlign: "center",
                      }}
                    >
                      📅
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          color: "#d0488f",
                          fontSize: 18,
                          fontWeight: 700,
                          margin: "0 0 8px 0",
                        }}
                      >
                        {event.title}
                      </h3>
                      <p
                        style={{
                          color: "#b86fa5",
                          fontSize: 16,
                          margin: "0 0 4px 0",
                          fontWeight: 600,
                        }}
                      >
                        {formatDateFr(event.date)}
                        {event.time && (
                          <span style={{ marginLeft: 8, opacity: 0.8 }}>
                            ⏰ {event.time}
                          </span>
                        )}
                      </p>
                      {event.location && (
                        <p
                          style={{
                            color: "#888",
                            fontSize: 14,
                            margin: "4px 0",
                          }}
                        >
                          📍 {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p
                          style={{
                            color: "#666",
                            fontSize: 14,
                            margin: "8px 0 0 0",
                            lineHeight: 1.4,
                          }}
                        >
                          {event.description.length > 100
                            ? event.description.substring(0, 100) + "..."
                            : event.description}
                        </p>
                      )}
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: "#b86fa5",
                          fontWeight: 500,
                        }}
                      >
                        👤 Créé par {displayUserName(event.user_id)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bouton ajouter événement */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            style={{
              ...bigBtn,
              fontSize: 16,
              padding: "1rem 2rem",
              background: "linear-gradient(90deg, #ff80ab 0%, #ff4081 100%)",
            }}
            onClick={() => openEventForm(todayStr)}
          >
            ➕ Ajouter un événement
          </button>
        </div>
      </main>

      {/* Modal détails événement */}
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
                  {formatDateFr(modalEvent.date)}
                  {modalEvent.time && (
                    <span style={{ marginLeft: 8 }}>⏰ {modalEvent.time}</span>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire ajout événement */}
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
              <label
                style={{
                  fontWeight: 600,
                  color: "#d0488f",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Date
              </label>
              <input
                type="date"
                name="date"
                value={eventForm.date}
                onChange={handleEventFormChange}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: "1px solid #ffcccb",
                  fontSize: 18,
                  marginBottom: 16,
                  background: "#fff8fb",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  fontWeight: 600,
                  color: "#d0488f",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Titre
              </label>
              <input
                type="text"
                name="title"
                value={eventForm.title}
                onChange={handleEventFormChange}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: "1px solid #ffcccb",
                  fontSize: 18,
                  marginBottom: 16,
                  background: "#fff8fb",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  fontWeight: 600,
                  color: "#d0488f",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Heure
              </label>
              <input
                type="time"
                name="time"
                value={eventForm.time}
                onChange={handleEventFormChange}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: "1px solid #ffcccb",
                  fontSize: 18,
                  marginBottom: 16,
                  background: "#fff8fb",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  fontWeight: 600,
                  color: "#d0488f",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Lieu
              </label>
              <input
                type="text"
                name="location"
                value={eventForm.location}
                onChange={handleEventFormChange}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: "1px solid #ffcccb",
                  fontSize: 18,
                  marginBottom: 16,
                  background: "#fff8fb",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  fontWeight: 600,
                  color: "#d0488f",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                value={eventForm.description}
                onChange={handleEventFormChange}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: "1px solid #ffcccb",
                  fontSize: 18,
                  marginBottom: 16,
                  background: "#fff8fb",
                  width: "100%",
                  boxSizing: "border-box",
                  minHeight: 60,
                  fontFamily: "inherit",
                }}
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
                  ...bigBtn,
                  fontSize: 16,
                  background: "#fff",
                  color: "#ff4081",
                  border: "1.5px solid #ff80ab",
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

      {/* Navigation en bas */}
      <BottomNavigation activePage="agenda" />
    </div>
  );
}
