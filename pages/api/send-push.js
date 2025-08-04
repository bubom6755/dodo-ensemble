import { createClient } from "@supabase/supabase-js";
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from "../../utils/vapid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ status: "GET ok", method: req.method });
  }
  if (req.method !== "POST") return res.status(405).end();

  let webpush;
  try {
    webpush = (await import("web-push")).default;
    if (!webpush) throw new Error("web-push.default is undefined");
    console.log("web-push importé");
  } catch (e) {
    console.error("Erreur import web-push", e);
    return res
      .status(500)
      .json({ error: "web-push import failed", details: e.message });
  }

  try {
    webpush.setVapidDetails(
      "mailto:victor.wambersie@gmail.com",
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    console.log("VAPID details set");
  } catch (e) {
    console.error("Erreur setVapidDetails", e);
    return res
      .status(500)
      .json({ error: "setVapidDetails failed", details: e.message });
  }

  const { userId, title, body } = req.body;

  if (!userId || !title || !body) {
    console.error("Missing required fields:", {
      userId: !!userId,
      title: !!title,
      body: !!body,
    });
    return res.status(400).json({ error: "Missing required fields" });
  }

  let data, error;
  try {
    const result = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId)
      .single();
    data = result.data;
    error = result.error;
    if (error || !data) {
      console.error("No subscription found for user:", userId, error);
      return res
        .status(404)
        .json({ error: "No subscription found", details: error });
    }
    console.log("Subscription found for user:", userId);
  } catch (e) {
    console.error("Database error:", e);
    return res
      .status(500)
      .json({ error: "Database error", details: e.message });
  }

  try {
    await webpush.sendNotification(
      data.subscription,
      JSON.stringify({ title, body })
    );
    console.log("Notification envoyée");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur sendNotification", err);
    res.status(500).json({ error: err.message });
  }
}
