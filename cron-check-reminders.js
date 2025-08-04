require("dotenv").config({ path: ".env.local" });

async function checkEventReminders() {
  try {
    console.log("🔔 Vérification automatique des rappels d'événements...");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(
        "https://",
        "http://localhost:3000"
      )}/api/check-event-reminders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ ${result.message}`);
    } else {
      console.error(`❌ Erreur: ${result.error}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error.message);
  }
}

// Exécuter immédiatement
checkEventReminders();

// Pour un vrai cron job, vous pouvez utiliser :
// - Vercel Cron Jobs (si déployé sur Vercel)
// - GitHub Actions
// - Un serveur avec cron
// - Un service comme cron-job.org

console.log("📋 Pour automatiser, ajoutez ceci à votre crontab :");
console.log("*/30 * * * * node /chemin/vers/cron-check-reminders.js");
console.log("(Vérifie toutes les 30 minutes)");
