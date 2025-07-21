import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

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

  // Identification utilisateur via URL ou localStorage
  useEffect(() => {
    // On attend que le router soit prêt (Next.js)
    if (!router.isReady) return;
    let userFromUrl = router.query.user;
    if (typeof userFromUrl === "string" && userFromUrl.trim() !== "") {
      setUserId(userFromUrl);
      localStorage.setItem("userId", userFromUrl);
    } else {
      // Sinon, on lit depuis le localStorage
      const stored = localStorage.getItem("userId");
      if (stored && stored.trim() !== "") {
        setUserId(stored);
      } else {
        alert("Aucun utilisateur défini. Ajoutez ?user=victor à l'URL.");
      }
    }
  }, [router.isReady, router.query.user]);

  // Charger la réponse du jour et toutes réponses
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
    // Upsert pour éviter doublons date+user
    const { error } = await supabase.from("responses").upsert(
      {
        user_id: userId,
        date: today,
        answer: ans ? "Oui" : "Non",
        reason: reasonText,
      },
      {
        onConflict: ["user_id", "date"],
        returning: "minimal", // optionnel, pour limiter la réponse
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

  // Prénom pour affichage (première lettre en majuscule)
  const displayName = userId
    ? userId.charAt(0).toUpperCase() + userId.slice(1)
    : "";

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "auto",
        padding: 20,
        fontFamily: "sans-serif",
        color: "#333",
      }}
    >
      {userId && (
        <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 18 }}>
          Bonjour {displayName}
        </div>
      )}
      <h1 style={{ color: "#d48abf" }}>Dors-tu avec moi ce soir ?</h1>
      <div>
        <button style={btnStyle} onClick={() => handleAnswer(true)}>
          Oui
        </button>
        <button style={btnStyle} onClick={() => handleAnswer(false)}>
          Non
        </button>
      </div>
      {showReasonInput && (
        <div style={{ marginTop: 10 }}>
          <label>Pourquoi ?</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ marginLeft: 10, padding: 5, width: "60%" }}
          />
          <button
            style={{ ...btnStyle, marginLeft: 10 }}
            onClick={submitReason}
          >
            Valider
          </button>
        </div>
      )}
      <section style={{ marginTop: 20 }}>
        <h2 style={{ color: "#d48abf" }}>Historique des réponses</h2>
        {responses.length === 0 && <p>Aucune réponse pour l’instant.</p>}
        <ul>
          {responses.map((r) => (
            <li key={r.id}>
              <strong>{r.date} :</strong> {r.user_id} a répondu{" "}
              <em>{r.answer}</em>
              {r.reason ? ` — ${r.reason}` : ""}
            </li>
          ))}
        </ul>
      </section>
      <section style={{ marginTop: 20 }}>
        <h2 style={{ color: "#d48abf" }}>Événements</h2>
        <form onSubmit={addEvent}>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            style={{ padding: 5, marginRight: 10 }}
          />
          <input
            type="text"
            placeholder="Titre de l’événement"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            required
            style={{ padding: 5, marginRight: 10 }}
          />
          <button type="submit" style={btnStyle}>
            Ajouter
          </button>
        </form>
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              {e.date} – {e.title}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const btnStyle = {
  backgroundColor: "#ffeef8",
  border: "1px solid #ffb0d4",
  borderRadius: 6,
  padding: "0.5rem 1rem",
  marginRight: 8,
  cursor: "pointer",
};
