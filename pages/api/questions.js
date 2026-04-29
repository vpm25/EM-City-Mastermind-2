import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // ── GET: list all questions ───────────────────────────────────
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("survey_questions")
      .select("id, en, translations, active, sort_order")
      .order("sort_order", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  // ── POST: save the full set of questions ──────────────────────
  // Strategy: UPSERT existing rows by id, then delete rows no longer present.
  // This preserves question IDs across edits, which keeps survey_responses.question_id valid forever.
  if (req.method === "POST") {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid questions" });
    }

    const incomingIds = [];
    const toUpsert = [];
    const toInsert = [];

    questions.forEach((q, i) => {
      const row = {
        en: q.en || "",
        translations: q.translations || {}, // JSONB — stores all language translations
        active: q.active !== false,
        sort_order: i,
      };

      // A real DB id is a small integer (Postgres SERIAL). Anything else
      // (Date.now() placeholders, etc.) means it's a new row needing a fresh id.
      if (typeof q.id === "number" && q.id > 0 && q.id < 1000000) {
        row.id = q.id;
        incomingIds.push(q.id);
        toUpsert.push(row);
      } else {
        toInsert.push(row);
      }
    });

    try {
      // 1. Upsert existing rows (preserves their ids)
      if (toUpsert.length) {
        const { error: upErr } = await supabase
          .from("survey_questions")
          .upsert(toUpsert, { onConflict: "id" });
        if (upErr) throw upErr;
      }

      // 2. Insert brand-new rows (DB assigns ids)
      let inserted = [];
      if (toInsert.length) {
        const { data: insData, error: insErr } = await supabase
          .from("survey_questions")
          .insert(toInsert)
          .select();
        if (insErr) throw insErr;
        inserted = insData || [];
      }

      // 3. Delete rows that were removed in the UI
      const keepIds = [...incomingIds, ...inserted.map(r => r.id)];
      if (keepIds.length) {
        const { error: delErr } = await supabase
          .from("survey_questions")
          .delete()
          .not("id", "in", `(${keepIds.join(",")})`);
        if (delErr) throw delErr;
      } else {
        const { error: delErr } = await supabase
          .from("survey_questions")
          .delete()
          .neq("id", 0);
        if (delErr) throw delErr;
      }

      // Return the latest state
      const { data, error } = await supabase
        .from("survey_questions")
        .select("id, en, translations, active, sort_order")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
