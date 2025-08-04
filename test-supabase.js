// Script de test pour vérifier la connexion Supabase
const { createClient } = require("@supabase/supabase-js");

// Vérifier les variables d'environnement
console.log("Vérification des variables d'environnement:");
console.log(
  "NEXT_PUBLIC_SUPABASE_URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL ? "Défini" : "Non défini"
);
console.log(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Défini" : "Non défini"
);

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.error("❌ Variables d'environnement Supabase manquantes!");
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Tester la connexion
async function testConnection() {
  try {
    console.log("\n🧪 Test de connexion à Supabase...");

    // Tester une requête simple
    const { data, error } = await supabase
      .from("weekly_plannings")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Erreur de connexion:", error);
    } else {
      console.log("✅ Connexion réussie!");
      console.log("📊 Données reçues:", data);
    }
  } catch (err) {
    console.error("❌ Erreur inattendue:", err);
  }
}

testConnection();
