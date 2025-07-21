import { createClient } from "@supabase/supabase-js";

const VAPID_PUBLIC_KEY =
  "BInzKFIkdJ5js3aBJbZfpJ-JT7Yyqoj0QNMHt8hQLCyRiGUhEu3Al4WbVROXfUaQ02zZeL6RO4UuaMP2lLYbiGA"; // Remplace par ta clé publique
const VAPID_PRIVATE_KEY = "rtfNQU4_zsaJVLRIpEtoCM6p9Jyvv_BtEwGtH0gRxcQ"; // Remplace par ta clé privée

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Import dynamique de web-push pour éviter l'erreur de build Next.js
  const webpush = (await import("web-push")).default;

  webpush.setVapidDetails(
    "mailto:victor.wambersie@gmail.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  if (req.method !== "POST") return res.status(405).end();
  const { userId, title, body } = req.body;
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", userId)
    .single();
  if (error || !data) return res.status(404).json({ error: "No subscription" });
  try {
    await webpush.sendNotification(
      data.subscription,
      JSON.stringify({ title, body })
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
