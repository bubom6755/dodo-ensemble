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
    is_mystery: false,
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
    setEventForm({
      date,
      title: "",
      description: "",
      time: "",
      location: "",
      is_mystery: false,
    });
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
      is_mystery: eventForm.is_mystery,
      user_id: userId,
    });
    if (error) {
      setEventFormError("Erreur lors de l'enregistrement");
    } else {
      setShowEventForm(false);
      fetchEvents();
      showToast(
        eventForm.is_mystery
          ? "Événement mystère créé ! 🎭"
          : "Événement créé !"
      );
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
                const event = eventsByDate[dateStr];
                const isMystery = event?.is_mystery;
                const isPast =
                  new Date(dateStr) < new Date().setHours(0, 0, 0, 0);

                return (
                  <div
                    key={dateStr}
                    style={{
                      minHeight: 52,
                      borderRadius: 10,
                      background: isToday
                        ? "#fff0fa"
                        : hasEvent
                        ? isMystery && !isPast
                          ? "#f0f8ff" // Bleu clair pour mystère
                          : "#ffebee"
                        : "#fefefe",
                      textAlign: "center",
                      fontSize: 17,
                      color: isToday
                        ? "#d0488f"
                        : hasEvent
                        ? isMystery && !isPast
                          ? "#2196f3" // Bleu pour mystère
                          : "#d0488f"
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
                        ? isMystery && !isPast
                          ? "1.5px solid #90caf9" // Bordure bleue pour mystère
                          : "1.5px solid #ffcdd2"
                        : "none",
                    }}
                    onClick={() =>
                      hasEvent
                        ? openEventModal(eventsByDate[dateStr])
                        : openEventForm(dateStr)
                    }
                    title={
                      hasEvent
                        ? isMystery && !isPast
                          ? "🎭 Événement mystère"
                          : eventsByDate[dateStr].title
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
                          background:
                            isMystery && !isPast ? "#2196f3" : "#ff4081",
                          position: "absolute",
                          left: "50%",
                          bottom: 8,
                          transform: "translateX(-50%)",
                        }}
                      ></div>
                    )}
                    {isMystery && !isPast && (
                      <div
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          fontSize: 12,
                          color: "#2196f3",
                        }}
                      >
                        🎭
                      </div>
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
              sortedEvents.map((event) => {
                const isMystery = event.is_mystery;
                const isPast =
                  new Date(event.date) < new Date().setHours(0, 0, 0, 0);
                const shouldShowMystery = isMystery && !isPast;

                return (
                  <div
                    key={event.id}
                    style={{
                      ...mobileCard,
                      cursor: "pointer",
                      transition: "transform 0.2s ease-out",
                      border: shouldShowMystery ? "2px solid #90caf9" : "none",
                      background: shouldShowMystery ? "#f0f8ff" : "#ffffff",
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
                          background: shouldShowMystery
                            ? "linear-gradient(135deg, #90caf9 0%, #2196f3 100%)"
                            : "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
                          borderRadius: 12,
                          padding: "12px",
                          color: "white",
                          fontSize: 20,
                          minWidth: 48,
                          textAlign: "center",
                        }}
                      >
                        {shouldShowMystery ? "🎭" : "📅"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            color: shouldShowMystery ? "#2196f3" : "#d0488f",
                            fontSize: 18,
                            fontWeight: 700,
                            margin: "0 0 8px 0",
                          }}
                        >
                          {shouldShowMystery
                            ? "🎭 Événement mystère"
                            : event.title}
                        </h3>
                        <p
                          style={{
                            color: shouldShowMystery ? "#1976d2" : "#b86fa5",
                            fontSize: 16,
                            margin: "0 0 4px 0",
                            fontWeight: 600,
                          }}
                        >
                          {formatDateFr(event.date)}
                          {event.time && !shouldShowMystery && (
                            <span style={{ marginLeft: 8, opacity: 0.8 }}>
                              ⏰ {event.time}
                            </span>
                          )}
                        </p>
                        {event.location && !shouldShowMystery && (
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
                        {event.description && !shouldShowMystery && (
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
                        {shouldShowMystery && (
                          <p
                            style={{
                              color: "#2196f3",
                              fontSize: 14,
                              margin: "8px 0 0 0",
                              fontStyle: "italic",
                            }}
                          >
                            La surprise sera révélée le jour J ! ✨
                          </p>
                        )}
                        <div
                          style={{
                            marginTop: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              color: shouldShowMystery ? "#1976d2" : "#b86fa5",
                              fontWeight: 600,
                            }}
                          >
                            👤 {displayUserName(event.user_id)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
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
            {(() => {
              const isMystery = modalEvent.is_mystery;
              const isPast =
                new Date(modalEvent.date) < new Date().setHours(0, 0, 0, 0);
              const shouldShowMystery = isMystery && !isPast;

              return (
                <>
                  <div
                    style={{
                      background: shouldShowMystery
                        ? "linear-gradient(90deg, #e3f2fd 0%, #fff 100%)"
                        : "linear-gradient(90deg, #ffeef8 0%, #fff 100%)",
                      padding: "24px 32px 18px 32px",
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                      borderBottom: "1px solid #f3d6e7",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 32,
                        color: shouldShowMystery ? "#2196f3" : "#d0488f",
                      }}
                    >
                      {shouldShowMystery ? "🎭" : "📅"}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 22,
                          color: shouldShowMystery ? "#2196f3" : "#d0488f",
                          marginBottom: 2,
                        }}
                      >
                        {shouldShowMystery
                          ? "🎭 Événement mystère"
                          : modalEvent.title}
                      </div>
                      <div
                        style={{
                          color: shouldShowMystery ? "#1976d2" : "#b86fa5",
                          fontSize: 16,
                          fontWeight: 500,
                        }}
                      >
                        {modalEvent.date}{" "}
                        {modalEvent.time && !shouldShowMystery && (
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
                        color: shouldShowMystery ? "#2196f3" : "#b86fa5",
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
                    {shouldShowMystery ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "32px 16px",
                          background: "#f0f8ff",
                          borderRadius: 12,
                          border: "2px solid #90caf9",
                          marginBottom: 20,
                        }}
                      >
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
                        <h3
                          style={{
                            color: "#2196f3",
                            fontSize: 20,
                            fontWeight: 700,
                            margin: "0 0 12px 0",
                          }}
                        >
                          Événement mystère !
                        </h3>
                        <p
                          style={{
                            color: "#1976d2",
                            fontSize: 16,
                            lineHeight: 1.5,
                            margin: 0,
                          }}
                        >
                          La surprise sera révélée le{" "}
                          {formatDateFr(modalEvent.date)} ! ✨
                        </p>
                      </div>
                    ) : (
                      <>
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
                      </>
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
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Formulaire ajout événement */}
      {showEventForm && (
        <div style={modalOverlay} onClick={closeEventForm}>
          <div
            style={{
              ...modalBox,
              maxWidth: 450,
              padding: 0,
              overflow: "hidden",
              borderRadius: 24,
              boxShadow: "0 20px 60px rgba(184, 111, 165, 0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div
              style={{
                background: "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
                padding: "24px 32px 20px 32px",
                color: "white",
                textAlign: "center",
                position: "relative",
              }}
            >
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  margin: "0 0 8px 0",
                  color: "white",
                }}
              >
                ✨ Nouvel événement
              </h2>
              <p
                style={{
                  fontSize: 16,
                  opacity: 0.9,
                  margin: 0,
                  color: "white",
                }}
              >
                {formatDateFr(eventForm.date)}
              </p>
              <button
                onClick={closeEventForm}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  fontSize: 20,
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
                }
                title="Fermer"
              >
                ×
              </button>
            </div>

            {/* Contenu du formulaire */}
            <form onSubmit={submitEventForm} style={{ padding: "32px" }}>
              {/* Titre */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    fontWeight: 600,
                    color: "#d0488f",
                    marginBottom: 8,
                    display: "block",
                    fontSize: 16,
                  }}
                >
                  📝 Titre de l'événement
                </label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  placeholder="Ex: Dîner romantique, Sortie cinéma..."
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: "2px solid #ffd6ef",
                    fontSize: 16,
                    background: "#fff8fc",
                    width: "100%",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#ff4081";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(255, 64, 129, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#ffd6ef";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  required
                />
              </div>

              {/* Heure */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    fontWeight: 600,
                    color: "#d0488f",
                    marginBottom: 8,
                    display: "block",
                    fontSize: 16,
                  }}
                >
                  ⏰ Heure
                </label>
                <input
                  type="time"
                  name="time"
                  value={eventForm.time}
                  onChange={handleEventFormChange}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: "2px solid #ffd6ef",
                    fontSize: 16,
                    background: "#fff8fc",
                    width: "100%",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#ff4081";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(255, 64, 129, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#ffd6ef";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Lieu */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    fontWeight: 600,
                    color: "#d0488f",
                    marginBottom: 8,
                    display: "block",
                    fontSize: 16,
                  }}
                >
                  📍 Lieu
                </label>
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventFormChange}
                  placeholder="Ex: Restaurant Le Petit Bistrot, Cinéma..."
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: "2px solid #ffd6ef",
                    fontSize: 16,
                    background: "#fff8fc",
                    width: "100%",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#ff4081";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(255, 64, 129, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#ffd6ef";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    fontWeight: 600,
                    color: "#d0488f",
                    marginBottom: 8,
                    display: "block",
                    fontSize: 16,
                  }}
                >
                  💭 Description (optionnel)
                </label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  placeholder="Ajoutez des détails sur l'événement..."
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: "2px solid #ffd6ef",
                    fontSize: 16,
                    background: "#fff8fc",
                    width: "100%",
                    boxSizing: "border-box",
                    minHeight: 80,
                    fontFamily: "inherit",
                    resize: "vertical",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#ff4081";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(255, 64, 129, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#ffd6ef";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Option Mystère */}
              <div
                style={{
                  marginBottom: 32,
                  padding: "16px",
                  background: "#fff8fc",
                  borderRadius: 12,
                  border: "2px solid #ffd6ef",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#d0488f",
                  }}
                >
                  <input
                    type="checkbox"
                    name="is_mystery"
                    checked={eventForm.is_mystery}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        is_mystery: e.target.checked,
                      })
                    }
                    style={{
                      width: 20,
                      height: 20,
                      accentColor: "#ff4081",
                    }}
                  />
                  <span style={{ fontSize: 20 }}>🎭</span>
                  <span>Événement mystère</span>
                </label>
                <p
                  style={{
                    margin: "8px 0 0 32px",
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 1.4,
                  }}
                >
                  L'événement sera caché jusqu'au jour J pour créer la surprise
                  !
                </p>
              </div>

              {/* Message d'erreur */}
              {eventFormError && (
                <div
                  style={{
                    color: "#e74c3c",
                    marginBottom: 20,
                    padding: "12px 16px",
                    background: "#fdf2f2",
                    borderRadius: 8,
                    border: "1px solid #fecaca",
                    fontSize: 14,
                  }}
                >
                  ⚠️ {eventFormError}
                </div>
              )}

              {/* Boutons */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={closeEventForm}
                  style={{
                    padding: "14px 24px",
                    borderRadius: 12,
                    border: "2px solid #ffd6ef",
                    background: "#fff",
                    color: "#ff4081",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
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
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "14px 32px",
                    borderRadius: 12,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    boxShadow: "0 4px 12px rgba(255, 64, 129, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(255, 64, 129, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(255, 64, 129, 0.3)";
                  }}
                >
                  ✨ Créer l'événement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation en bas */}
      <BottomNavigation activePage="agenda" />
    </div>
  );
}
