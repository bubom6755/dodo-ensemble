import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// VAPID keys
const VAPID_PUBLIC_KEY =
  "BInzKFIkdJ5js3aBJbZfpJ-JT7Yyqoj0QNMHt8hQLCyRiGUhEu3Al4WbVROXfUaQ02zZeL6RO4UuaMP2lLYbiGA";
const VAPID_PRIVATE_KEY = "rtfNQU4_zsaJVLRIpEtoCM6p9Jyvv_BtEwGtH0gRxcQ";

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🔔 Vérification des rappels d'événements...");

    // Récupérer tous les événements
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (eventsError) {
      console.error(
        "Erreur lors de la récupération des événements:",
        eventsError
      );
      return res.status(500).json({ error: "Erreur base de données" });
    }

    // Récupérer toutes les subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (subsError) {
      console.error(
        "Erreur lors de la récupération des subscriptions:",
        subsError
      );
      return res.status(500).json({ error: "Erreur base de données" });
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    let notificationsSent = 0;

    for (const event of events) {
      const eventDate = new Date(event.date);
      const eventDateStr = event.date;

      // Notification la veille (si l'événement est demain)
      if (eventDateStr === tomorrowStr) {
        console.log(`📅 Rappel veille pour: ${event.title}`);

        const formattedDate = eventDate.toLocaleDateString("fr-FR", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

        // Envoyer à tous les utilisateurs
        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(
              sub.subscription,
              JSON.stringify({
                title: "Rappel événement demain !",
                body: `Demain ${formattedDate} : ${event.title}${
                  event.time ? ` à ${event.time}` : ""
                }`,
                icon: "/icon-192x192.png",
                badge: "/badge-72x72.png",
                tag: "event-reminder",
                data: {
                  url: "/",
                  eventId: event.id,
                },
              })
            );
            notificationsSent++;
            console.log(`✅ Notification veille envoyée à ${sub.user_id}`);
          } catch (error) {
            console.error(
              `❌ Erreur notification veille pour ${sub.user_id}:`,
              error
            );
          }
        }
      }

      // Notification 3h avant (si l'événement est aujourd'hui et a une heure)
      if (eventDateStr === todayStr && event.time) {
        const [hours, minutes] = event.time.split(":").map(Number);
        const eventTime = new Date(today);
        eventTime.setHours(hours, minutes, 0, 0);

        const threeHoursBefore = new Date(eventTime);
        threeHoursBefore.setHours(threeHoursBefore.getHours() - 3);

        const now = new Date();

        // Si on est dans la fenêtre de 3h avant (±30 minutes)
        if (Math.abs(now - threeHoursBefore) < 30 * 60 * 1000) {
          console.log(`⏰ Rappel 3h avant pour: ${event.title}`);

          // Envoyer à tous les utilisateurs
          for (const sub of subscriptions) {
            try {
              await webpush.sendNotification(
                sub.subscription,
                JSON.stringify({
                  title: "Événement dans 3h !",
                  body: `Dans 3h : ${event.title} à ${event.time}${
                    event.location ? ` - ${event.location}` : ""
                  }`,
                  icon: "/icon-192x192.png",
                  badge: "/badge-72x72.png",
                  tag: "event-reminder-3h",
                  data: {
                    url: "/",
                    eventId: event.id,
                  },
                })
              );
              notificationsSent++;
              console.log(`✅ Notification 3h envoyée à ${sub.user_id}`);
            } catch (error) {
              console.error(
                `❌ Erreur notification 3h pour ${sub.user_id}:`,
                error
              );
            }
          }
        }
      }
    }

    console.log(`✅ ${notificationsSent} notifications de rappel envoyées`);
    res.status(200).json({
      success: true,
      notificationsSent,
      message: `${notificationsSent} notifications de rappel envoyées`,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la vérification des rappels:", error);
    res.status(500).json({ error: error.message });
  }
}
