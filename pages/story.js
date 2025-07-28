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
  padding: 20,
  margin: "16px 0",
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
  padding: 24,
  minWidth: 300,
  maxWidth: 350,
  zIndex: 1001,
};

const mobileInput = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ffcccb",
  fontSize: 16,
  marginBottom: 12,
  background: "#fff8fb",
  width: "100%",
  boxSizing: "border-box",
  color: "#4a4a4a",
  transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
};

const mobileTextarea = {
  ...mobileInput,
  minHeight: 80,
  maxHeight: 200,
  fontFamily: "inherit",
  fontSize: 14,
  resize: "vertical",
  marginBottom: 12,
  color: "#4a4a4a",
};

const labelStyle = {
  fontWeight: 600,
  color: "#d0488f",
  marginRight: 8,
  display: "block",
  marginBottom: 4,
  fontSize: 14,
};

export default function Story() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [stories, setStories] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [responses, setResponses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newStory, setNewStory] = useState({
    title: "",
    content: "",
    date: "",
    category: "moment",
  });
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    icon: "💕",
    type: "milestone",
  });

  // Fonction utilitaire pour afficher une notification
  function showToast(message, color = "#d0488f") {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  }

  // Fonction utilitaire pour afficher le nom d'utilisateur
  function displayUserName(userId) {
    if (userId === "victor") return "Victor";
    if (userId === "alyssia") return "Alyssia";
    return userId;
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
    if (userId) {
      fetchAllData();
    }
  }, [userId]);

  async function fetchAllData() {
    setLoading(true);

    // Récupérer les milestones
    const { data: milestonesData, error: milestonesError } = await supabase
      .from("milestones")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    // Récupérer les histoires personnalisées
    const { data: storiesData, error: storiesError } = await supabase
      .from("stories")
      .select("*")
      .order("date", { ascending: false });

    // Récupérer les réponses "Oui" à la question du soir
    const { data: responsesData, error: responsesError } = await supabase
      .from("responses")
      .select("*")
      .eq("answer", "Oui")
      .order("date", { ascending: false });

    // Récupérer les événements spéciaux
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });

    if (!milestonesError) setMilestones(milestonesData || []);
    if (!storiesError) setStories(storiesData || []);
    if (!responsesError) setResponses(responsesData || []);
    if (!eventsError) setEvents(eventsData || []);

    setLoading(false);
  }

  function openAddModal() {
    setNewStory({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      category: "moment",
    });
    setShowAddModal(true);
  }

  function closeAddModal() {
    setShowAddModal(false);
  }

  function openEventModal(event = null) {
    if (event) {
      setEditingEvent(event);
      setNewEvent({
        title: event.title,
        description: event.description || "",
        date: event.date,
        icon: event.icon,
        type: event.type,
      });
    } else {
      setEditingEvent(null);
      setNewEvent({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        icon: "💕",
        type: "milestone",
      });
    }
    setShowEventModal(true);
  }

  function closeEventModal() {
    setShowEventModal(false);
    setEditingEvent(null);
  }

  function handleStoryChange(e) {
    setNewStory({ ...newStory, [e.target.name]: e.target.value });
  }

  function handleEventChange(e) {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  }

  async function saveStory() {
    if (!newStory.title.trim() || !newStory.content.trim()) {
      showToast("Titre et contenu obligatoires", "red");
      return;
    }

    const { error } = await supabase.from("stories").insert({
      title: newStory.title,
      content: newStory.content,
      date: newStory.date,
      category: newStory.category,
      user_id: userId,
    });

    if (error) {
      console.error("Erreur saveStory:", error);
      showToast("Erreur lors de la sauvegarde", "red");
      return;
    }

    showToast("Histoire ajoutée ! 📖");
    closeAddModal();
    fetchAllData();
  }

  async function saveEvent() {
    if (!newEvent.title.trim() || !newEvent.date) {
      showToast("Titre et date obligatoires", "red");
      return;
    }

    const eventData = {
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      icon: newEvent.icon,
      type: newEvent.type,
      sort_order: milestones.length + 1,
    };

    let error;
    if (editingEvent) {
      // Mise à jour
      const { error: updateError } = await supabase
        .from("milestones")
        .update(eventData)
        .eq("id", editingEvent.id);
      error = updateError;
    } else {
      // Création
      const { error: insertError } = await supabase
        .from("milestones")
        .insert(eventData);
      error = insertError;
    }

    if (error) {
      console.error("Erreur saveEvent:", error);
      showToast("Erreur lors de la sauvegarde", "red");
      return;
    }

    showToast(
      editingEvent ? "Événement modifié ! ✨" : "Événement ajouté ! ✨"
    );
    closeEventModal();
    fetchAllData();
  }

  async function deleteEvent(eventId) {
    const { error } = await supabase
      .from("milestones")
      .update({ is_active: false })
      .eq("id", eventId);

    if (error) {
      console.error("Erreur deleteEvent:", error);
      showToast("Erreur lors de la suppression", "red");
      return;
    }

    showToast("Événement supprimé ! 🗑️");
    fetchAllData();
  }

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

  function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    return `Le ${date.getDate()} ${date.toLocaleDateString("fr-FR", {
      month: "long",
    })} ${date.getFullYear()}`;
  }

  function getCategoryIcon(category) {
    const icons = {
      moment: "💕",
      voyage: "✈️",
      anniversaire: "🎂",
      surprise: "🎁",
      quotidien: "☀️",
      autre: "📝",
    };
    return icons[category] || "📝";
  }

  function getCategoryLabel(category) {
    const labels = {
      moment: "Moment spécial",
      voyage: "Voyage",
      anniversaire: "Anniversaire",
      surprise: "Surprise",
      quotidien: "Quotidien",
      autre: "Autre",
    };
    return labels[category] || "Autre";
  }

  // Créer la timeline complète avec tous les événements
  function createTimeline() {
    const timeline = [];

    // Ajouter les milestones de la BDD
    milestones.forEach((milestone) => {
      timeline.push({
        ...milestone,
        source: "milestone",
      });
    });

    // Ajouter les histoires personnalisées
    stories.forEach((story) => {
      timeline.push({
        id: `story-${story.id}`,
        title: story.title,
        date: story.date,
        description: story.content,
        icon: getCategoryIcon(story.category),
        type: "story",
        source: "custom",
        user_id: story.user_id,
        category: story.category,
      });
    });

    // Ajouter les événements spéciaux
    events.forEach((event) => {
      timeline.push({
        id: `event-${event.id}`,
        title: event.is_mystery ? "🎭 Événement mystère" : event.title,
        date: event.date,
        description: event.is_mystery
          ? "La surprise sera révélée le jour J ! ✨"
          : event.description || event.location,
        icon: event.is_mystery ? "🎭" : "📅",
        type: "event",
        source: "event",
        user_id: event.user_id,
        is_mystery: event.is_mystery,
      });
    });

    // Trier par date (du plus récent au plus ancien)
    return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const timeline = createTimeline();

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
            animation: "slideInDown 0.5s ease-out",
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
          paddingBottom: 100,
        }}
      >
        {/* Header */}
        <div style={{ ...mobileCard, marginTop: 24, textAlign: "center" }}>
          <h1
            style={{
              color: "#ff4081",
              fontSize: 28,
              margin: "18px 0 24px 0",
            }}
          >
            📖 Notre Histoire
          </h1>
          <p style={{ color: "#b86fa5", fontSize: 16, marginBottom: 20 }}>
            La timeline de notre belle histoire d'amour...
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                ...bigBtn,
                fontSize: 14,
                padding: "0.8rem 1.2rem",
              }}
              onClick={openAddModal}
            >
              ✨ Ajouter un souvenir
            </button>
            {userId === "victor" && (
              <button
                style={{
                  ...bigBtn,
                  fontSize: 14,
                  padding: "0.8rem 1.2rem",
                  background:
                    "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                }}
                onClick={() => openEventModal()}
              >
                ⭐ Événement important
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div style={{ ...mobileCard, textAlign: "center" }}>
            <div style={{ color: "#ff80ab", fontSize: 20, margin: "24px 0" }}>
              Chargement...
            </div>
          </div>
        ) : timeline.length === 0 ? (
          <div style={{ ...mobileCard, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
            <h3 style={{ color: "#ff4081", marginBottom: 8 }}>
              Aucune histoire encore
            </h3>
            <p style={{ color: "#888", marginBottom: 20 }}>
              Commencez à écrire votre belle histoire d'amour !
            </p>
            <button style={bigBtn} onClick={openAddModal}>
              Écrire la première page
            </button>
          </div>
        ) : (
          <div style={{ padding: "0 8px" }}>
            {timeline.map((item, index) => (
              <div
                key={item.id}
                style={{
                  ...mobileCard,
                  position: "relative",
                  marginBottom: 16,
                  animation: "fadeInUp 0.6s ease-out",
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: "both",
                  transform: "translateY(0)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(255, 200, 220, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 24px rgba(255, 200, 220, 0.4)";
                }}
              >
                {/* Contenu de l'événement */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      background:
                        item.source === "milestone"
                          ? "linear-gradient(135deg, #ff4081 0%, #d0488f 100%)"
                          : item.source === "response"
                          ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
                          : "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
                      borderRadius: 12,
                      padding: "10px",
                      color: "white",
                      fontSize: 18,
                      minWidth: 40,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        marginBottom: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          color: "#d0488f",
                          fontSize: 16,
                          fontWeight: 700,
                          margin: 0,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {item.title}
                      </h3>
                      {item.source !== "milestone" && (
                        <span
                          style={{
                            background: "#fff0fa",
                            color: "#b86fa5",
                            padding: "2px 6px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {item.source === "response"
                            ? "💤 Dodo"
                            : item.source === "event"
                            ? "📅 Événement"
                            : "📖 Souvenir"}
                        </span>
                      )}
                      {item.source === "milestone" && userId === "victor" && (
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          <button
                            onClick={() => openEventModal(item)}
                            style={{
                              background: "rgba(255, 200, 220, 0.2)",
                              border: "none",
                              borderRadius: 4,
                              padding: "4px 6px",
                              fontSize: 12,
                              color: "#d0488f",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(255, 200, 220, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "rgba(255, 200, 220, 0.2)";
                            }}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteEvent(item.id)}
                            style={{
                              background: "rgba(255, 100, 100, 0.2)",
                              border: "none",
                              borderRadius: 4,
                              padding: "4px 6px",
                              fontSize: 12,
                              color: "#e74c3c",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(255, 100, 100, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "rgba(255, 100, 100, 0.2)";
                            }}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    <p
                      style={{
                        color: "#b86fa5",
                        fontSize: 13,
                        margin: "0 0 6px 0",
                        fontWeight: 600,
                      }}
                    >
                      📅 {formatDateShort(item.date)}
                    </p>
                    <p
                      style={{
                        color: "#666",
                        fontSize: 13,
                        lineHeight: 1.4,
                        margin: "6px 0 0 0",
                      }}
                    >
                      {item.description}
                    </p>
                    {item.source !== "milestone" && (
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "#b86fa5",
                            fontWeight: 600,
                          }}
                        >
                          👤 {displayUserName(item.user_id)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal d'ajout d'histoire */}
      {showAddModal && (
        <div style={modalOverlay} onClick={closeAddModal}>
          <div
            style={{
              ...modalBox,
              maxWidth: 320,
              padding: 0,
              overflow: "hidden",
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(184, 111, 165, 0.4)",
              animation: "zoomIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div
              style={{
                background: "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
                padding: "20px 24px 16px 24px",
                color: "white",
                textAlign: "center",
                position: "relative",
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: "0 0 6px 0",
                  color: "white",
                }}
              >
                ✨ Nouveau souvenir
              </h2>
              <p
                style={{
                  fontSize: 14,
                  opacity: 0.9,
                  margin: 0,
                  color: "white",
                }}
              >
                Partagez un moment précieux
              </p>
              <button
                onClick={closeAddModal}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  fontSize: 18,
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
            <form style={{ padding: "20px" }}>
              {/* Titre */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>📝 Titre</label>
                <input
                  type="text"
                  name="title"
                  value={newStory.title}
                  onChange={handleStoryChange}
                  placeholder="Ex: Notre premier rendez-vous..."
                  style={mobileInput}
                  required
                />
              </div>

              {/* Date */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>📅 Date</label>
                <input
                  type="date"
                  name="date"
                  value={newStory.date}
                  onChange={handleStoryChange}
                  style={mobileInput}
                  required
                />
              </div>

              {/* Catégorie */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>🏷️ Catégorie</label>
                <select
                  name="category"
                  value={newStory.category}
                  onChange={handleStoryChange}
                  style={mobileInput}
                >
                  <option value="moment">💕 Moment spécial</option>
                  <option value="voyage">✈️ Voyage</option>
                  <option value="anniversaire">🎂 Anniversaire</option>
                  <option value="surprise">🎁 Surprise</option>
                  <option value="quotidien">☀️ Quotidien</option>
                  <option value="autre">📝 Autre</option>
                </select>
              </div>

              {/* Contenu */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>💭 Votre histoire</label>
                <textarea
                  name="content"
                  value={newStory.content}
                  onChange={handleStoryChange}
                  placeholder="Racontez ce moment précieux..."
                  style={mobileTextarea}
                  required
                />
              </div>

              {/* Boutons */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={closeAddModal}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "2px solid #ffd6ef",
                    background: "#fff",
                    color: "#ff4081",
                    fontSize: 14,
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
                  type="button"
                  onClick={saveStory}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #ff80ab 0%, #ff4081 100%)",
                    color: "white",
                    fontSize: 14,
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
                  ✨ Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout/modification d'événement important */}
      {showEventModal && (
        <div style={modalOverlay} onClick={closeEventModal}>
          <div
            style={{
              ...modalBox,
              maxWidth: 320,
              padding: 0,
              overflow: "hidden",
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(184, 111, 165, 0.4)",
              animation: "zoomIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div
              style={{
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                padding: "20px 24px 16px 24px",
                color: "white",
                textAlign: "center",
                position: "relative",
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: "0 0 6px 0",
                  color: "white",
                }}
              >
                {editingEvent ? "✏️ Modifier" : "⭐ Nouvel événement"}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  opacity: 0.9,
                  margin: 0,
                  color: "white",
                }}
              >
                {editingEvent
                  ? "Modifiez cet événement"
                  : "Ajoutez un événement important"}
              </p>
              <button
                onClick={closeEventModal}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  fontSize: 18,
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
            <form style={{ padding: "20px" }}>
              {/* Titre */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>⭐ Titre</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleEventChange}
                  placeholder="Ex: Première rencontre..."
                  style={mobileInput}
                  required
                />
              </div>

              {/* Date */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>📅 Date</label>
                <input
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleEventChange}
                  style={mobileInput}
                  required
                />
              </div>

              {/* Icône */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>🎨 Icône</label>
                <select
                  name="icon"
                  value={newEvent.icon}
                  onChange={handleEventChange}
                  style={mobileInput}
                >
                  <option value="💕">💕 Amour</option>
                  <option value="👀">👀 Première rencontre</option>
                  <option value="💋">💋 Premier baiser</option>
                  <option value="💑">💑 Couple</option>
                  <option value="✈️">✈️ Voyage</option>
                  <option value="🎂">🎂 Anniversaire</option>
                  <option value="💍">💍 Mariage</option>
                  <option value="🏠">🏠 Maison</option>
                  <option value="👶">👶 Bébé</option>
                  <option value="🌟">🌟 Étoile</option>
                </select>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>💭 Description (optionnel)</label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleEventChange}
                  placeholder="Décrivez ce moment important..."
                  style={mobileTextarea}
                />
              </div>

              {/* Boutons */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={closeEventModal}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "2px solid #4caf50",
                    background: "#fff",
                    color: "#4caf50",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f1f8e9";
                    e.currentTarget.style.borderColor = "#45a049";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "#4caf50";
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={saveEvent}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(76, 175, 80, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(76, 175, 80, 0.3)";
                  }}
                >
                  {editingEvent ? "✏️ Modifier" : "⭐ Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation en bas */}
      <BottomNavigation activePage="story" />

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
