import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // ── GET: list all sessions + which one is active ────────────
  if (req.method === "GET") {
    const { data: sessions, error: sErr } = await supabase
      .from("survey_sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (sErr) return res.status(500).json({ error: sErr.message });

    const { data: state } = await supabase
      .from("session_state")
      .select("active_session_id")
      .eq("id", 1)
      .single();

    return res.status(200).json({
      sessions: sessions || [],
      activeSessionId: state?.active_session_id || null,
    });
  }

  // ── POST: create a new session OR switch active session ─────
  if (req.method === "POST") {
    const { action, name, sessionId } = req.body || {};

    // Create a new session (and switch to it automatically)
    if (action === "create") {
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Name is required" });
      }
      const { data, error } = await supabase
        .from("survey_sessions")
        .insert([{ name: name.trim() }])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });

      // Make the new session active. Also reset session_open, current_question_id,
      // and all live_* fields so the new session starts in a clean state.
      // (Otherwise a stale presentation from the previous session would show on /live.)
      await supabase
        .from("session_state")
        .update({
          active_session_id: data.id,
          session_open: false,
          current_question_id: null,
          live_mode: "counter",
          live_slide_idx: 0,
          live_slides: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      return res.status(200).json({ ok: true, session: data });
    }

    // Switch to an existing session
    if (action === "switch") {
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
      }
      const { error } = await supabase
        .from("session_state")
        .update({
          active_session_id: sessionId,
          // Reset open state AND clear any stale presentation pushed to /live
          // by the previous session — otherwise /live would still show the old
          // event's slides.
          session_open: false,
          current_question_id: null,
          live_mode: "counter",
          live_slide_idx: 0,
          live_slides: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    // Rename a session
    if (action === "rename") {
      if (!sessionId || !name) {
        return res.status(400).json({ error: "sessionId and name are required" });
      }
      const { error } = await supabase
        .from("survey_sessions")
        .update({ name: name.trim() })
        .eq("id", sessionId);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  // ── DELETE: remove a session and all its data ───────────────
  // CAREFUL: this cascade-deletes all questions and responses tied to it.
  if (req.method === "DELETE") {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: "sessionId is required" });

    // Don't allow deleting the active session
    const { data: state } = await supabase
      .from("session_state")
      .select("active_session_id")
      .eq("id", 1)
      .single();
    if (state?.active_session_id === parseInt(sessionId, 10)) {
      return res.status(400).json({ error: "Cannot delete the active session. Switch first." });
    }

    const { error } = await supabase
      .from("survey_sessions")
      .delete()
      .eq("id", sessionId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
