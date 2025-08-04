import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { subscription, userId } = req.body;
  if (!subscription || !userId) {
    console.error("Missing data:", {
      subscription: !!subscription,
      userId: !!userId,
    });
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    // Upsert pour éviter les doublons
    const { data, error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        subscription,
      },
      { onConflict: ["user_id"] }
    );

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("Subscription saved successfully for user:", userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: error.message });
  }
}
