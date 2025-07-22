import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import Loader from "../components/Loader";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [hearts, setHearts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("userId");
    setIsConnected(!!(stored && stored.trim() !== ""));
  }, []);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setShowLoader(true);
    };

    const handleRouteChangeEnd = () => {
      setShowLoader(false);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeEnd);
    router.events.on("routeChangeError", handleRouteChangeEnd);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeEnd);
      router.events.off("routeChangeError", handleRouteChangeEnd);
    };
  }, [router]);

  useEffect(() => {
    // Génère les positions aléatoires côté client uniquement
    const arr = Array.from({ length: 8 }, (_, i) => ({
      left: Math.random() * 100,
      delay: i * 0.8,
      duration: 6 + i * 0.5,
    }));
    setHearts(arr);
  }, []);

  const handleGoAhead = () => {
    if (isConnected) {
      setShowLoader(true);
      setTimeout(() => {
        router.replace("/");
      }, 800); // délai pour voir le loader
    } else {
      setShowModal(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    setShowLoader(true);
    setTimeout(() => {
      router.replace("/");
    }, 800); // délai pour voir le loader
  };

  const citation = "“L'amour, c'est prendre soin l'un de l'autre chaque jour.”";

  const styles = {
    bg: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    header: {
      width: "100%",
      height: 160,
      background: "#fff",
      borderBottomRightRadius: 40,
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 3,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      padding: "32px 28px 0 28px",
      boxSizing: "border-box",
      boxShadow: "0 2px 16px #ffd6ef33",
    },
    citation: {
      color: "#222",
      fontSize: 20,
      fontWeight: 600,
      textAlign: "left",
      lineHeight: 1.3,
      letterSpacing: 0.2,
      maxWidth: 260,
      position: "relative",
      zIndex: 1,
    },
    goBtn: {
      background: "#fff",
      color: "#d0488f",
      border: "none",
      borderRadius: 32,
      fontSize: 20,
      fontWeight: 700,
      width: "92%",
      height: 50,
      position: "fixed",
      left: "4%",
      bottom: 24,
      boxShadow: "0 4px 20px #ffd6ef66",
      cursor: "pointer",
      letterSpacing: 0.3,
      zIndex: 10,
      transition: "all 0.2s ease-in-out",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.18)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    modalBox: {
      background: "#fff",
      borderRadius: 24,
      boxShadow: "0 8px 32px rgba(255, 182, 219, 0.35)",
      padding: 32,
      minWidth: 320,
      maxWidth: 360,
      zIndex: 1001,
      textAlign: "center",
    },
    input: {
      padding: 14,
      borderRadius: 12,
      border: "1px solid #ffd6ef",
      fontSize: 17,
      width: "100%",
      marginBottom: 18,
      background: "#fff8fc",
      outline: "none",
    },
    submitBtn: {
      background: "#ffeef8",
      color: "#d0488f",
      border: "1px solid #ffb0d4",
      borderRadius: 10,
      padding: "0.8rem 2rem",
      fontWeight: 600,
      fontSize: 16,
      cursor: "pointer",
      opacity: loading ? 0.6 : 1,
      transition: "all 0.2s ease-in-out",
    },
    heart: (i) => ({
      position: "absolute",
      bottom: `${-20 + i * 50}px`,
      left: `${Math.random() * 100}%`,
      width: "24px",
      height: "24px",
      background: "transparent",
      zIndex: 0,
      animation: `rise ${6 + i * 0.5}s ease-in infinite`,
      animationDelay: `${i * 0.8}s`,
    }),
  };

  if (showLoader) {
    return <Loader />;
  }

  return (
    <div style={styles.bg}>
      {hearts.map((h, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: -20 + i * 50,
            left: `${h.left}%`,
            width: 24,
            height: 24,
            background: "transparent",
            zIndex: 0,
            animation: `rise ${h.duration}s ease-in infinite`,
            animationDelay: `${h.delay}s`,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#ff8eb9"
            width="100%"
            height="100%"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      <div style={styles.header}>
        <span style={styles.citation}>{citation}</span>
      </div>

      <button style={styles.goBtn} onClick={handleGoAhead}>
        Clique moi !
      </button>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <form
            style={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <h2 style={{ color: "#d0488f", marginBottom: 24 }}>Connexion</h2>
            <input
              type="text"
              placeholder="Identifiant (ex: victor)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={styles.input}
              autoFocus
            />
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
            {error && (
              <div style={{ color: "red", marginTop: 16 }}>{error}</div>
            )}
          </form>
        </div>
      )}

      <style jsx>{`
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
      `}</style>
    </div>
  );
}
