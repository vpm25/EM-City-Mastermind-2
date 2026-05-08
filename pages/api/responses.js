import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getActiveSessionId() {
  const { data } = await supabase
    .from("session_state")
    .select("active_session_id")
    .eq("id", 1)
    .single();
  return data?.active_session_id || null;
}

export default async function handler(req, res) {
  // ── GET: list responses for the active session ──────────────
  if (req.method === "GET") {
    const activeId = await getActiveSessionId();
    let query = supabase
      .from("survey_responses")
      .select("*")
      .order("created_at", { ascending: true });
    if (activeId) {
      query = query.eq("session_id", activeId);
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ── POST: save responses from a participant ──────────────────
  // Two modes:
  //   A) Multi-question submit (preferred for events with form-style UX):
  //      body = { lang, langName, flag, participant_token, items: [{question_id, question_text, answer}, ...] }
  //   B) Single-question (legacy, still supported):
  //      body = { lang, langName, flag, answers, question_id, question_text, participant_token }
  if (req.method === "POST") {
    const {
      lang, langName, flag, participant_token,
      items, // multi
      answers, question_id, question_text, // legacy
    } = req.body || {};

    if (!lang) return res.status(400).json({ error: "Missing lang" });

    const activeId = await getActiveSessionId();

    // ── Mode A: multi-question (items array) ────────────────────
    if (Array.isArray(items) && items.length > 0) {
      const rows = items
        .filter(it => it && (it.answer || "").toString().trim())
        .map(it => ({
          lang,
          lang_name: langName,
          flag,
          answers: [it.answer],
          question_id: it.question_id ?? null,
          question_text: it.question_text ?? null,
          participant_token: participant_token ?? null,
          session_id: activeId,
        }));

      if (rows.length === 0) {
        return res.status(400).json({ error: "All items were empty" });
      }

      const { data, error } = await supabase
        .from("survey_responses")
        .insert(rows)
        .select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, inserted: data.length, rows: data });
    }

    // ── Mode B: legacy single-question ──────────────────────────
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "Missing answers or items" });
    }
    const { data, error } = await supabase
      .from("survey_responses")
      .insert([{
        lang,
        lang_name: langName,
        flag,
        answers,
        question_id: question_id ?? null,
        question_text: question_text ?? null,
        participant_token: participant_token ?? null,
        session_id: activeId,
      }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ── DELETE: by id, by participant_token, or all (within active session) ───
  if (req.method === "DELETE") {
    const { id, participant_token } = req.query;
    const activeId = await getActiveSessionId();

    if (id) {
      const { error } = await supabase
        .from("survey_responses")
        .delete()
        .eq("id", id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (participant_token) {
      let q = supabase.from("survey_responses").delete().eq("participant_token", participant_token);
      if (activeId) q = q.eq("session_id", activeId);
      const { error } = await q;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    // Delete ALL responses — ONLY within the active session, never across sessions
    let q = supabase.from("survey_responses").delete().neq("id", 0);
    if (activeId) q = q.eq("session_id", activeId);
    const { error } = await q;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
