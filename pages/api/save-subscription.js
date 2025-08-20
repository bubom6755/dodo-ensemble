import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  console.log("📥 Requête reçue pour sauvegarder subscription");

  const { subscription, userId } = req.body;

  console.log("📋 Données reçues:", {
    hasSubscription: !!subscription,
    hasUserId: !!userId,
    userId: userId,
    subscriptionKeys: subscription ? Object.keys(subscription) : null,
  });

  if (!subscription || !userId) {
    console.error("❌ Données manquantes:", {
      subscription: !!subscription,
      userId: !!userId,
    });
    return res.status(400).json({ error: "Données manquantes" });
  }

  try {
    console.log("💾 Tentative de sauvegarde en base...");

    // Préparer les données
    const subscriptionData = {
      user_id: userId,
      subscription: subscription,
    };

    console.log("📊 Données à insérer:", {
      user_id: subscriptionData.user_id,
      subscription_endpoint: subscriptionData.subscription?.endpoint
        ? "Présent"
        : "Manquant",
      subscription_keys: subscriptionData.subscription?.keys
        ? "Présents"
        : "Manquants",
    });

    // Upsert pour éviter les doublons
    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert(subscriptionData, {
        onConflict: "user_id",
      })
      .select();

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      return res.status(500).json({
        error: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    console.log(
      "✅ Subscription sauvegardée avec succès pour l'utilisateur:",
      userId
    );
    console.log("📊 Données retournées:", data);

    res.status(200).json({
      success: true,
      data,
      message: "Subscription sauvegardée avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur inattendue:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
}
