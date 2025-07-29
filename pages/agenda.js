import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import BottomNavigation from "../components/BottomNavigation";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

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
  }, []);

  async function fetchEvents() {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true })
      .order("time", { ascending: true });
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
        year: "numeric",
      })
      .replace(/^(.)/, (c) => c.toUpperCase());
  }

  function displayUserName(userId) {
    if (userId === "victor") return "Victor";
    if (userId === "alyssia") return "Alyssia";
    return userId;
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
    setIsEditing(false);
    setEditingEventId(null);
  }

  function handleEventFormChange(e) {
    const { name, value, type, checked } = e.target;
    setEventForm({
      ...eventForm,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  async function submitEventForm(e) {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) {
      setEventFormError("Titre et date obligatoires");
      return;
    }

    const eventData = {
      date: eventForm.date,
      title: eventForm.title,
      description: eventForm.description,
      time: eventForm.time,
      location: eventForm.location,
      is_mystery: eventForm.is_mystery,
      user_id: userId,
    };

    // Si on est en mode édition, ajouter l'ID de l'événement
    if (isEditing && editingEventId) {
      eventData.id = editingEventId;
    }

    const { error } = await supabase.from("events").upsert(eventData);

    if (error) {
      setEventFormError("Erreur lors de l'enregistrement");
    } else {
      setShowEventForm(false);
      setIsEditing(false);
      setEditingEventId(null);
      fetchEvents();
      showToast(
        isEditing
          ? eventForm.is_mystery
            ? "Événement mystère modifié ! 🎭"
            : "Événement modifié avec succès ! ✨"
          : eventForm.is_mystery
          ? "Événement mystère créé ! 🎭"
          : "Événement créé avec succès ! ✨"
      );
    }
  }

  // Fonction pour modifier un événement
  async function handleEditEvent() {
    if (!modalEvent) return;

    // Pré-remplir le formulaire avec les données de l'événement
    setEventForm({
      date: modalEvent.date,
      title: modalEvent.title,
      description: modalEvent.description || "",
      time: modalEvent.time || "",
      location: modalEvent.location || "",
      is_mystery: modalEvent.is_mystery || false,
    });

    // Marquer comme en mode édition
    setIsEditing(true);
    setEditingEventId(modalEvent.id);

    // Fermer la modal de détails et ouvrir le formulaire de modification
    closeEventModal();
    setShowEventForm(true);
    setEventFormError("");
  }

  // Fonction pour supprimer un événement
  async function handleDeleteEvent() {
    if (!modalEvent) return;

    // Ouvrir le modal de confirmation
    setEventToDelete(modalEvent);
    setShowDeleteModal(true);
  }

  // Fonction pour confirmer la suppression
  async function confirmDeleteEvent() {
    if (!eventToDelete) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventToDelete.id);

    if (error) {
      showToast("Erreur lors de la suppression", "#f44336");
    } else {
      closeEventModal();
      setShowDeleteModal(false);
      setEventToDelete(null);
      fetchEvents();
      showToast("Événement supprimé avec succès !", "#4caf50");
    }
  }

  // Fonction pour annuler la suppression
  function cancelDeleteEvent() {
    setShowDeleteModal(false);
    setEventToDelete(null);
  }

  // Groupe les événements par mois
  function groupEventsByMonth() {
    const grouped = {};
    events.forEach((event) => {
      const monthKey = new Date(event.date).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    });
    return grouped;
  }

  const groupedEvents = groupEventsByMonth();

  return (
    <div className="agenda-container">
      {/* Header élégant */}
      <div className="agenda-header">
        <div className="header-content">
          <div className="header-icon">📅</div>
          <h1 className="header-title">Notre Agenda</h1>
          <p className="header-subtitle">Gérez nos événements ensemble</p>
        </div>
      </div>

      {/* Bouton d'ajout flottant */}
      <button
        className="add-event-button"
        onClick={() => openEventForm(toLocalDateString(new Date()))}
      >
        <div className="add-button-content">
          <span className="add-icon">+</span>
        </div>
      </button>

      {/* Contenu principal - Timeline uniquement */}
      <div className="agenda-content">
        <div className="timeline-view">
          {events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3 className="empty-title">Aucun événement à venir</h3>
              <p className="empty-text">Créez votre premier événement !</p>
            </div>
          ) : (
            <div className="timeline">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={`timeline-item ${
                    event.is_mystery ? "mystery" : ""
                  }`}
                  onClick={() => openEventModal(event)}
                >
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-date">
                      {new Date(event.date).getDate()}{" "}
                      {new Date(event.date).toLocaleDateString("fr-FR", {
                        month: "short",
                      })}
                    </div>
                    <h3 className="timeline-title">
                      {event.is_mystery && !isMysteryEventRevealed(event)
                        ? "Événement mystère"
                        : event.title}
                    </h3>
                    {event.time && (
                      <p className="timeline-time">⏰ {event.time}</p>
                    )}
                    {event.is_mystery && (
                      <div className="timeline-mystery">🎭 Mystère</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <div className="toast" style={{ color: toast.color }}>
          {toast.message}
        </div>
      )}

      {/* Modal de création d'événement */}
      {showEventForm && (
        <div className="modal-overlay" onClick={closeEventForm}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">✨</div>
              <h2 className="modal-title">
                {isEditing ? "Modifier l'événement" : "Nouvel événement"}
              </h2>
            </div>

            <form className="modal-form" onSubmit={submitEventForm}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={eventForm.date}
                  onChange={handleEventFormChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  className="form-input"
                  placeholder="Titre de l'événement"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Heure</label>
                <input
                  type="time"
                  name="time"
                  value={eventForm.time}
                  onChange={handleEventFormChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lieu</label>
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventFormChange}
                  className="form-input"
                  placeholder="Lieu de l'événement"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  className="form-textarea"
                  placeholder="Description (optionnelle)"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_mystery"
                    checked={eventForm.is_mystery}
                    onChange={handleEventFormChange}
                    className="form-checkbox"
                  />
                  <span className="checkbox-text">🎭 Événement mystère</span>
                </label>
              </div>

              {eventFormError && (
                <div className="form-error">{eventFormError}</div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeEventForm}
                >
                  Annuler
                </button>
                <button type="submit" className="submit-button">
                  {isEditing ? "Modifier l'événement" : "Créer l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détails d'événement */}
      {showEventModal && modalEvent && (
        <div className="modal-overlay" onClick={closeEventModal}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-header">
              <div className="event-modal-icon">
                {modalEvent.is_mystery ? "🎭" : "📅"}
              </div>
              <div className="event-modal-info">
                <h2 className="event-modal-title">
                  {modalEvent.is_mystery && !isMysteryEventRevealed(modalEvent)
                    ? "Événement mystère"
                    : modalEvent.title}
                </h2>
                <p className="event-modal-date">
                  {formatDateFr(modalEvent.date)}
                  {modalEvent.time && ` • ${modalEvent.time}`}
                </p>
              </div>
              <button className="close-button" onClick={closeEventModal}>
                ×
              </button>
            </div>

            <div className="event-modal-content">
              {modalEvent.location &&
                (!modalEvent.is_mystery ||
                  isMysteryEventRevealed(modalEvent)) && (
                  <div className="event-detail">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{modalEvent.location}</span>
                  </div>
                )}

              {modalEvent.description &&
                (!modalEvent.is_mystery ||
                  isMysteryEventRevealed(modalEvent)) && (
                  <div className="event-detail">
                    <span className="detail-icon">📝</span>
                    <span className="detail-text">
                      {modalEvent.description}
                    </span>
                  </div>
                )}

              {modalEvent.is_mystery && !isMysteryEventRevealed(modalEvent) && (
                <div className="mystery-notice">
                  🎭 Cet événement est un mystère ! Les détails ne seront
                  révélés qu'au moment venu.
                </div>
              )}

              {modalEvent.is_mystery && isMysteryEventRevealed(modalEvent) && (
                <div className="mystery-revealed">
                  🎉 Le mystère est révélé ! Voici tous les détails de
                  l'événement.
                </div>
              )}

              <div className="event-actions">
                <button
                  className="action-button edit"
                  onClick={handleEditEvent}
                >
                  ✏️ Modifier
                </button>
                <button
                  className="action-button delete"
                  onClick={handleDeleteEvent}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && eventToDelete && (
        <div className="modal-overlay" onClick={cancelDeleteEvent}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">🗑️</div>
              <h2 className="modal-title">Confirmation de suppression</h2>
            </div>
            <div className="modal-content">
              <p>
                T'es sûr de vouloir supprimer l'événement "{eventToDelete.title}
                " du {formatDateFr(eventToDelete.date)} ?
              </p>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={cancelDeleteEvent}>
                Annuler
              </button>
              <button className="submit-button" onClick={confirmDeleteEvent}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation activePage="agenda" />

      <style jsx>{`
        .agenda-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%);
          position: relative;
          overflow: hidden;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont,
            sans-serif;
          padding-bottom: 100px;
        }

        .agenda-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.8);
          padding: 24px 24px 20px 24px;
          text-align: center;
          box-shadow: 0 2px 20px rgba(255, 214, 239, 0.3);
        }

        .header-content {
          max-width: 400px;
          margin: 0 auto;
        }

        .header-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .header-title {
          color: #d0488f;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          color: #b86fa5;
          font-size: 14px;
          margin: 0;
          font-weight: 500;
        }

        .add-event-button {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #ff80ab 0%, #ff4081 100%);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(255, 64, 129, 0.4);
          transition: all 0.3s ease;
          z-index: 100;
        }

        .add-event-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(255, 64, 129, 0.6);
        }

        .add-button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .add-icon {
          color: white;
          font-size: 24px;
          font-weight: 700;
        }

        .agenda-content {
          max-width: 400px;
          margin: 0 auto;
          padding: 0 16px;
          margin-top: 24px;
        }

        .timeline-view {
          padding: 0 8px;
        }

        .timeline-month {
          margin-bottom: 32px;
        }

        .timeline-month-title {
          color: #d0488f;
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 20px 0;
          text-align: center;
        }

        .timeline {
          position: relative;
          padding-left: 16px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 6px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, #ff80ab 0%, #ff4081 100%);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .timeline-item:hover {
          transform: translateX(4px);
        }

        .timeline-dot {
          position: absolute;
          left: -17px;
          top: 40%;
          width: 12px;
          height: 12px;
          background: #ff4081;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(255, 64, 129, 0.3);
        }

        .timeline-item.mystery .timeline-dot {
          background: #2196f3;
        }

        .timeline-content {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid rgba(255, 182, 219, 0.2);
          transition: all 0.3s ease;
          margin-left: 8px;
        }

        .timeline-item:hover .timeline-content {
          box-shadow: 0 4px 16px rgba(255, 182, 219, 0.3);
        }

        .timeline-date {
          color: #ff4081;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .timeline-title {
          color: #d0488f;
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .timeline-time {
          color: #b86fa5;
          font-size: 14px;
          margin: 0;
        }

        .timeline-mystery {
          background: rgba(33, 150, 243, 0.1);
          color: #1976d2;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 8px;
          margin-top: 8px;
          display: inline-block;
        }

        .toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 182, 219, 0.3);
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 16px rgba(255, 182, 219, 0.3);
          z-index: 1000;
          animation: slideInDown 0.3s ease-out;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.3s ease-out;
          box-sizing: border-box;
        }

        .modal-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(255, 182, 219, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.8);
          animation: modalFadeIn 0.3s ease-out;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .modal-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .modal-title {
          color: #d0488f;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          color: #d0488f;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(255, 182, 219, 0.3);
          border-radius: 12px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #ff4081;
          box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1);
        }

        .form-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .form-checkbox {
          width: 20px;
          height: 20px;
          accent-color: #ff4081;
        }

        .checkbox-text {
          color: #d0488f;
          font-weight: 600;
          font-size: 14px;
        }

        .form-error {
          color: #f44336;
          font-size: 14px;
          margin-top: 8px;
          text-align: center;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .cancel-button,
        .submit-button {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .cancel-button {
          background: rgba(255, 255, 255, 0.8);
          color: #b86fa5;
          border: 1px solid rgba(255, 182, 219, 0.3);
        }

        .submit-button {
          background: linear-gradient(135deg, #ff80ab 0%, #ff4081 100%);
          color: white;
        }

        .cancel-button:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .submit-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 64, 129, 0.3);
        }

        .event-modal {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          max-width: 400px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(255, 182, 219, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.8);
          animation: modalFadeIn 0.3s ease-out;
        }

        .event-modal-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 182, 219, 0.2);
        }

        .event-modal-icon {
          font-size: 32px;
        }

        .event-modal-info {
          flex: 1;
        }

        .event-modal-title {
          color: #d0488f;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .event-modal-date {
          color: #b86fa5;
          font-size: 14px;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: #b86fa5;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: rgba(255, 182, 219, 0.1);
          color: #d0488f;
        }

        .event-modal-content {
          padding: 24px;
        }

        .event-detail {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-icon {
          font-size: 18px;
          margin-top: 2px;
        }

        .detail-text {
          color: #666;
          font-size: 14px;
          line-height: 1.4;
        }

        .mystery-notice {
          background: rgba(33, 150, 243, 0.1);
          border: 1px solid rgba(33, 150, 243, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          color: #1976d2;
          font-size: 14px;
          font-weight: 600;
        }

        .mystery-revealed {
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          color: #4caf50;
          font-size: 14px;
          font-weight: 600;
        }

        .event-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .action-button {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .action-button.edit {
          background: rgba(255, 255, 255, 0.8);
          color: #b86fa5;
          border: 1px solid rgba(255, 182, 219, 0.3);
        }

        .action-button.delete {
          background: rgba(244, 67, 54, 0.1);
          color: #f44336;
          border: 1px solid rgba(244, 67, 54, 0.2);
        }

        .action-button:hover {
          transform: translateY(-1px);
        }

        .modal-content {
          padding: 24px;
          text-align: center;
        }

        .modal-content p {
          color: #666;
          font-size: 16px;
          line-height: 1.5;
          margin: 0;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          padding: 0 24px 24px 24px;
        }

        .cancel-button {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 182, 219, 0.3);
          background: rgba(255, 255, 255, 0.8);
          color: #b86fa5;
        }

        .cancel-button:hover {
          background: rgba(255, 182, 219, 0.1);
          color: #d0488f;
          transform: translateY(-1px);
        }

        @keyframes slideInDown {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-title {
          color: #d0488f;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .empty-text {
          color: #b86fa5;
          font-size: 14px;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
