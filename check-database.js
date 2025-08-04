// Script pour vérifier et créer la table push_subscriptions
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

// Vérifier les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables d'environnement manquantes:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error("   NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅" : "❌");
  console.error(
    "\n💡 Mettez à jour le fichier .env.local avec vos vraies clés Supabase"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log("🔍 Vérification de la base de données...");
  console.log("📡 URL Supabase:", supabaseUrl);

  try {
    // 1. Tester la connexion
    console.log("\n1. Test de connexion...");
    const { data: testData, error: testError } = await supabase
      .from("push_subscriptions")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ Erreur de connexion:", testError.message);

      // Si l'erreur indique que la table n'existe pas, on la crée
      if (
        testError.message.includes("relation") &&
        testError.message.includes("does not exist")
      ) {
        console.log(
          "\n📋 La table push_subscriptions n'existe pas. Création..."
        );

        // Note: La création de table nécessite des permissions admin
        // Vous devrez exécuter ce SQL manuellement dans votre dashboard Supabase
        console.log("\n🔧 Exécutez ce SQL dans votre dashboard Supabase :");
        console.log(`
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
        `);

        return;
      }
      return;
    }

    console.log("✅ Connexion à Supabase OK");

    // 2. Vérifier la structure de la table
    console.log("\n2. Vérification de la structure de la table...");
    let columns = null;
    let columnsError = null;
    try {
      const result = await supabase.rpc("get_table_columns", {
        table_name: "push_subscriptions",
      });
      columns = result.data;
      columnsError = result.error;
    } catch (error) {
      columnsError = { message: "Fonction non disponible" };
    }

    if (columnsError) {
      console.log("ℹ️  Impossible de vérifier la structure automatiquement");
      console.log("📋 Vérifiez manuellement que votre table a ces colonnes :");
      console.log("   - id (UUID, PRIMARY KEY)");
      console.log("   - user_id (TEXT, NOT NULL)");
      console.log("   - subscription (JSONB, NOT NULL)");
      console.log("   - created_at (TIMESTAMP WITH TIME ZONE)");
      console.log("   - updated_at (TIMESTAMP WITH TIME ZONE)");
    } else {
      console.log("✅ Structure de la table vérifiée");
    }

    // 3. Compter les abonnements existants
    console.log("\n3. Abonnements existants...");
    const { count, error: countError } = await supabase
      .from("push_subscriptions")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Erreur lors du comptage:", countError);
    } else {
      console.log(`✅ ${count} abonnement(s) trouvé(s)`);
    }

    // 4. Lister les tables existantes
    console.log("\n4. Tables existantes dans la base...");
    let tables = null;
    let tablesError = null;
    try {
      const result = await supabase.rpc("get_tables");
      tables = result.data;
      tablesError = result.error;
    } catch (error) {
      tablesError = { message: "Fonction non disponible" };
    }

    if (tablesError) {
      console.log("ℹ️  Impossible de lister les tables automatiquement");
    } else {
      console.log("📋 Tables trouvées :");
      tables.forEach((table) => {
        console.log(`   - ${table.table_name}`);
      });
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);
  }
}

// Exécuter la vérification
checkDatabase();
