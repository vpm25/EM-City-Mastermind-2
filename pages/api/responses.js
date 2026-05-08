import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // ── GET: list all responses (admin view) ──────────────────────
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("survey_responses")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ── POST: save responses from a participant ──────────────────
  // Two modes:
  //   A) Multi-question submit (preferred for events with form-style UX):
  //      body = { lang, langName, flag, participant_token, items: [{question_id, question_text, answer}, ...] }
  //      Inserts one row per item with the same participant_token.
  //   B) Single-question (legacy, still supported):
  //      body = { lang, langName, flag, answers, question_id, question_text, participant_token }
  if (req.method === "POST") {
    const {
      lang,
      langName,
      flag,
      participant_token,
      // Multi-question mode:
      items,
      // Legacy single-question mode:
      answers,
      question_id,
      question_text,
    } = req.body || {};

    if (!lang) return res.status(400).json({ error: "Missing lang" });

    // ── Mode A: multi-question (items array) ────────────────────
    if (Array.isArray(items) && items.length > 0) {
      const rows = items
        .filter(it => it && (it.answer || "").toString().trim()) // skip empty answers
        .map(it => ({
          lang,
          lang_name: langName,
          flag,
          answers: [it.answer],
          question_id: it.question_id ?? null,
          question_text: it.question_text ?? null,
          participant_token: participant_token ?? null,
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
      }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // ── DELETE: by id, by participant_token, or all ───────────────
  if (req.method === "DELETE") {
    const { id, participant_token } = req.query;

    if (id) {
      const { error } = await supabase
        .from("survey_responses")
        .delete()
        .eq("id", id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (participant_token) {
      const { error } = await supabase
        .from("survey_responses")
        .delete()
        .eq("participant_token", participant_token);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    const { error } = await supabase
      .from("survey_responses")
      .delete()
      .neq("id", 0);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
