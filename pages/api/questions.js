import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("survey_questions").select("*").order("sort_order", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === "POST") {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions)) return res.status(400).json({ error: "Invalid questions" });
    await supabase.from("survey_questions").delete().neq("id", 0);
    const rows = questions.map((q, i) => ({
      en: q.en, zh: q.zh||q.en, ja: q.ja||q.en, ko: q.ko||q.en,
      th: q.th||q.en, vi: q.vi||q.en, id_lang: q.id||q.en, fil: q.fil||q.en,
      active: q.active !== false, sort_order: i,
    }));
    const { data, error } = await supabase.from("survey_questions").insert(rows).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  return res.status(405).json({ error: "Method not allowed" });
}
