import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import BottomNavigation from "../components/BottomNavigation";

export default function Planning() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState("both"); // "me", "partner", "both"
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editForm, setEditForm] = useState({
    start_time: "",
    end_time: "",
    status: "work",
  });
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({
    start_time: "",
    end_time: "",
    status: "work",
    apply_to_days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
  });
  const [plannings, setPlannings] = useState({});
  const [loading, setLoading] = useState(false);

  // Constantes pour les jours et statuts
  const DAYS_OF_WEEK = [
    { id: "monday", label: "Lundi", short: "Lun", emoji: "🇫🇷" },
    { id: "tuesday", label: "Mardi", short: "Mar", emoji: "🇫🇷" },
    { id: "wednesday", label: "Mercredi", short: "Mer", emoji: "🇫🇷" },
    { id: "thursday", label: "Jeudi", short: "Jeu", emoji: "🇫🇷" },
    { id: "friday", label: "Vendredi", short: "Ven", emoji: "🇫🇷" },
    { id: "saturday", label: "Samedi", short: "Sam", emoji: "🇫🇷" },
    { id: "sunday", label: "Dimanche", short: "Dim", emoji: "🇫🇷" },
  ];

  const STATUS_OPTIONS = [
    {
      value: "work",
      label: "Travail",
      icon: "💼",
      color: "#ff4081",
      bgColor: "#ffeef8",
    },
    {
      value: "rest",
      label: "Repos",
      icon: "😴",
      color: "#4caf50",
      bgColor: "#f1f8e9",
    },
    {
      value: "remote",
      label: "Télétravail",
      icon: "🏠",
      color: "#2196f3",
      bgColor: "#e3f2fd",
    },
  ];

  const ALL_USERS = ["victor", "alyssia"];

  // Fonction pour obtenir la date réelle du jour de la semaine
  function getDayDate(dayId) {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const dayIndex = DAYS_OF_WEEK.findIndex((day) => day.id === dayId);
    const targetDay = dayIndex === 0 ? 1 : dayIndex + 1; // Convertir en format 1-7 (lundi=1)

    // Calculer combien de jours depuis aujourd'hui
    const daysSinceToday = (targetDay - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysSinceToday);

    return targetDate.getDate();
  }

  // Fonction pour réorganiser les jours en commençant par aujourd'hui
  function getDaysStartingFromToday() {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = dimanche, 1 = lundi, etc.

    // Convertir en index de notre tableau (0-6)
    const todayIndex = currentDay === 0 ? 6 : currentDay - 1; // Lundi = 0, Dimanche = 6

    // Réorganiser le tableau en commençant par aujourd'hui
    const reorderedDays = [];
    for (let i = 0; i < DAYS_OF_WEEK.length; i++) {
      const index = (todayIndex + i) % DAYS_OF_WEEK.length;
      reorderedDays.push(DAYS_OF_WEEK[index]);
    }

    return reorderedDays;
  }

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
        checkRestDayNotification(stored);
      }
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchPlannings();
    }
  }, [userId]);

  // Vérifier si demain est un jour de repos et afficher un toast
  async function checkRestDayNotification(userId) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay =
      DAYS_OF_WEEK[tomorrow.getDay() === 0 ? 6 : tomorrow.getDay() - 1]; // Lundi = 0

    const { data, error } = await supabase
      .from("weekly_plannings")
      .select("status")
      .eq("user_id", userId)
      .eq("day_of_week", tomorrowDay.id)
      .maybeSingle();

    if (!error && data && data.status === "rest") {
      showToast("Demain est un jour de repos ! 😴", "#4caf50");
    }
  }

  async function fetchPlannings() {
    if (!userId) {
      console.log("fetchPlannings: userId non défini");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("weekly_plannings")
        .select("*")
        .in("user_id", ALL_USERS)
        .order("user_id")
        .order("day_of_week");

      if (error) {
        console.error("Erreur fetchPlannings:", error);
        showToast("Erreur lors du chargement des plannings", "red");
        return;
      }

      console.log("fetchPlannings: données reçues:", data);

      const planningsByUser = {};
      ALL_USERS.forEach((user) => {
        planningsByUser[user] = {};
        DAYS_OF_WEEK.forEach((day) => {
          const planning = data?.find(
            (p) => p.user_id === user && p.day_of_week === day.id
          );

          // Formater correctement les données pour l'affichage
          const formattedPlanning = planning
            ? {
                ...planning,
                start_time: planning.start_time || "",
                end_time: planning.end_time || "",
                status: planning.status || "work",
              }
            : {
                user_id: user,
                day_of_week: day.id,
                start_time: "",
                end_time: "",
                status: "work",
              };

          planningsByUser[user][day.id] = formattedPlanning;
        });
      });

      console.log("fetchPlannings: plannings formatés:", planningsByUser);
      setPlannings(planningsByUser);
    } catch (error) {
      console.error("Erreur inattendue fetchPlannings:", error);
      showToast("Erreur inattendue lors du chargement", "red");
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(day) {
    const currentPlanning = plannings[userId]?.[day.id] || {
      start_time: "",
      end_time: "",
      status: "work",
    };
    setEditingDay(day);
    setEditForm(currentPlanning);
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
    setEditingDay(null);
  }

  function openBulkEditModal() {
    setShowBulkEditModal(true);
  }

  function closeBulkEditModal() {
    setShowBulkEditModal(false);
  }

  function handleEditFormChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function handleBulkEditFormChange(e) {
    setBulkEditForm({ ...bulkEditForm, [e.target.name]: e.target.value });
  }

  function handleBulkEditDayChange(dayId, checked) {
    setBulkEditForm({
      ...bulkEditForm,
      apply_to_days: {
        ...bulkEditForm.apply_to_days,
        [dayId]: checked,
      },
    });
  }

  async function savePlanning() {
    console.log("savePlanning appelée avec:", { editingDay, userId, editForm });

    if (!editingDay || !userId) {
      console.log("savePlanning: données manquantes", { editingDay, userId });
      showToast("Erreur: données manquantes", "red");
      return;
    }

    // Validation des données
    if (editForm.status !== "rest") {
      if (!editForm.start_time || !editForm.end_time) {
        console.log("savePlanning: heures manquantes", editForm);
        showToast("Veuillez remplir les heures de début et de fin", "red");
        return;
      }

      // Vérifier que l'heure de fin est après l'heure de début
      if (editForm.start_time >= editForm.end_time) {
        console.log("savePlanning: heures invalides", {
          start: editForm.start_time,
          end: editForm.end_time,
        });
        showToast("L'heure de fin doit être après l'heure de début", "red");
        return;
      }
    }

    const planningData = {
      user_id: userId,
      day_of_week: editingDay.id,
      status: editForm.status,
      updated_at: new Date().toISOString(),
    };

    // Ajouter les horaires seulement si ce n'est pas repos
    // Pour PostgreSQL TIME, on envoie directement les valeurs HH:MM
    if (editForm.status !== "rest") {
      planningData.start_time = editForm.start_time;
      planningData.end_time = editForm.end_time;
    } else {
      planningData.start_time = null;
      planningData.end_time = null;
    }

    console.log("savePlanning: données à sauvegarder:", planningData);

    try {
      // Vérifier si l'enregistrement existe déjà
      const { data: existingData, error: checkError } = await supabase
        .from("weekly_plannings")
        .select("id")
        .eq("user_id", userId)
        .eq("day_of_week", editingDay.id)
        .maybeSingle();

      if (checkError) {
        console.error("Erreur lors de la vérification:", checkError);
        showToast("Erreur lors de la vérification des données", "red");
        return;
      }

      let result;
      if (existingData) {
        // Mise à jour
        result = await supabase
          .from("weekly_plannings")
          .update(planningData)
          .eq("user_id", userId)
          .eq("day_of_week", editingDay.id);
      } else {
        // Insertion
        result = await supabase.from("weekly_plannings").insert(planningData);
      }

      const { error } = result;

      if (error) {
        console.error("Erreur savePlanning:", error);
        showToast("Erreur lors de la sauvegarde: " + error.message, "red");
        return;
      }

      console.log("savePlanning: succès");
      showToast("Planning sauvegardé ! ✨");
      closeEditModal();
      await fetchPlannings(); // Attendre que les données soient rechargées
    } catch (error) {
      console.error("Erreur inattendue savePlanning:", error);
      showToast("Erreur inattendue lors de la sauvegarde", "red");
    }
  }

  async function saveBulkPlanning() {
    if (!userId) {
      showToast("Erreur: utilisateur non connecté", "red");
      return;
    }

    const selectedDays = Object.keys(bulkEditForm.apply_to_days).filter(
      (day) => bulkEditForm.apply_to_days[day]
    );

    if (selectedDays.length === 0) {
      showToast("Sélectionnez au moins un jour", "red");
      return;
    }

    // Validation des données
    if (bulkEditForm.status !== "rest") {
      if (!bulkEditForm.start_time || !bulkEditForm.end_time) {
        showToast("Veuillez remplir les heures de début et de fin", "red");
        return;
      }

      // Vérifier que l'heure de fin est après l'heure de début
      if (bulkEditForm.start_time >= bulkEditForm.end_time) {
        showToast("L'heure de fin doit être après l'heure de début", "red");
        return;
      }
    }

    const planningData = {
      user_id: userId,
      status: bulkEditForm.status,
      updated_at: new Date().toISOString(),
    };

    // Ajouter les horaires seulement si ce n'est pas repos
    // Pour PostgreSQL TIME, on envoie directement les valeurs HH:MM
    if (bulkEditForm.status !== "rest") {
      planningData.start_time = bulkEditForm.start_time;
      planningData.end_time = bulkEditForm.end_time;
    } else {
      planningData.start_time = null;
      planningData.end_time = null;
    }

    try {
      // Sauvegarder chaque jour sélectionné
      const promises = selectedDays.map(async (dayId) => {
        const dayData = { ...planningData, day_of_week: dayId };

        // Vérifier si l'enregistrement existe déjà
        const { data: existingData, error: checkError } = await supabase
          .from("weekly_plannings")
          .select("id")
          .eq("user_id", userId)
          .eq("day_of_week", dayId)
          .maybeSingle();

        if (checkError) {
          console.error(
            `Erreur lors de la vérification pour ${dayId}:`,
            checkError
          );
          return { success: false, day: dayId, error: checkError };
        }

        let result;
        if (existingData) {
          // Mise à jour
          result = await supabase
            .from("weekly_plannings")
            .update(dayData)
            .eq("user_id", userId)
            .eq("day_of_week", dayId);
        } else {
          // Insertion
          result = await supabase.from("weekly_plannings").insert(dayData);
        }

        const { error } = result;

        if (error) {
          console.error(`Erreur savePlanning pour ${dayId}:`, error);
          return { success: false, day: dayId, error };
        }

        return { success: true, day: dayId };
      });

      const results = await Promise.all(promises);
      const failedDays = results.filter((r) => !r.success);

      if (failedDays.length > 0) {
        console.error("Échecs de sauvegarde:", failedDays);
        showToast(`Erreur pour ${failedDays.length} jour(s)`, "red");
      } else {
        showToast(`${selectedDays.length} jour(s) sauvegardé(s) ! ✨`);
        closeBulkEditModal();
        await fetchPlannings(); // Attendre que les données soient rechargées
      }
    } catch (error) {
      console.error("Erreur inattendue saveBulkPlanning:", error);
      showToast("Erreur inattendue lors de la sauvegarde en masse", "red");
    }
  }

  // Calculer les créneaux libres en commun
  function getCommonFreeSlots() {
    const commonSlots = {};

    DAYS_OF_WEEK.forEach((day) => {
      const victorPlanning = plannings.victor?.[day.id];
      const alyssiaPlanning = plannings.alyssia?.[day.id];

      // Vérifier si les deux sont en repos
      if (
        victorPlanning?.status === "rest" &&
        alyssiaPlanning?.status === "rest"
      ) {
        commonSlots[day.id] = "Repos en commun";
      }
      // Vérifier les créneaux libres (pas de travail)
      else if (
        victorPlanning?.status !== "work" &&
        alyssiaPlanning?.status !== "work"
      ) {
        commonSlots[day.id] = "Libre en commun";
      }
    });

    return commonSlots;
  }

  const commonFreeSlots = getCommonFreeSlots();

  function getStatusDisplay(planning, isOwnPlanning = false) {
    if (!planning)
      return {
        label: "Non défini",
        icon: "❓",
        color: "#ccc",
        bgColor: "#f8f8f8",
      };

    const status = STATUS_OPTIONS.find((s) => s.value === planning.status);
    if (!status)
      return {
        label: "Non défini",
        icon: "❓",
        color: "#ccc",
        bgColor: "#f8f8f8",
      };

    return status;
  }

  function getTimeDisplay(planning, isOwnPlanning = false) {
    if (!planning) return "";

    if (planning.start_time && planning.end_time) {
      return `${planning.start_time} - ${planning.end_time}`;
    } else if (planning.start_time) {
      return `À partir de ${planning.start_time}`;
    } else if (planning.end_time) {
      return `Jusqu'à ${planning.end_time}`;
    }
    return "";
  }

  return (
    <div className="planning-container">
      {/* Header élégant */}
      <div className="planning-header">
        <div className="header-content">
          <div className="header-icon">📋</div>
          <h1 className="header-title">Notre Planning</h1>
          <p className="header-subtitle">Organisez vos semaines ensemble</p>
        </div>
      </div>

      {/* Bouton d'édition en masse flottant */}
      {viewMode === "me" && (
        <button className="bulk-edit-button" onClick={openBulkEditModal}>
          <div className="bulk-button-content">
            <span className="bulk-icon">⚡</span>
          </div>
        </button>
      )}

      {/* Contenu principal */}
      <div className="planning-content">
        {/* Sélecteur de vue */}
        <div className="view-selector">
          <button
            className={`view-button ${viewMode === "me" ? "active" : ""}`}
            onClick={() => setViewMode("me")}
          >
            <span className="view-icon">👸🏻</span>
            <span className="view-label">Moi</span>
          </button>
          <button
            className={`view-button ${viewMode === "partner" ? "active" : ""}`}
            onClick={() => setViewMode("partner")}
          >
            <span className="view-icon">🤴</span>
            <span className="view-label">
              {displayUserName(ALL_USERS.find((u) => u !== userId))}
            </span>
          </button>
          <button
            className={`view-button ${viewMode === "both" ? "active" : ""}`}
            onClick={() => setViewMode("both")}
          >
            <span className="view-icon">👫</span>
            <span className="view-label">Tous les deux</span>
          </button>
        </div>

        {/* Planning des jours */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-icon">⏳</div>
            <h3 className="loading-title">Chargement...</h3>
          </div>
        ) : (
          <div className="planning-timeline">
            {getDaysStartingFromToday().map((day) => {
              const myPlanning = plannings[userId]?.[day.id];
              const partnerPlanning =
                plannings[ALL_USERS.find((u) => u !== userId)]?.[day.id];
              const isCommonFree = commonFreeSlots[day.id];
              const dayDate = getDayDate(day.id);

              return (
                <div
                  key={day.id}
                  className={`timeline-item ${
                    isCommonFree ? "common-free" : ""
                  }`}
                  onClick={() => viewMode === "me" && openEditModal(day)}
                >
                  <div className="timeline-marker">
                    <div className="day-number">{dayDate}</div>
                    <div className="day-name">{day.short}</div>
                  </div>

                  <div className="timeline-content">
                    <div className="planning-details">
                      {viewMode === "me" && (
                        <div className="planning-info">
                          <div
                            className="status-badge"
                            style={{
                              backgroundColor: getStatusDisplay(
                                myPlanning,
                                true
                              ).bgColor,
                            }}
                          >
                            <span className="status-icon">
                              {getStatusDisplay(myPlanning, true).icon}
                            </span>
                            <span
                              className="status-label"
                              style={{
                                color: getStatusDisplay(myPlanning, true).color,
                              }}
                            >
                              {getStatusDisplay(myPlanning, true).label}
                            </span>
                          </div>
                          {getTimeDisplay(myPlanning, true) && (
                            <div className="time-info">
                              <span className="time-text">
                                {getTimeDisplay(myPlanning, true)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {viewMode === "partner" && (
                        <div className="planning-info">
                          <div
                            className="status-badge"
                            style={{
                              backgroundColor: getStatusDisplay(
                                partnerPlanning,
                                false
                              ).bgColor,
                            }}
                          >
                            <span className="status-icon">
                              {getStatusDisplay(partnerPlanning, false).icon}
                            </span>
                            <span
                              className="status-label"
                              style={{
                                color: getStatusDisplay(partnerPlanning, false)
                                  .color,
                              }}
                            >
                              {getStatusDisplay(partnerPlanning, false).label}
                            </span>
                          </div>
                          {getTimeDisplay(partnerPlanning, false) && (
                            <div className="time-info">
                              <span className="time-text">
                                {getTimeDisplay(partnerPlanning, false)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {viewMode === "both" && (
                        <div className="both-planning">
                          <div className="user-planning">
                            <div className="user-label">Moi</div>
                            <div
                              className="status-badge small"
                              style={{
                                backgroundColor: getStatusDisplay(
                                  myPlanning,
                                  true
                                ).bgColor,
                              }}
                            >
                              <span className="status-icon">
                                {getStatusDisplay(myPlanning, true).icon}
                              </span>
                              <span
                                className="status-label"
                                style={{
                                  color: getStatusDisplay(myPlanning, true)
                                    .color,
                                }}
                              >
                                {getStatusDisplay(myPlanning, true).label}
                              </span>
                            </div>
                            {getTimeDisplay(myPlanning, true) && (
                              <div className="time-info small">
                                <span className="time-text">
                                  {getTimeDisplay(myPlanning, true)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="user-planning">
                            <div className="user-label">
                              {displayUserName(
                                ALL_USERS.find((u) => u !== userId)
                              )}
                            </div>
                            <div
                              className="status-badge small"
                              style={{
                                backgroundColor: getStatusDisplay(
                                  partnerPlanning,
                                  false
                                ).bgColor,
                              }}
                            >
                              <span className="status-icon">
                                {getStatusDisplay(partnerPlanning, false).icon}
                              </span>
                              <span
                                className="status-label"
                                style={{
                                  color: getStatusDisplay(
                                    partnerPlanning,
                                    false
                                  ).color,
                                }}
                              >
                                {getStatusDisplay(partnerPlanning, false).label}
                              </span>
                            </div>
                            {getTimeDisplay(partnerPlanning, false) && (
                              <div className="time-info small">
                                <span className="time-text">
                                  {getTimeDisplay(partnerPlanning, false)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {isCommonFree && (
                        <div className="common-free-badge">
                          <span className="common-text">{isCommonFree}</span>
                        </div>
                      )}
                    </div>

                    {viewMode === "me" && (
                      <div className="edit-button-container">
                        <button className="edit-button">✏️</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {toast && (
        <div className="toast" style={{ color: toast.color }}>
          {toast.message}
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && editingDay && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">✏️</div>
              <h2 className="modal-title">Modifier {editingDay.label}</h2>
            </div>

            <form
              className="modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                savePlanning();
              }}
            >
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                  className="form-input"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {editForm.status !== "rest" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Heure de début</label>
                    <input
                      type="time"
                      name="start_time"
                      value={editForm.start_time}
                      onChange={handleEditFormChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Heure de fin</label>
                    <input
                      type="time"
                      name="end_time"
                      value={editForm.end_time}
                      onChange={handleEditFormChange}
                      className="form-input"
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeEditModal}
                >
                  Annuler
                </button>
                <button type="submit" className="submit-button">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification en masse */}
      {showBulkEditModal && (
        <div className="modal-overlay" onClick={closeBulkEditModal}>
          <div
            className="modal-container bulk-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-icon">⚡</div>
              <h2 className="modal-title">Modifier plusieurs jours</h2>
            </div>

            <form
              className="modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                saveBulkPlanning();
              }}
            >
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select
                  name="status"
                  value={bulkEditForm.status}
                  onChange={handleBulkEditFormChange}
                  className="form-input"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {bulkEditForm.status !== "rest" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Heure de début</label>
                    <input
                      type="time"
                      name="start_time"
                      value={bulkEditForm.start_time}
                      onChange={handleBulkEditFormChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Heure de fin</label>
                    <input
                      type="time"
                      name="end_time"
                      value={bulkEditForm.end_time}
                      onChange={handleBulkEditFormChange}
                      className="form-input"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Appliquer aux jours :</label>
                <div className="days-grid">
                  {DAYS_OF_WEEK.map((day) => (
                    <label
                      key={day.id}
                      className={`day-checkbox ${
                        bulkEditForm.apply_to_days[day.id] ? "checked" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={bulkEditForm.apply_to_days[day.id]}
                        onChange={(e) =>
                          handleBulkEditDayChange(day.id, e.target.checked)
                        }
                      />
                      <span className="day-short">{day.short}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeBulkEditModal}
                >
                  Annuler
                </button>
                <button type="submit" className="submit-button">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavigation activePage="planning" />

      <style jsx>{`
        .planning-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%);
          position: relative;
          overflow: hidden;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont,
            sans-serif;
          padding-bottom: 100px;
        }

        .planning-header {
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

        .bulk-edit-button {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
          transition: all 0.3s ease;
          z-index: 100;
        }

        .bulk-edit-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
        }

        .bulk-button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .bulk-icon {
          font-size: 24px;
          color: white;
        }

        .planning-content {
          max-width: 400px;
          margin: 0 auto;
          padding: 0 16px;
          margin-top: 24px;
        }

        .view-selector {
          display: flex;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          padding: 4px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(255, 200, 220, 0.2);
        }

        .view-button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          border: none;
          background: transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #b86fa5;
        }

        .view-button.active {
          background: linear-gradient(135deg, #ff80ab 0%, #ff4081 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 64, 129, 0.3);
        }

        .view-icon {
          font-size: 18px;
        }

        .view-label {
          font-size: 12px;
          font-weight: 600;
        }

        .loading-state {
          text-align: center;
          padding: 48px 24px;
        }

        .loading-icon {
          font-size: 48px;
          margin-bottom: 16px;
          animation: spin 2s linear infinite;
        }

        .loading-title {
          color: #b86fa5;
          font-size: 18px;
          margin: 0;
        }

        .planning-timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(255, 200, 220, 0.15);
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 12px;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 2px 12px rgba(255, 200, 220, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid transparent;
        }

        .timeline-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 200, 220, 0.2);
        }

        .timeline-item.common-free {
          border-color: #4caf50;
          background: linear-gradient(
            135deg,
            rgba(76, 175, 80, 0.05) 0%,
            #fff 100%
          );
        }

        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 60px;
          text-align: center;
        }

        .day-number {
          font-size: 18px;
          font-weight: 700;
          color: #d0488f;
          background: #ffeef8;
          border: 1px solid #ffd6ef;
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(255, 182, 219, 0.1);
        }

        .day-name {
          font-size: 11px;
          color: #b86fa5;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .timeline-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
        }

        .day-header {
          display: flex;
          justify-content: flex-end;
        }

        .edit-button-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 4px;
        }

        .edit-button {
          background: none;
          border: none;
          font-size: 16px;
          color: #b86fa5;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .edit-button:hover {
          background: rgba(255, 182, 219, 0.1);
          color: #d0488f;
        }

        .planning-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
          min-height: 60px;
        }

        .planning-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
        }

        .status-badge.small {
          padding: 4px 8px;
          font-size: 11px;
        }

        .status-icon {
          font-size: 14px;
        }

        .status-badge.small .status-icon {
          font-size: 12px;
        }

        .time-info {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #666;
          font-size: 12px;
        }

        .time-info.small {
          font-size: 10px;
        }

        .both-planning {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }

        .user-planning {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .user-label {
          font-size: 11px;
          font-weight: 600;
          color: #b86fa5;
          margin-bottom: 2px;
        }

        .common-free-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.2);
          border-radius: 8px;
          margin-top: 6px;
        }

        .common-text {
          color: #4caf50;
          font-weight: 600;
          font-size: 11px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.25);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease-out;
        }

        .modal-container {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(184, 111, 165, 0.3);
          max-width: 400px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          animation: modalFadeIn 0.3s ease-out;
        }

        .modal-container.bulk-modal {
          max-width: 450px;
        }

        .modal-header {
          background: linear-gradient(90deg, #ffeef8 0%, #fff 100%);
          padding: 24px 24px 16px 24px;
          border-bottom: 1px solid #f3d6e7;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .modal-icon {
          font-size: 28px;
          color: #d0488f;
        }

        .modal-title {
          color: #d0488f;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        .modal-form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          color: #d0488f;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ffd6ef;
          border-radius: 12px;
          font-size: 16px;
          background: #fff8fc;
          color: #4a4a4a;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #ff80ab;
          box-shadow: 0 0 0 3px rgba(255, 128, 171, 0.1);
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        .day-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #f8f8f8;
          border: 1px solid #ddd;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .day-checkbox.checked {
          background: #fff0fa;
          border-color: #ff80ab;
        }

        .day-checkbox input {
          margin: 0;
        }

        .day-short {
          font-size: 14px;
          font-weight: 500;
          color: #666;
        }

        .day-checkbox.checked .day-short {
          color: #ff4081;
          font-weight: 600;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .cancel-button {
          flex: 1;
          padding: 12px 20px;
          border: 1px solid #ffd6ef;
          border-radius: 12px;
          background: #fff;
          color: #b86fa5;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-button:hover {
          background: #fff0fa;
          color: #d0488f;
        }

        .submit-button {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff80ab 0%, #ff4081 100%);
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 64, 129, 0.4);
        }

        .toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #ffebee;
          border: 1.5px solid #ffcdd2;
          border-radius: 12;
          padding: 12px 32px;
          font-weight: 600;
          font-size: 17;
          box-shadow: 0 4px 16px rgba(255, 200, 220, 0.4);
          z-index: 2000;
          animation: slideInDown 0.3s ease-out;
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
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
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

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
