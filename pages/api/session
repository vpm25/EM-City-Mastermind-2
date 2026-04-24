import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("session_state").select("*").eq("id", 1).single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === "POST") {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from("session_state").update(updates).eq("id", 1).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  return res.status(405).json({ error: "Method not allowed" });
}
