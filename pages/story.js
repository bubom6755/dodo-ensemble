import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import BottomNavigation from "../components/BottomNavigation";

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
    <div className="story-container">
      {/* Header romantique */}
      <div className="story-header">
        <div className="header-content">
          <div className="header-icon">💕</div>
          <h1 className="header-title">Notre Histoire d'Amour</h1>
          <p className="header-subtitle">Les pages de notre livre d'amour</p>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="action-buttons">
        <button className="add-story-button" onClick={openAddModal}>
          <span className="button-icon">✨</span>
          <span className="button-text">Ajouter un souvenir</span>
        </button>
        {userId === "victor" && (
          <button className="add-event-button" onClick={() => openEventModal()}>
            <span className="button-icon">⭐</span>
            <span className="button-text">Événement important</span>
          </button>
        )}
      </div>

      {/* Contenu principal */}
      <div className="story-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-icon">💕</div>
            <h3 className="loading-title">Chargement de notre histoire...</h3>
          </div>
        ) : timeline.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💕</div>
            <h3 className="empty-title">Notre histoire commence ici</h3>
            <p className="empty-text">
              Commencez à écrire les pages de votre belle histoire d'amour !
            </p>
          </div>
        ) : (
          <div className="story-book">
            {timeline.map((item, index) => (
              <div
                key={item.id}
                className="story-page"
                style={{
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                <div className="page-ribbon"></div>
                <div className="page-content">
                  <div className="page-header">
                    <div className="page-icon">{item.icon}</div>
                    <div className="page-meta">
                      <h3 className="page-title">{item.title}</h3>
                      <div className="page-badges">
                        {item.source !== "milestone" && (
                          <span className="page-badge">
                            {item.source === "response"
                              ? "💤 Dodo"
                              : item.source === "event"
                              ? "📅 Événement"
                              : "📖 Souvenir"}
                          </span>
                        )}
                        {item.source === "milestone" && userId === "victor" && (
                          <div className="page-actions">
                            <button
                              className="edit-button"
                              onClick={() => openEventModal(item)}
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => deleteEvent(item.id)}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="page-date">
                    📅 {formatDateShort(item.date)}
                  </div>

                  <p className="page-description">{item.description}</p>

                  {item.source !== "milestone" && (
                    <div className="page-user">
                      <span className="user-info">
                        👤 {displayUserName(item.user_id)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {toast && (
        <div className="toast" style={{ color: toast.color }}>
          {toast.message}
        </div>
      )}

      {/* Modal d'ajout d'histoire */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">✨</div>
              <h2 className="modal-title">Nouveau souvenir</h2>
              <p className="modal-subtitle">Partagez un moment précieux</p>
            </div>

            <div className="form-group">
              <label className="form-label">📝 Titre</label>
              <input
                type="text"
                name="title"
                value={newStory.title}
                onChange={handleStoryChange}
                placeholder="Ex: Notre premier rendez-vous..."
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">📅 Date</label>
              <input
                type="date"
                name="date"
                value={newStory.date}
                onChange={handleStoryChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">🏷️ Catégorie</label>
              <select
                name="category"
                value={newStory.category}
                onChange={handleStoryChange}
                className="form-input"
              >
                <option value="moment">💕 Moment spécial</option>
                <option value="voyage">✈️ Voyage</option>
                <option value="anniversaire">🎂 Anniversaire</option>
                <option value="surprise">🎁 Surprise</option>
                <option value="quotidien">☀️ Quotidien</option>
                <option value="autre">📝 Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">💭 Votre histoire</label>
              <textarea
                name="content"
                value={newStory.content}
                onChange={handleStoryChange}
                placeholder="Racontez ce moment précieux..."
                className="form-textarea"
                required
              />
            </div>

            <div className="form-actions">
              <button className="cancel-button" onClick={closeAddModal}>
                Annuler
              </button>
              <button className="submit-button" onClick={saveStory}>
                ✨ Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout/modification d'événement important */}
      {showEventModal && (
        <div className="modal-overlay" onClick={closeEventModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">⭐</div>
              <h2 className="modal-title">
                {editingEvent ? "✏️ Modifier" : "⭐ Nouvel événement"}
              </h2>
              <p className="modal-subtitle">
                {editingEvent
                  ? "Modifiez cet événement"
                  : "Ajoutez un événement important"}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">⭐ Titre</label>
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleEventChange}
                placeholder="Ex: Première rencontre..."
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">📅 Date</label>
              <input
                type="date"
                name="date"
                value={newEvent.date}
                onChange={handleEventChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">🎨 Icône</label>
              <select
                name="icon"
                value={newEvent.icon}
                onChange={handleEventChange}
                className="form-input"
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

            <div className="form-group">
              <label className="form-label">💭 Description (optionnel)</label>
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleEventChange}
                placeholder="Décrivez ce moment important..."
                className="form-textarea"
              />
            </div>

            <div className="form-actions">
              <button className="cancel-button" onClick={closeEventModal}>
                Annuler
              </button>
              <button className="submit-button" onClick={saveEvent}>
                {editingEvent ? "✏️ Modifier" : "⭐ Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation activePage="story" />

      <style jsx>{`
        .story-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%);
          position: relative;
          overflow: hidden;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont,
            sans-serif;
          padding-bottom: 100px;
        }

        .story-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
              circle at 20% 80%,
              rgba(255, 182, 193, 0.2) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 20%,
              rgba(255, 105, 180, 0.15) 0%,
              transparent 50%
            );
          pointer-events: none;
        }

        .story-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(255, 182, 193, 0.3);
          padding: 28px 24px 24px 24px;
          text-align: center;
          box-shadow: 0 4px 30px rgba(255, 182, 193, 0.2);
          position: relative;
          z-index: 10;
        }

        .header-content {
          max-width: 400px;
          margin: 0 auto;
        }

        .header-icon {
          font-size: 48px;
          margin-bottom: 16px;
          filter: drop-shadow(0 0 20px rgba(255, 105, 180, 0.3));
          animation: heartbeat 2s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .header-title {
          color: #d0488f;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 10px rgba(208, 72, 143, 0.2);
        }

        .header-subtitle {
          color: #b86fa5;
          font-size: 16px;
          margin: 0;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          max-width: 400px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .add-story-button,
        .add-event-button {
          flex: 1;
          background: linear-gradient(135deg, #ff6b9d 0%, #ff4081 100%);
          color: white;
          border: none;
          border-radius: 20px;
          padding: 16px 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(255, 64, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .add-story-button:hover,
        .add-event-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 64, 129, 0.4);
        }

        .button-icon {
          font-size: 18px;
        }

        .button-text {
          font-size: 13px;
        }

        .story-content {
          max-width: 400px;
          margin: 0 auto;
          padding: 0 16px;
          position: relative;
          z-index: 10;
        }

        .loading-state {
          text-align: center;
          padding: 80px 20px;
        }

        .loading-icon {
          font-size: 48px;
          margin-bottom: 20px;
          animation: heartbeat 2s ease-in-out infinite;
        }

        .loading-title {
          color: #d0488f;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 32px;
          animation: heartbeat 2s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(255, 105, 180, 0.3));
        }

        .empty-title {
          color: #d0488f;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 16px 0;
        }

        .empty-text {
          color: #b86fa5;
          font-size: 16px;
          margin: 0;
          line-height: 1.6;
        }

        .story-book {
          position: relative;
          padding: 20px 0;
        }

        .story-book::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(to bottom, #ff6b9d, #ff4081, #d0488f);
          border-radius: 2px;
          transform: translateX(-50%);
        }

        .story-page {
          position: relative;
          margin-bottom: 32px;
          animation: slideInLeft 0.8s ease-out;
          animation-fill-mode: both;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .page-ribbon {
          position: absolute;
          left: 50%;
          top: 0;
          width: 40px;
          height: 8px;
          background: linear-gradient(135deg, #ff6b9d 0%, #ff4081 100%);
          border-radius: 4px;
          transform: translateX(-50%);
          box-shadow: 0 2px 8px rgba(255, 64, 129, 0.3);
          z-index: 2;
        }

        .page-ribbon::before {
          content: "";
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: linear-gradient(
            135deg,
            rgba(255, 107, 157, 0.3),
            rgba(255, 64, 129, 0.3)
          );
          border-radius: 6px;
          z-index: -1;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        .page-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 28px;
          margin-top: 16px;
          border: 2px solid rgba(255, 182, 193, 0.3);
          box-shadow: 0 8px 32px rgba(255, 182, 193, 0.2);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .page-content::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff6b9d 0%, #ff4081 100%);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .story-page:hover .page-content {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 48px rgba(255, 182, 193, 0.3);
          border-color: rgba(255, 64, 129, 0.4);
        }

        .story-page:hover .page-content::before {
          transform: scaleX(1);
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .page-icon {
          font-size: 28px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 10px rgba(255, 105, 180, 0.3));
        }

        .page-meta {
          flex: 1;
          min-width: 0;
        }

        .page-title {
          color: #d0488f;
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .page-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .page-badge {
          background: linear-gradient(
            135deg,
            rgba(255, 64, 129, 0.1),
            rgba(208, 72, 143, 0.1)
          );
          color: #d0488f;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 12px;
          border: 1px solid rgba(255, 64, 129, 0.2);
        }

        .page-actions {
          display: flex;
          gap: 6px;
          margin-left: auto;
        }

        .edit-button,
        .delete-button {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 182, 193, 0.3);
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-button:hover {
          background: rgba(255, 64, 129, 0.1);
          border-color: #ff4081;
        }

        .delete-button:hover {
          background: rgba(244, 67, 54, 0.1);
          border-color: #f44336;
        }

        .page-date {
          color: #b86fa5;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .page-description {
          color: #666;
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .page-user {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-info {
          background: linear-gradient(
            135deg,
            rgba(255, 182, 193, 0.2),
            rgba(255, 105, 180, 0.2)
          );
          color: #d0488f;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 182, 193, 0.3);
        }

        /* Toast notifications */
        .toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          color: #d0488f;
          padding: 16px 24px;
          border-radius: 16px;
          font-weight: 600;
          z-index: 1000;
          animation: slideInDown 0.3s ease-out;
          border: 2px solid rgba(255, 182, 193, 0.3);
          box-shadow: 0 8px 32px rgba(255, 182, 193, 0.3);
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(30px);
          border-radius: 24px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          border: 2px solid rgba(255, 182, 193, 0.3);
          box-shadow: 0 20px 60px rgba(255, 182, 193, 0.3);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .modal-icon {
          font-size: 48px;
          margin-bottom: 16px;
          filter: drop-shadow(0 0 20px rgba(255, 105, 180, 0.3));
        }

        .modal-title {
          color: #d0488f;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .modal-subtitle {
          color: #b86fa5;
          font-size: 16px;
          margin: 0;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          color: #d0488f;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(255, 182, 193, 0.3);
          border-radius: 16px;
          padding: 16px;
          color: #333;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #ff4081;
          box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1);
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: rgba(208, 72, 143, 0.5);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .cancel-button {
          flex: 1;
          background: rgba(255, 255, 255, 0.8);
          color: #b86fa5;
          border: 2px solid rgba(255, 182, 193, 0.3);
          border-radius: 16px;
          padding: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-button:hover {
          background: rgba(255, 182, 193, 0.1);
          border-color: #ff4081;
        }

        .submit-button {
          flex: 1;
          background: linear-gradient(135deg, #ff6b9d 0%, #ff4081 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(255, 64, 129, 0.3);
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 64, 129, 0.4);
        }
      `}</style>
    </div>
  );
}
