import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [sakuraPetals, setSakuraPetals] = useState([]);
  const [citation, setCitation] = useState(
    "L'amour, c'est prendre soin l'un de l'autre chaque jour."
  );
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("userId");
    setIsConnected(!!(stored && stored.trim() !== ""));
  }, []);

  useEffect(() => {
    // Génère les cœurs animés (votre code original amélioré)
    const heartsArray = Array.from({ length: 8 }, (_, i) => ({
      left: Math.random() * 100,
      delay: i * 0.8,
      duration: 6 + i * 0.5,
    }));
    setHearts(heartsArray);

    // Ajout de pétales de sakura flottants
    const petalsArray = Array.from({ length: 15 }, (_, i) => ({
      left: Math.random() * 100,
      delay: i * 1.5,
      duration: 12 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
    setSakuraPetals(petalsArray);
  }, []);

  useEffect(() => {
    async function fetchCitation() {
      const { data, error } = await supabase
        .from("citation")
        .select("text")
        .order("updated_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setCitation(data[0].text);
      }
    }
    fetchCitation();
  }, []);

  const handleGoAhead = () => {
    if (isConnected) {
      setShowLoader(true);
      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } else {
      setShowModal(true);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!userId.trim()) return;

    setLoading(true);

    const { data, error: dbError } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", userId.trim())
      .single();

    setLoading(false);

    if (dbError || !data) {
      setError("Utilisateur inconnu. Veuillez contacter l'administrateur.");
      return;
    }

    localStorage.setItem("userId", userId.trim());
    setShowModal(false);
    setIsConnected(true);
    setShowLoader(true);
    setTimeout(() => {
      router.replace("/");
    }, 1500);
  };

  if (showLoader) {
    return (
      <div className="loader-container">
        <div className="premium-loader">
          <div className="loader-heart">
            <svg viewBox="0 0 24 24" fill="#ff8eb9">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div className="loader-text">Chargement...</div>
          <div className="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <style jsx>{`
          .loader-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont,
              sans-serif;
          }

          .premium-loader {
            text-align: center;
            animation: fadeInScale 0.8s ease-out;
          }

          .loader-heart {
            width: 64px;
            height: 64px;
            margin: 0 auto 24px;
            animation: heartPulse 1.8s ease-in-out infinite;
            filter: drop-shadow(0 4px 12px rgba(255, 182, 219, 0.4));
          }

          .loader-text {
            color: #d0488f;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
          }

          .loader-dots {
            display: flex;
            justify-content: center;
            gap: 6px;
          }

          .loader-dots span {
            width: 8px;
            height: 8px;
            background: #ff8eb9;
            border-radius: 50%;
            animation: dotBounce 1.4s ease-in-out infinite;
          }

          .loader-dots span:nth-child(2) {
            animation-delay: 0.2s;
          }
          .loader-dots span:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes heartPulse {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes dotBounce {
            0%,
            80%,
            100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-12px);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Pétales de sakura flottants */}
      {sakuraPetals.map((petal, i) => (
        <div
          key={`petal-${i}`}
          className="sakura-petal"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            transform: `rotate(${petal.rotation}deg)`,
          }}
        >
          🌸
        </div>
      ))}

      {/* Cœurs animés (votre style original) */}
      {hearts.map((heart, i) => (
        <div
          key={`heart-${i}`}
          className="floating-heart"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="#ff8eb9" width="24" height="24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      {/* Header avec citation (votre style original amélioré) */}
      <div className="header">
        <div className="citation-container">
          <div className="citation-accent">💕</div>
          <div className="citation-text">{citation}</div>
          <div className="citation-line"></div>
        </div>
      </div>

      {/* Bouton principal (votre style original sublimé) */}
      <button className="main-button" onClick={handleGoAhead}>
        <div className="button-shine"></div>
        <div className="button-content">
          <span className="button-icon">✨</span>
          <span className="button-text">Clique moi !</span>
        </div>
      </button>

      {/* Modal de connexion (votre thème conservé) */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">🌸</div>
              <h2 className="modal-title">Connexion</h2>
              <div className="modal-subtitle">Entrez votre identifiant</div>
            </div>

            <div className="modal-form">
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Identifiant (ex: demo)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="premium-input"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <div className="input-focus-line"></div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="submit-button"
              >
                <div className="button-bg"></div>
                <span className="submit-content">
                  {loading ? (
                    <>
                      <div className="loading-heart">💖</div>
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <div className="button-arrow">→</div>
                    </>
                  )}
                </span>
              </button>

              {error && (
                <div className="error-message">
                  <div className="error-icon">🌸</div>
                  <div className="error-text">{error}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          position: relative;
          overflow: hidden;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont,
            sans-serif;
          padding-top: 160px;
          padding-bottom: 80px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .sakura-petal {
          position: absolute;
          top: -50px;
          font-size: 16px;
          animation: sakuraFall infinite linear;
          pointer-events: none;
          z-index: 1;
          opacity: 0.8;
        }

        .floating-heart {
          position: absolute;
          bottom: -20px;
          width: 24px;
          height: 24px;
          animation: rise infinite ease-in;
          pointer-events: none;
          z-index: 1;
        }

        .header {
          width: 100%;
          height: 160px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom-right-radius: 40px;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 10;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          padding: 32px 28px 0 28px;
          box-sizing: border-box;
          box-shadow: 0 2px 20px rgba(255, 214, 239, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.8);
          animation: slideDown 1s ease-out;
        }

        .citation-container {
          max-width: 280px;
          position: relative;
        }

        .citation-accent {
          font-size: 24px;
          margin-bottom: 8px;
          animation: bounce 2s ease-in-out infinite;
        }

        .citation-text {
          color: #222;
          font-size: 20px;
          font-weight: 600;
          text-align: left;
          line-height: 1.3;
          letter-spacing: 0.2px;
          position: relative;
          z-index: 1;
          animation: fadeInUp 1s ease-out 0.3s both;
        }

        .citation-line {
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #ff8eb9, #ffd6ef);
          border-radius: 2px;
          margin-top: 12px;
          animation: expandLine 1s ease-out 0.8s both;
        }

        .main-button {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          color: #d0488f;
          border: 2px solid rgba(255, 214, 239, 0.6);
          border-radius: 32px;
          font-size: 20px;
          font-weight: 700;
          width: 92%;
          height: 56px;
          position: fixed;
          left: 4%;
          bottom: 24px;
          box-shadow: 0 8px 32px rgba(255, 214, 239, 0.5);
          cursor: pointer;
          letter-spacing: 0.3px;
          z-index: 100;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: buttonFloat 3s ease-in-out infinite;
        }

        .main-button:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(255, 214, 239, 0.7);
          border-color: #ff8eb9;
        }

        .main-button:active {
          transform: translateY(-2px);
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shine 3s ease-in-out infinite;
          border-radius: 32px;
        }

        .button-content {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 2;
        }

        .button-icon {
          font-size: 18px;
          animation: sparkle 2s ease-in-out infinite;
        }

        .button-text {
          font-weight: 700;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(30px);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(255, 182, 219, 0.4);
          min-width: 0;
          width: 90vw;
          max-width: 360px;
          z-index: 1001;
          text-align: center;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.8);
          overflow: hidden;
          animation: modalSlideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          margin: 0 auto;
        }

        .modal-header {
          padding: 32px 32px 24px;
          background: linear-gradient(
            135deg,
            rgba(255, 240, 250, 0.8),
            transparent
          );
        }

        .modal-icon {
          font-size: 32px;
          margin-bottom: 12px;
          animation: rotate 2s linear infinite;
        }

        .modal-title {
          color: #d0488f;
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 8px;
          letter-spacing: -0.3px;
        }

        .modal-subtitle {
          color: #888;
          font-size: 15px;
          font-weight: 500;
          margin: 0;
        }

        .modal-form {
          padding: 0 32px 32px;
        }

        .input-container {
          position: relative;
          margin-bottom: 24px;
        }

        .premium-input {
          padding: 16px 20px;
          border-radius: 16px;
          border: 2px solid #ffd6ef;
          font-size: 16px;
          width: 100%;
          background: rgba(255, 248, 252, 0.8);
          backdrop-filter: blur(10px);
          outline: none;
          color: #333;
          font-weight: 500;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .premium-input:focus {
          border-color: #ff8eb9;
          box-shadow: 0 0 0 4px rgba(255, 142, 185, 0.1);
          transform: translateY(-2px);
        }

        .input-focus-line {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: #ff8eb9;
          transition: all 0.3s ease;
          transform: translateX(-50%);
          border-radius: 1px;
        }

        .premium-input:focus + .input-focus-line {
          width: 100%;
        }

        .submit-button {
          background: linear-gradient(135deg, #ffeef8 0%, #fff0fa 100%);
          color: #d0488f;
          border: 2px solid #ffb0d4;
          border-radius: 16px;
          padding: 16px 32px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.3px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 176, 212, 0.4);
          border-color: #ff8eb9;
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-bg {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: buttonShine 2s ease-in-out infinite;
        }

        .submit-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          z-index: 2;
        }

        .loading-heart {
          animation: heartBeat 1s ease-in-out infinite;
        }

        .button-arrow {
          font-size: 18px;
          transition: transform 0.3s ease;
        }

        .submit-button:hover .button-arrow {
          transform: translateX(4px);
        }

        .error-message {
          margin-top: 20px;
          padding: 16px;
          background: rgba(254, 226, 226, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid #ffb0d4;
          color: #d0488f;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shakeIn 0.5s ease-out;
        }

        .error-icon {
          font-size: 16px;
        }

        @keyframes sakuraFall {
          0% {
            transform: translateY(-100px) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes slideDown {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expandLine {
          0% {
            width: 0;
          }
          100% {
            width: 60px;
          }
        }

        @keyframes buttonFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes shine {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: 100%;
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.1) rotate(180deg);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes modalSlideUp {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes buttonShine {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        @keyframes heartBeat {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        @keyframes shakeIn {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 480px) {
          .container {
            max-width: 100%;
          }

          .header {
            padding: 28px 24px 0 24px;
          }

          .citation-text {
            font-size: 18px;
          }

          .main-button {
            width: 90%;
            left: 5%;
          }
          .modal-overlay {
            align-items: center;
            justify-content: center;
            padding: 0;
          }
          .modal-container {
            width: 98vw;
            max-width: 98vw;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}
