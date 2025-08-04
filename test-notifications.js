// Script de test pour les notifications push
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

// Vérifier les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables d'environnement manquantes:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error("   NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅" : "❌");
  console.error("\n💡 Créez un fichier .env.local avec vos clés Supabase");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotifications() {
  console.log("🔍 Test des notifications push...");
  console.log("📡 URL Supabase:", supabaseUrl);

  try {
    // 1. Vérifier la connexion à Supabase
    console.log("\n1. Test de connexion à Supabase...");
    const { data: testData, error: testError } = await supabase
      .from("push_subscriptions")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ Erreur de connexion à Supabase:", testError);
      return;
    }
    console.log("✅ Connexion à Supabase OK");

    // 2. Lister les abonnements existants
    console.log("\n2. Abonnements existants:");
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (subError) {
      console.error(
        "❌ Erreur lors de la récupération des abonnements:",
        subError
      );
      return;
    }

    if (subscriptions.length === 0) {
      console.log("⚠️  Aucun abonnement trouvé");
      console.log(
        "💡 Pour tester, activez les notifications dans l'application"
      );
    } else {
      console.log(`✅ ${subscriptions.length} abonnement(s) trouvé(s):`);
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. User ID: ${sub.user_id}`);
        console.log(
          `      Subscription: ${JSON.stringify(sub.subscription).substring(
            0,
            100
          )}...`
        );
      });
    }

    // 3. Tester l'envoi d'une notification (si des abonnements existent)
    if (subscriptions.length > 0) {
      console.log("\n3. Test d'envoi de notification...");
      const testUserId = subscriptions[0].user_id;

      const response = await fetch("http://localhost:3000/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: testUserId,
          title: "Test Notification",
          body: "Ceci est un test de notification push ! 🎉",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Notification envoyée avec succès");
      } else {
        console.error("❌ Erreur lors de l'envoi:", result);
      }
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Exécuter le test
testNotifications();
