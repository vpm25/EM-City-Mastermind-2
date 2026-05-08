import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper: find the currently active session id from session_state.
async function getActiveSessionId() {
  const { data } = await supabase
    .from("session_state")
    .select("active_session_id")
    .eq("id", 1)
    .single();
  return data?.active_session_id || null;
}

export default async function handler(req, res) {
  // ── GET: list all questions for the active session ────────────
  if (req.method === "GET") {
    const activeId = await getActiveSessionId();
    let query = supabase
      .from("survey_questions")
      .select("id, en, translations, active, sort_order, analysis_instruction, session_id")
      .order("sort_order", { ascending: true });
    // Filter by active session if one is set; if none, return all (for migration safety)
    if (activeId) {
      query = query.eq("session_id", activeId);
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  // ── POST: save the full set of questions for the active session ──
  if (req.method === "POST") {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid questions" });
    }

    const activeId = await getActiveSessionId();

    const incomingIds = [];
    const toUpsert = [];
    const toInsert = [];

    questions.forEach((q, i) => {
      const row = {
        en: q.en || "",
        translations: q.translations || {},
        active: q.active !== false,
        sort_order: i,
        analysis_instruction: q.analysisInstruction || null,
        session_id: activeId,
      };

      if (typeof q.id === "number" && q.id > 0 && q.id < 1000000) {
        row.id = q.id;
        incomingIds.push(q.id);
        toUpsert.push(row);
      } else {
        toInsert.push(row);
      }
    });

    try {
      // 1. Upsert existing rows
      if (toUpsert.length) {
        const { error: upErr } = await supabase
          .from("survey_questions")
          .upsert(toUpsert, { onConflict: "id" });
        if (upErr) throw upErr;
      }

      // 2. Insert new rows
      let inserted = [];
      if (toInsert.length) {
        const { data: insData, error: insErr } = await supabase
          .from("survey_questions")
          .insert(toInsert)
          .select();
        if (insErr) throw insErr;
        inserted = insData || [];
      }

      // 3. Delete removed rows — ONLY within the active session, never across sessions
      const keepIds = [...incomingIds, ...inserted.map(r => r.id)];
      let deleteQuery = supabase.from("survey_questions").delete();
      if (activeId) {
        deleteQuery = deleteQuery.eq("session_id", activeId);
      }
      if (keepIds.length) {
        deleteQuery = deleteQuery.not("id", "in", `(${keepIds.join(",")})`);
      } else {
        deleteQuery = deleteQuery.neq("id", 0); // delete all in this session if list is empty
      }
      const { error: delErr } = await deleteQuery;
      if (delErr) throw delErr;

      // Return the latest state for the active session
      let finalQuery = supabase
        .from("survey_questions")
        .select("id, en, translations, active, sort_order, analysis_instruction, session_id")
        .order("sort_order", { ascending: true });
      if (activeId) finalQuery = finalQuery.eq("session_id", activeId);
      const { data, error } = await finalQuery;
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
