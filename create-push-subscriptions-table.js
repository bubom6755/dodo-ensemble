require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables d'environnement manquantes");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl);
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPushSubscriptionsTable() {
  console.log("🔧 Création/Vérification de la table push_subscriptions...");

  try {
    // SQL pour créer la table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        subscription JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Index pour les performances
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
      
      -- Trigger pour updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;
      CREATE TRIGGER update_push_subscriptions_updated_at
        BEFORE UPDATE ON push_subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
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
      console.log("✅ Table push_subscriptions créée/vérifiée avec succès");
    }

    // Tester l'insertion
    console.log("🧪 Test d'insertion...");
    const testData = {
      user_id: "test-user",
      subscription: {
        endpoint: "https://test.endpoint",
        keys: {
          p256dh: "test-key",
          auth: "test-auth",
        },
      },
    };

    const { data, error: insertError } = await supabase
      .from("push_subscriptions")
      .insert(testData)
      .select();

    if (insertError) {
      console.error("❌ Erreur lors du test d'insertion:", insertError);
      return;
    }

    console.log("✅ Test d'insertion réussi");

    // Nettoyer le test
    const { error: deleteError } = await supabase
      .from("push_subscriptions")
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

createPushSubscriptionsTable();
