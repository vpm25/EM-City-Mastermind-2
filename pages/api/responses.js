import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("survey_responses").select("*").order("created_at", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === "POST") {
    const { lang, langName, flag, answers, question_id, participant_token } = req.body;
    if (!answers || !Array.isArray(answers)) return res.status(400).json({ error: "Invalid answers" });
    const { data, error } = await supabase
      .from("survey_responses")
      .insert([{ lang, lang_name: langName, flag, answers, question_id: question_id||null, participant_token: participant_token||null }])
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (id) {
      // Delete single response
      const { error } = await supabase.from("survey_responses").delete().eq("id", parseInt(id));
      if (error) return res.status(500).json({ error: error.message });
    } else {
      // Delete all responses
      const { error } = await supabase.from("survey_responses").delete().neq("id", 0);
      if (error) return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
