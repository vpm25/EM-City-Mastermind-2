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
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });

    // Map DB column "id_lang" back to the JS field "idLang" the frontend expects
    const mapped = (data || []).map(r => ({
      id: r.id,
      en: r.en,
      zh: r.zh,
      ja: r.ja,
      ko: r.ko,
      th: r.th,
      vi: r.vi,
      idLang: r.id_lang, // ← frontend uses idLang for Indonesian
      fil: r.fil,
      active: r.active,
      sort_order: r.sort_order,
    }));
    return res.status(200).json(mapped);
  }

  // ── POST: save the full set of questions ──────────────────────
  // Strategy: UPSERT existing rows by id, then delete any rows that
  // are no longer in the payload. This preserves question IDs across
  // edits, which keeps survey_responses.question_id valid forever.
  if (req.method === "POST") {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid questions" });
    }

    // Split incoming rows: existing (numeric id) vs new (no id or non-numeric placeholder)
    const incomingIds = [];
    const toUpsert = [];
    const toInsert = [];

    questions.forEach((q, i) => {
      const row = {
        en:       q.en || "",
        zh:       q.zh     || q.en || "",
        ja:       q.ja     || q.en || "",
        ko:       q.ko     || q.en || "",
        th:       q.th     || q.en || "",
        vi:       q.vi     || q.en || "",
        id_lang:  q.idLang || q.en || "",  // ← read from idLang (NOT q.id!)
        fil:      q.fil    || q.en || "",
        active:   q.active !== false,
        sort_order: i,
      };

      // A real DB id is a number (Postgres SERIAL). Anything else (including the
      // Date.now() placeholders the frontend uses for new questions) is treated as
      // a brand-new row and gets a fresh DB-assigned id.
      if (typeof q.id === "number" && q.id < 2147483647 && q.id > 0 && q.id < 1000000) {
        // Looks like a real DB id (small integer, not Date.now())
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

      // 3. Delete rows that are no longer present in the incoming list
      //    (admin removed them in the UI)
      const keepIds = [...incomingIds, ...inserted.map(r => r.id)];
      if (keepIds.length) {
        const { error: delErr } = await supabase
          .from("survey_questions")
          .delete()
          .not("id", "in", `(${keepIds.join(",")})`);
        if (delErr) throw delErr;
      } else {
        // Nothing to keep → wipe the table
        const { error: delErr } = await supabase
          .from("survey_questions")
          .delete()
          .neq("id", 0);
        if (delErr) throw delErr;
      }

      // Return the latest state
      const { data, error } = await supabase
        .from("survey_questions")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;

      const mapped = (data || []).map(r => ({
        id: r.id, en: r.en, zh: r.zh, ja: r.ja, ko: r.ko,
        th: r.th, vi: r.vi, idLang: r.id_lang, fil: r.fil,
        active: r.active, sort_order: r.sort_order,
      }));
      return res.status(200).json(mapped);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
