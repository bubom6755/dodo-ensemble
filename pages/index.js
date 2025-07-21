import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

const mainBg = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%)",
  padding: 0,
};

const cardStyle = {
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 2px 16px #ffd6ef55",
  padding: 28,
  marginBottom: 28,
  marginTop: 0,
};

const bigBtn = {
  background: "linear-gradient(90deg, #ffb0d4 0%, #ffeef8 100%)",
  color: "#d0488f",
  border: "none",
  borderRadius: 32,
  fontSize: 22,
  fontWeight: 700,
  padding: "1.1rem 2.5rem",
  margin: "0 18px 0 0",
  boxShadow: "0 2px 8px #ffd6ef33",
  cursor: "pointer",
  transition: "transform 0.1s, box-shadow 0.1s",
};

const bigBtnHover = {
  transform: "scale(1.05)",
  boxShadow: "0 4px 16px #ffd6ef77",
};

const sectionTitle = {
  color: "#d48abf",
  fontWeight: 700,
  fontSize: 22,
  marginBottom: 10,
  marginTop: 0,
};

const inputStyle = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ffd6ef",
  fontSize: 16,
  marginRight: 10,
  background: "#fff8fc",
};

const labelStyle = {
  fontWeight: 600,
  color: "#d0488f",
  marginRight: 8,
};

const helpBubble = {
  display: "inline-block",
  background: "#ffeef8",
  color: "#d0488f",
  borderRadius: 12,
  padding: "6px 14px",
  fontSize: 15,
  marginLeft: 8,
  marginBottom: 4,
};

const answerIcon = {
  Oui: "💗",
  Non: "💔",
};

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [answer, setAnswer] = useState(null);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [responses, setResponses] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventDate, setEventDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [btnHover, setBtnHover] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    let userFromUrl = router.query.user;
    if (typeof userFromUrl === "string" && userFromUrl.trim() !== "") {
      setUserId(userFromUrl);
      localStorage.setItem("userId", userFromUrl);
    } else {
      const stored = localStorage.getItem("userId");
      if (stored && stored.trim() !== "") {
        setUserId(stored);
      } else {
        alert("Aucun utilisateur défini. Ajoutez ?user=victor à l'URL.");
      }
    }
  }, [router.isReady, router.query.user]);

  useEffect(() => {
    fetchResponses();
    fetchEvents();
  }, []);

  async function fetchResponses() {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .order("date", { ascending: false })
      .limit(10);
    if (error) console.error(error);
    else setResponses(data);
  }

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    if (error) console.error(error);
    else setEvents(data);
  }

  async function handleAnswer(ans) {
    setAnswer(ans);
    if (!ans) {
      setShowReasonInput(true);
    } else {
      await saveResponse(ans, "");
      setShowReasonInput(false);
      fetchResponses();
    }
  }

  async function saveResponse(ans, reasonText) {
    const today = new Date().toISOString().split("T")[0];
    if (!userId) {
      alert("Aucun utilisateur défini. Ajoutez ?user=victor à l'URL.");
      return;
    }
    const { error } = await supabase.from("responses").upsert(
      {
        user_id: userId,
        date: today,
        answer: ans ? "Oui" : "Non",
        reason: reasonText,
      },
      {
        onConflict: ["user_id", "date"],
        returning: "minimal",
      }
    );
  }

  async function submitReason() {
    await saveResponse(answer, reason);
    setReason("");
    setShowReasonInput(false);
    fetchResponses();
  }

  async function addEvent(e) {
    e.preventDefault();
    if (!eventDate || !eventTitle) return;
    const { error } = await supabase.from("events").upsert({
      date: eventDate,
      title: eventTitle,
    });
    if (error) console.error(error);
    else {
      setEventDate("");
      setEventTitle("");
      fetchEvents();
    }
  }

  const displayName = userId
    ? userId.charAt(0).toUpperCase() + userId.slice(1)
    : "";

  return (
    <div style={mainBg}>
      <main style={{ maxWidth: 480, margin: "auto", padding: 0 }}>
        <div style={{ ...cardStyle, marginTop: 36, textAlign: "center" }}>
          {userId && (
            <div
              style={{
                fontWeight: 700,
                fontSize: 26,
                color: "#d0488f",
                marginBottom: 8,
              }}
            >
              Bonjour {displayName} !
            </div>
          )}
          <div style={{ fontSize: 18, color: "#b86fa5", marginBottom: 10 }}>
            <span style={helpBubble}>Bienvenue sur votre espace quotidien</span>
          </div>
          <div style={{ fontSize: 15, color: "#b86fa5", marginBottom: 8 }}>
            <span style={helpBubble}>
              Pour répondre, cliquez simplement sur un bouton ci-dessous
            </span>
          </div>
          <h1
            style={{ color: "#d48abf", fontSize: 30, margin: "18px 0 24px 0" }}
          >
            Dors-tu avec moi ce soir ?
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <button
              style={
                btnHover === "oui" ? { ...bigBtn, ...bigBtnHover } : bigBtn
              }
              onMouseEnter={() => setBtnHover("oui")}
              onMouseLeave={() => setBtnHover("")}
              onClick={() => handleAnswer(true)}
            >
              Oui 💗
            </button>
            <button
              style={
                btnHover === "non" ? { ...bigBtn, ...bigBtnHover } : bigBtn
              }
              onMouseEnter={() => setBtnHover("non")}
              onMouseLeave={() => setBtnHover("")}
              onClick={() => handleAnswer(false)}
            >
              Non 💔
            </button>
          </div>
          {showReasonInput && (
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Pourquoi ?</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ ...inputStyle, width: "60%" }}
                placeholder="Expliquez en quelques mots..."
              />
              <button
                style={{
                  ...bigBtn,
                  fontSize: 17,
                  padding: "0.6rem 1.5rem",
                  marginLeft: 10,
                }}
                onClick={submitReason}
              >
                Valider
              </button>
              <span style={helpBubble}>
                Facultatif, mais ça aide à comprendre !
              </span>
            </div>
          )}
        </div>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>Historique des réponses</h2>
          <div style={{ fontSize: 15, color: "#b86fa5", marginBottom: 8 }}>
            <span style={helpBubble}>Retrouvez vos 10 dernières réponses</span>
          </div>
          {responses.length === 0 && (
            <p style={{ color: "#b86fa5" }}>Aucune réponse pour l’instant.</p>
          )}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {responses.map((r) => (
              <li
                key={r.id}
                style={{
                  background: r.answer === "Oui" ? "#ffeef8" : "#fff0f3",
                  borderRadius: 10,
                  marginBottom: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: 17,
                }}
              >
                <span style={{ fontSize: 22, marginRight: 10 }}>
                  {answerIcon[r.answer] || ""}
                </span>
                <span
                  style={{ fontWeight: 600, color: "#d0488f", marginRight: 8 }}
                >
                  {r.date}
                </span>
                <span style={{ color: "#b86fa5", marginRight: 8 }}>
                  {r.user_id}
                </span>
                <span
                  style={{
                    color: r.answer === "Oui" ? "#d0488f" : "#b86fa5",
                    fontWeight: 600,
                  }}
                >
                  {r.answer}
                </span>
                {r.reason ? (
                  <span
                    style={{
                      color: "#b86fa5",
                      marginLeft: 10,
                      fontStyle: "italic",
                    }}
                  >
                    — {r.reason}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>Événements</h2>
          <div style={{ fontSize: 15, color: "#b86fa5", marginBottom: 8 }}>
            <span style={helpBubble}>
              Ajoutez un événement important à venir
            </span>
          </div>
          <form
            onSubmit={addEvent}
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              style={{ ...inputStyle, width: 140, marginBottom: 8 }}
            />
            <input
              type="text"
              placeholder="Titre de l’événement"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
              style={{ ...inputStyle, flex: 1, minWidth: 120, marginBottom: 8 }}
            />
            <button
              type="submit"
              style={{
                ...bigBtn,
                fontSize: 17,
                padding: "0.6rem 1.5rem",
                margin: 0,
              }}
            >
              Ajouter
            </button>
          </form>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {events.map((e) => (
              <li
                key={e.id}
                style={{
                  background: "#fff8fc",
                  borderRadius: 10,
                  marginBottom: 8,
                  padding: "8px 12px",
                  fontSize: 16,
                  color: "#b86fa5",
                }}
              >
                <span
                  style={{ fontWeight: 600, color: "#d0488f", marginRight: 8 }}
                >
                  {e.date}
                </span>
                {e.title}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
