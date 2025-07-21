import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { subscription, userId } = req.body;
  if (!subscription || !userId)
    return res.status(400).json({ error: "Missing data" });
  // Upsert pour éviter les doublons
  await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      subscription,
    },
    { onConflict: ["user_id"] }
  );
  res.status(200).json({ success: true });
}
