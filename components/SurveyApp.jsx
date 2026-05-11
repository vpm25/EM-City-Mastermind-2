import { useState, useEffect, useRef } from "react";

const LANGS = [
  { code:"en", name:"English",      full:"English",      flag:"🇬🇧" },
  { code:"ru", name:"Русский",      full:"Russian",      flag:"🇷🇺" },
  { code:"kk", name:"Қазақша",       full:"Kazakh",       flag:"🇰🇿" },
  { code:"uz", name:"Oʻzbekcha",     full:"Uzbek",        flag:"🇺🇿" },
  { code:"mn", name:"Монгол",        full:"Mongolian",    flag:"🇲🇳" },
  { code:"ka", name:"ქართული",      full:"Georgian",     flag:"🇬🇪" },
  { code:"hy", name:"Հայերեն",       full:"Armenian",     flag:"🇦🇲" },
  { code:"az", name:"Azərbaycan",    full:"Azerbaijani",  flag:"🇦🇿" },
];

// Default empty — admin will create questions through the UI before the event.
const DEFAULT_QS = [];

const UI = {
  en: { next:"Next",       submit:"Submit",   ph:"Share your thoughts here...",     thanks:"Thank you!",          saved:"Your response has been recorded.", newP:"New Participant",  q:"Question" },
  ru: { next:"Далее",      submit:"Отправить", ph:"Поделитесь своими мыслями...",    thanks:"Спасибо!",            saved:"Ваш ответ записан.",                newP:"Новый участник",   q:"Вопрос" },
  kk: { next:"Келесі",     submit:"Жіберу",    ph:"Ойларыңызбен бөлісіңіз...",       thanks:"Рахмет!",             saved:"Жауабыңыз тіркелді.",               newP:"Жаңа қатысушы",    q:"Сұрақ" },
  uz: { next:"Keyingi",    submit:"Yuborish",  ph:"Fikrlaringiz bilan bo'lishing...", thanks:"Rahmat!",             saved:"Javobingiz qayd etildi.",           newP:"Yangi ishtirokchi", q:"Savol" },
  mn: { next:"Дараах",     submit:"Илгээх",    ph:"Бодлоо энд хуваалцаарай...",       thanks:"Баярлалаа!",          saved:"Таны хариу бүртгэгдлээ.",           newP:"Шинэ оролцогч",    q:"Асуулт" },
  ka: { next:"შემდეგი",   submit:"გაგზავნა",   ph:"გააზიარეთ თქვენი აზრები...",      thanks:"გმადლობთ!",            saved:"თქვენი პასუხი ჩაიწერა.",            newP:"ახალი მონაწილე",  q:"კითხვა" },
  hy: { next:"Հաջորդը",   submit:"Ուղարկել",   ph:"Կիսվեք ձեր մտքերով...",          thanks:"Շնորհակալություն!",   saved:"Ձեր պատասխանը գրանցված է.",         newP:"Նոր մասնակից",     q:"Հարց" },
  az: { next:"Növbəti",    submit:"Göndər",    ph:"Fikirlərinizi bölüşün...",        thanks:"Təşəkkür edirik!",    saved:"Cavabınız qeydə alındı.",           newP:"Yeni iştirakçı",   q:"Sual" },
};

const COLORS = [
  "linear-gradient(135deg,#1a6b3a,#2e8b57)",
  "linear-gradient(135deg,#145a32,#1e8449)",
  "linear-gradient(135deg,#0b5345,#148f77)",
  "linear-gradient(135deg,#1d6a2a,#27ae60)",
  "linear-gradient(135deg,#0e6655,#1abc9c)",
  "linear-gradient(135deg,#145a32,#229954)",
  "linear-gradient(135deg,#1b6b3a,#239b56)",
];

const G = "#27ae60";
const DG = "#1a6b3a";
const LG = "#f0faf4";
const BD = "#d5ede0";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body,button,input,textarea{font-family:'Plus Jakarta Sans',sans-serif;}
.app{min-height:100vh;background:#f0faf4;color:#1a3a26;}
.center{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;background:linear-gradient(160deg,#e8f8ee,#f0faf4);}
.lb:hover{border-color:#27ae60!important;transform:translateY(-2px)!important;box-shadow:0 6px 20px rgba(39,174,96,.12)!important;}
.nb:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(39,174,96,.4)!important;}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.fade{animation:fadeUp .3s ease;}
`;

function Btn({ children, onClick, disabled, style={}, outline=false }) {
  const base = {
    padding:"14px 24px", borderRadius:"10px", fontWeight:"700", fontSize:"14px",
    cursor:disabled?"not-allowed":"pointer", border:"none", transition:"all .2s",
    opacity:disabled?0.4:1,
    background:outline?"#fff":`linear-gradient(135deg,${DG},${G})`,
    color:outline?DG:"#fff",
    border:outline?`2px solid ${BD}`:"none",
    boxShadow:outline?"none":"0 4px 15px rgba(39,174,96,.25)",
    ...style,
  };
  return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>;
}

function SmallBtn({ children, onClick, disabled, color="green" }) {
  const colors = {
    green:  { bg:"#f0faf4", border:BD,     text:DG },
    red:    { bg:"#fff2f2", border:"#faa", text:"#c0392b" },
    white:  { bg:"#fff",    border:BD,     text:"#3a6a4a" },
    orange: { bg:"#fff8f0", border:"#fcc", text:"#c0620b" },
  };
  const c = colors[color] || colors.green;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:"6px 12px", borderRadius:"7px", fontSize:"11px", fontWeight:"700",
      cursor:disabled?"not-allowed":"pointer", border:`2px solid ${c.border}`,
      background:c.bg, color:c.text, opacity:disabled?.4:1, transition:"all .2s",
    }}>{children}</button>
  );
}

function Slide({ data, idx, total }) {
  return (
    <div style={{ background:COLORS[idx%COLORS.length], borderRadius:"16px", minHeight:"400px",
      display:"flex", flexDirection:"column", position:"relative", padding:"44px 48px",
      boxShadow:"0 8px 32px rgba(27,107,58,.2)" }}>
      <div style={{ display:"inline-block", fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase",
        fontWeight:"700", padding:"5px 14px", borderRadius:"20px", marginBottom:"16px",
        background:"rgba(255,255,255,.2)", color:"#fff", width:"fit-content" }}>{data.category}</div>
      <span style={{ fontSize:"40px", marginBottom:"14px", display:"block" }}>{data.icon}</span>
      <h2 style={{ fontSize:"26px", fontWeight:"800", color:"#fff", marginBottom:"18px", lineHeight:"1.25" }}>{data.title}</h2>
      <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"12px" }}>
        {(data.points || []).map((p,i) => (
          <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"10px",
            fontSize:"14px", color:"rgba(255,255,255,.9)", lineHeight:"1.65" }}>
            <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#fff",
              flexShrink:0,marginTop:"9px",display:"inline-block" }} />
            <span dangerouslySetInnerHTML={{__html: mdBold(p)}} />
          </li>
        ))}
      </ul>
      {data.takeaway && (
        <div style={{ marginTop:"22px", padding:"14px 18px", background:"rgba(255,255,255,.15)",
          borderRadius:"10px", borderLeft:"3px solid rgba(255,255,255,.6)",
          fontSize:"13px", color:"#fff", fontStyle:"italic", lineHeight:"1.55" }}
          dangerouslySetInnerHTML={{__html: mdBold(data.takeaway)}} />
      )}
      <span style={{ position:"absolute",bottom:"24px",right:"28px",fontSize:"10px",
        color:"rgba(255,255,255,.3)",fontWeight:"700" }}>{idx+1}/{total}</span>
    </div>
  );
}

// Tiny markdown helper: turns **bold text** into <strong> with extra emphasis.
// Also escapes HTML to prevent injection from AI output.
function mdBold(text) {
  if (text == null) return "";
  const escaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return escaped.replace(/\*\*(.+?)\*\*/g,
    '<strong style="color:#fff;font-weight:900">$1</strong>');
}

export default function App() {
  // Initial screen — detect /live URL for the projection display
  const [screen,      setScreen]      = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname || "";
      const hash = window.location.hash || "";
      if (path.endsWith("/live") || hash === "#live") return "live";
    }
    return "lang";
  });
  const [lang,        setLang]        = useState("en");
  const [qIdx,        setQIdx]        = useState(0);
  const [answers,     setAnswers]     = useState([]);
  const [responses,   setResponses]   = useState([]);
  const [tab,         setTab]         = useState("questions");
  const [questions,   setQuestions]   = useState(DEFAULT_QS);
  const [editQ,       setEditQ]       = useState(null);
  const [newQText,    setNewQText]    = useState("");
  const [translating, setTranslating] = useState(false);
  const [transErr,    setTransErr]    = useState("");
  const [expandedTrans, setExpandedTrans] = useState(new Set());
  const [expandedInstr, setExpandedInstr] = useState(new Set()); // qIds with instruction editor open
  const [instrDraft,    setInstrDraft]    = useState({});         // {qId: draftText}
  const [editingTrans,  setEditingTrans]  = useState({}); // {qId_langCode: text}
  const [retranslating, setRetranslating] = useState({}); // {qId_langCode: true}
  const [qSummaries,  setQSummaries]  = useState({});
  const [loadingSum,  setLoadingSum]  = useState(null);
  const [customOpen,    setCustomOpen]    = useState(new Set()); // qIds with ad-hoc editor open
  const [customDraft,   setCustomDraft]   = useState({});         // {qId: draftText}
  const [loadingCustom, setLoadingCustom] = useState(null);       // qId currently running
  const [copiedSum,   setCopiedSum]   = useState(null); // question id
  const [copiedRaw,   setCopiedRaw]   = useState(null); // question id
  const [collapsedQs, setCollapsedQs] = useState(new Set()); // qIds whose response list is collapsed
  const [slides,      setSlides]      = useState(null);
  const [loadingPres, setLoadingPres] = useState(false);
  const [onePager,    setOnePager]    = useState(null);   // strategic one-pager (markdown)
  const [loadingOnePager, setLoadingOnePager] = useState(false);
  const [slideIdx,    setSlideIdx]    = useState(0);
  const [hiddenSlides,setHiddenSlides]= useState(new Set());
  // ── Live presentation mode (push slides to /live screen) ──
  const [liveMode,     setLiveMode]     = useState("counter");  // 'counter' or 'presentation'
  const [liveSlideIdx, setLiveSlideIdx] = useState(0);
  const [liveSlides,   setLiveSlides]   = useState(null);       // slides currently pushed to /live
  const [pw,          setPw]          = useState("");
  const [pwErr,       setPwErr]       = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [csvDone,     setCsvDone]     = useState(false);
  const [sessionOpen, setSessionOpen]    = useState(false);
  const [currentQId,  setCurrentQId]     = useState(null);
  const [waitingNext, setWaitingNext]    = useState(false);
  const [sessionDone, setSessionDone]    = useState(false);
  const [participantToken, setParticipantToken] = useState(null);
  const [submitError, setSubmitError]    = useState(null); // ← surface failed submits to the user
  // ── Sessions (multi-event isolation) ──
  const [sessions,      setSessions]      = useState([]);   // [{id, name, created_at, ...}]
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const pollRefHandle = useRef(null);
  const answeredQIdRef = useRef(null);
  const sessionWasOpenRef = useRef(false);
  // Once a participant submits in form mode, this flag stays true so the
  // polling keeps them on the thank-you screen instead of bouncing them
  // back to the form.
  const hasSubmittedRef = useRef(false);

  const t       = UI[lang] || UI.en;
  const activeQs = questions.filter(q => q.active !== false);
  const currentQ = currentQId ? questions.find(q => q.id === currentQId) : activeQs[qIdx];
  // Get the translation of a question for a given language code.
  // Now reads from the translations JSONB. English is stored in q.en (top-level)
  // for backwards compatibility and because it's the canonical source for AI translation.
  const getLang = (q, lang) => {
    if (!q) return '';
    if (lang === 'en') return q.en || '';
    const t = q.translations || {};
    return t[lang] || q.en || '';
  };
  const curAns  = currentQId ? (answers.length > 0 ? answers : [""]) : (answers.length === activeQs.length ? answers : activeQs.map(() => ""));

  // ── Map each unique participant_token to a stable number (#1, #2, ...) by first-seen order
  // Falls back to the row id for legacy responses without a token.
  const participantNumberMap = (() => {
    const map = new Map();
    let n = 0;
    for (const r of responses) {
      const key = r.participant_token || `row_${r.id}`;
      if (!map.has(key)) { n += 1; map.set(key, n); }
    }
    return map;
  })();
  const participantNum = (r) => participantNumberMap.get(r.participant_token || `row_${r.id}`) || r.id;
  const uniqueParticipantCount = participantNumberMap.size;

  // ── Group all DB rows by participant — one entry per person with all their answers
  const participantGroups = (() => {
    // Build text->id and id->text lookups for live questions
    const liveIds = new Set(questions.map(q => q.id));
    const liveTexts = new Map(); // normalized text → question id
    const norm = s => String(s || "").trim().toLowerCase();
    questions.forEach(q => { if (q.en) liveTexts.set(norm(q.en), q.id); });

    const groups = new Map();
    for (const r of responses) {
      const key = r.participant_token || `row_${r.id}`;
      if (!groups.has(key)) {
        groups.set(key, {
          num: participantNum(r),
          token: key,
          lang: r.lang,
          langName: r.langName,
          flag: r.flag,
          time: r.time,
          answersByQId: {},   // qid (live) → answer
          answersByIdx: [],   // for legacy rows with no question_id
          orphans: [],        // [{ text, answer }] — answers that don't match any live question
        });
      }
      const g = groups.get(key);
      const answer = (r.answers && r.answers[0]) || "";
      if (!answer) continue;

      // 1. Best match: snapshot text matches a live question's text
      if (r.question_text) {
        const matchedId = liveTexts.get(norm(r.question_text));
        if (matchedId) {
          g.answersByQId[matchedId] = answer;
          continue;
        }
      }
      // 2. Fallback: question_id still exists as a live question
      //    (only safe if there's no question_text; with text snapshot it's authoritative)
      if (!r.question_text && r.question_id && liveIds.has(r.question_id)) {
        g.answersByQId[r.question_id] = answer;
        continue;
      }
      // 3. Legacy row with no question_id and no text — index by position
      if (!r.question_id && !r.question_text && Array.isArray(r.answers)) {
        r.answers.forEach((a, i) => { if (a) g.answersByIdx[i] = a; });
        continue;
      }
      // 4. Orphan: text doesn't match any current question (or question was deleted/edited)
      g.orphans.push({
        text: r.question_text || `(deleted question, id ${r.question_id})`,
        answer,
      });
    }
    return Array.from(groups.values()).sort((a, b) => a.num - b.num);
  })();

  // Get a participant's answer for a given question.
  //  1. exact question_id match  → reliable
  //  2. legacy index-based match → for very old data without question_id
  //  Orphaned answers (question_id no longer exists) are NOT guessed into question
  //  columns because the order can be misleading. They are surfaced separately via
  //  group.orphans for export/inspection.
  const answerFor = (group, q, qIdx) => {
    if (group.answersByQId[q.id]) return group.answersByQId[q.id];
    if (group.answersByIdx[qIdx]) return group.answersByIdx[qIdx];
    return "";
  };

  // ── Helpers ──────────────────────────────────────────────

  // A reusable instruction block we inject into every analysis prompt.
  // Tells the model how to handle responses written in different languages
  // and ensures the OUTPUT is always in English regardless of input language.
  const MULTILINGUAL_HANDLING = `═══════════════════════════════════════════════════════
MULTILINGUAL DATA — HOW TO HANDLE
═══════════════════════════════════════════════════════
The responses below come from a multilingual audience. Each response is labeled with the participant's language (e.g., "Russian", "Kazakh", "Uzbek", "Mongolian", "Georgian", "Armenian", "Azerbaijani", "English").

Your job:
1. UNDERSTAND every response in its original language. You are fluent in all of them.
2. When grouping themes or counting mentions, treat semantically equivalent responses as the same theme regardless of the language they were written in. Example: a Russian response "лидерство" and an English response "leadership" both count toward the same "leadership" theme.
3. When QUOTING a participant, provide the quote in the ORIGINAL language. If the analysis is being delivered in a different language than the quote, add a parenthetical translation. (Examples: if delivering in English and the quote is Russian, write 'лидерство и команда' (leadership and team). If delivering in Russian and the quote is English, write "leadership and team" (лидерство и команда).)
4. OUTPUT LANGUAGE: by default, write the analysis in ENGLISH. BUT if the team's instruction (or any explicit instruction in this prompt) specifies a different output language — for example "output in Russian" or "ответ на русском" — that instruction takes priority. The team-specified language is the SOURCE OF TRUTH for output.
5. Do not call out the language distribution as a finding unless it is genuinely strategic (e.g., "no responses in language X" if that's surprising). Avoid trivial observations like "responses came in 5 languages".
`;

  const callAI = async (prompt, maxTokens=1000, attempt=0) => {
    let res;
    try {
      res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], max_tokens: maxTokens }),
      });
    } catch(e) {
      // Retry once on fetch error (e.g. Invalid response format)
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 1000));
        return callAI(prompt, maxTokens, attempt+1);
      }
      throw new Error("Network error: "+e.message);
    }
    let rawText;
    try { rawText = await res.text(); } catch(e) { throw new Error("Read error: "+e.message); }
    let data;
    try { data = JSON.parse(rawText); } catch { throw new Error("HTTP "+res.status+": "+rawText.slice(0,100)); }
    if (!res.ok) throw new Error("API error "+res.status+": "+(data?.error?.message||rawText.slice(0,80)));
    const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
    if (!text) throw new Error("Empty AI response");
    return text;
  };

  const translateQuestion = async (englishText) => {
    setTranslating(true); setTransErr("");
    // Build the prompt dynamically from LANGS so adding a language only requires
    // editing the LANGS array — no other code changes needed.
    const targetLangs = LANGS.filter(l => l.code !== "en");
    const formatLines = targetLangs.map(l => `${l.code.toUpperCase()}: translation`).join("\n");
    const prompt =
      "Translate this question accurately into the following languages. If you are not certain of a translation, return the English text unchanged for that language rather than guessing. Do not invent words or paraphrase loosely.\n\n" +
      `Languages: ${targetLangs.map(l => l.full).join(", ")}\n\n` +
      `Reply ONLY in this format, one per line:\n${formatLines}\n\n` +
      `Question: ${englishText}`;
    try {
      const response = await callAI(prompt, 1500);
      const lines = String(response).split("\n");
      const get = (code) => {
        const upper = code.toUpperCase();
        const line = lines.find(l => l.trim().toUpperCase().startsWith(upper + ":"));
        return line ? line.slice(line.indexOf(":") + 1).trim() : englishText;
      };
      const translations = {};
      targetLangs.forEach(l => { translations[l.code] = get(l.code); });
      return { en: englishText, translations };
    } catch (e) {
      setTransErr("Translation error: " + e.message);
      const translations = {};
      targetLangs.forEach(l => { translations[l.code] = englishText; });
      return { en: englishText, translations };
    } finally { setTranslating(false); }
  };

  // ── Survey flow ───────────────────────────────────────────
  const pickLang = async (code) => {
    setLang(code);
    setQIdx(0);
    setAnswers([""]);
    setSessionDone(false);
    sessionWasOpenRef.current = false;
    answeredQIdRef.current = null;
    setCurrentQId(null);
    // Reuse a persisted token if the participant is just resuming after a refresh,
    // otherwise generate a fresh one.
    let token = null;
    try { token = localStorage.getItem("participant_token"); } catch {}
    if (!token) {
      token = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `p_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      try { localStorage.setItem("participant_token", token); } catch {}
    }
    setParticipantToken(token);
    setScreen("waiting");
    startPolling();
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (data.session_open) {
        sessionWasOpenRef.current = true;
        if (data.current_question_id) {
          // Legacy single-question mode
          setCurrentQId(data.current_question_id);
          setScreen("survey");
        } else {
          // Multi-question form mode — let polling decide based on questions state
          setScreen("survey");
        }
      }
    } catch {}
  };

  const handleNext = async () => {
    const info = LANGS.find(l => l.code === lang);

    // ── Single-question legacy mode (admin pushed currentQId) ──
    if (currentQId) {
      const currentQuestion = questions.find(q => q.id === currentQId);
      const newResp = {
        lang, langName: info?.full || lang, flag: info?.flag || "",
        answers: [...curAns],
        question_id: currentQId,
        question_text: currentQuestion?.en || null,
        participant_token: participantToken
      };
      setSubmitError(null);
      try {
        const res = await fetch("/api/responses", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newResp),
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => res.statusText);
          throw new Error(errText || `HTTP ${res.status}`);
        }
        const data = await res.json();
        answeredQIdRef.current = currentQId;
        setWaitingNext(true);
        setScreen("waiting");
        startPolling();
        setResponses(prev => [...prev, {
          id: data.id, lang: data.lang, langName: data.lang_name, flag: data.flag,
          answers: data.answers, question_id: data.question_id,
          question_text: data.question_text,
          participant_token: data.participant_token,
          time: new Date(data.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
      } catch (e) {
        setSubmitError(e.message || "Network error — please try again");
      }
      return;
    }

    // ── Multi-question form mode (all active questions on one screen) ──
    // Build items array from current answers, one per active question.
    const items = activeQs.map((q, i) => ({
      question_id: q.id,
      question_text: q.en || null,
      answer: (curAns[i] || "").trim(),
    }));

    // Filter to only those with content. The backend also filters but we
    // want to know locally if there's anything to send.
    const filledItems = items.filter(it => it.answer);
    if (filledItems.length === 0) {
      setSubmitError("Please answer at least one question before submitting.");
      return;
    }

    const payload = {
      lang,
      langName: info?.full || lang,
      flag: info?.flag || "",
      participant_token: participantToken,
      items: filledItems,
    };

    setSubmitError(null);
    try {
      const res = await fetch("/api/responses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(errText || `HTTP ${res.status}`);
      }
      const data = await res.json();
      // Mark this participant as having submitted so polling won't bounce
      // them back to the form when the session keeps running.
      hasSubmittedRef.current = true;
      // Move participant to thank-you screen
      setScreen("complete");
      // Push the new rows into local state so the admin sees them right away
      if (data.rows && Array.isArray(data.rows)) {
        setResponses(prev => [
          ...prev,
          ...data.rows.map(r => ({
            id: r.id, lang: r.lang, langName: r.lang_name, flag: r.flag,
            answers: r.answers, question_id: r.question_id,
            question_text: r.question_text,
            participant_token: r.participant_token,
            time: new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }))
        ]);
      }
    } catch (e) {
      setSubmitError(e.message || "Network error — please try again");
    }
  };

  const changeAnswer = (val) => { const u=[...curAns]; u[currentQId?0:qIdx]=val; setAnswers(u); };
  const reset = () => {
    // Clear EVERYTHING tied to the previous participant
    setAnswers([]);
    setQIdx(0);
    setSessionDone(false);
    setWaitingNext(false);
    setCurrentQId(null);
    setParticipantToken(null);
    answeredQIdRef.current = null;
    sessionWasOpenRef.current = false;
    hasSubmittedRef.current = false;
    try { localStorage.removeItem("participant_token"); } catch {}
    if (pollRefHandle.current) { clearInterval(pollRefHandle.current); pollRefHandle.current = null; }
    setScreen("lang");
  };

  // ── Admin auth ────────────────────────────────────────────
  const tryLogin = async () => {
    if (pw!=="admin123") { setPwErr(true); setTimeout(()=>setPwErr(false),1600); return; }
    try {
      const res = await fetch("/api/responses");
      if (res.ok) {
        const data = await res.json();
        setResponses(data.map(r=>({
          id:r.id, lang:r.lang, langName:r.lang_name, flag:r.flag,
          answers:r.answers, question_id:r.question_id,
          question_text:r.question_text,
          participant_token:r.participant_token,
          time:new Date(r.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
        })));
      }
    } catch(e) { console.log("Could not load responses:", e); }
    setScreen("admin"); setTab("questions");
    // Load current session state
    try {
      const sRes = await fetch("/api/session");
      if (sRes.ok) {
        const sData = await sRes.json();
        setSessionOpen(sData.session_open || false);
        setCurrentQId(sData.current_question_id || null);
      }
    } catch(e) {}
    // Load the list of sessions for the dropdown selector
    loadSessions();
  };

  // ── Questions management ──────────────────────────────────
  // ── Session polling (participant side) ──
  const startPolling = () => {
    // Clear any existing poll first
    if (pollRefHandle.current) clearInterval(pollRefHandle.current);
    const interval = setInterval(async () => {
      try {
        const [sessionRes, questionsRes] = await Promise.all([
          fetch("/api/session"),
          fetch("/api/questions")
        ]);
        if (!sessionRes.ok) return;
        const sessionData = await sessionRes.json();
        // Update questions in real time — capture the data once and reuse it below
        let qDataLatest = [];
        if (questionsRes.ok) {
          qDataLatest = await questionsRes.json().catch(() => []);
          if (Array.isArray(qDataLatest) && qDataLatest.length > 0) {
            setQuestions(qDataLatest.map(q => ({
              id: q.id, active: q.active, en: q.en,
              translations: q.translations || {},
              analysisInstruction: q.analysis_instruction || "",
            })));
          }
        }
        // Session closed
        if (!sessionData.session_open) {
          if (sessionWasOpenRef.current) {
            // Session WAS open before = show thank you
            setSessionDone(true);
            setWaitingNext(false);
            setCurrentQId(null);
            setScreen("sessionDone");
            try { localStorage.removeItem("participant_token"); } catch {}
            clearInterval(interval);
          } else {
            // Session never opened = keep waiting
            setScreen("waiting");
          }
          return;
        }
        const newQId = sessionData.current_question_id;
        setCurrentQId(prev => {
          if (prev !== null && prev !== newQId) {
            // Question actually changed - reset answer
            setAnswers([""]);
            answeredQIdRef.current = null;
          }
          return newQId;
        });

        // Decide which screen the participant should see now
        if (sessionData.session_open) {
          sessionWasOpenRef.current = true;
          // The participant already submitted in this session — leave them on
          // the thank-you screen no matter what changes in the session.
          if (hasSubmittedRef.current) {
            return;
          }
          // Already submitted? Stay on the thank-you screen.
          if (screen === "complete") {
            return;
          }
          if (newQId && newQId !== answeredQIdRef.current) {
            // Legacy single-question mode (admin pushed one specific question)
            setScreen("survey");
            setWaitingNext(false);
          } else if (!newQId) {
            // Multi-question form mode — session is open without a specific
            // pushed question. Show the form whenever there are active questions.
            const hasActive = Array.isArray(qDataLatest) && qDataLatest.some(q => q.active !== false);
            if (hasActive) {
              setScreen("survey");
              setWaitingNext(false);
            } else {
              setScreen("waiting");
              setWaitingNext(true);
            }
          } else {
            // Already answered the current pushed question
            setScreen("waiting");
            setWaitingNext(true);
          }
        } else if (sessionWasOpenRef.current) {
          // Session closed AFTER being open = thank you
          setSessionDone(true);
          setScreen("sessionDone");
        } else {
          // Session never opened = just wait
          setScreen("waiting");
          setWaitingNext(true);
        }
      } catch(e) { console.log("polling error", e); }
    }, 8000); // ← was 3000. Slower polling reduces backend load by ~62% with no UX impact.
    pollRefHandle.current = interval;
    return interval;
  };

  const stopPolling = () => { if (pollRefHandle.current) clearInterval(pollRefHandle.current); };

  // ── Admin session controls ──
  const activateQuestion = async (q) => {
    // Auto-open session if not open + activate question in one step
    const res = await fetch("/api/session");
    const data = await res.json();
    const shown = data.questions_shown || [];
    if (!shown.find(s => s.id === q.id)) shown.push({ id: q.id, en: q.en, activated_at: new Date().toISOString() });
    await fetch("/api/session", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        session_open: true,
        session_started_at: data.session_started_at || new Date().toISOString(),
        current_question_id: q.id,
        questions_shown: shown
      })
    });
    setSessionOpen(true);
    setCurrentQId(q.id);
  };

  // ── Sessions (multi-event) management ──
  // Loads the list of sessions and which one is active. Called on admin mount
  // and after any create/switch operation so the UI stays in sync.
  const loadSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data.sessions || []);
      setActiveSessionId(data.activeSessionId);
    } catch (e) { /* ignore */ }
  };

  const createSession = async (name) => {
    if (!name?.trim()) return;
    try {
      const res = await fetch("/api/sessions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: name.trim() }),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        alert("Could not create session: " + err);
        return;
      }
      // Switching to the new session resets everything tied to "current event"
      setNewSessionName("");
      setCreatingSession(false);
      // Reload everything that depends on the active session
      await loadSessions();
      await loadResponses();
      // Reload questions through the existing polling effect by forcing a fetch
      const qRes = await fetch("/api/questions");
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestions((qData || []).map(q => ({
          id: q.id, active: q.active, en: q.en,
          translations: q.translations || {},
          analysisInstruction: q.analysis_instruction || "",
        })));
      }
      setSessionOpen(false);
      setCurrentQId(null);
    } catch (e) {
      alert("Could not create session: " + e.message);
    }
  };

  const switchSession = async (sessionId) => {
    if (!sessionId || sessionId === activeSessionId) return;
    try {
      const res = await fetch("/api/sessions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch", sessionId }),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        alert("Could not switch session: " + err);
        return;
      }
      await loadSessions();
      await loadResponses();
      const qRes = await fetch("/api/questions");
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestions((qData || []).map(q => ({
          id: q.id, active: q.active, en: q.en,
          translations: q.translations || {},
          analysisInstruction: q.analysis_instruction || "",
        })));
      }
      setSessionOpen(false);
      setCurrentQId(null);
    } catch (e) {
      alert("Could not switch session: " + e.message);
    }
  };

  const renameSession = async (sessionId, name) => {
    if (!name?.trim()) return;
    try {
      const res = await fetch("/api/sessions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", sessionId, name: name.trim() }),
      });
      if (res.ok) await loadSessions();
    } catch (e) { /* ignore */ }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm("Delete this session and ALL its questions and responses? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/sessions?sessionId=${sessionId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        alert("Could not delete session: " + err);
        return;
      }
      await loadSessions();
    } catch (e) {
      alert("Could not delete session: " + e.message);
    }
  };

  // ── Live presentation control ──
  // Pushes the currently-generated slides to the /live screen so the admin
  // can project them. Only the admin can trigger this — participants on /live
  // just read whatever is in session_state.
  const pushPresentationToLive = async () => {
    if (!slides || !slides.slides) {
      alert("Generate the presentation first.");
      return;
    }
    // Filter out any hidden slides
    const visible = slides.slides.filter((_, i) => !hiddenSlides.has(i));
    if (!visible.length) {
      alert("All slides are hidden — show at least one before pushing to live.");
      return;
    }
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          live_mode: "presentation",
          live_slide_idx: 0,
          live_slides: { slides: visible, presentationTitle: slides.presentationTitle },
        }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => "Could not push"));
      setLiveMode("presentation");
      setLiveSlideIdx(0);
      setLiveSlides({ slides: visible, presentationTitle: slides.presentationTitle });
    } catch (e) {
      alert("Could not push to live: " + e.message);
    }
  };

  const showCounterOnLive = async () => {
    try {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ live_mode: "counter" }),
      });
      setLiveMode("counter");
    } catch (e) { /* ignore */ }
  };

  const goLiveSlide = async (newIdx) => {
    if (!liveSlides?.slides) return;
    const total = liveSlides.slides.length;
    if (newIdx < 0 || newIdx >= total) return;
    try {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ live_slide_idx: newIdx }),
      });
      setLiveSlideIdx(newIdx);
    } catch (e) { /* ignore */ }
  };

  const closeSession = async () => {
    await fetch("/api/session", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ session_open: false, session_ended_at: new Date().toISOString(), current_question_id: null })
    });
    setSessionOpen(false);
    setCurrentQId(null);
  };

  // Open session in FORM mode (multi-question). All active questions become
  // visible to participants at the same time, no current_question_id.
  const openFormSession = async () => {
    // Activate all questions if some are inactive
    const allActive = questions.every(q => q.active !== false);
    let qs = questions;
    if (!allActive) {
      qs = questions.map(q => ({ ...q, active: true }));
      setQuestions(qs);
      await syncQuestions(qs);
    }
    const res = await fetch("/api/session");
    const data = await res.json();
    await fetch("/api/session", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_open: true,
        session_started_at: data.session_started_at || new Date().toISOString(),
        current_question_id: null, // ← null means form-mode (all active questions)
        questions_shown: qs.filter(q => q.active !== false).map(q => ({
          id: q.id, en: q.en, activated_at: new Date().toISOString()
        })),
      })
    });
    setSessionOpen(true);
    setCurrentQId(null);
  };

  // ── Load responses from DB ──
  const loadResponses = async () => {
    try {
      const res = await fetch("/api/responses");
      if (res.ok) {
        const data = await res.json();
        setResponses(data.map(r=>({
          id:r.id, lang:r.lang, langName:r.lang_name, flag:r.flag,
          answers:r.answers, question_id:r.question_id,
          question_text:r.question_text,
          participant_token:r.participant_token,
          time:new Date(r.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
        })));
      }
    } catch(e) {}
  };

  // ── Delete single response ──
  const deleteResponse = async (id) => {
    if (!window.confirm(`Delete response #${id}?`)) return;
    try {
      const res = await fetch(`/api/responses?id=${id}`, { method:"DELETE" });
      if (!res.ok) {
        const errText = await res.text().catch(()=>res.statusText);
        throw new Error(errText || `HTTP ${res.status}`);
      }
      setResponses(prev => prev.filter(r => r.id !== id));
    } catch(e) { alert("Could not delete response: "+e.message); }
  };

  // ── Delete all responses from one participant (by token) ──
  const deleteParticipant = async (group) => {
    // Confirm with the participant number for clarity
    if (!window.confirm(`Delete ALL responses from Participant #${group.num}? This cannot be undone.`)) return;
    // group.token is set in participantGroups; for legacy rows without a token we fall back to row_<id>
    const token = group.token;
    try {
      let res;
      if (token && !token.startsWith("row_")) {
        res = await fetch(`/api/responses?participant_token=${encodeURIComponent(token)}`, { method:"DELETE" });
      } else {
        // Legacy participant — token is fake (row_<id>); delete just that row by id
        const legacyId = parseInt(token.replace("row_",""), 10);
        res = await fetch(`/api/responses?id=${legacyId}`, { method:"DELETE" });
      }
      if (!res.ok) {
        const errText = await res.text().catch(()=>res.statusText);
        throw new Error(errText || `HTTP ${res.status}`);
      }
      // Optimistic local cleanup; the next poll will reconcile anyway
      setResponses(prev => prev.filter(r =>
        token && !token.startsWith("row_")
          ? r.participant_token !== token
          : r.id !== parseInt(token.replace("row_",""), 10)
      ));
    } catch(e) { alert("Could not delete participant: "+e.message); }
  };

  // ── Delete all responses ──
  const deleteAllResponses = async () => {
    if (!window.confirm("Delete ALL responses? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/responses", { method:"DELETE" });
      if (!res.ok) {
        const errText = await res.text().catch(()=>res.statusText);
        throw new Error(errText || `HTTP ${res.status}`);
      }
      setResponses([]);
      setQSummaries({});
    } catch(e) { alert("Could not delete responses: "+e.message); }
  };

  // ── Copy as table ──
  const copyAsTable = () => {
    const hasOrphans = participantGroups.some(g => g.orphans && g.orphans.length);
    const headers = [
      "Participant", "Language", "Time",
      ...questions.map((q,i)=>`Q${i+1}: ${q.en.slice(0,40)}`),
      ...(hasOrphans ? ["Unmatched answers"] : []),
    ];
    const rows = participantGroups.map(g => {
      const base = [
        `#${g.num}`, g.langName, g.time,
        ...questions.map((q, qi) => answerFor(g, q, qi)),
      ];
      if (hasOrphans) {
        base.push(g.orphans && g.orphans.length
          ? g.orphans.map(o => `${o.text} → ${o.answer}`).join(" | ")
          : "");
      }
      return base;
    });
    const table = [headers, ...rows].map(row => row.join("\t")).join("\n");
    navigator.clipboard.writeText(table).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── On mount: load the active session info ──
  // This is needed for the lang screen title and the /live screen — both
  // need to know which event session is currently active. Without this,
  // participants would see a generic title until polling kicks in.
  useEffect(() => {
    fetch("/api/sessions")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setSessions(data.sessions || []);
          setActiveSessionId(data.activeSessionId);
        }
      })
      .catch(() => {});
  }, []);

  // ── Poll responses every 5s when in admin mode ──
  useEffect(() => {
    if (screen !== "admin") return;
    loadResponses();
    const interval = setInterval(loadResponses, 5000);
    return () => clearInterval(interval);
  }, [screen]);

  // ── Cleanup the participant-side poll when the component unmounts ──
  useEffect(() => {
    return () => {
      if (pollRefHandle.current) {
        clearInterval(pollRefHandle.current);
        pollRefHandle.current = null;
      }
    };
  }, []);

  // ── Load + poll questions from DB every 5s ──
  useEffect(() => {
    const loadQs = () => {
      fetch("/api/questions").then(r=>r.json()).then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data.map(q => ({
            id: q.id, active: q.active, en: q.en,
            translations: q.translations || {},
            analysisInstruction: q.analysis_instruction || "",
          })));
        }
      }).catch(() => {});
    };
    loadQs();
    // Adaptive polling: admin needs near-real-time updates while editing questions,
    // but participants don't need it because questions don't change mid-session.
    // For 1200+ concurrent participants this 5x reduction is essential to avoid
    // backend rate limits.
    const intervalMs = screen === "admin" ? 4000 : 20000;
    const interval = setInterval(loadQs, intervalMs);
    return () => clearInterval(interval);
  }, [screen]);

  // ── Live projection screen: poll responses + session info + live mode ──
  useEffect(() => {
    if (screen !== "live") return;
    const fetchAll = async () => {
      // Responses (for the counter)
      loadResponses();
      // Active session info (for the title)
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
          setActiveSessionId(data.activeSessionId);
        }
      } catch {}
      // Live presentation state (counter vs presentation, current slide, slides JSON)
      try {
        const res = await fetch("/api/session");
        if (res.ok) {
          const s = await res.json();
          setLiveMode(s.live_mode || "counter");
          setLiveSlideIdx(s.live_slide_idx || 0);
          setLiveSlides(s.live_slides || null);
        }
      } catch {}
    };
    fetchAll(); // initial
    const interval = setInterval(fetchAll, 2000); // every 2s for snappy slide changes
    return () => clearInterval(interval);
  }, [screen]);

  // ── Sync questions to DB whenever admin changes them ──
  const syncQuestions = async (qs) => {
    try {
      await fetch("/api/questions", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ questions: qs }),
      });
    } catch(e) { console.log("sync error", e); }
  };

  const toggleQ = (id) => {
    const updated = questions.map(q=>q.id===id?{...q,active:!q.active}:q);
    setQuestions(updated);
    syncQuestions(updated);
  };
  const toggleAll = () => {
    const allOn = questions.every(q=>q.active!==false);
    const updated = questions.map(q=>({...q,active:!allOn}));
    setQuestions(updated);
    syncQuestions(updated);
  }; // Note: toggleAll kept for Activate All button
  const deleteQ = (id) => {
    if (questions.length>1) {
      const updated = questions.filter(q=>q.id!==id);
      setQuestions(updated);
      syncQuestions(updated);
    }
  };

  const toggleTransExpand = (id) => {
    setExpandedTrans(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  };

  const toggleInstrExpand = (q) => {
    setExpandedInstr(prev => {
      const n = new Set(prev);
      if (n.has(q.id)) {
        n.delete(q.id);
      } else {
        n.add(q.id);
        // Seed the draft from the current saved value
        setInstrDraft(d => ({ ...d, [q.id]: q.analysisInstruction || "" }));
      }
      return n;
    });
  };

  const saveInstr = (qId) => {
    const text = (instrDraft[qId] || "").trim();
    setQuestions(prev => {
      const updated = prev.map(q => q.id === qId ? { ...q, analysisInstruction: text } : q);
      syncQuestions(updated);
      return updated;
    });
    // Close the editor
    setExpandedInstr(prev => { const n = new Set(prev); n.delete(qId); return n; });
  };

  // Map a language code to its English name, used to construct the translation prompt.
  // Built dynamically from the LANGS array so adding a language only requires editing LANGS.
  const langNameFor = (code) => {
    const lang = LANGS.find(l => l.code === code);
    return lang?.full || code;
  };

  // Re-translate ONE language for ONE question (used when the field is empty
  // or fell back to English and the admin wants the AI to fill it in).
  const retranslateOne = async (q, langCode) => {
    if (langCode === 'en') return; // English is the source — never retranslate
    const name = langNameFor(langCode);
    const key = q.id + "_" + langCode;
    setRetranslating(prev => ({ ...prev, [key]: true }));
    try {
      const prompt = `Translate the following question accurately into ${name}. Reply with ONLY the translated text — no labels, no quotes, no explanations. If you are not confident in the translation, return the English text unchanged rather than guessing.\n\nQuestion: ${q.en}`;
      const response = await callAI(prompt, 400);
      const translated = String(response || "").trim().replace(/^["']|["']$/g, "");
      if (translated) {
        const updated = questions.map(qq =>
          qq.id === q.id
            ? { ...qq, translations: { ...(qq.translations || {}), [langCode]: translated } }
            : qq
        );
        setQuestions(updated);
        await syncQuestions(updated);
      }
    } catch (e) {
      alert("Could not translate: " + e.message);
    } finally {
      setRetranslating(prev => { const n = {...prev}; delete n[key]; return n; });
    }
  };

  const startEditTrans = (qId, langCode, currentText) => {
    setEditingTrans(prev => ({...prev, [qId+"_"+langCode]: currentText}));
  };

  const saveTransEdit = (qId, langCode) => {
    const key = qId+"_"+langCode;
    const newText = editingTrans[key];
    if (newText !== undefined) {
      setQuestions(prev => {
        const updated = prev.map(q =>
          q.id === qId
            ? (langCode === 'en'
                ? { ...q, en: newText }
                : { ...q, translations: { ...(q.translations || {}), [langCode]: newText } })
            : q
        );
        syncQuestions(updated); // ← persist to DB so the edit survives refresh
        return updated;
      });
      setEditingTrans(prev => { const n={...prev}; delete n[key]; return n; });
    }
  };

  const cancelTransEdit = (qId, langCode) => {
    const key = qId+"_"+langCode;
    setEditingTrans(prev => { const n={...prev}; delete n[key]; return n; });
  };

  const addQuestion = async () => {
    if (!newQText.trim()||questions.length>=10) return;
    const txt = newQText.trim();
    const tempId = Date.now();
    // Add stub immediately in English (no translations yet — will fill from AI below)
    const stub = { id: tempId, active: false, en: txt, translations: {}, analysisInstruction: "", translating: true };
    const withStub = [...questions, stub];
    setQuestions(withStub);
    setNewQText("");
    // Translate in background
    const result = await translateQuestion(txt);
    const translated = result
      ? { ...stub, en: result.en, translations: result.translations, translating: false }
      : { ...stub, translating: false };
    const final = withStub.map(q => q.id === tempId ? translated : q);
    setQuestions(final);
    // Sync to Supabase
    await syncQuestions(final);
  };

  const saveEdit = async () => {
    if (!editQ?.text.trim()) return;
    const t = await translateQuestion(editQ.text.trim());
    if (!t) return;
    setQuestions(prev => {
      const updated = prev.map(q =>
        q.id === editQ.id
          ? { ...q, en: t.en, translations: t.translations }
          : q
      );
      syncQuestions(updated);
      return updated;
    });
    setEditQ(null);
  };

  // ── Per-question summary ──────────────────────────────────
  const generateQSummary = async (q) => {
    if (!responses.length) return;
    setLoadingSum(q.id);
    const qPos = questions.indexOf(q);
    // One entry per participant who actually answered THIS question
    const qResps = participantGroups
      .map(g => ({ g, answer: answerFor(g, q, qPos) }))
      .filter(({ answer }) => answer && String(answer).trim());
    if (!qResps.length) {
      setQSummaries(prev=>({...prev,[q.id]:"No responses yet for this question."}));
      setLoadingSum(null);
      return;
    }
    const nR = qResps.length;
    const ans = qResps.map(({ g, answer }) =>
      `- Participant #${g.num} (${g.langName}): ${answer}`
    ).join("\n");

    // If the admin set a custom analysis instruction for this question, use it
    // instead of the generic strategic-consultant prompt. The grounding rules
    // (no fabrication) still apply.
    const customInstr = (q.analysisInstruction || "").trim();
    let prompt;

    if (customInstr) {
      prompt = `You are analyzing the responses to ONE specific survey question. Follow the analysis instruction below carefully.

═══════════════════════════════════════════════════════
GROUNDING RULES — ABSOLUTE
═══════════════════════════════════════════════════════
- Every observation MUST be derivable from the responses below. No exceptions.
- DO NOT invent numbers, percentages, segments, demographics, or any detail not explicitly present in the data.
- DO NOT extrapolate beyond what the responses say.
- Quantitative claims must reflect ACTUAL counts. If you cannot count precisely, describe qualitatively ("most", "a few", "one participant"). Never approximate.
- If the data is thin or patterns ambiguous, say so honestly.

${MULTILINGUAL_HANDLING}
QUESTION ASKED TO PARTICIPANTS:
"${q.en}"

NUMBER OF RESPONSES: ${nR}

ANALYSIS INSTRUCTION (follow this exactly):
${customInstr}

OUTPUT STYLE:
- Plain English, no jargon.
- Be specific. Quote near-verbatim phrases from the responses where helpful.
- If the instruction asks for counts and the count is exactly N, say "${nR > 1 ? "5 of 12" : "1 of 1"}" style — never approximate.
- With only ${nR} response${nR===1?"":"s"}, acknowledge that limit honestly if it constrains what you can say.

RESPONSES:
${ans}`;
    } else {
      prompt = `You are a world-class strategic executive consultant with 20+ years of experience analyzing organizational surveys for Fortune 500 leadership teams. You specialize in turning raw qualitative feedback into insights that drive decisions.

You are now being asked to analyze the responses to ONE specific survey question and produce a tight set of strategic insights.

═══════════════════════════════════════════════════════
GROUNDING RULES — ABSOLUTE
═══════════════════════════════════════════════════════
- Every observation MUST be derivable from the responses below. No exceptions.
- DO NOT invent numbers, percentages, segments, demographics, tenure groups, departments, or any detail not explicitly present in the data.
- DO NOT extrapolate beyond what the responses say. If a response says "leadership", you cannot claim it was about "executive leadership development programs" — only say what is actually there.
- Quantitative claims (counts, percentages) must reflect the ACTUAL count in the data. When you CAN count something precisely (e.g., "leadership" appears in 4 out of 7 responses), state the exact number. When you CANNOT count precisely (themes that overlap, fuzzy boundaries, vague references), describe it qualitatively ("most", "a few", "one participant"). Never use approximate or estimated numbers — be exact or be qualitative.
- If the data is thin or the patterns ambiguous, say so honestly. Hedged truth beats confident fiction.

${MULTILINGUAL_HANDLING}
QUESTION:
"${q.en}"

NUMBER OF RESPONSES TO THIS QUESTION: ${nR}

YOUR TASK:
Write 3-5 strategic bullet points. Each bullet should help leadership make a decision — answer the question "so what?". Focus on:
- Patterns or contrasts you can verify by looking at the responses
- What the responses imply for the organization
- Specific words or phrases drawn from the actual responses

EXAMPLES (note that the patterns named would only be claimed if they actually exist in the data — these are illustrations of STYLE, not templates to fill in):
  • One theme dominates the responses — leadership development — surfacing in roughly two-thirds of replies. The signal is strong enough to act on.
  • A small but consistent minority raised concerns about clarity in development pathways. Worth attention before it grows louder.
  • Three distinct themes emerged in the responses — each pointing to a different lever leadership can pull.

DO NOT produce:
  ✗ Trivia: "Responses in Japanese were shorter than English" (linguistic, not strategic)
  ✗ Format observations: "Most participants gave a one-word answer" (about format, not content)
  ✗ Vacuous summaries: "Participants varied in their responses"
  ✗ Fabricated segmentations: "Participants in their first year said X, those past year three said Y" — UNLESS the data actually distinguishes those groups
  ✗ Invented percentages: do not write "64% said X" unless you literally counted X in the data

STYLE:
- Plain English. No jargon.
- Start each bullet with "•".
- Be confident only where the data supports it. Hedge where it doesn't.
- With ${nR} response${nR===1?"":"s"}, acknowledge limits openly if the sample is too small to support strong conclusions.

RESPONSES:
${ans}`;
    }

    try {
      const raw = await callAI(prompt, 1000);
      setQSummaries(prev=>({...prev,[q.id]:raw}));
    } catch(e) {
      setQSummaries(prev=>({...prev,[q.id]:"Error: "+e.message}));
    }
    setLoadingSum(null);
  };

  // ── Run a one-off, ad-hoc analysis with a custom instruction the admin
  // types in the moment. Result is stored in qSummaries (same display slot)
  // but the instruction is NOT persisted to the question.
  const generateCustomAnalysis = async (q) => {
    const instruction = (customDraft[q.id] || "").trim();
    if (!instruction) {
      alert("Please write an instruction first.");
      return;
    }
    if (!responses.length) return;

    setLoadingCustom(q.id);
    const qPos = questions.indexOf(q);
    const qResps = participantGroups
      .map(g => ({ g, answer: answerFor(g, q, qPos) }))
      .filter(({ answer }) => answer && String(answer).trim());

    if (!qResps.length) {
      setQSummaries(prev => ({ ...prev, [q.id]: "No responses yet for this question." }));
      setLoadingCustom(null);
      return;
    }

    const nR = qResps.length;
    const ans = qResps.map(({ g, answer }) =>
      `- Participant #${g.num} (${g.langName}): ${answer}`
    ).join("\n");

    const prompt = `You are analyzing the responses to ONE specific survey question. Follow the analysis instruction below carefully.

═══════════════════════════════════════════════════════
GROUNDING RULES — ABSOLUTE
═══════════════════════════════════════════════════════
- Every observation MUST be derivable from the responses below. No exceptions.
- DO NOT invent numbers, percentages, segments, demographics, or details not explicitly present.
- Quantitative claims must reflect ACTUAL counts. If you cannot count precisely, describe qualitatively. Never approximate.
- If the instruction asks for something the data cannot support (e.g., "top 100" when only 5 responses exist), say so honestly and provide what the data actually supports.

${MULTILINGUAL_HANDLING}
QUESTION ASKED TO PARTICIPANTS:
"${q.en}"

NUMBER OF RESPONSES: ${nR}

ANALYSIS INSTRUCTION (follow this exactly):
${instruction}

OUTPUT STYLE:
- Plain English, no jargon.
- Be specific. Quote near-verbatim phrases from the responses where helpful.
- Counts must be exact. Never approximate.
- With ${nR} response${nR===1?"":"s"}, acknowledge that limit honestly if it constrains what you can deliver.

RESPONSES:
${ans}`;

    try {
      const raw = await callAI(prompt, 1500);
      setQSummaries(prev => ({ ...prev, [q.id]: raw }));
      // Close the editor on success
      setCustomOpen(prev => { const n = new Set(prev); n.delete(q.id); return n; });
    } catch (e) {
      setQSummaries(prev => ({ ...prev, [q.id]: "Error: " + e.message }));
    }
    setLoadingCustom(null);
  };

  const toggleCustomEditor = (q) => {
    setCustomOpen(prev => {
      const n = new Set(prev);
      if (n.has(q.id)) n.delete(q.id); else n.add(q.id);
      return n;
    });
  };

  // ── Export ────────────────────────────────────────────────
  const exportCSV = () => {
    if (!participantGroups.length) {
      alert("No data to export yet.");
      return;
    }
    try {
      const esc = s => `"${String(s ?? "").replace(/"/g, '""')}"`;
      const hasOrphans = participantGroups.some(g => g.orphans && g.orphans.length);
      const hdrs = [
        "#", "Language", "Time",
        ...questions.map((q, i) => `Q${i+1}: ${q.en}`),
        ...(hasOrphans ? ["Unmatched answers (from deleted questions)"] : []),
      ];
      const rows = participantGroups.map(g => {
        const base = [
          g.num, g.langName, g.time,
          ...questions.map((q, qi) => answerFor(g, q, qi)),
        ];
        if (hasOrphans) {
          base.push(g.orphans && g.orphans.length
            ? g.orphans.map(o => `${o.text} → ${o.answer}`).join(" | ")
            : "");
        }
        return base;
      });
      const csv = [hdrs, ...rows].map(r => r.map(esc).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey_${new Date().toISOString().slice(0,10)}.csv`;
      // Some browsers (Firefox, Safari) require the link to be in the DOM to trigger download.
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Free the blob URL after the click has been processed.
      setTimeout(() => URL.revokeObjectURL(url), 100);
      setCsvDone(true);
      setTimeout(() => setCsvDone(false), 2500);
    } catch (e) {
      alert("Could not export CSV: " + e.message);
    }
  };

  // ── Presentation ──────────────────────────────────────────
  // ── Download presentation as .pptx file ──
  // Loads pptxgenjs from CDN on demand so it doesn't bloat the initial bundle.
  const loadPptxgen = () => new Promise((resolve, reject) => {
    if (window.PptxGenJS) return resolve(window.PptxGenJS);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
    s.onload = () => resolve(window.PptxGenJS);
    s.onerror = () => reject(new Error("Could not load pptxgenjs from CDN"));
    document.head.appendChild(s);
  });

  const downloadPPTX = async () => {
    if (!slides || !slides.slides) return;
    try {
      const PptxGenJS = await loadPptxgen();
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
      pptx.title = slides.presentationTitle || "Survey Results";

      // Try to load the logo as data URL so it embeds in the pptx
      let logoDataUrl = null;
      try {
        const logoRes = await fetch("/herbalife-logo-white.png");
        if (logoRes.ok) {
          const blob = await logoRes.blob();
          logoDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } catch { /* logo optional — proceed without it */ }

      // Helper: parse "text with **bold** parts" into pptxgenjs runs.
      // Each segment becomes a { text, options } object that addText can consume.
      const parseBold = (raw, baseOptions = {}) => {
        if (raw == null) return [{ text: "", options: baseOptions }];
        const parts = String(raw).split(/(\*\*[^*]+\*\*)/g);
        return parts
          .filter(p => p.length > 0)
          .map(p => {
            const m = p.match(/^\*\*(.+)\*\*$/);
            if (m) return { text: m[1], options: { ...baseOptions, bold: true } };
            return { text: p, options: { ...baseOptions } };
          });
      };

      const visible = slides.slides.filter((_, i) => !hiddenSlides.has(i));
      visible.forEach((s, i) => {
        const slide = pptx.addSlide();
        slide.background = { color: "1F6B3A" }; // Same dark green as the in-app slide
        // Category pill
        if (s.category) {
          slide.addText(s.category, {
            x: 0.5, y: 0.4, w: 4, h: 0.4,
            fontSize: 11, bold: true, color: "FFFFFF",
            fontFace: "Arial", charSpacing: 4,
          });
        }
        // Icon
        if (s.icon) {
          slide.addText(s.icon, { x: 0.5, y: 0.95, w: 1, h: 0.8, fontSize: 36 });
        }
        // Title
        slide.addText(s.title || "", {
          x: 0.5, y: 1.85, w: 12.3, h: 1.1,
          fontSize: 32, bold: true, color: "FFFFFF", fontFace: "Arial",
        });
        // Bullet points — each bullet becomes a paragraph with parsed bold runs
        if (Array.isArray(s.points) && s.points.length) {
          // For pptxgenjs, you build an array where each top-level entry is a
          // paragraph (bullet). Within a paragraph you can have multiple runs
          // with different styling. We set bullet+paraSpaceAfter on the FIRST
          // run of each paragraph, and a line-break on the LAST run before
          // the next bullet starts.
          const allRuns = [];
          s.points.forEach((p, idx) => {
            const runs = parseBold(p);
            runs.forEach((r, j) => {
              const opts = { ...r.options };
              if (j === 0) {
                opts.bullet = { code: "2022" };
                opts.paraSpaceAfter = 12;
              }
              allRuns.push({ text: r.text, options: opts });
            });
            // Force a paragraph break between bullets
            if (idx < s.points.length - 1) {
              allRuns.push({ text: "", options: { breakLine: true } });
            }
          });
          slide.addText(allRuns, {
            x: 0.5, y: 3.1, w: 12.3, h: s.takeaway ? 3 : 4,
            fontSize: 16, color: "FFFFFF", fontFace: "Arial", valign: "top",
          });
        }
        // Takeaway box at the bottom (italic, on lighter background)
        if (s.takeaway) {
          slide.addText(parseBold(s.takeaway, { italic: true }), {
            x: 0.5, y: 6.2, w: 12.3, h: 0.7,
            fontSize: 14, italic: true, color: "FFFFFF", fontFace: "Arial",
            fill: { color: "2D7A47" }, // slightly lighter green panel
            margin: 0.2,
          });
        }
        // Herbalife logo — bottom-left, subtle (50% transparency)
        if (logoDataUrl) {
          slide.addImage({
            data: logoDataUrl,
            x: 0.4, y: 7.0, w: 1.4, h: 0.4,
            transparency: 50, // 0 = opaque, 100 = fully transparent
          });
        }
        // Slide number — bottom-right
        slide.addText(`${i + 1}/${visible.length}`, {
          x: 12.3, y: 7.1, w: 0.7, h: 0.3,
          fontSize: 10, color: "FFFFFF", align: "right", italic: true,
        });
      });

      const safeName = (slides.presentationTitle || "presentation")
        .replace(/[^a-z0-9]+/gi, "_").toLowerCase();
      await pptx.writeFile({ fileName: `${safeName}.pptx` });
    } catch (e) {
      alert("Could not download presentation: " + e.message);
    }
  };

  // ── Generate strategic one-pager (executive dashboard, JSON structured) ──
  const generateOnePager = async () => {
    if (!responses.length) return;
    setLoadingOnePager(true); setOnePager(null);

    const answeredQIds = new Set(
      participantGroups.flatMap(g => Object.keys(g.answersByQId).map(Number))
    );
    const presQs = questions.filter(q => q.active !== false || answeredQIds.has(q.id));

    const block = participantGroups.map(g =>
      `Participant #${g.num} (${g.langName}):\n`+
      presQs.map((q,i)=>`Q${i+1}: ${q.en}\nAnswer: ${answerFor(g, q, i)||"(no answer)"}`).join("\n")
    ).join("\n\n");

    const nP = participantGroups.length;
    const nQ = presQs.length;
    const nResp = responses.length;

    const prompt = `You are a world-class strategic executive consultant who designs board-ready one-page dashboards for Fortune 500 leadership teams. You combine the analytical rigor of McKinsey with the punchy clarity of a great brand strategist. Your work is famous for being scannable in 90 seconds and impossible to forget.

You are now producing an EXECUTIVE DASHBOARD ONE-PAGER from a survey of ${nP} participant${nP===1?"":"s"} who answered ${nQ} question${nQ===1?"":"s"} (${nResp} total responses).

═══════════════════════════════════════════════════════
GROUNDING RULES — ABSOLUTE
═══════════════════════════════════════════════════════
- Every claim, quote, theme, percentage, count, or segmentation MUST be derivable from the responses below. No exceptions.
- DO NOT invent: numbers, percentages, demographics, cohort sizes, tenure groups, departments, regions, comparisons between subgroups, or any detail that is not explicitly in the data.
- Quantitative claims must reflect the ACTUAL count in the data. When you CAN count something precisely (e.g., "leadership" appears in 4 out of 7 responses), state the exact number. When you CANNOT count precisely (themes that overlap, fuzzy boundaries, vague references), describe it qualitatively ("most", "a few", "one participant"). Never use approximate or estimated numbers — be exact or be qualitative.
- DO NOT extrapolate. If a response says "leadership", you cannot claim it referred to "first-time leadership roles" or "executive development programs" unless those exact phrases are in the responses.
- Every direct quote must be a near-verbatim phrase from the actual responses. Do not paraphrase quotes.
- If the data is thin or a pattern is ambiguous, say so honestly. A hedged truth is more credible than a confident fabrication.
- Be PUNCHY. Short sentences. Active voice.
- Use the language of decisions, not descriptions. Say "rethink", "double down", "stop", not "consider exploring".
- Output language: ENGLISH.

${MULTILINGUAL_HANDLING}
═══════════════════════════════════════════════════════
STRUCTURE — DERIVE THE SECTIONS FROM THE DATA
═══════════════════════════════════════════════════════
This is the most important rule of this brief: section titles must come from THE DATA, not from a template.

🚫 STRICTLY FORBIDDEN section titles (these are lazy and will be rejected):
  • "Strengths" / "Fortalezas"
  • "Opportunities" / "Oportunidades"
  • "Weaknesses"
  • "Blind spots" / "Puntos ciegos"
  • "Where to act" / "Dónde actuar"
  • "Recommendations"
  • "Key findings"
  • "Action items"
  • "Pros and cons"
  • Anything that sounds like a SWOT, retrospective, or generic consulting framework

If your section title would fit equally well on ANY survey, it's the wrong title. It must be specific to THIS data.

✅ GOOD section titles earn their place by being specific to what the data actually shows. Real examples (each could only describe a particular dataset):
  • "The 35-vs-25 Divide"
  • "Leadership Casts a Long Shadow"
  • "What Two People Cannot Tell Us"
  • "AI Surfaces — Without Being Asked"
  • "When 'Good' and 'Bad' Both Mean Yes"
  • "The Quote That Stops You"
  • "Where the Energy Lives"
  • "Signals From the Margins"
  • "What's Missing From Every Answer"
  • "The Word No One Used"

Think like a journalist writing a magazine headline based on what they actually read, not a consultant filling a template. The reader should be intrigued by the section title alone — and every word of it should be defensible by pointing to the responses below.

PROCESS for choosing your sections:
1. Read all responses carefully and look for genuine patterns, contrasts, or signals.
2. Group what you find into 3-6 themes that are SPECIFIC to this dataset.
3. Name each theme with words that describe what's actually there — not generic consulting labels.
4. If your title would fit on any other survey's report, rename it until it couldn't.

═══════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════
Return ONLY valid JSON (no markdown, no backticks, no commentary). Use this schema:

{
  "title": "Short, evocative title that hints at the core finding (max 8 words). NOT generic.",
  "metadata": "${nP} participant${nP===1?"":"s"} · ${nQ} question${nQ===1?"":"s"} · [add timeframe or event context if helpful]",
  "executiveSummary": "ONE paragraph (50-80 words) capturing the overall picture. Lead with the headline finding, then the tension or nuance, then the implication. This is what a leader will remember if they read nothing else.",
  "sections": [
    {
      "icon": "single emoji that matches the section's tone (✅ ⚠️ 👁 🎯 💡 📊 🔍 🚦 🌱 🪞 🧭 🌊 etc.)",
      "title": "Section title — drawn from what the data actually shows, NOT from a template",
      "cards": [
        {
          "title": "Card heading — a specific finding (3-7 words)",
          "body": "1-2 sentences with data + so-what. Be concrete. Use specific numbers or phrases from the data.",
          "quote": "Optional: a memorable phrase from a participant. Under 15 words. Omit the field entirely if no quote earns inclusion."
        }
      ]
    }
  ],
  "tension": {
    "label": "2-3 word label for the tension (optional)",
    "left": "What one side / group / data signal said (5-10 words)",
    "right": "What the other side / group / data signal said (5-10 words)"
  }
}

CONSTRAINTS:
- 3 to 6 sections total. Quality over quantity. If a section doesn't have at least 2 strong cards, cut it.
- 2 to 4 cards per section.
- "tension" field is OPTIONAL — include it ONLY if there is a genuine, clear tension or contrast in the data. If there's no real tension, OMIT THE ENTIRE "tension" FIELD. Don't fabricate one.
- Total content ~400-600 words across all cards. Fits on one printed page.

EXAMPLES OF STYLE (these are illustrations of HOW a card reads — NOT templates to fill in. Only write claims that you can defend by pointing to the actual responses below):

{
  "title": "Leadership development resonates",
  "body": "Surfaced as the single most-mentioned theme across the responses — strong signal that investment here will land.",
  "quote": "Most valuable was learning to lead without authority"
}

{
  "title": "Recruitment without retention",
  "body": "Participants describe pulling in new members but losing them quickly. Pipeline is leaky, not empty.",
  "quote": "We recruit but it's not easy to retain them"
}

Critical: do NOT copy these example numbers or example quotes. They are placeholders showing tone. Your numbers and quotes must come from the actual data below.

DO NOT produce content like:
  ✗ "Participants gave varied responses" (vacuous)
  ✗ "Communication is important" (banal)
  ✗ "More data is needed" (cop-out — say what specifically would help)
  ✗ "Responses in Japanese were shorter than English" (linguistic, not strategic)
  ✗ Fabricated subgroups: "First-year participants said X, senior ones said Y" — UNLESS the data actually distinguishes them
  ✗ Invented percentages: "60% said X" — UNLESS you literally counted X and the percentage is accurate

ACTUAL SURVEY RESPONSES:
${block}`;

    try {
      const raw = await callAI(prompt, 4000);
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      const parsed = JSON.parse(m[0]);
      setOnePager(parsed);
    } catch(e) {
      setOnePager({ error: "Could not generate one-pager: " + e.message });
    }
    setLoadingOnePager(false);
  };

  // Convert structured one-pager to plain text for clipboard
  const onePagerToText = (op) => {
    if (!op || op.error) return "";
    const lines = [];
    if (op.title) lines.push(op.title.toUpperCase(), "");
    if (op.metadata) lines.push(op.metadata, "");
    if (op.executiveSummary) lines.push(op.executiveSummary, "");
    (op.sections || []).forEach(s => {
      lines.push("");
      lines.push(`${s.icon || ""} ${(s.title || "").toUpperCase()}`.trim());
      lines.push("─".repeat(40));
      (s.cards || []).forEach(c => {
        lines.push(`• ${c.title}`);
        if (c.body) lines.push(`  ${c.body}`);
        if (c.quote) lines.push(`  "${c.quote}"`);
        lines.push("");
      });
    });
    if (op.tension && op.tension.left && op.tension.right) {
      lines.push("");
      lines.push(`TENSION${op.tension.label ? ` — ${op.tension.label}` : ""}`);
      lines.push(`  ◀ ${op.tension.left}`);
      lines.push(`  ▶ ${op.tension.right}`);
    }
    return lines.join("\n");
  };

  const copyOnePager = () => {
    if (!onePager || onePager.error) return;
    navigator.clipboard.writeText(onePagerToText(onePager)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Download one-pager as PDF ──
  const loadJsPDF = () => new Promise((resolve, reject) => {
    if (window.jspdf?.jsPDF) return resolve(window.jspdf.jsPDF);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf?.jsPDF);
    s.onerror = () => reject(new Error("Could not load jsPDF"));
    document.head.appendChild(s);
  });

  const downloadOnePagerPDF = async () => {
    if (!onePager || onePager.error) return;
    try {
      const jsPDF = await loadJsPDF();
      const op = onePager;
      const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });
      const pageW = 612, pageH = 792;
      const M = 36;
      const colGap = 14;
      const colW = (pageW - M*2 - colGap) / 2;
      const G_DARK = [31, 107, 58];
      const G_MID  = [39, 174, 96];
      const G_LIGHT= [200, 230, 210];
      const G_BG   = [240, 248, 242];
      const TXT    = [26, 58, 38];
      const TXT_MUTED = [122, 170, 136];
      const ORANGE = [230, 145, 56];
      const RED    = [200, 80, 60];

      let y = M;

      // Header bar
      doc.setFillColor(...G_DARK);
      doc.rect(0, 0, pageW, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("EXECUTIVE STRATEGIC ONE-PAGER", M, 14);
      doc.setFont("helvetica", "normal");
      doc.text("Survey Insights Synthesis", pageW - M, 14, { align: "right" });

      y = 50;

      // Title
      doc.setTextColor(...G_DARK);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      const titleLines = doc.splitTextToSize(op.title || "Survey Insights", pageW - M*2);
      titleLines.forEach(l => { doc.text(l, M, y); y += 26; });

      if (op.subtitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...TXT_MUTED);
        doc.text(op.subtitle, M, y);
        y += 14;
      }

      // Executive summary
      if (op.executiveSummary) {
        y += 8;
        const padY = 10, padX = 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const sumLines = doc.splitTextToSize(op.executiveSummary, pageW - M*2 - padX*2);
        const boxH = sumLines.length * 13 + padY*2;
        doc.setFillColor(...G_BG);
        doc.setDrawColor(...G_LIGHT);
        doc.setLineWidth(1);
        doc.roundedRect(M, y, pageW - M*2, boxH, 4, 4, "FD");
        doc.setFillColor(...G_MID);
        doc.rect(M, y, 3, boxH, "F");
        doc.setTextColor(...TXT);
        sumLines.forEach((l, i) => doc.text(l, M + padX, y + padY + 11 + i*13));
        y += boxH + 14;
      }

      // Card renderer
      const drawCard = (x, yStart, w, item, accentColor) => {
        const padX = 10, padY = 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const tLines = doc.splitTextToSize(item.title || "", w - padX*2);
        let yy = yStart + padY + 11;
        tLines.forEach(() => { yy += 12; });
        yy += 2;
        if (item.body) {
          doc.setFontSize(8.5);
          const bLines = doc.splitTextToSize(item.body, w - padX*2);
          bLines.forEach(() => { yy += 11; });
          yy += 2;
        }
        if (item.quote) {
          doc.setFontSize(8);
          const qLines = doc.splitTextToSize(`"${item.quote}"`, w - padX*2);
          qLines.forEach(() => { yy += 10; });
        }
        const cardH = (yy - yStart) - 12 + padY;

        doc.setDrawColor(...G_LIGHT);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.7);
        doc.roundedRect(x, yStart, w, cardH, 3, 3, "FD");
        doc.setFillColor(...accentColor);
        doc.rect(x, yStart, 2.5, cardH, "F");

        let yT = yStart + padY + 11;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...accentColor);
        const tLines2 = doc.splitTextToSize(item.title || "", w - padX*2);
        tLines2.forEach(l => { doc.text(l, x + padX, yT); yT += 12; });
        yT += 2;
        if (item.body) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(...TXT);
          const bLines2 = doc.splitTextToSize(item.body, w - padX*2);
          bLines2.forEach(l => { doc.text(l, x + padX, yT); yT += 11; });
          yT += 2;
        }
        if (item.quote) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(...TXT_MUTED);
          const qLines2 = doc.splitTextToSize(`"${item.quote}"`, w - padX*2);
          qLines2.forEach(l => { doc.text(l, x + padX, yT); yT += 10; });
        }
        return yStart + cardH;
      };

      const sectionHeader = (text, icon, color) => {
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...color);
        doc.text(`${icon}  ${text.toUpperCase()}`, M, y);
        doc.setDrawColor(...color);
        doc.setLineWidth(0.5);
        doc.line(M, y + 3, pageW - M, y + 3);
        y += 14;
      };

      // Free-form sections — iterate whatever the AI produced
      (op.sections || []).forEach(section => {
        const items = section.cards || [];
        if (!items.length) return;
        sectionHeader(section.title || "", section.icon || "", G_MID);
        for (let i = 0; i < items.length; i += 2) {
          const yStart = y;
          const yLeft  = drawCard(M, yStart, colW, items[i], G_MID);
          const yRight = items[i+1] ? drawCard(M + colW + colGap, yStart, colW, items[i+1], G_MID) : yStart;
          y = Math.max(yLeft, yRight) + 8;
          if (y > pageH - M - 60) { doc.addPage(); y = M; }
        }
      });

      // Optional tension footer
      if (op.tension && op.tension.left && op.tension.right) {
        y += 6;
        const footH = 56;
        if (y + footH > pageH - M) { doc.addPage(); y = M; }
        doc.setFillColor(...G_DARK);
        doc.roundedRect(M, y, pageW - M*2, footH, 4, 4, "F");
        if (op.tension.label) {
          doc.setTextColor(180, 220, 195);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.text(op.tension.label.toUpperCase(), M + (pageW - M*2)/2, y + 12, { align: "center" });
        }
        const halfW = (pageW - M*2) / 2;
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        const leftLines = doc.splitTextToSize(`"${op.tension.left}"`, halfW - 24);
        const rightLines = doc.splitTextToSize(`"${op.tension.right}"`, halfW - 24);
        leftLines.forEach((l, j)  => doc.text(l, M + halfW/2, y + 30 + j*11, { align: "center" }));
        rightLines.forEach((l, j) => doc.text(l, M + halfW + halfW/2, y + 30 + j*11, { align: "center" }));
        // × divider
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(180, 220, 195);
        doc.text("×", M + halfW, y + 36, { align: "center" });
        y += footH + 4;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...TXT_MUTED);
      doc.text(`Confidential · Generated ${new Date().toLocaleDateString()}`, pageW/2, pageH - 18, { align: "center" });

      doc.save(`one_pager_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      alert("Could not download PDF: " + e.message);
    }
  };

  // ── Download one-pager as Word (.docx) ──
  const loadDocx = () => new Promise((resolve, reject) => {
    if (window.docx) return resolve(window.docx);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.min.js";
    s.onload = () => resolve(window.docx);
    s.onerror = () => reject(new Error("Could not load docx library"));
    document.head.appendChild(s);
  });

  const downloadOnePagerDOCX = async () => {
    if (!onePager || onePager.error) return;
    try {
      const d = await loadDocx();
      const { Document, Packer, Paragraph, TextRun,
              Table, TableRow, TableCell, WidthType, BorderStyle,
              ShadingType, AlignmentType } = d;
      const op = onePager;
      const G_DARK = "1F6B3A", G_MID = "27AE60", ORANGE = "E69138", RED = "C8504A";
      const TXT = "1A3A26", MUTED = "7AAA88", BG = "F0F8F2";

      const children = [];

      children.push(new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: op.title || "Survey Insights", bold: true, size: 36, color: G_DARK })],
      }));
      if (op.subtitle) children.push(new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({ text: op.subtitle, italics: true, size: 18, color: MUTED })],
      }));

      if (op.executiveSummary) {
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({
            children: [new TableCell({
              shading: { type: ShadingType.SOLID, color: BG, fill: BG },
              borders: {
                left: { style: BorderStyle.SINGLE, size: 24, color: G_MID },
                top: { style: BorderStyle.SINGLE, size: 4, color: "C8E6D2" },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "C8E6D2" },
                right: { style: BorderStyle.SINGLE, size: 4, color: "C8E6D2" },
              },
              children: [new Paragraph({
                spacing: { before: 120, after: 120 },
                children: [new TextRun({ text: op.executiveSummary, size: 22, color: TXT })],
              })],
            })],
          })],
        }));
        children.push(new Paragraph({ spacing: { after: 280 }, children: [] }));
      }

      const sectionHeader = (text, color) => new Paragraph({
        spacing: { before: 240, after: 140 },
        border: { bottom: { color, space: 4, style: BorderStyle.SINGLE, size: 8 } },
        children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color, characterSpacing: 30 })],
      });

      const cardCell = (item, color) => new TableCell({
        margins: { top: 140, bottom: 140, left: 200, right: 200 },
        borders: {
          left: { style: BorderStyle.SINGLE, size: 18, color },
          top: { style: BorderStyle.SINGLE, size: 4, color: "C8E6D2" },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "C8E6D2" },
          right: { style: BorderStyle.SINGLE, size: 4, color: "C8E6D2" },
        },
        children: [
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: item.title || "", bold: true, size: 22, color })],
          }),
          ...(item.body ? [new Paragraph({
            spacing: { after: item.quote ? 80 : 0 },
            children: [new TextRun({ text: item.body, size: 18, color: TXT })],
          })] : []),
          ...(item.quote ? [new Paragraph({
            children: [new TextRun({ text: `"${item.quote}"`, italics: true, size: 16, color: MUTED })],
          })] : []),
        ],
      });

      const cardGrid = (items, color) => {
        const rows = [];
        for (let i = 0; i < items.length; i += 2) {
          rows.push(new TableRow({
            children: [
              cardCell(items[i], color),
              items[i+1] ? cardCell(items[i+1], color) : new TableCell({
                borders: { top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}},
                children: [new Paragraph({ children: [] })],
              }),
            ],
          }));
        }
        return new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
          columnWidths: [4750, 4750],
        });
      };

      // Free-form sections — iterate whatever the AI produced
      (op.sections || []).forEach(section => {
        const items = section.cards || [];
        if (!items.length) return;
        children.push(sectionHeader(`${section.icon || ""}  ${section.title || ""}`.trim(), G_MID));
        children.push(cardGrid(items, G_MID));
      });

      // Optional tension footer
      if (op.tension && op.tension.left && op.tension.right) {
        children.push(new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }));
        if (op.tension.label) {
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [new TextRun({
              text: op.tension.label.toUpperCase(),
              bold: true, size: 18, color: G_MID, characterSpacing: 40,
            })],
          }));
        }
        const tensionCell = (text) => new TableCell({
          shading: { type: ShadingType.SOLID, color: G_DARK, fill: G_DARK },
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
          borders: { top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}},
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `"${text}"`, italics: true, size: 20, color: "FFFFFF" })],
          })],
        });
        const xCell = new TableCell({
          shading: { type: ShadingType.SOLID, color: G_DARK, fill: G_DARK },
          margins: { top: 200, bottom: 200, left: 100, right: 100 },
          borders: { top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}},
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "×", bold: true, size: 28, color: "B4DCC3" })],
          })],
        });
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({ children: [
            tensionCell(op.tension.left),
            xCell,
            tensionCell(op.tension.right),
          ] })],
        }));
      }

      const doc = new Document({
        styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
        sections: [{
          properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
          children,
        }],
      });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `one_pager_${new Date().toISOString().slice(0,10)}.docx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e) {
      alert("Could not download Word: " + e.message);
    }
  };

  // ── Generate AI Presentation ──
  const generatePresentation = async () => {
    if (!responses.length) return;
    setLoadingPres(true); setSlides(null); setSlideIdx(0); setHiddenSlides(new Set());

    // Use the union of currently-active questions AND any question that has
    // at least one answer. This way deactivating a question after the fact
    // doesn't erase it from the presentation.
    const answeredQIds = new Set(
      participantGroups.flatMap(g => Object.keys(g.answersByQId).map(Number))
    );
    const presQs = questions.filter(q =>
      q.active !== false || answeredQIds.has(q.id)
    );

    const nP = participantGroups.length;
    const nQ = presQs.length;
    const nResp = responses.length;
    // Minimum: 1 opening + 1 per question + 1 closing.
    // The AI may produce MORE slides if a question's content needs splitting.
    const minSlides = 2 + nQ;

    // Active session name gives the presentation its title
    const activeSession = sessions.find(s => s.id === activeSessionId);
    const eventName = activeSession?.name || "Survey Results";

    // For each question, build a focused block of its responses + the team's
    // custom analysis instruction (if they wrote one for that question).
    const questionBlocks = presQs.map((q, i) => {
      const qResps = participantGroups
        .map(g => ({ g, answer: answerFor(g, q, i) }))
        .filter(({ answer }) => answer && String(answer).trim());

      const responsesText = qResps.length
        ? qResps.map(({g, answer}) => `- Participant #${g.num} (${g.langName}): ${answer}`).join("\n")
        : "(no responses)";

      const customInstr = (q.analysisInstruction || "").trim();
      const instructionLine = customInstr
        ? `═══ TEAM'S ANALYSIS INSTRUCTION FOR THIS QUESTION ═══
${customInstr}
═════════════════════════════════════════════════════
The instruction above is the SOURCE OF TRUTH for the content of this question's slide.
You MUST cover everything the team asked for. Do not omit, abbreviate, or substitute any part of it.
You may split the content across multiple bullets or sub-bullets to make it look clean,
but every piece of information they requested must appear on the slide.`
        : `═══ ANALYSIS INSTRUCTION ═══
No specific instruction provided. Produce a strategic 3-5 bullet summary highlighting the main themes, patterns, and any notable contrasts in the responses.`;

      return `═══════════════════════════════════════════════════
QUESTION ${i+1}: "${q.en}"

${instructionLine}

RESPONSES (${qResps.length} of ${nP}):
${responsesText}`;
    }).join("\n\n");

    const prompt = `You are a world-class strategic consultant creating a beautiful, audience-ready presentation. The presentation will be projected LIVE to the people who just answered the survey.

═══════════════════════════════════════════════════════
HOW TO READ THIS PROMPT
═══════════════════════════════════════════════════════
For each question slide, the team has either:
(a) provided a SPECIFIC ANALYSIS INSTRUCTION — in which case THE INSTRUCTION DEFINES THE CONTENT. You produce exactly what they asked for, in full. You decide ONLY how to lay it out visually.
(b) provided NO instruction — in which case YOU decide content (per the default summary instructions).

The split is sacred:
- CONTENT belongs to the team (when they wrote an instruction).
- VISUAL FORMAT belongs to you.

Do NOT compress the team's instruction into "executive-friendly bullets" if they asked for "top 10 with counts and quotes" — that would be 10 items with their counts and their quotes. You may use sub-bullets, multi-line items, or anything that fits the slide canvas; you may not drop or summarize what they explicitly asked for.

═══════════════════════════════════════════════════════
GROUNDING RULES — ABSOLUTE
═══════════════════════════════════════════════════════
- Every claim, quote, theme, count, or comparison MUST be derivable from the responses.
- DO NOT invent: numbers, percentages, demographics, segments, regions, departments — anything not in the data.
- Quantitative claims must be exact counts. If you can't count precisely, describe qualitatively ("most", "a few", "one"). Never approximate.
- DO NOT extrapolate. Stick to what people actually said.
- If the data can't support what the instruction asks for (e.g., team asks for "top 10" but only 5 themes exist), provide what the data DOES support and note the limitation honestly.

${MULTILINGUAL_HANDLING}

═══════════════════════════════════════════════════════
DATA SUMMARY (use these exact numbers)
═══════════════════════════════════════════════════════
- Event: ${eventName}
- ${nP} participant${nP===1?"":"s"} answered
- ${nQ} question${nQ===1?"":"s"} were asked
- ${nResp} individual response${nResp===1?"":"s"} collected total

═══════════════════════════════════════════════════════
STRUCTURE — minimum ${minSlides} slides; generate MORE when a question's content is too large for one slide
═══════════════════════════════════════════════════════

SLIDE 1 — OPENING
A welcoming opener for "${eventName} Results". Mention ${nP} participants and ${nQ} questions truthfully. Energize the audience. 2-3 short bullets, one inspiring takeaway.

${presQs.map((q, i) => `QUESTION ${i+1} SLIDES — for question: "${q.en}"

Apply the team's instruction (or default). Cover EVERYTHING they asked for, even if that means using multiple slides.

How to split when content is large:
- Count the items the analysis will produce.
- 8 items or fewer: ONE slide.
- 9 to 15 items: TWO slides. Categories become "QUESTION ${i+1} (Part 1)" and "QUESTION ${i+1} (Part 2)".
- 16 or more items: THREE slides similarly.
- Choose the split point at a natural boundary (top items vs long tail; one category per slide; etc.).

FORMATTING — use markdown bold (wrap text with **double asterisks**) on KEY phrases inside bullets:
- Bold the theme name or category label at the start of each bullet.
- Bold counts when central: **(32 participants)**.
- Bold the most important phrase in the takeaway.
- Don't bold whole sentences — only keywords that should grab the eye on stage.
- Example: "**Leadership development** **(32)** — most-cited theme, especially among Russian speakers."

Other rules:
- If counts asked: include exact counts.
- If quotes asked: include original language + translation.
- DO NOT include the same item twice across slides.
- The takeaway field is OPTIONAL. Use it only on the LAST slide for that question, summarizing the overall pattern.`).join("\n\n")}

CLOSING SLIDE
A short, sincere closing thanking participants and acknowledging the value of their input. 2-3 bullets, one inspiring closing line as takeaway.

═══════════════════════════════════════════════════════
VISUAL FORMAT GUIDELINES — your domain
═══════════════════════════════════════════════════════
- TITLE: short and clear (10 words or less). For multi-part splits use "Top Themes — Part 1" / "Top Themes — Part 2".
- BULLETS (points array): each one self-contained.
- HARD LIMIT: never more than 8 bullets on a single slide. If content needs more, split into multiple slides.
- BOLD KEY TERMS: use markdown **double asterisks** around the most important phrase in each bullet (theme name, count, key noun). This makes the slide scannable from across the room.
- For lists with counts: format as "**Theme name** **(count)** — quote/detail" — e.g., "**Leadership development** **(32)** — 'we need direct mentorship'".
- For quotes inside bullets: "phrase in original" (English translation).
- TAKEAWAY: optional italic sentence at the bottom. Use only on the LAST slide for each question (the synthesis). May also contain **bold** on the punchline word.
- DO NOT pad. If a question has only 3 themes, give 3 bullets — don't invent extras.
- DO NOT repeat content. Each item appears on exactly one slide.

═══════════════════════════════════════════════════════
RETURN FORMAT — strict JSON only, no markdown, no backticks, no commentary
═══════════════════════════════════════════════════════
{
  "presentationTitle": "${eventName} Results",
  "slides": [
    {"category":"OPENING","icon":"✨","title":"...","points":["...","..."],"takeaway":"..."},
    {"category":"QUESTION 1","icon":"💬","title":"...","points":["...","...","..."],"takeaway":"..."},
    {"category":"CLOSING","icon":"🙏","title":"Thank you","points":["..."],"takeaway":""}
  ]
}

═══════════════════════════════════════════════════════
ACTUAL SURVEY DATA — analyze this
═══════════════════════════════════════════════════════
${questionBlocks}`;

    try {
      const raw = await callAI(prompt, 8000);
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      setSlides(JSON.parse(m[0]));
    } catch(e) { setSlides({error:e.message}); }
    setLoadingPres(false);
  };

  const toggleSlide = (i) => {
    setHiddenSlides(prev=>{ const n=new Set(prev); n.has(i)?n.delete(i):n.add(i); return n; });
  };

  const visibleSlides = slides?.slides ? slides.slides.map((_,i)=>i).filter(i=>!hiddenSlides.has(i)) : [];

  const goSlide = (dir) => {
    const pos = visibleSlides.indexOf(slideIdx);
    const next = visibleSlides[pos+dir];
    if (next !== undefined) setSlideIdx(next);
  };

  // ── Shared styles ─────────────────────────────────────────
  const hasData = responses.length > 0;
  const pct = activeQs.length > 0 ? ((qIdx+1)/activeQs.length)*100 : 0;
  const allActive = questions.every(q=>q.active!==false);

  const card = {background:"#fff",border:`2px solid ${BD}`,borderRadius:"14px",
    padding:"22px",boxShadow:"0 2px 8px rgba(27,107,58,.05)",marginBottom:"14px"};

  // ═══════════════════════════════════════════════════════════
  return (
    <div className="app">
      <style>{css}</style>

      {/* ── LIVE PROJECTION SCREEN ── */}
      {/* Designed for projecting on a big screen during the event.
          Open URL: https://your-app.vercel.app/live (or #live)
          Hit F11 for fullscreen. Updates every 3 seconds. */}
      {screen==="live" && (() => {
        // Count distinct participants (one tick per person regardless of
        // how many questions they answered).
        const peopleCount = new Set(
          responses.map(r => r.participant_token).filter(Boolean)
        ).size;
        // Pull the active session name (loaded by the live polling effect).
        const activeSession = sessions.find(s => s.id === activeSessionId);
        const eventName = activeSession?.name || "Live Session";

        // ── Presentation mode: render the current slide full-screen ──
        if (liveMode === "presentation" && liveSlides?.slides?.length) {
          const slidesArr = liveSlides.slides;
          const idx = Math.max(0, Math.min(liveSlideIdx, slidesArr.length - 1));
          const current = slidesArr[idx];
          return (
            <div style={{
              minHeight:"100vh", width:"100%",
              background:`linear-gradient(135deg, ${DG} 0%, #0a3d20 100%)`,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              padding:"40px 60px", fontFamily:"inherit", color:"#fff",
              boxSizing:"border-box"}}>
              {/* Top label — event name */}
              <div style={{position:"absolute",top:"24px",left:"50%",transform:"translateX(-50%)",
                fontSize:"clamp(11px, 1.1vw, 15px)",letterSpacing:"5px",textTransform:"uppercase",
                color:"#b4dcc3",fontWeight:"700",whiteSpace:"nowrap",textAlign:"center",
                padding:"0 20px",maxWidth:"95vw",overflow:"hidden",textOverflow:"ellipsis"}}>
                ✦ {eventName} ✦
              </div>

              {/* Slide content */}
              <div style={{maxWidth:"1200px", width:"100%"}}>
                {/* Category pill */}
                {current.category && (
                  <div style={{display:"inline-block", padding:"6px 18px", borderRadius:"30px",
                    background:"rgba(255,255,255,0.15)", color:"#fff",
                    fontSize:"clamp(11px, 0.9vw, 14px)", fontWeight:"700",
                    letterSpacing:"3px", textTransform:"uppercase", marginBottom:"22px"}}>
                    {current.category}
                  </div>
                )}
                {/* Icon */}
                {current.icon && (
                  <div style={{fontSize:"clamp(44px, 5vw, 72px)", marginBottom:"18px", lineHeight:"1"}}>
                    {current.icon}
                  </div>
                )}
                {/* Title */}
                <h1 style={{fontSize:"clamp(34px, 4vw, 60px)", fontWeight:"800", lineHeight:"1.15",
                  marginBottom:"30px", color:"#fff"}}>
                  {current.title}
                </h1>
                {/* Bullets */}
                {Array.isArray(current.points) && current.points.length > 0 && (
                  <ul style={{listStyle:"none", padding:0, margin:0,
                    display:"flex", flexDirection:"column", gap:"16px"}}>
                    {current.points.map((p, i) => (
                      <li key={i} style={{display:"flex", alignItems:"flex-start", gap:"16px",
                        fontSize:"clamp(18px, 1.7vw, 26px)", color:"rgba(255,255,255,0.95)",
                        lineHeight:"1.55"}}>
                        <span style={{display:"inline-block", width:"10px", height:"10px",
                          borderRadius:"50%", background:"#fff", flexShrink:0, marginTop:"14px"}} />
                        <span dangerouslySetInnerHTML={{__html: mdBold(p)}} />
                      </li>
                    ))}
                  </ul>
                )}
                {/* Takeaway */}
                {current.takeaway && (
                  <div style={{marginTop:"32px", padding:"20px 24px",
                    background:"rgba(255,255,255,0.12)", borderRadius:"12px",
                    borderLeft:"4px solid rgba(255,255,255,0.6)",
                    fontSize:"clamp(16px, 1.5vw, 22px)", color:"#fff",
                    fontStyle:"italic", lineHeight:"1.5"}}
                    dangerouslySetInnerHTML={{__html: mdBold(current.takeaway)}} />
                )}
              </div>

              {/* Slide counter at bottom */}
              <div style={{position:"absolute", bottom:"30px", right:"40px",
                fontSize:"14px", color:"rgba(255,255,255,0.5)", fontWeight:"700",
                letterSpacing:"2px"}}>
                {idx + 1} / {slidesArr.length}
              </div>

              {/* Herbalife logo — subtle, bottom-left corner */}
              <img
                src="/herbalife-logo-white.png"
                alt="Herbalife"
                style={{position:"absolute", bottom:"24px", left:"40px",
                  height:"clamp(28px, 2.5vw, 42px)", opacity:0.55,
                  pointerEvents:"none"}}
              />
            </div>
          );
        }

        // ── Counter mode (default) ──
        return (
          <div style={{
            minHeight:"100vh",width:"100%",
            background:`linear-gradient(135deg, ${DG} 0%, #0a3d20 100%)`,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            padding:"40px 20px",fontFamily:"inherit",color:"#fff"}}>

            {/* Top label — uses the active session name */}
            <div style={{position:"absolute",top:"30px",left:"50%",transform:"translateX(-50%)",
              fontSize:"clamp(13px, 1.3vw, 18px)",letterSpacing:"6px",textTransform:"uppercase",color:"#b4dcc3",fontWeight:"700",
              whiteSpace:"nowrap",textAlign:"center",padding:"0 20px",maxWidth:"95vw",overflow:"hidden",textOverflow:"ellipsis"}}>
              ✦ {eventName} — Live ✦
            </div>

            {/* The big counter */}
            <div style={{textAlign:"center"}}>
              <div style={{
                fontSize:"clamp(120px, 22vw, 280px)",
                fontWeight:"900",lineHeight:"1",
                color:"#fff",
                textShadow:"0 4px 30px rgba(0,0,0,0.3)",
                letterSpacing:"-4px",
                fontVariantNumeric:"tabular-nums",
                animation:"liveCountPulse 2s ease-in-out infinite",
              }}>
                {peopleCount.toLocaleString()}
              </div>
              <div style={{
                fontSize:"clamp(20px, 2.5vw, 32px)",
                marginTop:"20px",letterSpacing:"6px",textTransform:"uppercase",
                color:"#b4dcc3",fontWeight:"600"}}>
                People have answered
              </div>
              <div style={{
                fontSize:"clamp(14px, 1.4vw, 18px)",
                marginTop:"30px",color:"#7aaa88",fontWeight:"500",fontStyle:"italic"}}>
                and counting…
              </div>
            </div>

            {/* Bottom subtle pulse indicator */}
            <div style={{position:"absolute",bottom:"40px",left:"50%",transform:"translateX(-50%)",
              display:"flex",alignItems:"center",gap:"10px",fontSize:"12px",color:"#7aaa88",letterSpacing:"3px",textTransform:"uppercase",fontWeight:"600"}}>
              <span style={{display:"inline-block",width:"10px",height:"10px",borderRadius:"50%",
                background:"#27ae60",animation:"liveDot 1.5s ease-in-out infinite"}} />
              Updating live
            </div>

            {/* Herbalife logo — subtle, bottom-left corner */}
            <img
              src="/herbalife-logo-white.png"
              alt="Herbalife"
              style={{position:"absolute", bottom:"32px", left:"40px",
                height:"clamp(28px, 2.5vw, 40px)", opacity:0.5,
                pointerEvents:"none"}}
            />

            <style>{`
              @keyframes liveCountPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
              }
              @keyframes liveDot {
                0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(39,174,96,0.6); }
                50% { opacity: 0.5; box-shadow: 0 0 0 12px rgba(39,174,96,0); }
              }
            `}</style>
          </div>
        );
      })()}

      {/* ── LANGUAGE SELECT ── */}
      {screen==="lang" && (
        <div className="center">
          <div style={{maxWidth:"720px",width:"100%"}}>
            <div style={{textAlign:"center",marginBottom:"44px"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:"8px",background:DG,color:"#fff",
                padding:"8px 18px",borderRadius:"30px",fontSize:"12px",fontWeight:"700",
                letterSpacing:"2px",textTransform:"uppercase",marginBottom:"18px"}}>
                🌍 Eurasian Markets
              </div>
              {/* Dynamic title — uses the active session name.
                  Splits the name into two parts so we can apply the dual-color
                  styling (dark green / bright green) just like the original. */}
              {(() => {
                const activeSession = sessions.find(s => s.id === activeSessionId);
                const fullName = activeSession?.name || "City Development Mastermind Program";
                const trimmed = fullName.trim();
                const words = trimmed.split(/\s+/);
                let firstPart, secondPart;
                // If the whole name is short (≤ ~16 chars), keep it on a single
                // line so titles like "PT & MT" or "CDMM 2026" don't get awkwardly broken.
                if (trimmed.length <= 16 || words.length === 1) {
                  firstPart = "";
                  secondPart = trimmed;
                } else {
                  // Multi-word names: find the split point closest to the middle by char count
                  const total = trimmed.length;
                  let bestSplit = 1;
                  let bestDiff = Infinity;
                  for (let i = 1; i < words.length; i++) {
                    const left = words.slice(0, i).join(" ").length;
                    const right = total - left - 1;
                    const diff = Math.abs(left - right);
                    if (diff < bestDiff) { bestDiff = diff; bestSplit = i; }
                  }
                  firstPart = words.slice(0, bestSplit).join(" ");
                  secondPart = words.slice(bestSplit).join(" ");
                }
                return (
                  <h1 style={{
                    fontSize: trimmed.length > 30 ? "30px" : (trimmed.length > 20 ? "34px" : "38px"),
                    fontWeight:"800", lineHeight:"1.1"}}>
                    {firstPart && <>{firstPart}<br/></>}
                    <span style={{color:G}}>{secondPart}</span>
                  </h1>
                );
              })()}
              <p style={{marginTop:"10px",color:"#7aaa88",fontSize:"14px"}}>
                Select your language
              </p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px"}}>
              {LANGS.map(l=>(
                <button key={l.code} className="lb" onClick={()=>pickLang(l.code)} style={{
                  background:"#fff",border:`2px solid ${BD}`,borderRadius:"14px",padding:"20px 10px",
                  cursor:"pointer",textAlign:"center",color:"#1a3a26",
                  boxShadow:"0 2px 8px rgba(27,107,58,.06)",transition:"all .2s"}}>
                  <span style={{fontSize:"28px",display:"block",marginBottom:"8px"}}>{l.flag}</span>
                  <span style={{fontSize:"13px",fontWeight:"700",display:"block"}}>{l.name}</span>
                  <span style={{fontSize:"10px",color:"#7aaa88",display:"block",marginTop:"3px"}}>{l.full}</span>
                </button>
              ))}
            </div>
            <div style={{textAlign:"center",marginTop:"28px"}}>
              <button onClick={()=>setScreen("login")} style={{background:"none",border:"none",
                color:"#b0d4b8",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer"}}>
                · · · Admin Panel · · ·
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN LOGIN ── */}
      {screen==="login" && (
        <div className="center">
          <div style={{maxWidth:"360px",width:"100%",textAlign:"center"}}>
            <div style={{width:"72px",height:"72px",background:`linear-gradient(135deg,${DG},${G})`,
              borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"30px",margin:"0 auto 20px",boxShadow:"0 8px 24px rgba(39,174,96,.3)"}}>🔒</div>
            <h2 style={{fontSize:"26px",fontWeight:"800",marginBottom:"8px"}}>Admin Access</h2>
            <p style={{color:"#7aaa88",fontSize:"14px",marginBottom:"24px"}}>Enter your password to continue</p>
            <input type="password" placeholder="Password" value={pw}
              onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()}
              style={{width:"100%",padding:"14px 18px",border:`2px solid ${pwErr?"#e74c3c":BD}`,
                borderRadius:"10px",fontSize:"15px",outline:"none",marginBottom:"8px",
                textAlign:"center",letterSpacing:"4px",background:pwErr?"#fdf0ee":"#fff",
                transition:"all .2s",color:"#1a3a26"}} />
            {pwErr
              ? <p style={{color:"#e74c3c",fontSize:"12px",marginBottom:"14px",fontWeight:"600"}}>❌ Incorrect password</p>
              : <div style={{height:"20px",marginBottom:"14px"}} />}
            <Btn onClick={tryLogin} style={{width:"100%"}}>Unlock Dashboard →</Btn>
            <button onClick={()=>setScreen("lang")} style={{marginTop:"14px",background:"none",
              border:"none",color:"#b0d4b8",fontSize:"12px",cursor:"pointer"}}>← Back to Survey</button>
          </div>
        </div>
      )}

      {/* ── SURVEY ── */}
      {screen==="survey" && (activeQs.length > 0 || currentQId) && (
        <div className="center">
          <div style={{maxWidth:"680px",width:"100%"}}>
            {/* Top bar — language switcher */}
            <div style={{marginBottom:"20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <button onClick={()=>setScreen("langSwitch")} style={{
                background:"none",border:"none",color:"#7aaa88",fontSize:"13px",
                cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",padding:"0",fontFamily:"inherit"}}>
                🌐 Change language
              </button>
            </div>

            {/* If admin pushed a single question (legacy mode) — show only that one */}
            {currentQId ? (
              <>
                <p style={{fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:G,marginBottom:"14px",fontWeight:"700"}}>{t.q}</p>
                <h2 style={{fontSize:"24px",fontWeight:"700",lineHeight:"1.5",marginBottom:"26px"}}>
                  {getLang(questions.find(q=>q.id===currentQId), lang)}
                </h2>
                <textarea value={curAns[0]||""} onChange={e=>changeAnswer(e.target.value)}
                  placeholder={t.ph} rows={6}
                  style={{width:"100%",background:"#fff",border:`2px solid ${BD}`,borderRadius:"12px",
                    padding:"20px",color:"#1a3a26",fontSize:"15px",lineHeight:"1.7",resize:"vertical",outline:"none"}}
                  onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor=BD} />
                {submitError && (
                  <div style={{marginTop:"12px",padding:"12px 14px",background:"#fff2f2",border:"2px solid #faa",
                    borderRadius:"10px",color:"#c0392b",fontSize:"13px",fontWeight:"600"}}>
                    ⚠️ {submitError}
                  </div>
                )}
                <Btn className="nb" onClick={handleNext} disabled={!curAns[0]?.trim()}
                  style={{width:"100%",marginTop:"16px",padding:"17px",fontSize:"14px",
                    background:curAns[0]?.trim()?`linear-gradient(135deg,${DG},${G})`:BD,
                    color:curAns[0]?.trim()?"#fff":"#7aaa88",boxShadow:"none"}}>
                  {t.submit} ✓
                </Btn>
              </>
            ) : (
              <>
                {/* Multi-question form view — all active questions on one screen */}
                {(() => {
                  const answeredCount = curAns.filter(a => a && a.trim()).length;
                  return (
                    <>
                      {/* Progress indicator */}
                      <div style={{marginBottom:"28px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",fontWeight:"600"}}>
                          <span style={{color:"#7aaa88"}}>{answeredCount} / {activeQs.length} {t.q.toLowerCase()}{answeredCount===1?"":"s"}</span>
                          <span style={{color:G}}>{Math.round((answeredCount/Math.max(activeQs.length,1))*100)}%</span>
                        </div>
                        <div style={{height:"6px",background:BD,borderRadius:"6px",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${(answeredCount/Math.max(activeQs.length,1))*100}%`,
                            background:`linear-gradient(90deg,${DG},${G})`,borderRadius:"6px",transition:"width .5s ease"}} />
                        </div>
                      </div>

                      {/* All questions stacked */}
                      {activeQs.map((q, i) => (
                        <div key={q.id} style={{marginBottom:"28px",padding:"22px",background:"#fff",borderRadius:"14px",border:`2px solid ${BD}`}}>
                          <p style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:G,marginBottom:"10px",fontWeight:"700"}}>
                            {t.q} {String(i+1).padStart(2,"0")} / {String(activeQs.length).padStart(2,"0")}
                          </p>
                          <h2 style={{fontSize:"19px",fontWeight:"700",lineHeight:"1.45",marginBottom:"16px",color:"#1a3a26"}}>
                            {getLang(q, lang)}
                          </h2>
                          <textarea
                            value={curAns[i]||""}
                            onChange={e=>{
                              const newAns = [...(curAns.length===activeQs.length?curAns:activeQs.map(()=>""))];
                              newAns[i] = e.target.value;
                              setAnswers(newAns);
                            }}
                            placeholder={t.ph}
                            rows={4}
                            style={{width:"100%",background:"#fafbfc",border:`2px solid ${BD}`,borderRadius:"10px",
                              padding:"14px 16px",color:"#1a3a26",fontSize:"14px",lineHeight:"1.6",resize:"vertical",outline:"none",
                              fontFamily:"inherit",boxSizing:"border-box"}}
                            onFocus={e=>e.target.style.borderColor=G}
                            onBlur={e=>e.target.style.borderColor=BD} />
                        </div>
                      ))}

                      {/* Submit error */}
                      {submitError && (
                        <div style={{marginBottom:"14px",padding:"12px 14px",background:"#fff2f2",border:"2px solid #faa",
                          borderRadius:"10px",color:"#c0392b",fontSize:"13px",fontWeight:"600"}}>
                          ⚠️ {submitError}
                        </div>
                      )}

                      {/* Submit all */}
                      <Btn className="nb" onClick={handleNext} disabled={answeredCount===0}
                        style={{width:"100%",padding:"18px",fontSize:"15px",fontWeight:"700",
                          background:answeredCount>0?`linear-gradient(135deg,${DG},${G})`:BD,
                          color:answeredCount>0?"#fff":"#7aaa88",boxShadow:"none"}}>
                        {answeredCount===0
                          ? `${t.submit} (please answer at least one)`
                          : answeredCount<activeQs.length
                            ? `${t.submit} ✓ (${answeredCount}/${activeQs.length})`
                            : `${t.submit} ✓`}
                      </Btn>
                      {answeredCount>0 && answeredCount<activeQs.length && (
                        <p style={{fontSize:"12px",color:"#7aaa88",textAlign:"center",marginTop:"10px",lineHeight:"1.5"}}>
                          You can submit with empty questions if you prefer.
                        </p>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── COMPLETE ── */}
      {screen==="complete" && (
        <div className="center">
          <div style={{maxWidth:"420px",width:"100%",textAlign:"center"}}>
            <div style={{width:"80px",height:"80px",background:`linear-gradient(135deg,${DG},${G})`,
              borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"34px",margin:"0 auto 24px",boxShadow:"0 8px 24px rgba(39,174,96,.3)"}}>✓</div>
            <h2 style={{fontSize:"34px",fontWeight:"800",marginBottom:"10px"}}>{t.thanks}</h2>
            <p style={{color:"#7aaa88",fontSize:"15px"}}>{t.saved}</p>
          </div>
        </div>
      )}

      {/* ── LANG SWITCH ── */}
      {screen==="langSwitch" && (
        <div className="center">
          <div style={{maxWidth:"720px",width:"100%"}}>
            <div style={{textAlign:"center",marginBottom:"32px"}}>
              <button onClick={()=>setScreen("survey")} style={{background:"none",border:"none",
                color:"#7aaa88",fontSize:"13px",cursor:"pointer",marginBottom:"16px",display:"block",margin:"0 auto 16px"}}>
                ← Back
              </button>
              <h2 style={{fontSize:"26px",fontWeight:"800",color:"#1a3a26"}}>Change Language</h2>
              <p style={{color:"#7aaa88",fontSize:"14px",marginTop:"8px"}}>Your answers are saved — just pick a new language</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px"}}>
              {LANGS.map(l=>(
                <button key={l.code} className="lb" onClick={()=>{
                  setLang(l.code);
                  // Decide where to go based on session state.
                  // If session is open AND there are active questions, go straight to the survey.
                  // Otherwise go to waiting and let polling pick up the right state.
                  const hasActive = questions.some(q => q.active !== false);
                  if (sessionOpen && (currentQId || hasActive)) {
                    setScreen("survey");
                  } else {
                    setScreen("waiting");
                  }
                }} style={{
                  background: lang===l.code?"#f0faf4":"#fff",
                  border:`2px solid ${lang===l.code?G:BD}`,
                  borderRadius:"14px",padding:"20px 10px",cursor:"pointer",textAlign:"center",
                  color:"#1a3a26",boxShadow:"0 2px 8px rgba(27,107,58,.06)",transition:"all .2s"}}>
                  <span style={{fontSize:"28px",display:"block",marginBottom:"8px"}}>{l.flag}</span>
                  <span style={{fontSize:"13px",fontWeight:"700",display:"block"}}>{l.name}</span>
                  {lang===l.code && <span style={{fontSize:"10px",color:G,display:"block",marginTop:"3px"}}>✓ Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── WAITING SCREEN ── */}
      {screen==="waiting" && (
        <div className="center">
          <div style={{maxWidth:"440px",width:"100%",textAlign:"center"}}>
            <div style={{width:"80px",height:"80px",background:`linear-gradient(135deg,${DG},${G})`,
              borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"34px",margin:"0 auto 24px",boxShadow:"0 8px 24px rgba(39,174,96,.3)",
              animation:"pulse 2s infinite"}}>⏳</div>
            <style>{`@keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.08);}}`}</style>
            <h2 style={{fontSize:"28px",fontWeight:"800",marginBottom:"10px",color:"#1a3a26"}}>
              {lang==="zh"?"请稍等...":lang==="ja"?"お待ちください...":lang==="ko"?"잠시 기다려 주세요...":
               lang==="th"?"กรุณารอสักครู่...":lang==="vi"?"Vui lòng chờ...":lang==="id"?"Mohon tunggu...":
               lang==="fil"?"Mangyaring maghintay...":"Please wait..."}
            </h2>
            <p style={{color:"#7aaa88",fontSize:"15px"}}>
              {lang==="zh"?"下一个问题即将到来":lang==="ja"?"次の質問をお待ちください":lang==="ko"?"다음 질문을 기다리는 중":
               lang==="th"?"กำลังรอคำถามถัดไป":lang==="vi"?"Đang chờ câu hỏi tiếp theo":lang==="id"?"Menunggu pertanyaan berikutnya":
               lang==="fil"?"Naghihintay sa susunod na tanong":"Next question coming soon"}
            </p>
            <div style={{marginTop:"24px",display:"flex",justifyContent:"center",gap:"6px"}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:"8px",height:"8px",borderRadius:"50%",background:G,
                  animation:`bounce 1.2s ${i*0.2}s infinite`,opacity:0.7}}/>
              ))}
            </div>
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}`}</style>
            <button onClick={()=>setScreen("langSwitch")} style={{
              marginTop:"32px",background:"none",border:"none",color:"#b0d4b8",
              fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>
              🌐 Change language
            </button>
          </div>
        </div>
      )}

      {/* ── SESSION DONE SCREEN ── */}
      {screen==="sessionDone" || sessionDone ? (
        <div className="center">
          <div style={{maxWidth:"440px",width:"100%",textAlign:"center"}}>
            <div style={{width:"80px",height:"80px",background:`linear-gradient(135deg,${DG},${G})`,
              borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"34px",margin:"0 auto 24px",boxShadow:"0 8px 24px rgba(39,174,96,.3)"}}>🎉</div>
            <h2 style={{fontSize:"32px",fontWeight:"800",marginBottom:"10px",color:"#1a3a26"}}>
              {lang==="zh"?"感谢您的参与！":lang==="ja"?"ご参加ありがとうございました！":lang==="ko"?"참여해 주셔서 감사합니다!":
               lang==="th"?"ขอบคุณสำหรับการมีส่วนร่วม!":lang==="vi"?"Cảm ơn bạn đã tham gia!":lang==="id"?"Terima kasih atas partisipasi Anda!":
               lang==="fil"?"Salamat sa iyong pakikilahok!":"Thank you for participating!"}
            </h2>
            <p style={{color:"#7aaa88",fontSize:"15px"}}>
              {lang==="zh"?"您的回答已记录。":lang==="ja"?"回答が記録されました。":lang==="ko"?"응답이 기록되었습니다.":
               lang==="th"?"บันทึกคำตอบของคุณแล้ว":lang==="vi"?"Phản hồi của bạn đã được ghi lại.":lang==="id"?"Tanggapan Anda telah dicatat.":
               lang==="fil"?"Naitala na ang iyong mga sagot.":"Your responses have been recorded."}
            </p>
          </div>
        </div>
      ) : null}

      {/* ── ADMIN ── */}
      {screen==="admin" && (
        <div style={{minHeight:"100vh",background:LG,padding:"28px 20px"}}>

          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            maxWidth:"1020px",margin:"0 auto 24px",flexWrap:"wrap",gap:"12px"}}>
            <h1 style={{fontSize:"22px",fontWeight:"800"}}>📊 Admin Dashboard</h1>
            <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
              <SmallBtn onClick={copyAsTable} disabled={!hasData} color={copied?"green":"white"}>
                {copied?"✓ Copied!":"📊 Copy as Table"}
              </SmallBtn>
              <button onClick={exportCSV} disabled={!hasData} style={{
                padding:"9px 16px",borderRadius:"9px",fontSize:"12px",fontWeight:"600",
                cursor:hasData?"pointer":"not-allowed",border:`2px solid ${csvDone?"#27ae60":DG}`,
                background:csvDone?"#d5f5e3":DG,color:csvDone?DG:"#fff",opacity:hasData?1:.4}}>
                {csvDone?"✓ Downloaded!":"⬇ Export CSV"}
              </button>
              <button onClick={()=>window.open("/live","_blank")} style={{
                padding:"9px 16px",borderRadius:"9px",fontSize:"12px",fontWeight:"700",
                cursor:"pointer",border:`2px solid ${G}`,background:"#fff",color:DG,
                fontFamily:"inherit"}}
                title="Open the projection screen in a new tab — for showing on a big screen during the event">
                🖥️ Open Live View
              </button>
              <SmallBtn onClick={()=>setScreen("lang")} color="white">← Survey</SmallBtn>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px",maxWidth:"1020px",margin:"0 auto 24px"}}>
            {[{n:uniqueParticipantCount,l:"Participants"},{n:responses.length,l:"Responses"},{n:new Set(responses.map(r=>r.lang)).size,l:"Languages"}].map((s,i)=>(
              <div key={i} style={{background:"#fff",border:`2px solid ${BD}`,borderRadius:"14px",padding:"22px",textAlign:"center"}}>
                <div style={{fontSize:"38px",fontWeight:"800",color:DG,lineHeight:"1",marginBottom:"5px"}}>{s.n}</div>
                <div style={{fontSize:"10px",color:"#7aaa88",letterSpacing:"2px",textTransform:"uppercase",fontWeight:"600"}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* ── Event Session Selector ── */}
          {/* Lets admins switch between separate "events" (e.g., PT&MT vs CDMM).
              Each session has its own questions, responses, and analysis. */}
          <div style={{maxWidth:"1020px",margin:"0 auto 16px",background:"#fff",
            border:`2px solid ${BD}`,borderRadius:"14px",padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
              <div style={{flex:1,minWidth:"220px"}}>
                <p style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:G,fontWeight:"700",marginBottom:"6px"}}>
                  📂 Event Session
                </p>
                <p style={{fontSize:"12px",color:"#7aaa88",marginBottom:"10px",lineHeight:"1.5"}}>
                  Each session is an independent event with its own questions, responses, and analysis. Switch sessions or create a new one without affecting the others.
                </p>
                {!creatingSession ? (
                  <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                    <select
                      value={activeSessionId || ""}
                      onChange={e => switchSession(parseInt(e.target.value, 10))}
                      style={{padding:"9px 12px",borderRadius:"8px",border:`2px solid ${BD}`,
                        fontSize:"13px",fontWeight:"600",color:"#1a3a26",background:"#fff",cursor:"pointer",
                        fontFamily:"inherit",outline:"none",minWidth:"220px"}}
                    >
                      {sessions.length === 0 && <option value="">Loading...</option>}
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.id === activeSessionId ? "  ← active" : ""}
                        </option>
                      ))}
                    </select>
                    <SmallBtn onClick={() => setCreatingSession(true)} color="green">
                      + New Session
                    </SmallBtn>
                    {activeSessionId && sessions.length > 1 && (
                      <SmallBtn
                        onClick={() => deleteSession(sessions.find(s => s.id !== activeSessionId)?.id)}
                        color="white"
                        title="Delete a session (cannot delete the active one)"
                      >
                        🗑 Delete other…
                      </SmallBtn>
                    )}
                  </div>
                ) : (
                  <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                    <input
                      autoFocus
                      type="text"
                      value={newSessionName}
                      onChange={e => setNewSessionName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") createSession(newSessionName);
                        if (e.key === "Escape") { setCreatingSession(false); setNewSessionName(""); }
                      }}
                      placeholder='e.g., "PT&MT - May 14" or "CDMM - May 15"'
                      style={{padding:"9px 12px",borderRadius:"8px",border:`2px solid ${G}`,
                        fontSize:"13px",fontFamily:"inherit",outline:"none",minWidth:"260px"}}
                    />
                    <SmallBtn onClick={() => createSession(newSessionName)} color="green" disabled={!newSessionName.trim()}>
                      ✓ Create
                    </SmallBtn>
                    <SmallBtn onClick={() => { setCreatingSession(false); setNewSessionName(""); }} color="white">
                      Cancel
                    </SmallBtn>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Controls */}
          <div style={{maxWidth:"1020px",margin:"0 auto 20px",background:"#fff",
            border:`2px solid ${BD}`,borderRadius:"14px",padding:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
              <div>
                <h3 style={{fontSize:"15px",fontWeight:"700",color:"#1a3a26"}}>Session Control</h3>
                <p style={{fontSize:"12px",color:"#7aaa88",marginTop:"3px"}}>
                  {sessionOpen ? "🟢 Session is OPEN — participants are waiting" : "🔴 Session is closed"}
                  {currentQId != null ? ` · Active Q: ${(questions.find(q=>q.id===currentQId)||{en:""}).en.slice(0,40)}...` : ""}
                </p>
              </div>
              <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                {!sessionOpen && questions.length > 0 && (
                  <button onClick={openFormSession} style={{padding:"10px 20px",borderRadius:"9px",
                    background:`linear-gradient(135deg,${DG},${G})`,color:"#fff",border:"none",
                    fontFamily:"inherit",fontSize:"13px",fontWeight:"700",cursor:"pointer",
                    boxShadow:"0 4px 15px rgba(39,174,96,.25)"}}>
                    🚀 Open Session — Show All Questions
                  </button>
                )}
                {sessionOpen && (
                  <button onClick={closeSession} style={{padding:"10px 20px",borderRadius:"9px",
                    background:"linear-gradient(135deg,#c0392b,#e74c3c)",color:"#fff",border:"none",
                    fontFamily:"inherit",fontSize:"13px",fontWeight:"700",cursor:"pointer",
                    boxShadow:"0 4px 15px rgba(192,57,43,.25)"}}>
                    🔒 End Session
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:"8px",maxWidth:"1020px",margin:"0 auto 20px",flexWrap:"wrap"}}>
            {[["questions","✏️ Questions"],["responses","📊 Results"]].map(([t2,label])=>(
              <button key={t2} onClick={()=>setTab(t2)} style={{
                padding:"10px 22px",borderRadius:"9px",fontSize:"12px",fontWeight:"600",
                cursor:"pointer",border:`2px solid ${tab===t2?DG:BD}`,transition:"all .2s",
                background:tab===t2?DG:"#fff",color:tab===t2?"#fff":"#7aaa88"}}>
                {label}
              </button>
            ))}
          </div>

          <div style={{maxWidth:"1020px",margin:"0 auto"}}>

            {/* ── RESPONSES & RESULTS TAB ── */}
            {tab==="responses" && (
              !hasData ? (
                <div style={{textAlign:"center",padding:"60px",color:"#b0d4b8"}}>
                  <div style={{fontSize:"48px",marginBottom:"16px"}}>📭</div>
                  No responses yet. Share the survey with participants!
                </div>
              ) : (
                <div>
                  {/* Results action buttons */}
                  <div style={{display:"flex",gap:"10px",marginBottom:"16px",flexWrap:"wrap",alignItems:"center"}}>
                    <button onClick={loadResponses} style={{
                      padding:"9px 16px",borderRadius:"9px",fontSize:"12px",fontWeight:"600",
                      cursor:"pointer",border:`2px solid ${G}`,background:LG,color:DG}}>
                      🔄 Refresh
                    </button>
                    <button onClick={deleteAllResponses} style={{
                      padding:"9px 16px",borderRadius:"9px",fontSize:"12px",fontWeight:"600",
                      cursor:"pointer",border:"2px solid #fcc",background:"#fff8f0",color:"#c0392b"}}>
                      🗑 Delete All Responses
                    </button>
                    <button onClick={()=>setCollapsedQs(new Set(questions.map(q=>q.id)))} style={{
                      padding:"9px 16px",borderRadius:"9px",fontSize:"12px",fontWeight:"600",
                      cursor:"pointer",border:`2px solid ${BD}`,background:"#fff",color:"#7aaa88"}}>
                      ▸ Collapse all
                    </button>
                    <button onClick={()=>setCollapsedQs(new Set())} style={{
                      padding:"9px 16px",borderRadius:"9px",fontSize:"12px",fontWeight:"600",
                      cursor:"pointer",border:`2px solid ${BD}`,background:"#fff",color:"#7aaa88"}}>
                      ▾ Expand all
                    </button>
                  </div>

                  {/* Generate Presentation button at top */}
                  <button onClick={generatePresentation} disabled={loadingPres} style={{
                    width:"100%",padding:"16px",border:"none",borderRadius:"12px",fontSize:"13px",
                    fontWeight:"700",cursor:loadingPres?"not-allowed":"pointer",marginBottom:"12px",
                    background:`linear-gradient(135deg,${DG},${G})`,color:"#fff",
                    boxShadow:"0 4px 15px rgba(39,174,96,.25)",opacity:loadingPres?.6:1}}>
                    {loadingPres?"⏳ Generating presentation...":slides?"🔄 Regenerate AI Presentation":"✨ Generate AI Presentation"}
                  </button>

                  {/* Generate One-Pager button */}
                  <button onClick={generateOnePager} disabled={loadingOnePager} style={{
                    width:"100%",padding:"14px",border:`2px solid ${G}`,borderRadius:"12px",fontSize:"13px",
                    fontWeight:"700",cursor:loadingOnePager?"not-allowed":"pointer",marginBottom:"24px",
                    background:"#fff",color:DG,opacity:loadingOnePager?.6:1}}>
                    {loadingOnePager?"⏳ Distilling key insights...":onePager?"🔄 Regenerate Strategic One-Pager":"📄 Generate Strategic One-Pager"}
                  </button>

                  {/* One-pager viewer */}
                  {loadingOnePager && (
                    <div style={{textAlign:"center",padding:"30px",background:"#fff",borderRadius:"14px",border:`2px solid ${BD}`,marginBottom:"24px"}}>
                      <div style={{width:"32px",height:"32px",border:`3px solid ${BD}`,borderTopColor:G,
                        borderRadius:"50%",animation:"spin .9s linear infinite",margin:"0 auto 14px"}} />
                      <p style={{color:"#7aaa88",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase"}}>Distilling the strategic essentials...</p>
                    </div>
                  )}
                  {onePager && !loadingOnePager && onePager.error && (
                    <div style={{background:"#fff2f2",border:"2px solid #faa",borderRadius:"14px",padding:"20px",marginBottom:"24px",color:"#c0392b"}}>
                      ⚠️ {onePager.error}
                    </div>
                  )}
                  {onePager && !loadingOnePager && !onePager.error && (
                    <div style={{background:"#fff",borderRadius:"14px",border:`2px solid ${BD}`,padding:"24px",marginBottom:"24px"}}>
                      {/* Action bar */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px",paddingBottom:"14px",borderBottom:`2px solid ${LG}`,gap:"10px",flexWrap:"wrap"}}>
                        <span style={{fontSize:"10px",fontWeight:"700",color:G,letterSpacing:"2px",textTransform:"uppercase"}}>📄 Executive Strategic One-Pager</span>
                        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                          <button onClick={copyOnePager} style={{
                            padding:"6px 12px",borderRadius:"7px",fontSize:"11px",fontWeight:"600",
                            cursor:"pointer",border:`2px solid ${BD}`,background:copied?G:"#fff",color:copied?"#fff":DG}}>
                            {copied?"✓ Copied":"📋 Copy"}
                          </button>
                          <button onClick={downloadOnePagerPDF} style={{
                            padding:"6px 12px",borderRadius:"7px",fontSize:"11px",fontWeight:"600",
                            cursor:"pointer",border:`2px solid ${G}`,background:"#fff",color:DG}}>
                            ⬇ PDF
                          </button>
                          <button onClick={downloadOnePagerDOCX} style={{
                            padding:"6px 12px",borderRadius:"7px",fontSize:"11px",fontWeight:"600",
                            cursor:"pointer",border:`2px solid ${G}`,background:"#fff",color:DG}}>
                            ⬇ Word
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 style={{fontSize:"24px",fontWeight:"800",color:DG,margin:"0 0 4px",lineHeight:"1.25"}}>{onePager.title}</h2>
                      {onePager.metadata && (
                        <p style={{fontSize:"12px",color:"#7aaa88",margin:"0 0 18px",fontStyle:"italic"}}>{onePager.metadata}</p>
                      )}

                      {/* Executive summary */}
                      {onePager.executiveSummary && (
                        <div style={{background:"#f0f8f2",borderLeft:`4px solid ${G}`,borderRadius:"6px",padding:"14px 16px",marginBottom:"22px",fontSize:"14px",lineHeight:"1.6",color:"#1a3a26"}}>
                          {onePager.executiveSummary}
                        </div>
                      )}

                      {/* Sections — fully AI-determined */}
                      {Array.isArray(onePager.sections) && onePager.sections.map((sec, si) => (
                        <div key={si} style={{marginBottom:"22px"}}>
                          <div style={{fontSize:"11px",fontWeight:"700",color:G,letterSpacing:"2px",textTransform:"uppercase",borderBottom:`1px solid ${G}`,paddingBottom:"6px",marginBottom:"12px",display:"flex",alignItems:"center",gap:"8px"}}>
                            {sec.icon && <span style={{fontSize:"14px",letterSpacing:0}}>{sec.icon}</span>}
                            <span>{sec.title}</span>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"12px"}}>
                            {(sec.cards || []).map((c, ci) => (
                              <div key={ci} style={{background:"#fff",border:`1px solid ${LG}`,borderLeft:`4px solid ${G}`,borderRadius:"6px",padding:"12px 14px"}}>
                                <div style={{fontSize:"13px",fontWeight:"700",color:DG,marginBottom:"6px"}}>{c.title}</div>
                                {c.body && <div style={{fontSize:"12px",color:"#1a3a26",lineHeight:"1.55",marginBottom:c.quote?"8px":"0"}}>{c.body}</div>}
                                {c.quote && <div style={{fontSize:"11px",color:"#7aaa88",fontStyle:"italic",lineHeight:"1.5"}}>"{c.quote}"</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Tension footer (optional) */}
                      {onePager.tension && onePager.tension.left && onePager.tension.right && (
                        <div style={{marginTop:"6px",borderRadius:"10px",overflow:"hidden",background:DG}}>
                          {onePager.tension.label && (
                            <div style={{padding:"8px 12px",textAlign:"center",fontSize:"9px",fontWeight:"700",letterSpacing:"3px",color:"#b4dcc3"}}>
                              {onePager.tension.label.toUpperCase()}
                            </div>
                          )}
                          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",padding:"14px 18px",color:"#fff"}}>
                            <div style={{fontSize:"13px",fontStyle:"italic",lineHeight:"1.4",textAlign:"center"}}>"{onePager.tension.left}"</div>
                            <div style={{fontSize:"20px",fontWeight:"700",padding:"0 16px",color:"#b4dcc3"}}>×</div>
                            <div style={{fontSize:"13px",fontStyle:"italic",lineHeight:"1.4",textAlign:"center"}}>"{onePager.tension.right}"</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Presentation viewer */}
                  {loadingPres && (
                    <div style={{textAlign:"center",padding:"40px",background:"#fff",borderRadius:"14px",border:`2px solid ${BD}`,marginBottom:"24px"}}>
                      <div style={{width:"38px",height:"38px",border:`3px solid ${BD}`,borderTopColor:G,
                        borderRadius:"50%",animation:"spin .9s linear infinite",margin:"0 auto 16px"}} />
                      <p style={{color:"#7aaa88",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase"}}>AI is building your presentation...</p>
                    </div>
                  )}

                  {slides && !slides.error && slides.slides && (
                    <div style={{...card,marginBottom:"24px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px",paddingBottom:"14px",borderBottom:`2px solid ${LG}`,gap:"12px",flexWrap:"wrap"}}>
                        <span style={{fontSize:"14px",fontWeight:"700",color:DG}}>📊 {slides.presentationTitle}</span>
                        <div style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
                          <button onClick={downloadPPTX} style={{
                            padding:"7px 14px",borderRadius:"8px",fontSize:"11px",fontWeight:"700",
                            cursor:"pointer",border:`2px solid ${G}`,background:"#fff",color:DG,
                            display:"flex",alignItems:"center",gap:"6px"}}>
                            ⬇ Download .pptx
                          </button>
                          {/* Push to /live screen */}
                          {liveMode === "presentation" ? (
                            <button onClick={showCounterOnLive} style={{
                              padding:"7px 14px",borderRadius:"8px",fontSize:"11px",fontWeight:"700",
                              cursor:"pointer",border:`2px solid #c78a00`,background:"#fff8e6",color:"#8a5a00",
                              display:"flex",alignItems:"center",gap:"6px"}}
                              title="Stop showing the presentation on /live and go back to the response counter">
                              ← Back to counter
                            </button>
                          ) : (
                            <button onClick={pushPresentationToLive} style={{
                              padding:"7px 14px",borderRadius:"8px",fontSize:"11px",fontWeight:"700",
                              cursor:"pointer",border:`2px solid ${DG}`,background:DG,color:"#fff",
                              display:"flex",alignItems:"center",gap:"6px"}}
                              title="Push these slides to the /live projection screen, starting at slide 1">
                              🖥️ Show on /live
                            </button>
                          )}
                          <span style={{fontSize:"11px",color:"#7aaa88"}}>{slides.slides.length - hiddenSlides.size} / {slides.slides.length} slides visible</span>
                        </div>
                      </div>

                      {/* If we're projecting, show a banner with live navigation */}
                      {liveMode === "presentation" && liveSlides?.slides && (
                        <div style={{padding:"10px 14px",background:"#fff8e6",border:`2px solid #f0c14b`,
                          borderRadius:"10px",marginBottom:"14px",display:"flex",alignItems:"center",
                          justifyContent:"space-between",gap:"10px",flexWrap:"wrap"}}>
                          <span style={{fontSize:"12px",fontWeight:"700",color:"#8a5a00"}}>
                            🔴 LIVE on /live screen — slide {liveSlideIdx + 1} of {liveSlides.slides.length}
                          </span>
                          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                            <button onClick={()=>goLiveSlide(liveSlideIdx - 1)}
                              disabled={liveSlideIdx <= 0}
                              style={{width:"32px",height:"32px",background:"#fff",border:`2px solid #f0c14b`,
                                borderRadius:"7px",color:"#8a5a00",fontSize:"15px",fontWeight:"700",
                                cursor:liveSlideIdx<=0?"not-allowed":"pointer",
                                opacity:liveSlideIdx<=0?.4:1}}>‹</button>
                            <button onClick={()=>goLiveSlide(liveSlideIdx + 1)}
                              disabled={liveSlideIdx >= (liveSlides.slides.length - 1)}
                              style={{width:"32px",height:"32px",background:"#fff",border:`2px solid #f0c14b`,
                                borderRadius:"7px",color:"#8a5a00",fontSize:"15px",fontWeight:"700",
                                cursor:liveSlideIdx>=(liveSlides.slides.length-1)?"not-allowed":"pointer",
                                opacity:liveSlideIdx>=(liveSlides.slides.length-1)?.4:1}}>›</button>
                          </div>
                        </div>
                      )}

                      {/* Navigation (admin preview, separate from /live) */}
                      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
                        <button onClick={()=>goSlide(-1)} disabled={visibleSlides.indexOf(slideIdx)<=0}
                          style={{width:"36px",height:"36px",background:LG,border:`2px solid ${BD}`,borderRadius:"8px",
                            color:"#7aaa88",fontSize:"17px",cursor:"pointer",display:"flex",alignItems:"center",
                            justifyContent:"center",opacity:visibleSlides.indexOf(slideIdx)<=0?.3:1,flexShrink:0}}>‹</button>
                        <span style={{fontSize:"12px",color:"#7aaa88",fontWeight:"700",minWidth:"55px",textAlign:"center"}}>
                          {visibleSlides.indexOf(slideIdx)+1} / {visibleSlides.length}
                        </span>
                        <button onClick={()=>goSlide(1)} disabled={visibleSlides.indexOf(slideIdx)>=visibleSlides.length-1}
                          style={{width:"36px",height:"36px",background:LG,border:`2px solid ${BD}`,borderRadius:"8px",
                            color:"#7aaa88",fontSize:"17px",cursor:"pointer",display:"flex",alignItems:"center",
                            justifyContent:"center",opacity:visibleSlides.indexOf(slideIdx)>=visibleSlides.length-1?.3:1,flexShrink:0}}>›</button>
                        <div style={{display:"flex",gap:"5px",flex:1,flexWrap:"wrap"}}>
                          {slides.slides.map((_,i)=>(
                            <div key={i} onClick={()=>!hiddenSlides.has(i)&&setSlideIdx(i)} style={{
                              width:i===slideIdx?"18px":"7px",height:"7px",borderRadius:i===slideIdx?"4px":"50%",
                              background:hiddenSlides.has(i)?"#ddd":i===slideIdx?G:BD,
                              cursor:hiddenSlides.has(i)?"default":"pointer",transition:"all .2s",opacity:hiddenSlides.has(i)?.35:1}} />
                          ))}
                        </div>
                      </div>
                      {/* Slide */}
                      {hiddenSlides.has(slideIdx)
                        ? <div style={{borderRadius:"12px",height:"120px",display:"flex",alignItems:"center",
                            justifyContent:"center",background:"#f5f5f5",border:"2px dashed #ddd",color:"#bbb",marginBottom:"14px"}}>
                            This slide is hidden
                          </div>
                        : <Slide data={slides.slides[slideIdx]} idx={slideIdx} total={slides.slides.length} />
                      }
                      {/* Slide manager */}
                      <div style={{marginTop:"14px",display:"flex",flexDirection:"column",gap:"6px"}}>
                        {slides.slides.map((s,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 12px",
                            background:hiddenSlides.has(i)?LG:"#fff",borderRadius:"8px",border:`1px solid ${BD}`,
                            opacity:hiddenSlides.has(i)?.5:1,transition:"all .2s",cursor:"pointer"}}
                            onClick={()=>!hiddenSlides.has(i)&&setSlideIdx(i)}>
                            <span style={{fontSize:"16px"}}>{s.icon}</span>
                            <div style={{flex:1}}>
                              <div style={{fontSize:"12px",fontWeight:"600",color:"#1a3a26"}}>{s.title}</div>
                              <div style={{fontSize:"10px",color:"#7aaa88",textTransform:"uppercase",letterSpacing:"1px"}}>{s.category}</div>
                            </div>
                            <button onClick={e=>{e.stopPropagation();toggleSlide(i);}} style={{
                              padding:"4px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:"700",flexShrink:0,
                              border:`2px solid ${hiddenSlides.has(i)?"#faa":BD}`,
                              background:hiddenSlides.has(i)?"#fff2f2":LG,
                              color:hiddenSlides.has(i)?"#c0392b":G,cursor:"pointer"}}>
                              {hiddenSlides.has(i)?"○ Off":"● On"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {slides?.error && (
                    <div style={{padding:"20px",background:"#fff2f2",borderRadius:"12px",color:"#c0392b",fontSize:"13px",marginBottom:"24px"}}>
                      Error: {slides.error}
                    </div>
                  )}

                  {/* Questions with responses + per-question summary */}
                  {questions.map((q,qi)=>{
                    // Build per-question answers using participantGroups so orphaned/legacy
                    // responses also show up (matches the Copy as Table behaviour)
                    const qResponses = participantGroups
                      .map(g => ({
                        g,
                        answer: answerFor(g, q, qi),
                      }))
                      .filter(({ answer }) => answer && String(answer).trim());
                    if (qResponses.length === 0) return null;
                    return (
                    <div key={q.id} style={{...card}}>
                      {/* Question header */}
                      <div style={{marginBottom:"16px",paddingBottom:"14px",borderBottom:`2px solid ${LG}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}}>
                          <div style={{flex:1}}>
                            <span style={{fontSize:"10px",fontWeight:"700",color:G,letterSpacing:"2px",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>
                              Question {qi+1} · {qResponses.length} response{qResponses.length===1?"":"s"}
                            </span>
                            <h3 style={{fontSize:"16px",fontWeight:"700",color:"#1a3a26",lineHeight:"1.4",cursor:"pointer"}}
                              onClick={()=>setCollapsedQs(prev=>{
                                const n=new Set(prev);
                                if(n.has(q.id)) n.delete(q.id); else n.add(q.id);
                                return n;
                              })}
                              title="Click to collapse / expand responses">
                              <span style={{display:"inline-block",marginRight:"6px",fontSize:"12px",color:G,transform:collapsedQs.has(q.id)?"rotate(-90deg)":"none",transition:"transform .2s"}}>▾</span>
                              {q.en}
                            </h3>
                          </div>
<div style={{display:"flex",gap:"8px",flexShrink:0}}>
                            {sessionOpen && (
                            <button onClick={()=>activateQuestion(q)} style={{
                              padding:"9px 14px",borderRadius:"9px",fontSize:"12px",fontWeight:"700",
                              cursor:"pointer",border:`2px solid ${currentQId===q.id?"#27ae60":"#d5ede0"}`,
                              background:currentQId!=null&&currentQId===q.id?"#d5f5e3":"#fff",
                              color:currentQId!=null&&currentQId===q.id?"#fff":"#7aaa88",flexShrink:0}}>
                              {currentQId!=null&&currentQId===q.id?"⏹":"▶ Activate"}
                            </button>
                          )}
                          </div>
                        </div>
                      </div>

                      {/* Analysis prompt — sets how the AI will analyze this question
                          when you click "Generate Final Presentation". Edit any time. */}
                      <div style={{marginBottom:"14px"}}>
                        <button onClick={()=>toggleInstrExpand(q)}
                          style={{background:"transparent",border:"none",padding:0,cursor:"pointer",
                            fontSize:"12px",color:q.analysisInstruction?G:"#7aaa88",fontWeight:"600",
                            textDecoration:"underline",textDecorationStyle:"dotted",textUnderlineOffset:"3px"}}>
                          {q.analysisInstruction
                            ? `🧠 Analysis prompt set ✓  ${expandedInstr.has(q.id) ? "(hide)" : "(view / edit)"}`
                            : `🧠 + Add analysis prompt for this question`}
                        </button>
                        {expandedInstr.has(q.id) && (
                          <div style={{marginTop:"10px",padding:"14px",background:"#f4faf6",borderRadius:"10px",border:`1px solid ${G}`}}>
                            <div style={{fontSize:"10px",fontWeight:"700",color:DG,marginBottom:"6px",letterSpacing:"1.5px",textTransform:"uppercase"}}>
                              🧠 Analysis instruction for the final presentation
                            </div>
                            <p style={{fontSize:"11px",color:"#7aaa88",margin:"0 0 10px",lineHeight:"1.5"}}>
                              Tells the AI how to summarize this question on its slide of the final presentation. Leave empty for a generic strategic summary.
                            </p>
                            <textarea
                              value={instrDraft[q.id] ?? ""}
                              onChange={e=>setInstrDraft(d=>({...d, [q.id]: e.target.value}))}
                              rows={4}
                              placeholder="e.g., List the top 5 themes participants mentioned, with a count of how many people raised each."
                              style={{width:"100%",padding:"10px",border:`1px solid ${BD}`,borderRadius:"8px",
                                fontSize:"13px",resize:"vertical",outline:"none",lineHeight:"1.5",fontFamily:"inherit",
                                boxSizing:"border-box"}}
                            />
                            <div style={{display:"flex",gap:"6px",marginTop:"10px"}}>
                              <SmallBtn onClick={()=>saveInstr(q.id)} color="green">💾 Save</SmallBtn>
                              <SmallBtn onClick={()=>toggleInstrExpand(q)} color="white">Cancel</SmallBtn>
                              {q.analysisInstruction && (
                                <SmallBtn onClick={()=>{ setInstrDraft(d=>({...d, [q.id]: ""})); saveInstr(q.id); }} color="white">
                                  Clear
                                </SmallBtn>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Answers — collapsible */}
                      {!collapsedQs.has(q.id) && (
                        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                          {qResponses.map(({g, answer},ri)=>(
                            <div key={`${g.num}-${q.id}`} style={{padding:"12px 14px",background:"#fff",borderRadius:"10px",
                              border:`2px solid ${LG}`}}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px",alignItems:"center"}}>
                                <span style={{fontSize:"11px",fontWeight:"700",color:"#1a3a26"}}>{g.flag} Participant #{g.num}</span>
                                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                                  <span style={{fontSize:"10px",color:"#7aaa88"}}>{g.langName} · {g.time}</span>
                                  <button onClick={()=>deleteParticipant(g)} style={{
                                    background:"none",border:"none",cursor:"pointer",
                                    fontSize:"12px",color:"#faa",padding:"0",lineHeight:"1"}}
                                    title={`Delete all responses from Participant #${g.num}`}>🗑</button>
                                </div>
                              </div>
                              <p style={{fontSize:"14px",color:"#3a5a46",lineHeight:"1.65"}}>
                                {answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {collapsedQs.has(q.id) && (
                        <div style={{padding:"10px 14px",background:LG,borderRadius:"8px",border:`1px dashed ${BD}`,
                          textAlign:"center",fontSize:"12px",color:"#7aaa88",cursor:"pointer"}}
                          onClick={()=>setCollapsedQs(prev=>{ const n=new Set(prev); n.delete(q.id); return n; })}>
                          {qResponses.length} response{qResponses.length===1?"":"s"} hidden — click to show
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── QUESTIONS TAB ── */}
            {tab==="questions" && (
              <div style={card}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                  <div>
                    <h3 style={{fontSize:"15px",fontWeight:"700"}}>Survey Questions</h3>
                    <p style={{fontSize:"12px",color:"#7aaa88",marginTop:"3px"}}>
                      {activeQs.length} active · {questions.length}/10 total · AI translates automatically
                    </p>
                  </div>
                </div>

                {/* Question list */}
                {questions.map((q,i)=>(
                  <div key={q.id}>
                    <div className="fade" style={{display:"flex",alignItems:"flex-start",gap:"12px",
                      padding:"14px",borderRadius:"10px",marginBottom:"8px",transition:"all .2s",
                      background:q.active===false?"#fafafa":LG,
                      border:`2px solid ${q.active===false?"#eee":BD}`,
                      opacity:q.active===false?.55:1}}>
                      {/* Number badge */}
                      <span style={{minWidth:"24px",height:"24px",background:DG,color:"#fff",
                        borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:"11px",fontWeight:"700",flexShrink:0,marginTop:"2px"}}>{i+1}</span>
                      {/* Content */}
                      <div style={{flex:1}}>

                        {editQ?.id===q.id ? (
                          <div>
                            <textarea value={editQ.text} rows={5}
                              onChange={e=>setEditQ({...editQ,text:e.target.value})}
                              style={{width:"100%",padding:"10px",border:`2px solid ${G}`,
                                borderRadius:"8px",fontSize:"14px",resize:"vertical",outline:"none"}} />
                            <div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
                              <SmallBtn onClick={saveEdit} disabled={translating||!editQ.text.trim()} color="green">
                                {translating?"⏳ Translating...":"💾 Save & Translate"}
                              </SmallBtn>
                              <SmallBtn onClick={()=>setEditQ(null)} color="white">Cancel</SmallBtn>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p style={{fontSize:"14px",color:"#1a3a26",lineHeight:"1.5"}}>{q.en}</p>
                            <p style={{fontSize:"11px",color:"#7aaa88",marginTop:"4px"}}>
                              {Object.values(q.translations || {}).filter(Boolean).slice(0, 3).map((s, j) => (
                                <span key={j} style={{marginRight:"8px"}}>{s?.slice(0,20)}…</span>
                              ))}
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Buttons */}
                      {editQ?.id!==q.id && (
                        <div style={{display:"flex",flexDirection:"column",gap:"5px",flexShrink:0}}>
                          <button onClick={()=>{
                              if(currentQId===q.id){
                                // Deactivate - stop showing to participants
                                fetch("/api/session",{method:"POST",headers:{"Content-Type":"application/json"},
                                  body:JSON.stringify({current_question_id:null})});
                                setCurrentQId(null);
                              } else {
                                activateQuestion(q);
                              }
                            }} title={currentQId===q.id?"Stop showing":"Show to participants"} style={{
                              width:"36px",height:"36px",borderRadius:"8px",fontSize:"14px",cursor:"pointer",
                              border:`2px solid ${currentQId===q.id?"#27ae60":"#d5ede0"}`,
                              background:currentQId===q.id?"#1a6b3a":"#fff",
                              display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700",
                              color:currentQId===q.id?"#fff":"#7aaa88"}}>
                              {currentQId===q.id?"⏹":"▶"}
                            </button>


                          <button onClick={()=>toggleTransExpand(q.id)} title="View/edit translations"
                            style={{width:"36px",height:"36px",borderRadius:"8px",fontSize:"16px",cursor:"pointer",
                            border:`2px solid ${expandedTrans.has(q.id)?"#27ae60":BD}`,
                            background:expandedTrans.has(q.id)?"#f0faf4":"#fff",
                            display:"flex",alignItems:"center",justifyContent:"center"}}>
                            🌐
                          </button>
                          <button onClick={()=>setEditQ({id:q.id,text:q.en})} title="Edit English"
                            style={{width:"36px",height:"36px",borderRadius:"8px",fontSize:"16px",cursor:"pointer",
                            border:`2px solid ${BD}`,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            ✏️
                          </button>
                          <button onClick={()=>deleteQ(q.id)} disabled={questions.length<=1} title="Delete" style={{
                            width:"36px",height:"36px",borderRadius:"8px",fontSize:"16px",
                            cursor:questions.length>1?"pointer":"not-allowed",border:"2px solid #fcc",
                            background:"#fff8f0",opacity:questions.length>1?1:.4,
                            display:"flex",alignItems:"center",justifyContent:"center"}}>
                            🗑
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Translations panel */}
                    {expandedTrans.has(q.id) && (
                      <div className="fade" style={{margin:"0 0 8px 36px",background:"#fff",
                        border:`2px solid ${BD}`,borderRadius:"12px",overflow:"hidden"}}>
                        <div style={{padding:"10px 14px",background:LG,borderBottom:`2px solid ${BD}`,
                          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:"11px",fontWeight:"700",color:DG,letterSpacing:"1px",textTransform:"uppercase"}}>
                            🌐 Translations
                          </span>
                          <span style={{fontSize:"10px",color:"#7aaa88"}}>Click any field to edit</span>
                        </div>
                        {LANGS.filter(l => l.code !== "en").map(({code, flag, full: name}) => {
                          const key = q.id+"_"+code;
                          const value = (q.translations || {})[code];
                          const isEditing = editingTrans[key] !== undefined;
                          return (
                            <div key={code} style={{padding:"10px 14px",borderBottom:`1px solid ${LG}`,
                              display:"flex",alignItems:"flex-start",gap:"10px"}}>
                              <span style={{fontSize:"18px",flexShrink:0,marginTop:"2px"}}>{flag}</span>
                              <div style={{flex:1}}>
                                <div style={{fontSize:"10px",fontWeight:"600",color:"#7aaa88",marginBottom:"4px"}}>{name}</div>
                                {isEditing ? (
                                  <div>
                                    <textarea value={editingTrans[key]}
                                      onChange={e=>setEditingTrans(prev=>({...prev,[key]:e.target.value}))}
                                      rows={3} style={{width:"100%",padding:"8px",border:`2px solid ${G}`,
                                        borderRadius:"8px",fontSize:"13px",resize:"vertical",outline:"none",lineHeight:"1.5"}} />
                                    <div style={{display:"flex",gap:"6px",marginTop:"6px"}}>
                                      <button onClick={()=>saveTransEdit(q.id,code)} style={{
                                        padding:"5px 12px",borderRadius:"6px",fontSize:"11px",fontWeight:"700",
                                        background:DG,color:"#fff",border:"none",cursor:"pointer"}}>✓ Save</button>
                                      <button onClick={()=>cancelTransEdit(q.id,code)} style={{
                                        padding:"5px 12px",borderRadius:"6px",fontSize:"11px",fontWeight:"600",
                                        background:"#fff",color:"#7aaa88",border:`2px solid ${BD}`,cursor:"pointer"}}>Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                                    <p onClick={()=>startEditTrans(q.id,code,value||q.en)}
                                      style={{fontSize:"13px",color:value&&value!==q.en?"#1a3a26":"#aaa",
                                        lineHeight:"1.55",cursor:"pointer",padding:"4px 6px",borderRadius:"6px",
                                        border:"2px solid transparent",transition:"all .2s",flex:1,margin:0}}
                                      onMouseEnter={e=>{e.currentTarget.style.borderColor=BD;e.currentTarget.style.background=LG;}}
                                      onMouseLeave={e=>{e.currentTarget.style.borderColor="transparent";e.currentTarget.style.background="transparent";}}>
                                      {value&&value!==q.en ? value : <em style={{color:"#bbb"}}>Same as English — click to translate</em>}
                                    </p>
                                    {(!value || value===q.en) && (
                                      <button onClick={()=>retranslateOne(q,code)}
                                        disabled={retranslating[key]}
                                        title={`Translate to ${name} with AI`}
                                        style={{padding:"4px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:"600",
                                          background:LG,color:DG,border:`1px solid ${BD}`,cursor:retranslating[key]?"wait":"pointer",
                                          flexShrink:0}}>
                                        {retranslating[key] ? "..." : "🌐 AI"}
                                      </button>
                                    )}
                                    {value && value!==q.en && (
                                      <button onClick={()=>retranslateOne(q,code)}
                                        disabled={retranslating[key]}
                                        title={`Re-translate to ${name} with AI`}
                                        style={{padding:"4px 8px",borderRadius:"6px",fontSize:"11px",fontWeight:"500",
                                          background:"transparent",color:"#7aaa88",border:`1px solid ${BD}`,
                                          cursor:retranslating[key]?"wait":"pointer",flexShrink:0,opacity:0.7}}>
                                        {retranslating[key] ? "..." : "🔄"}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* AI Summary for this question */}
                    {qSummaries[q.id] && (
                      <div className="fade" style={{margin:"0 0 12px 36px",padding:"12px 14px",background:"#fff",
                        border:`2px solid ${BD}`,borderRadius:"10px",fontSize:"13px",color:"#3a5a46",lineHeight:"1.7",whiteSpace:"pre-wrap"}}>
                        <div style={{fontSize:"10px",fontWeight:"700",color:G,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"}}>🤖 AI Summary</div>
                        {qSummaries[q.id]}
                      </div>
                    )}
                  </div>
                ))}

                <p style={{fontSize:"11px",color:"#7aaa88",marginTop:"8px"}}>
                  💡 Auto-translation runs on Vercel. In preview, questions are added in English for all languages. Use ✏️ Edit to add translations manually.
                </p>

                {/* Add new question */}
                {questions.length<10 ? (
                  <div style={{marginTop:"16px",paddingTop:"16px",borderTop:`2px solid ${BD}`}}>
                    <p style={{fontSize:"12px",color:"#7aaa88",marginBottom:"10px",fontWeight:"600"}}>
                      ➕ Add Question ({questions.length}/10) — enter in English (auto-translation active on Vercel)
                    </p>
                    <textarea value={newQText} rows={5} placeholder="Type your question in English..."
                      onChange={e=>setNewQText(e.target.value)}
                      style={{width:"100%",padding:"12px",border:`2px solid ${BD}`,borderRadius:"10px",
                        fontSize:"14px",resize:"vertical",outline:"none",marginBottom:"10px"}}
                      onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor=BD} />
                    <SmallBtn onClick={addQuestion} disabled={!newQText.trim()||translating} color="green">
                      {translating?"⏳ Adding...":"✨ Add Question"}
                    </SmallBtn>
                  </div>
                ) : (
                  <p style={{marginTop:"12px",fontSize:"12px",color:"#7aaa88",textAlign:"center"}}>Maximum 10 questions reached.</p>
                )}
              </div>
            )}


          </div>
        </div>
      )}
    </div>
  );
}
