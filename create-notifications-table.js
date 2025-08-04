require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables d'environnement manquantes");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createNotificationsTable() {
  console.log("🔔 Création de la table notifications...");

  try {
    // SQL pour créer la table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Index pour les performances
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    `;

    // Exécuter le SQL
    const { error } = await supabase.rpc("exec_sql", { sql: createTableSQL });

    if (error) {
      console.log("⚠️ Impossible d'exécuter le SQL automatiquement");
      console.log(
        "📋 Veuillez exécuter ce SQL manuellement dans votre dashboard Supabase :"
      );
      console.log("\n" + createTableSQL + "\n");
    } else {
      console.log("✅ Table notifications créée avec succès");
    }

    // Tester l'insertion
    console.log("🧪 Test d'insertion...");
    const testData = {
      user_id: "test-user",
      message: "Test notification",
      type: "info",
    };

    const { data, error: insertError } = await supabase
      .from("notifications")
      .insert(testData)
      .select();

    if (insertError) {
      console.error("❌ Erreur lors du test d'insertion:", insertError);
      return;
    }

    console.log("✅ Test d'insertion réussi");

    // Nettoyer le test
    const { error: deleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", "test-user");

    if (deleteError) {
      console.log("⚠️ Impossible de nettoyer le test:", deleteError);
    } else {
      console.log("✅ Test nettoyé");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

createNotificationsTable();
