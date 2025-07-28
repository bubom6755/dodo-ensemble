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

const mobileInput = {
  padding: 16,
  borderRadius: 10,
  border: "1px solid #ffcccb",
  fontSize: 18,
  marginBottom: 16,
  background: "#fff8fb",
  width: "100%",
  boxSizing: "border-box",
  color: "#4a4a4a",
  transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
};

const labelStyle = {
  fontWeight: 600,
  color: "#d0488f",
  marginRight: 8,
  display: "block",
  marginBottom: 6,
  fontSize: 16,
};

// Constantes pour les jours et statuts
const DAYS_OF_WEEK = [
  { id: "monday", label: "Lundi", short: "Lun" },
  { id: "tuesday", label: "Mardi", short: "Mar" },
  { id: "wednesday", label: "Mercredi", short: "Mer" },
  { id: "thursday", label: "Jeudi", short: "Jeu" },
  { id: "friday", label: "Vendredi", short: "Ven" },
  { id: "saturday", label: "Samedi", short: "Sam" },
  { id: "sunday", label: "Dimanche", short: "Dim" },
];

const STATUS_OPTIONS = [
  { value: "work", label: "Travail", icon: "💼", color: "#ff4081" },
  { value: "rest", label: "Repos", icon: "😴", color: "#4caf50" },
  { value: "remote", label: "Télétravail", icon: "🏠", color: "#2196f3" },
];

const ALL_USERS = ["victor", "alyssia"];

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
    setLoading(true);
    const { data, error } = await supabase
      .from("weekly_plannings")
      .select("*")
      .in("user_id", ALL_USERS)
      .order("user_id")
      .order("day_of_week");

    if (!error) {
      const planningsByUser = {};
      ALL_USERS.forEach((user) => {
        planningsByUser[user] = {};
        DAYS_OF_WEEK.forEach((day) => {
          const planning = data?.find(
            (p) => p.user_id === user && p.day_of_week === day.id
          );
          planningsByUser[user][day.id] = planning || {
            user_id: user,
            day_of_week: day.id,
            start_time: "",
            end_time: "",
            status: "work",
          };
        });
      });
      setPlannings(planningsByUser);
    } else {
      console.error("Erreur fetchPlannings:", error);
    }
    setLoading(false);
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
    if (!editingDay) return;

    const planningData = {
      user_id: userId,
      day_of_week: editingDay.id,
      status: editForm.status,
      updated_at: new Date().toISOString(),
    };

    // Ajouter les horaires seulement si ce n'est pas repos
    if (editForm.status !== "rest") {
      planningData.start_time = editForm.start_time || null;
      planningData.end_time = editForm.end_time || null;
    } else {
      planningData.start_time = null;
      planningData.end_time = null;
    }

    // Utiliser upsert pour remplacer ou créer
    const { error } = await supabase
      .from("weekly_plannings")
      .upsert(planningData, {
        onConflict: "user_id,day_of_week",
      });

    if (error) {
      console.error("Erreur savePlanning:", error);
      showToast("Erreur lors de la sauvegarde", "red");
      return;
    }

    showToast("Planning sauvegardé !");
    closeEditModal();
    fetchPlannings();
  }

  async function saveBulkPlanning() {
    const selectedDays = Object.keys(bulkEditForm.apply_to_days).filter(
      (day) => bulkEditForm.apply_to_days[day]
    );

    if (selectedDays.length === 0) {
      showToast("Sélectionnez au moins un jour", "red");
      return;
    }

    const planningData = {
      user_id: userId,
      status: bulkEditForm.status,
      updated_at: new Date().toISOString(),
    };

    // Ajouter les horaires seulement si ce n'est pas repos
    if (bulkEditForm.status !== "rest") {
      planningData.start_time = bulkEditForm.start_time || null;
      planningData.end_time = bulkEditForm.end_time || null;
    } else {
      planningData.start_time = null;
      planningData.end_time = null;
    }

    // Sauvegarder chaque jour sélectionné avec upsert
    const promises = selectedDays.map(async (dayId) => {
      const dayData = { ...planningData, day_of_week: dayId };

      const { error } = await supabase
        .from("weekly_plannings")
        .upsert(dayData, {
          onConflict: "user_id,day_of_week",
        });

      if (error) {
        console.error(`Erreur savePlanning pour ${dayId}:`, error);
        return { success: false, day: dayId, error };
      }

      return { success: true, day: dayId };
    });

    const results = await Promise.all(promises);
    const failedDays = results.filter((r) => !r.success);

    if (failedDays.length > 0) {
      showToast(`Erreur pour ${failedDays.length} jour(s)`, "red");
    } else {
      showToast(`${selectedDays.length} jour(s) sauvegardé(s) !`);
      closeBulkEditModal();
      fetchPlannings();
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
    if (!planning) return { label: "Non défini", icon: "❓", color: "#ccc" };

    const status = STATUS_OPTIONS.find((s) => s.value === planning.status);
    if (!status) return { label: "Non défini", icon: "❓", color: "#ccc" };

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
          paddingBottom: 100,
        }}
      >
        {/* Header */}
        <div style={{ ...mobileCard, marginTop: 24, textAlign: "center" }}>
          <h1
            style={{ color: "#ff4081", fontSize: 28, margin: "18px 0 24px 0" }}
          >
            📋 Planning de la semaine
          </h1>

          {/* Boutons de vue */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                ...bigBtn,
                fontSize: 14,
                padding: "0.6rem 1.2rem",
                background: viewMode === "me" ? bigBtn.background : "#fff",
                color: viewMode === "me" ? "#fff" : "#ff4081",
                border: viewMode === "me" ? "none" : "1.5px solid #ff80ab",
              }}
              onClick={() => setViewMode("me")}
            >
              👤 Victor
            </button>
            <button
              style={{
                ...bigBtn,
                fontSize: 14,
                padding: "0.6rem 1.2rem",
                background: viewMode === "partner" ? bigBtn.background : "#fff",
                color: viewMode === "partner" ? "#fff" : "#ff4081",
                border: viewMode === "partner" ? "none" : "1.5px solid #ff80ab",
              }}
              onClick={() => setViewMode("partner")}
            >
              👥 {displayUserName(ALL_USERS.find((u) => u !== userId))}
            </button>
            <button
              style={{
                ...bigBtn,
                fontSize: 14,
                padding: "0.6rem 1.2rem",
                background: viewMode === "both" ? bigBtn.background : "#fff",
                color: viewMode === "both" ? "#fff" : "#ff4081",
                border: viewMode === "both" ? "none" : "1.5px solid #ff80ab",
              }}
              onClick={() => setViewMode("both")}
            >
              👫 Tous les deux
            </button>
          </div>

          {/* Bouton modifier tous les jours (visible seulement en vue "Moi") */}
          {viewMode === "me" && (
            <div style={{ marginBottom: 20 }}>
              <button
                style={{
                  ...bigBtn,
                  fontSize: 16,
                  padding: "0.8rem 2rem",
                  background:
                    "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                  border: "none",
                }}
                onClick={openBulkEditModal}
              >
                ⚡ Modifier tous les jours
              </button>
            </div>
          )}
        </div>

        {/* Planning */}
        {loading ? (
          <div style={{ ...mobileCard, textAlign: "center" }}>
            <div style={{ color: "#ff80ab", fontSize: 20, margin: "24px 0" }}>
              Chargement...
            </div>
          </div>
        ) : (
          DAYS_OF_WEEK.map((day) => {
            const myPlanning = plannings[userId]?.[day.id];
            const partnerPlanning =
              plannings[ALL_USERS.find((u) => u !== userId)]?.[day.id];
            const isCommonFree = commonFreeSlots[day.id];

            return (
              <div
                key={day.id}
                style={{
                  ...mobileCard,
                  border: isCommonFree ? "2px solid #4caf50" : "none",
                  background: isCommonFree ? "#f1f8e9" : "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{
                      color: "#ff4081",
                      fontSize: 20,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {day.label}
                  </h3>
                  {viewMode === "me" && (
                    <button
                      style={{
                        ...bigBtn,
                        fontSize: 14,
                        padding: "0.5rem 1rem",
                        background: "#fff",
                        color: "#ff4081",
                        border: "1.5px solid #ff80ab",
                      }}
                      onClick={() => openEditModal(day)}
                    >
                      ✏️ Modifier
                    </button>
                  )}
                </div>

                {/* Affichage selon le mode de vue */}
                {viewMode === "me" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 24 }}>
                        {getStatusDisplay(myPlanning, true).icon}
                      </span>
                      <span
                        style={{
                          color: getStatusDisplay(myPlanning, true).color,
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        {getStatusDisplay(myPlanning, true).label}
                      </span>
                    </div>
                    {getTimeDisplay(myPlanning, true) && (
                      <p style={{ color: "#666", margin: "8px 0 0 0" }}>
                        ⏰ {getTimeDisplay(myPlanning, true)}
                      </p>
                    )}
                  </div>
                )}

                {viewMode === "partner" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 24 }}>
                        {getStatusDisplay(partnerPlanning, false).icon}
                      </span>
                      <span
                        style={{
                          color: getStatusDisplay(partnerPlanning, false).color,
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        {getStatusDisplay(partnerPlanning, false).label}
                      </span>
                    </div>
                    {getTimeDisplay(partnerPlanning, false) && (
                      <p style={{ color: "#666", margin: "8px 0 0 0" }}>
                        ⏰ {getTimeDisplay(partnerPlanning, false)}
                      </p>
                    )}
                  </div>
                )}

                {viewMode === "both" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                      }}
                    >
                      {/* Mon planning */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: 20 }}>
                            {getStatusDisplay(myPlanning, true).icon}
                          </span>
                          <span
                            style={{
                              color: getStatusDisplay(myPlanning, true).color,
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            Moi
                          </span>
                        </div>
                        <div
                          style={{
                            color: "#666",
                            fontSize: 12,
                            marginLeft: 28,
                          }}
                        >
                          {getStatusDisplay(myPlanning, true).label}
                          {getTimeDisplay(myPlanning, true) && (
                            <div>⏰ {getTimeDisplay(myPlanning, true)}</div>
                          )}
                        </div>
                      </div>

                      {/* Planning du partenaire */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: 20 }}>
                            {getStatusDisplay(partnerPlanning, false).icon}
                          </span>
                          <span
                            style={{
                              color: getStatusDisplay(partnerPlanning, false)
                                .color,
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            {displayUserName(
                              ALL_USERS.find((u) => u !== userId)
                            )}
                          </span>
                        </div>
                        <div
                          style={{
                            color: "#666",
                            fontSize: 12,
                            marginLeft: 28,
                          }}
                        >
                          {getStatusDisplay(partnerPlanning, false).label}
                          {getTimeDisplay(partnerPlanning, false) && (
                            <div>
                              ⏰ {getTimeDisplay(partnerPlanning, false)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Indication des créneaux libres en commun */}
                    {isCommonFree && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "8px 12px",
                          background: "#e8f5e8",
                          borderRadius: 8,
                          border: "1px solid #4caf50",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "#4caf50",
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          🎉 {isCommonFree}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* Modal d'édition */}
      {showEditModal && editingDay && (
        <div style={modalOverlay} onClick={closeEditModal}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "#ff4081", fontSize: 20, marginBottom: 16 }}>
              Modifier {editingDay.label}
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Statut</label>
              <select
                name="status"
                value={editForm.status}
                onChange={handleEditFormChange}
                style={mobileInput}
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
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Heure de début</label>
                  <input
                    type="time"
                    name="start_time"
                    value={editForm.start_time}
                    onChange={handleEditFormChange}
                    style={mobileInput}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Heure de fin</label>
                  <input
                    type="time"
                    name="end_time"
                    value={editForm.end_time}
                    onChange={handleEditFormChange}
                    style={mobileInput}
                  />
                </div>
              </>
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
                onClick={closeEditModal}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{ ...bigBtn, fontSize: 16 }}
                onClick={savePlanning}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification en masse */}
      {showBulkEditModal && (
        <div style={modalOverlay} onClick={closeBulkEditModal}>
          <div
            style={{
              ...modalBox,
              maxWidth: 450,
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: "#ff4081", fontSize: 20, marginBottom: 16 }}>
              ⚡ Modifier plusieurs jours
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Statut</label>
              <select
                name="status"
                value={bulkEditForm.status}
                onChange={handleBulkEditFormChange}
                style={mobileInput}
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
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Heure de début</label>
                  <input
                    type="time"
                    name="start_time"
                    value={bulkEditForm.start_time}
                    onChange={handleBulkEditFormChange}
                    style={mobileInput}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Heure de fin</label>
                  <input
                    type="time"
                    name="end_time"
                    value={bulkEditForm.end_time}
                    onChange={handleBulkEditFormChange}
                    style={mobileInput}
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Appliquer aux jours :</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <label
                    key={day.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      background: bulkEditForm.apply_to_days[day.id]
                        ? "#fff0fa"
                        : "#f8f8f8",
                      borderRadius: 8,
                      border: bulkEditForm.apply_to_days[day.id]
                        ? "1px solid #ff80ab"
                        : "1px solid #ddd",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={bulkEditForm.apply_to_days[day.id]}
                      onChange={(e) =>
                        handleBulkEditDayChange(day.id, e.target.checked)
                      }
                      style={{ margin: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: bulkEditForm.apply_to_days[day.id]
                          ? 600
                          : 500,
                        color: bulkEditForm.apply_to_days[day.id]
                          ? "#ff4081"
                          : "#666",
                      }}
                    >
                      {day.short}
                    </span>
                  </label>
                ))}
              </div>
            </div>

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
                onClick={closeBulkEditModal}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{
                  ...bigBtn,
                  fontSize: 16,
                  background:
                    "linear-gradient(90deg, #4caf50 0%, #45a049 100%)",
                }}
                onClick={saveBulkPlanning}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation en bas */}
      <BottomNavigation activePage="planning" />
    </div>
  );
}
