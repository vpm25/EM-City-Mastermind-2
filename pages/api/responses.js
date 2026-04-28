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

  // ── POST: save a new response from a participant ──────────────
  if (req.method === "POST") {
    const {
      lang,
      langName,
      flag,
      answers,
      question_id,
      question_text, // ← snapshot of question wording when answered
      participant_token,
    } = req.body || {};
    if (!lang || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Missing lang or answers" });
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

    // Delete a single response
    if (id) {
      const { error } = await supabase
        .from("survey_responses")
        .delete()
        .eq("id", id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    // Delete all responses from a single participant
    if (participant_token) {
      const { error } = await supabase
        .from("survey_responses")
        .delete()
        .eq("participant_token", participant_token);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    // Delete ALL responses
    const { error } = await supabase
      .from("survey_responses")
      .delete()
      .neq("id", 0);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
