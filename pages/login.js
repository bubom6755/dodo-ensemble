import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [userId, setUserId] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Si déjà connecté, redirige vers la page principale
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userId");
      if (stored && stored.trim() !== "") {
        router.replace("/");
      }
    }
  }, [router]);

  function handleSubmit(e) {
    e.preventDefault();
    if (userId.trim() !== "") {
      localStorage.setItem("userId", userId.trim());
      router.replace("/");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff0fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 16px #ffd6ef55",
          padding: 32,
          minWidth: 320,
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#d0488f", marginBottom: 24 }}>Connexion</h1>
        <input
          type="text"
          placeholder="Identifiant (ex: victor)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ffd6ef",
            fontSize: 16,
            width: "100%",
            marginBottom: 18,
            background: "#fff8fc",
          }}
          autoFocus
        />
        <button
          type="submit"
          style={{
            background: "#ffeef8",
            color: "#d0488f",
            border: "1px solid #ffb0d4",
            borderRadius: 8,
            padding: "0.7rem 2rem",
            fontWeight: 600,
            fontSize: 17,
            cursor: "pointer",
          }}
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
