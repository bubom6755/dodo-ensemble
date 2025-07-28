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
  color: "4a4a4a",
};

const labelStyle = {
  fontWeight: 600,
  color: "#d0488f",
  marginRight: 8,
  display: "block",
  marginBottom: 4,
  fontSize: 14,
};

export default function Secrets() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSecret, setNewSecret] = useState({
    content: "",
    unlock_type: "manual",
    unlock_date: "",
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

  // Fonction utilitaire pour obtenir l'autre utilisateur
  function getOtherUser(currentUserId) {
    return currentUserId === "victor" ? "alyssia" : "victor";
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
      fetchSecrets();
    }
  }, [userId]);

  async function fetchSecrets() {
    setLoading(true);

    // Récupérer les secrets que l'utilisateur a envoyés (pour voir le statut)
    const { data: sentSecrets, error: sentError } = await supabase
      .from("secret_box")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    // Récupérer les secrets que l'utilisateur a reçus
    const { data: receivedSecrets, error: receivedError } = await supabase
      .from("secret_box")
      .select("*")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false });

    if (!sentError && !receivedError) {
      // Combiner les secrets avec des informations sur leur statut
      const allSecrets = [];

      // Ajouter les secrets envoyés (avec statut "envoyé")
      sentSecrets?.forEach((secret) => {
        allSecrets.push({
          ...secret,
          is_sent: true,
          display_name: `Envoyé à ${displayUserName(secret.recipient_id)}`,
        });
      });

      // Ajouter les secrets reçus
      receivedSecrets?.forEach((secret) => {
        allSecrets.push({
          ...secret,
          is_sent: false,
          display_name: `Reçu de ${displayUserName(secret.author_id)}`,
        });
      });

      // Trier par date de création
      allSecrets.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setSecrets(allSecrets);
    }

    setLoading(false);
  }

  function openAddModal() {
    setNewSecret({
      content: "",
      unlock_type: "manual",
      unlock_date: "",
    });
    setShowAddModal(true);
  }

  function closeAddModal() {
    setShowAddModal(false);
  }

  function openSecretModal(secret) {
    setSelectedSecret(secret);
    setShowSecretModal(true);
  }

  function closeSecretModal() {
    setShowSecretModal(false);
    setSelectedSecret(null);
  }

  function handleSecretChange(e) {
    setNewSecret({ ...newSecret, [e.target.name]: e.target.value });
  }

  async function saveSecret() {
    if (!newSecret.content.trim()) {
      showToast("Le contenu du secret est obligatoire", "red");
      return;
    }

    if (newSecret.unlock_type === "date" && !newSecret.unlock_date) {
      showToast("La date de déblocage est obligatoire", "red");
      return;
    }

    const secretData = {
      author_id: userId,
      recipient_id: getOtherUser(userId),
      content: newSecret.content,
      unlock_type: newSecret.unlock_type,
      unlock_date: newSecret.unlock_date || null,
      unlocked: false,
    };

    const { error } = await supabase.from("secret_box").insert(secretData);

    if (error) {
      console.error("Erreur saveSecret:", error);
      showToast("Erreur lors de la sauvegarde", "red");
      return;
    }

    showToast("Secret envoyé ! 🎁");
    closeAddModal();
    fetchSecrets();
  }

  async function unlockSecret(secretId) {
    const { error } = await supabase
      .from("secret_box")
      .update({ unlocked: true })
      .eq("id", secretId);

    if (error) {
      console.error("Erreur unlockSecret:", error);
      showToast("Erreur lors du déblocage", "red");
      return;
    }

    showToast("Secret débloqué ! ✨");
    fetchSecrets();
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  }

  function isSecretUnlocked(secret) {
    if (secret.unlocked) return true;
    if (secret.unlock_type === "date" && secret.unlock_date) {
      return new Date(secret.unlock_date) <= new Date();
    }
    return false;
  }

  function getDaysUntilUnlock(secret) {
    if (!secret.unlock_date) return null;
    const today = new Date();
    const unlockDate = new Date(secret.unlock_date);
    const diffTime = unlockDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            🎁 Boîte à Secrets
          </h1>
          <p style={{ color: "#b86fa5", fontSize: 16, marginBottom: 20 }}>
            Partagez des secrets qui se révèleront au bon moment...
          </p>
          <button
            style={{
              ...bigBtn,
              fontSize: 14,
              padding: "0.8rem 1.2rem",
            }}
            onClick={openAddModal}
          >
            ✨ Créer un secret
          </button>
        </div>

        {/* Liste des secrets */}
        {loading ? (
          <div style={{ ...mobileCard, textAlign: "center" }}>
            <div style={{ color: "#ff80ab", fontSize: 20, margin: "24px 0" }}>
              Chargement...
            </div>
          </div>
        ) : secrets.length === 0 ? (
          <div style={{ ...mobileCard, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
            <h3 style={{ color: "#ff4081", marginBottom: 8 }}>
              Aucun secret encore
            </h3>
            <p style={{ color: "#888", marginBottom: 20 }}>
              Créez votre premier secret pour commencer !
            </p>
            <button style={bigBtn} onClick={openAddModal}>
              Créer le premier secret
            </button>
          </div>
        ) : (
          <div style={{ padding: "0 8px" }}>
            {secrets.map((secret, index) => {
              const isUnlocked = isSecretUnlocked(secret);
              const daysUntilUnlock = getDaysUntilUnlock(secret);

              return (
                <div
                  key={secret.id}
                  style={{
                    ...mobileCard,
                    position: "relative",
                    marginBottom: 16,
                    animation: "fadeInUp 0.6s ease-out",
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "both",
                    transform: "translateY(0)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "pointer",
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
                  onClick={() => openSecretModal(secret)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        background: isUnlocked
                          ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
                          : "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                        borderRadius: 12,
                        padding: "10px",
                        color: "white",
                        fontSize: 18,
                        minWidth: 40,
                        textAlign: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isUnlocked ? "🎉" : "🔒"}
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
                          {isUnlocked ? "🎉 DÉVOILÉ!" : "🔒 Secret verrouillé"}
                        </h3>
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
                          {secret.display_name}
                        </span>
                      </div>
                      <p
                        style={{
                          color: "#b86fa5",
                          fontSize: 13,
                          margin: "0 0 6px 0",
                          fontWeight: 600,
                        }}
                      >
                        📅 {formatDateShort(secret.created_at)}
                      </p>
                      {isUnlocked ? (
                        <p
                          style={{
                            color: "#666",
                            fontSize: 13,
                            lineHeight: 1.4,
                            margin: "6px 0 0 0",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {secret.content}
                        </p>
                      ) : (
                        <div style={{ marginTop: 6 }}>
                          {secret.unlock_type === "manual" ? (
                            <p
                              style={{
                                color: "#ff9800",
                                fontSize: 13,
                                margin: 0,
                              }}
                            >
                              🔓 Déblocage manuel requis
                            </p>
                          ) : (
                            <p
                              style={{
                                color: "#ff9800",
                                fontSize: 13,
                                margin: 0,
                              }}
                            >
                              📅 Débloqué le {formatDate(secret.unlock_date)}
                              {daysUntilUnlock > 0 && (
                                <span style={{ color: "#b86fa5" }}>
                                  {" "}
                                  (dans {daysUntilUnlock} jour
                                  {daysUntilUnlock > 1 ? "s" : ""})
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de création de secret */}
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
                🎁 Nouveau secret
              </h2>
              <p
                style={{
                  fontSize: 14,
                  opacity: 0.9,
                  margin: 0,
                  color: "white",
                }}
              >
                Créez un secret pour {displayUserName(getOtherUser(userId))}
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
              {/* Type de déblocage */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>🔓 Type de déblocage</label>
                <select
                  name="unlock_type"
                  value={newSecret.unlock_type}
                  onChange={handleSecretChange}
                  style={mobileInput}
                >
                  <option value="manual">🔓 Déblocage manuel</option>
                  <option value="date">📅 Déblocage par date</option>
                </select>
              </div>

              {/* Date de déblocage (si applicable) */}
              {newSecret.unlock_type === "date" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>📅 Date de déblocage</label>
                  <input
                    type="date"
                    name="unlock_date"
                    value={newSecret.unlock_date}
                    onChange={handleSecretChange}
                    style={mobileInput}
                    required={newSecret.unlock_type === "date"}
                  />
                </div>
              )}

              {/* Contenu du secret */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>💭 Votre secret</label>
                <textarea
                  name="content"
                  value={newSecret.content}
                  onChange={handleSecretChange}
                  placeholder="Écrivez votre secret ici..."
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
                  onClick={saveSecret}
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
                  🎁 Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'affichage du secret */}
      {showSecretModal && selectedSecret && (
        <div style={modalOverlay} onClick={closeSecretModal}>
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
                background: isSecretUnlocked(selectedSecret)
                  ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
                  : "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
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
                {isSecretUnlocked(selectedSecret)
                  ? "🎉 Secret dévoilé"
                  : "🔒 Secret verrouillé"}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  opacity: 0.9,
                  margin: 0,
                  color: "white",
                }}
              >
                {selectedSecret.display_name}
              </p>
              <button
                onClick={closeSecretModal}
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

            {/* Contenu du secret */}
            <div style={{ padding: "20px" }}>
              {isSecretUnlocked(selectedSecret) ? (
                <div>
                  <p
                    style={{
                      color: "#666",
                      fontSize: 14,
                      lineHeight: 1.6,
                      margin: "0 0 16px 0",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedSecret.content}
                  </p>
                  <p
                    style={{
                      color: "#b86fa5",
                      fontSize: 12,
                      margin: 0,
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    📅 Créé le {formatDate(selectedSecret.created_at)}
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                  <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>
                    Ce secret n'est pas encore débloqué.
                  </p>
                  {selectedSecret.unlock_type === "manual" &&
                    !selectedSecret.is_sent && (
                      <button
                        onClick={() => {
                          unlockSecret(selectedSecret.id);
                          closeSecretModal();
                        }}
                        style={{
                          padding: "12px 24px",
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
                        🔓 Je veux lire le secret
                      </button>
                    )}
                  {selectedSecret.unlock_type === "date" && (
                    <p style={{ color: "#ff9800", fontSize: 13, margin: 0 }}>
                      📅 Débloqué le {formatDate(selectedSecret.unlock_date)}
                      {getDaysUntilUnlock(selectedSecret) > 0 && (
                        <span style={{ color: "#b86fa5" }}>
                          {" "}
                          (dans {getDaysUntilUnlock(selectedSecret)} jour
                          {getDaysUntilUnlock(selectedSecret) > 1 ? "s" : ""})
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation en bas */}
      <BottomNavigation activePage="secrets" />

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
