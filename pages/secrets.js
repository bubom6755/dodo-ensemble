import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import BottomNavigation from "../components/BottomNavigation";

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
    <div className="secrets-container">
      {/* Header élégant */}
      <div className="secrets-header">
        <div className="header-content">
          <div className="header-icon">🎁</div>
          <h1 className="header-title">Boîte à Secrets</h1>
          <p className="header-subtitle">
            Partagez des secrets qui se révèleront au bon moment
          </p>
        </div>
      </div>

      {/* Bouton d'ajout flottant */}
      <button className="add-secret-button" onClick={openAddModal}>
        <div className="add-button-content">
          <span className="add-icon">🎁</span>
        </div>
      </button>

      {/* Contenu principal */}
      <div className="secrets-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3 className="loading-title">Chargement des secrets...</h3>
          </div>
        ) : secrets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">🎁✨</div>
            <h3 className="empty-title">Aucun secret partagé</h3>
            <p className="empty-text">
              Créez votre premier secret pour commencer !
            </p>
            <button className="empty-action-button" onClick={openAddModal}>
              Créer mon premier secret
            </button>
          </div>
        ) : (
          <div className="secrets-masonry">
            {secrets.map((secret, index) => {
              const isUnlocked = isSecretUnlocked(secret);
              const daysUntilUnlock = getDaysUntilUnlock(secret);

              return (
                <div
                  key={secret.id}
                  className={`secret-tile ${
                    isUnlocked ? "unlocked" : "locked"
                  }`}
                  onClick={() => openSecretModal(secret)}
                  style={{
                    animationDelay: `${index * 0.15}s`,
                  }}
                >
                  <div className="tile-header">
                    <div className="tile-status">
                      {isUnlocked ? (
                        <span className="status-unlocked">🔓</span>
                      ) : (
                        <span className="status-locked">🔒</span>
                      )}
                    </div>
                    <div className="tile-meta">
                      <span className="tile-type">{secret.display_name}</span>
                      <span className="tile-date">
                        {formatDateShort(secret.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="tile-content">
                    {isUnlocked ? (
                      <div className="unlocked-preview">
                        <p className="preview-text">{secret.content}</p>
                      </div>
                    ) : (
                      <div className="locked-preview">
                        {secret.unlock_type === "manual" ? (
                          <div className="manual-lock">
                            <div className="lock-icon">🔐</div>
                            <p className="lock-message">
                              Déblocage manuel requis
                            </p>
                          </div>
                        ) : (
                          <div className="date-lock">
                            <div className="lock-icon">⏰</div>
                            <p className="lock-message">
                              Débloqué le {formatDate(secret.unlock_date)}
                              {daysUntilUnlock > 0 && (
                                <span className="countdown">
                                  {" "}
                                  (dans {daysUntilUnlock} jour
                                  {daysUntilUnlock > 1 ? "s" : ""})
                                </span>
                              )}
                            </p>
                          </div>
                        )}
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

      {/* Modal de création de secret */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">🎁</div>
              <h2 className="modal-title">Nouveau secret</h2>
              <p className="modal-subtitle">
                Créez un secret pour {displayUserName(getOtherUser(userId))}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">🔓 Type de déblocage</label>
              <select
                name="unlock_type"
                value={newSecret.unlock_type}
                onChange={handleSecretChange}
                className="form-input"
              >
                <option value="manual">🔓 Déblocage manuel</option>
                <option value="date">📅 Déblocage par date</option>
              </select>
            </div>

            {newSecret.unlock_type === "date" && (
              <div className="form-group">
                <label className="form-label">📅 Date de déblocage</label>
                <input
                  type="date"
                  name="unlock_date"
                  value={newSecret.unlock_date}
                  onChange={handleSecretChange}
                  className="form-input"
                  required={newSecret.unlock_type === "date"}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">💭 Votre secret</label>
              <textarea
                name="content"
                value={newSecret.content}
                onChange={handleSecretChange}
                placeholder="Écrivez votre secret ici..."
                className="form-textarea"
                required
              />
            </div>

            <div className="form-actions">
              <button className="cancel-button" onClick={closeAddModal}>
                Annuler
              </button>
              <button className="submit-button" onClick={saveSecret}>
                🎁 Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'affichage du secret */}
      {showSecretModal && selectedSecret && (
        <div className="modal-overlay" onClick={closeSecretModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                {isSecretUnlocked(selectedSecret) ? "🎉" : "🔒"}
              </div>
              <h2 className="modal-title">
                {isSecretUnlocked(selectedSecret)
                  ? "🎉 Secret dévoilé"
                  : "🔒 Secret verrouillé"}
              </h2>
              <p className="modal-subtitle">{selectedSecret.display_name}</p>
            </div>

            <div className="secret-content">
              {isSecretUnlocked(selectedSecret) ? (
                <div className="unlocked-content">
                  <p className="content-text">{selectedSecret.content}</p>
                  <div className="content-meta">
                    <span className="meta-date">
                      📅 Créé le {formatDate(selectedSecret.created_at)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="locked-content">
                  <div className="lock-icon">🔒</div>
                  <h3 className="lock-title">Secret verrouillé</h3>
                  <p className="lock-text">
                    Ce secret n'est pas encore débloqué.
                  </p>
                  {selectedSecret.unlock_type === "manual" &&
                    !selectedSecret.is_sent && (
                      <button
                        className="unlock-button"
                        onClick={() => {
                          unlockSecret(selectedSecret.id);
                          closeSecretModal();
                        }}
                      >
                        🔓 Je veux lire le secret
                      </button>
                    )}
                  {selectedSecret.unlock_type === "date" && (
                    <p className="date-info">
                      📅 Débloqué le {formatDate(selectedSecret.unlock_date)}
                      {getDaysUntilUnlock(selectedSecret) > 0 && (
                        <span className="days-remaining">
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

            <div className="form-actions">
              <button className="cancel-button" onClick={closeSecretModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation activePage="secrets" />

      <style jsx>{`
        .secrets-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%);
          position: relative;
          overflow: hidden;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont,
            sans-serif;
          padding-bottom: 100px;
        }

        .secrets-header {
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

        .add-secret-button {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #ff6b9d 0%, #ff4081 100%);
          border: none;
          border-radius: 20px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(255, 64, 129, 0.4);
          transition: all 0.3s ease;
          z-index: 100;
        }

        .add-secret-button:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 12px 32px rgba(255, 64, 129, 0.6);
        }

        .add-button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .add-icon {
          font-size: 28px;
        }

        .secrets-content {
          max-width: 400px;
          margin: 0 auto;
          padding: 0 16px;
          margin-top: 24px;
        }

        .loading-state {
          text-align: center;
          padding: 80px 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 64, 129, 0.2);
          border-top: 3px solid #ff4081;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-title {
          color: #d0488f;
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-illustration {
          font-size: 64px;
          margin-bottom: 24px;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .empty-title {
          color: #d0488f;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 12px 0;
        }

        .empty-text {
          color: #b86fa5;
          font-size: 16px;
          margin: 0 0 32px 0;
          line-height: 1.5;
        }

        .empty-action-button {
          background: linear-gradient(135deg, #ff6b9d 0%, #ff4081 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 16px 32px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(255, 64, 129, 0.3);
        }

        .empty-action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 64, 129, 0.4);
        }

        .secrets-masonry {
          display: grid;
          gap: 20px;
          padding: 0 8px;
        }

        .secret-tile {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 24px;
          border: 2px solid rgba(255, 182, 219, 0.3);
          transition: all 0.4s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          animation: slideInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .secret-tile::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff6b9d 0%, #ff4081 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .secret-tile:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 40px rgba(255, 182, 219, 0.4);
          border-color: rgba(255, 64, 129, 0.5);
        }

        .secret-tile:hover::before {
          transform: scaleX(1);
        }

        .secret-tile.locked {
          opacity: 0.8;
          background: rgba(255, 255, 255, 0.9);
        }

        .secret-tile.unlocked {
          border-color: rgba(76, 175, 80, 0.3);
        }

        .secret-tile.unlocked::before {
          background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
        }

        .tile-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .tile-status {
          font-size: 24px;
        }

        .status-unlocked {
          color: #4caf50;
        }

        .status-locked {
          color: #ff9800;
        }

        .tile-meta {
          text-align: right;
        }

        .tile-type {
          display: block;
          color: #d0488f;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .tile-date {
          display: block;
          color: #b86fa5;
          font-size: 12px;
          font-weight: 500;
        }

        .tile-content {
          margin-top: 16px;
        }

        .unlocked-preview {
          background: rgba(76, 175, 80, 0.05);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(76, 175, 80, 0.1);
        }

        .preview-text {
          color: #333;
          font-size: 15px;
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .locked-preview {
          text-align: center;
          padding: 20px 16px;
        }

        .manual-lock,
        .date-lock {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .lock-icon {
          font-size: 32px;
          opacity: 0.7;
        }

        .lock-message {
          color: #ff9800;
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          text-align: center;
        }

        .countdown {
          color: #b86fa5;
          font-weight: 500;
        }

        .toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 182, 219, 0.3);
          border-radius: 16px;
          padding: 16px 32px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 8px 24px rgba(255, 182, 219, 0.3);
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
          margin: 0 0 8px 0;
        }

        .modal-subtitle {
          color: #b86fa5;
          font-size: 14px;
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
          box-shadow: 0 4px 12px rgba(255, 64, 129, 0.4);
        }

        .secret-content {
          margin-bottom: 24px;
        }

        .unlocked-content {
          text-align: left;
        }

        .content-text {
          color: #333;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 16px 0;
          white-space: pre-wrap;
        }

        .content-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #b86fa5;
          font-size: 14px;
        }

        .locked-content {
          text-align: center;
          padding: 40px 20px;
        }

        .lock-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .lock-title {
          color: #d0488f;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 12px 0;
        }

        .lock-text {
          color: #b86fa5;
          font-size: 14px;
          margin: 0 0 24px 0;
        }

        .unlock-button {
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .unlock-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
        }

        .date-info {
          color: #ff9800;
          font-size: 13px;
          margin: 0;
        }

        .days-remaining {
          color: #b86fa5;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
