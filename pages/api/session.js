import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // ── GET: read the current session state ─────────────────────
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("session_state")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) {
      // If row doesn't exist yet, return defaults
      return res.status(200).json({
        session_open: false,
        current_question_id: null,
        questions_shown: [],
        active_session_id: null,
      });
    }
    return res.status(200).json(data || {});
  }

  // ── POST: update the current session state ──────────────────
  // Accepts any subset of:
  //   session_open, current_question_id, session_started_at,
  //   session_ended_at, questions_shown, active_session_id
  if (req.method === "POST") {
    const body = req.body || {};
    const updates = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("session_state")
      .update(updates)
      .eq("id", 1)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
