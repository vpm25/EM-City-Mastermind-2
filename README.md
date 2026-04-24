// pages/api/responses.js
// Handles saving and fetching survey responses from Supabase

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {

  // GET — fetch all responses
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST — save a new response
  if (req.method === 'POST') {
    const { lang, langName, flag, answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }

    const { data, error } = await supabase
      .from('survey_responses')
      .insert([{ lang, lang_name: langName, flag, answers }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  // DELETE — clear all responses (admin only)
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('survey_responses')
      .delete()
      .neq('id', 0); // delete all

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
