import { useState, useEffect } from "react";

const LANGS = [
  { code:"zh", name:"中文",            full:"Chinese (简体)",    flag:"🇨🇳" },
  { code:"ja", name:"日本語",           full:"Japanese",          flag:"🇯🇵" },
  { code:"ko", name:"한국어",           full:"Korean",            flag:"🇰🇷" },
  { code:"th", name:"ภาษาไทย",         full:"Thai",              flag:"🇹🇭" },
  { code:"vi", name:"Tiếng Việt",      full:"Vietnamese",        flag:"🇻🇳" },
  { code:"id", name:"Bahasa Indonesia",full:"Indonesian",        flag:"🇮🇩" },
  { code:"fil",name:"Filipino",        full:"Filipino",          flag:"🇵🇭" },
  { code:"en", name:"English",         full:"English",           flag:"🇦🇺" },
];

const DEFAULT_QS = [
  { id:1, active:true,
    en:"What has been the most valuable aspect of your professional development this year?",
    zh:"今年您在职业发展方面最有价值的收获是什么？",
    ja:"今年、あなたの職業的成長において最も価値あるものは何でしたか？",
    ko:"올해 귀하의 직업 발전에서 가장 가치 있었던 점은 무엇인가요?",
    th:"ด้านใดของการพัฒนาวิชาชีพของคุณในปีนี้ที่มีคุณค่ามากที่สุด?",
    vi:"Khía cạnh nào trong quá trình phát triển nghề nghiệp của bạn năm nay có giá trị nhất?",
    id:"Aspek apa yang paling berharga dalam perkembangan profesional Anda tahun ini?",
    fil:"Ano ang pinaka-mahalagang aspeto ng iyong propesyonal na pag-unlad ngayong taon?" },
  { id:2, active:true,
    en:"What obstacles are preventing your team from reaching its full potential?",
    zh:"哪些障碍阻碍了您的团队发挥其全部潜力？",
    ja:"チームが潜在能力を最大限に発揮するためにどのような障害がありますか？",
    ko:"팀이 잠재력을 최대한 발휘하지 못하게 하는 장애물은 무엇인가요?",
    th:"อุปสรรคใดที่ขัดขวางไม่ให้ทีมของคุณบรรลุศักยภาพสูงสุด?",
    vi:"Những trở ngại nào đang ngăn cản nhóm của bạn phát huy hết tiềm năng?",
    id:"Hambatan apa yang mencegah tim Anda mencapai potensi penuhnya?",
    fil:"Anong mga hadlang ang pumipigil sa iyong koponan na maabot ang buong potensyal nito?" },
  { id:3, active:true,
    en:"How do you feel about the collaboration and communication within your organization?",
    zh:"您对组织内部的协作和沟通有什么看法？",
    ja:"組織内のコラボレーションとコミュニケーションについてどのようにお感じですか？",
    ko:"조직 내 협업과 소통에 대해 어떻게 느끼시나요?",
    th:"คุณรู้สึกอย่างไรกับการทำงานร่วมกันและการสื่อสารภายในองค์กรของคุณ?",
    vi:"Bạn cảm thấy thế nào về sự hợp tác và giao tiếp trong tổ chức của bạn?",
    id:"Bagaimana perasaan Anda tentang kolaborasi dan komunikasi dalam organisasi Anda?",
    fil:"Paano mo nararamdaman ang pakikipagtulungan at komunikasyon sa iyong organisasyon?" },
  { id:4, active:true,
    en:"What one change would most improve your work experience in the next 6 months?",
    zh:"在未来6个月内，什么样的改变最能改善您的工作体验？",
    ja:"今後6ヶ月で、あなたの職場体験を最も改善する変化は何でしょうか？",
    ko:"향후 6개월 동안 업무 경험을 가장 개선할 수 있는 변화는 무엇인가요?",
    th:"การเปลี่ยนแปลงอะไรที่จะปรับปรุงประสบการณ์การทำงานของคุณมากที่สุดใน 6 เดือนข้างหน้า?",
    vi:"Thay đổi nào sẽ cải thiện trải nghiệm làm việc của bạn nhất trong 6 tháng tới?",
    id:"Perubahan apa yang paling meningkatkan pengalaman kerja Anda dalam 6 bulan ke depan?",
    fil:"Anong pagbabago ang pinakamagpapabuti sa iyong karanasan sa trabaho sa susunod na 6 na buwan?" },
];

const UI = {
  en:  { next:"Next", submit:"Submit", ph:"Share your thoughts here...", thanks:"Thank you!", saved:"Your response has been recorded.", newP:"New Participant", q:"Question" },
  zh:  { next:"下一步", submit:"提交", ph:"请在此分享您的想法...", thanks:"谢谢！", saved:"您的回答已记录。", newP:"新参与者", q:"问题" },
  ja:  { next:"次へ", submit:"送信", ph:"ここにご意見をお書きください...", thanks:"ありがとうございます！", saved:"回答が記録されました。", newP:"次の参加者", q:"質問" },
  ko:  { next:"다음", submit:"제출", ph:"여기에 의견을 나눠주세요...", thanks:"감사합니다!", saved:"응답이 기록되었습니다.", newP:"새 참가자", q:"질문" },
  th:  { next:"ถัดไป", submit:"ส่ง", ph:"แบ่งปันความคิดของคุณที่นี่...", thanks:"ขอบคุณ!", saved:"บันทึกคำตอบแล้ว", newP:"ผู้เข้าร่วมใหม่", q:"คำถาม" },
  vi:  { next:"Tiếp theo", submit:"Gửi", ph:"Chia sẻ suy nghĩ của bạn...", thanks:"Cảm ơn bạn!", saved:"Phản hồi đã được ghi lại.", newP:"Người mới", q:"Câu hỏi" },
  id:  { next:"Lanjutkan", submit:"Kirim", ph:"Bagikan pendapat Anda di sini...", thanks:"Terima kasih!", saved:"Tanggapan Anda telah dicatat.", newP:"Peserta Baru", q:"Pertanyaan" },
  fil: { next:"Susunod", submit:"Isumite", ph:"Ibahagi ang iyong mga saloobin...", thanks:"Salamat!", saved:"Naitala na ang iyong sagot.", newP:"Bagong Kalahok", q:"Tanong" },
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
        {data.points.map((p,i) => (
          <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:"10px",
            fontSize:"14px", color:"rgba(255,255,255,.9)", lineHeight:"1.65" }}>
            <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#fff",
              flexShrink:0,marginTop:"9px",display:"inline-block" }} />{p}
          </li>
        ))}
      </ul>
      <span style={{ position:"absolute",bottom:"24px",right:"28px",fontSize:"10px",
        color:"rgba(255,255,255,.3)",fontWeight:"700" }}>{idx+1}/{total}</span>
    </div>
  );
}

export default function App() {
  const [screen,      setScreen]      = useState("lang");
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
  const [editingTrans,  setEditingTrans]  = useState({}); // {qId_langCode: text}
  const [qSummaries,  setQSummaries]  = useState({});
  const [loadingSum,  setLoadingSum]  = useState(null);
  const [copiedSum,   setCopiedSum]   = useState(null); // question id
  const [copiedRaw,   setCopiedRaw]   = useState(null); // question id
  const [slides,      setSlides]      = useState(null);
  const [loadingPres, setLoadingPres] = useState(false);
  const [slideIdx,    setSlideIdx]    = useState(0);
  const [hiddenSlides,setHiddenSlides]= useState(new Set());
  const [pw,          setPw]          = useState("");
  const [pwErr,       setPwErr]       = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [csvDone,     setCsvDone]     = useState(false);
  const [sessionOpen, setSessionOpen]    = useState(false);
  const [currentQId,  setCurrentQId]     = useState(null);
  const [waitingNext, setWaitingNext]    = useState(false);
  const [sessionDone, setSessionDone]    = useState(false);
  const [pollRef,     setPollRef]        = useState(null);
  const [participantToken] = useState(() => 'p_' + Math.random().toString(36).slice(2,10));

  const t       = UI[lang] || UI.en;
  const activeQs = questions.filter(q => q.active !== false);
  const currentQ = currentQId ? questions.find(q => q.id === currentQId) : activeQs[qIdx];
  const getLang = (q, lang) => q?.[lang==='id'?'idLang':lang] || q?.en || '';
  const curAns  = currentQId ? (answers.length > 0 ? answers : [""]) : (answers.length === activeQs.length ? answers : activeQs.map(() => ""));

  // ── Helpers ──────────────────────────────────────────────
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
    const prompt = "Translate this question into 7 languages. Reply ONLY in this format, one per line:\nZH: translation\nJA: translation\nKO: translation\nTH: translation\nVI: translation\nID: translation\nFIL: translation\n\nQuestion: " + englishText;
    try {
      const response = await callAI(prompt, 1200);
      const get = (code) => {
        const lines = response.split("\n");
        const line = lines.find(l => l.toUpperCase().startsWith(code+":"));
        return line ? line.slice(code.length+1).trim() : englishText;
      };
      return {
        en:englishText,
        zh:get("ZH"), ja:get("JA"), ko:get("KO"), th:get("TH"),
        vi:get("VI"), idLang:get("ID"), fil:get("FIL"),
      };
    } catch(e) {
      setTransErr("Translation error: "+e.message);
      return { en:englishText, zh:englishText, ja:englishText, ko:englishText,
        th:englishText, vi:englishText, idLang:englishText, fil:englishText };
    } finally { setTranslating(false); }
  };

  // ── Survey flow ───────────────────────────────────────────
  const pickLang = async (code) => {
    setLang(code);
    setQIdx(0);
    setAnswers([""]);
    // Always show waiting first, polling will update screen
    setScreen("waiting");
    startPolling();
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (data.session_open && data.current_question_id) {
        setCurrentQId(data.current_question_id);
        setScreen("survey");
      }
    } catch {}
  };

  const handleNext = async () => {
    if (qIdx < activeQs.length-1) { setQIdx(qIdx+1); return; }
    const info = LANGS.find(l=>l.code===lang);
    const newResp = { 
      lang, langName:info?.full||lang, flag:info?.flag||"", 
      answers:[...curAns],
      question_id: currentQId || null,
      participant_token: participantToken
    };
    try {
      const res = await fetch("/api/responses", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(newResp),
      });
      const data = await res.json();
      if (res.ok) {
        setResponses(prev=>[...prev,{
          id:data.id, lang:data.lang, langName:data.lang_name, flag:data.flag,
          answers:data.answers,
          time:new Date(data.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
        }]);
      }
    } catch(e) {
      // fallback to local if API fails
      setResponses(prev=>[...prev,{
        id:prev.length+1, lang, langName:info?.full||lang, flag:info?.flag||"",
        answers:[...curAns],
        time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      }]);
    }
    setWaitingNext(true);
    setScreen("waiting");
    startPolling();
  };

  const changeAnswer = (val) => { const u=[...curAns]; u[currentQId?0:qIdx]=val; setAnswers(u); };
  const reset = () => { setAnswers([]); setQIdx(0); setScreen("lang"); };

  // ── Admin auth ────────────────────────────────────────────
  const tryLogin = async () => {
    if (pw!=="admin123") { setPwErr(true); setTimeout(()=>setPwErr(false),1600); return; }
    try {
      const res = await fetch("/api/responses");
      if (res.ok) {
        const data = await res.json();
        setResponses(data.map(r=>({
          id:r.id, lang:r.lang, langName:r.lang_name, flag:r.flag,
          answers:r.answers,
          time:new Date(r.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
        })));
      }
    } catch(e) { console.log("Could not load responses:", e); }
    setScreen("admin"); setTab("questions");
  };

  // ── Questions management ──────────────────────────────────
  // ── Session polling (participant side) ──
  const startPolling = () => {
    // Clear any existing poll first
    if (pollRef) clearInterval(pollRef);
    const interval = setInterval(async () => {
      try {
        const [sessionRes, questionsRes] = await Promise.all([
          fetch("/api/session"),
          fetch("/api/questions")
        ]);
        if (!sessionRes.ok) return;
        const sessionData = await sessionRes.json();
        // Update questions in real time
        if (questionsRes.ok) {
          const qData = await questionsRes.json();
          if (Array.isArray(qData) && qData.length > 0) {
            setQuestions(qData.map(q => ({
              id: q.id, active: q.active,
              en: q.en, zh: q.zh, ja: q.ja, ko: q.ko,
              th: q.th, vi: q.vi, idLang: q.id_lang, fil: q.fil,
            })));
          }
        }
        // Session closed - show thank you
        if (!sessionData.session_open) {
          setSessionDone(true);
          setWaitingNext(false);
          setCurrentQId(null);
          setScreen("sessionDone");
          clearInterval(interval);
          return;
        }
        const newQId = sessionData.current_question_id;
        const newQId = sessionData.current_question_id;
        setCurrentQId(prev => {
          if (prev !== newQId) {
            setAnswers([""]);
          }
          return newQId;
        });
        // Only show survey if session is open AND there is an active question
        if (sessionData.session_open && newQId) {
          setScreen("survey");
          setWaitingNext(false);
        } else {
          setScreen("waiting");
          setWaitingNext(true);
        }
      } catch(e) { console.log("polling error", e); }
    }, 3000);
    setPollRef(interval);
    return interval;
  };

  const stopPolling = () => { if (pollRef) clearInterval(pollRef); };

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

  const closeSession = async () => {
    await fetch("/api/session", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ session_open: false, session_ended_at: new Date().toISOString(), current_question_id: null })
    });
    setSessionOpen(false);
    setCurrentQId(null);
  };

  // ── Load + poll questions from DB every 5s ──
  useEffect(() => {
    const loadQs = () => {
      fetch("/api/questions").then(r=>r.json()).then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data.map(q => ({
            id: q.id, active: q.active,
            en: q.en, zh: q.zh, ja: q.ja, ko: q.ko,
            th: q.th, vi: q.vi, idLang: q.id_lang, fil: q.fil,
          })));
        }
      }).catch(() => {});
    };
    loadQs();
    const interval = setInterval(loadQs, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const startEditTrans = (qId, langCode, currentText) => {
    setEditingTrans(prev => ({...prev, [qId+"_"+langCode]: currentText}));
  };

  const saveTransEdit = (qId, langCode) => {
    const key = qId+"_"+langCode;
    const newText = editingTrans[key];
    if (newText !== undefined) {
      setQuestions(prev => prev.map(q => q.id===qId ? {...q, [langCode]: newText} : q));
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
    // Add stub immediately in English
    const stub = {id:tempId,active:false,en:txt,zh:txt,ja:txt,ko:txt,th:txt,vi:txt,idLang:txt,fil:txt,translating:true};
    const withStub = [...questions, stub];
    setQuestions(withStub);
    setNewQText("");
    // Translate in background
    const result = await translateQuestion(txt);
    const translated = result ? {...stub,...result,translating:false} : {...stub,translating:false};
    const final = withStub.map(q=>q.id===tempId ? translated : q);
    setQuestions(final);
    // Sync to Supabase
    await syncQuestions(final);
  };

  const saveEdit = async () => {
    if (!editQ?.text.trim()) return;
    const t = await translateQuestion(editQ.text.trim());
    if (!t) return;
    setQuestions(prev => {
      const updated = prev.map(q=>q.id===editQ.id?{id:q.id,active:q.active,...t}:q);
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
    const qResps = responses.filter(r=>r.question_id===q.id||(r.question_id===null&&r.answers[qPos]));
    const ans = qResps.map(r=>`- Participant #${r.id} (${r.langName}): ${r.question_id?r.answers[0]:r.answers[qPos]||"(no answer)"}`).join("\n");
    const prompt = `Summarize these survey responses for the question: "${q.en}"\n\nResponses:\n${ans}\n\nWrite 3-5 concise bullet points capturing key themes. Start each with "•".`;
    try {
      const raw = await callAI(prompt, 800);
      setQSummaries(prev=>({...prev,[q.id]:raw}));
    } catch(e) {
      setQSummaries(prev=>({...prev,[q.id]:"Error: "+e.message}));
    }
    setLoadingSum(null);
  };

  // ── Export ────────────────────────────────────────────────
  const copyRaw = () => {
    const hdr = `ASIA PACIFIC SURVEY — RAW DATA\nExported: ${new Date().toLocaleString()}\nParticipants: ${responses.length}\n${"=".repeat(40)}\n\n`;
    const body = responses.map(r=>`Participant #${r.id} | ${r.langName} ${r.flag} | ${r.time}\n`+
      questions.map((q,i)=>`  Q${i+1}: ${q.en}\n  → ${r.answers[i]||"(no answer)"}`).join("\n\n")
    ).join("\n\n"+"-".repeat(40)+"\n\n");
    navigator.clipboard.writeText(hdr+body).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);});
  };

  const exportCSV = () => {
    const esc = s=>`"${(s||"").replace(/"/g,'""')}"`;
    const hdrs = ["#","Language","Time",...questions.map((_,i)=>`Q${i+1}`)];
    const rows = responses.map(r=>[r.id,r.langName,r.time,...r.answers]);
    const csv = [hdrs,...rows].map(r=>r.map(esc).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"),{
      href:URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"})),
      download:`survey_${new Date().toISOString().slice(0,10)}.csv`
    });
    a.click(); setCsvDone(true); setTimeout(()=>setCsvDone(false),2500);
  };

  // ── Presentation ──────────────────────────────────────────
  const generatePresentation = async () => {
    if (!responses.length) return;
    setLoadingPres(true); setSlides(null); setSlideIdx(0); setHiddenSlides(new Set());
    const block = responses.map(r=>
      `Participant #${r.id} (${r.langName}):\n`+
      activeQs.map((q,i)=>`Q${i+1}: ${q.en}\nAnswer: ${r.answers[i]||"(no answer)"}`).join("\n")
    ).join("\n\n");
    const prompt = `Create a professional presentation from ${responses.length} Asia Pacific survey responses.

STRUCTURE:
1. One OVERVIEW slide (always first)
2. For each of the ${activeQs.length} questions, TWO slides:
   a) INSIGHTS — key themes and patterns
   b) SUMMARY — narrative synthesis of what respondents said
3. OPTIONAL: 0-2 extra slides if data warrants it

Questions:
${activeQs.map((q,i)=>`Q${i+1}: ${q.en}`).join("\n")}

Return ONLY valid JSON (no markdown, no backticks):
{"presentationTitle":"City Development Mastermind Program Results","slides":[{"category":"OVERVIEW","icon":"🌏","title":"...","points":["...","...","..."]},{"category":"Q1 INSIGHTS","icon":"...","title":"...","points":["...","...","..."]}]}

Rules: write each point with as many words as needed for clarity. Be specific and faithful to actual responses.

Responses:
${block}`;
    try {
      const raw = await callAI(prompt, 2000);
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
              <h1 style={{fontSize:"38px",fontWeight:"800",lineHeight:"1.1"}}>
                City Development<br/><span style={{color:G}}>Mastermind Program</span>
              </h1>
              <p style={{marginTop:"10px",color:"#7aaa88",fontSize:"14px"}}>
                Eurasian Markets · Select your language
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
      {screen==="survey" && (currentQId || activeQs.length>0) && (
        <div className="center">
          <div style={{maxWidth:"600px",width:"100%"}}>
            {/* Back to language */}
            <div style={{marginBottom:"20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <button onClick={()=>setScreen("lang")} style={{
                background:"none",border:"none",color:"#7aaa88",fontSize:"13px",
                cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",padding:"0",fontFamily:"inherit"}}>
                🌐 Change language
              </button>
            </div>
            {/* Progress */}
            <div style={{marginBottom:"32px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                <span style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#7aaa88",fontWeight:"600"}}>{currentQId ? "" : `${t.q} ${qIdx+1} / ${activeQs.length}`}</span>
                <span style={{fontSize:"12px",color:G,fontWeight:"700"}}>{currentQId ? "" : `${Math.round(pct)}%`}</span>
              </div>
              <div style={{height:"6px",background:BD,borderRadius:"6px",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${DG},${G})`,borderRadius:"6px",transition:"width .5s ease"}} />
              </div>
            </div>
            <p style={{fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:G,marginBottom:"14px",fontWeight:"700"}}>{t.q} {String(qIdx+1).padStart(2,"0")}</p>
            <h2 style={{fontSize:"24px",fontWeight:"700",lineHeight:"1.5",marginBottom:"26px"}}>
              {getLang(currentQId ? questions.find(q=>q.id===currentQId) : activeQs[qIdx], lang)}
            </h2>
            <textarea value={curAns[currentQId?0:qIdx]||""} onChange={e=>changeAnswer(e.target.value)}
              placeholder={t.ph} rows={6}
              style={{width:"100%",background:"#fff",border:`2px solid ${BD}`,borderRadius:"12px",
                padding:"20px",color:"#1a3a26",fontSize:"15px",lineHeight:"1.7",resize:"vertical",outline:"none"}}
              onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor=BD} />
            <Btn className="nb" onClick={handleNext} disabled={!curAns[currentQId?0:qIdx]?.trim()}
              style={{width:"100%",marginTop:"16px",padding:"17px",fontSize:"14px",
                background:curAns[currentQId?0:qIdx]?.trim()?`linear-gradient(135deg,${DG},${G})`:BD,
                color:curAns[currentQId?0:qIdx]?.trim()?"#fff":"#7aaa88",boxShadow:"none"}}>
              {qIdx===activeQs.length-1 ? `${t.submit} ✓` : `${t.next} →`}
            </Btn>
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
            <p style={{color:"#7aaa88",fontSize:"15px",marginBottom:"32px"}}>{t.saved}</p>
            <Btn onClick={reset}>{t.newP} →</Btn>
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
                <button key={l.code} className="lb" onClick={()=>{setLang(l.code);setScreen("survey");}} style={{
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
            <button onClick={()=>setScreen("lang")} style={{
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
              <SmallBtn onClick={copyRaw} disabled={!hasData} color={copied?"green":"white"}>
                {copied?"✓ Copied!":"📋 Copy Raw Data"}
              </SmallBtn>
              <button onClick={exportCSV} disabled={!hasData} style={{
                padding:"9px 16px",borderRadius:"9px",fontSize:"12px",fontWeight:"600",
                cursor:hasData?"pointer":"not-allowed",border:`2px solid ${csvDone?"#27ae60":DG}`,
                background:csvDone?"#d5f5e3":DG,color:csvDone?DG:"#fff",opacity:hasData?1:.4}}>
                {csvDone?"✓ Downloaded!":"⬇ Export CSV"}
              </button>
              <SmallBtn onClick={()=>setScreen("lang")} color="white">← Survey</SmallBtn>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px",maxWidth:"1020px",margin:"0 auto 24px"}}>
            {[{n:responses.length,l:"Responses"},{n:new Set(responses.map(r=>r.lang)).size,l:"Languages"},{n:activeQs.length,l:"Active Questions"}].map((s,i)=>(
              <div key={i} style={{background:"#fff",border:`2px solid ${BD}`,borderRadius:"14px",padding:"22px",textAlign:"center"}}>
                <div style={{fontSize:"38px",fontWeight:"800",color:DG,lineHeight:"1",marginBottom:"5px"}}>{s.n}</div>
                <div style={{fontSize:"10px",color:"#7aaa88",letterSpacing:"2px",textTransform:"uppercase",fontWeight:"600"}}>{s.l}</div>
              </div>
            ))}
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
                  {/* Generate Presentation button at top */}
                  <button onClick={generatePresentation} disabled={loadingPres} style={{
                    width:"100%",padding:"16px",border:"none",borderRadius:"12px",fontSize:"13px",
                    fontWeight:"700",cursor:loadingPres?"not-allowed":"pointer",marginBottom:"24px",
                    background:`linear-gradient(135deg,${DG},${G})`,color:"#fff",
                    boxShadow:"0 4px 15px rgba(39,174,96,.25)",opacity:loadingPres?.6:1}}>
                    {loadingPres?"⏳ Generating presentation...":slides?"🔄 Regenerate AI Presentation":"✨ Generate AI Presentation"}
                  </button>

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
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px",paddingBottom:"14px",borderBottom:`2px solid ${LG}`}}>
                        <span style={{fontSize:"14px",fontWeight:"700",color:DG}}>📊 {slides.presentationTitle}</span>
                        <span style={{fontSize:"11px",color:"#7aaa88"}}>{slides.slides.length - hiddenSlides.size} / {slides.slides.length} slides visible</span>
                      </div>
                      {/* Navigation */}
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
                  {questions.map((q,qi)=>{ const qResponses = responses.filter(r=>r.question_id===q.id||(r.question_id===null&&r.answers[qi])); return (
                    <div key={q.id} style={{...card}}>
                      {/* Question header */}
                      <div style={{marginBottom:"16px",paddingBottom:"14px",borderBottom:`2px solid ${LG}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}}>
                          <div style={{flex:1}}>
                            <span style={{fontSize:"10px",fontWeight:"700",color:G,letterSpacing:"2px",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>Question {qi+1}</span>
                            <h3 style={{fontSize:"16px",fontWeight:"700",color:"#1a3a26",lineHeight:"1.4"}}>{q.en}</h3>
                          </div>
<div style={{display:"flex",gap:"8px",flexShrink:0}}>
                            <button onClick={()=>{
                              const sep = "\u2500".repeat(40);
                              const lines = qResponses.map(r=>"Participant #"+r.id+" ("+r.langName+"):\n"+(r.question_id?r.answers[0]:r.answers[qi]||"(no answer)"));
                              const text = "QUESTION "+(qi+1)+": "+q.en+"\n"+sep+"\n"+lines.join("\n\n");
                              navigator.clipboard.writeText(text).then(()=>{
                                setCopiedRaw(q.id); setTimeout(()=>setCopiedRaw(null),2000);
                              });
                            }} style={{padding:"9px 14px",borderRadius:"9px",fontSize:"12px",fontWeight:"600",
                              cursor:"pointer",border:`2px solid ${copiedRaw===q.id?"#27ae60":BD}`,
                              background:copiedRaw===q.id?"#d5f5e3":"#fff",
                              color:copiedRaw===q.id?"#1a6b3a":"#7aaa88",flexShrink:0}}>
                              {copiedRaw===q.id?"✓ Copied!":"📋 Copy"}
                            </button>
                            {sessionOpen && (
                            <button onClick={()=>activateQuestion(q)} style={{
                              padding:"9px 14px",borderRadius:"9px",fontSize:"12px",fontWeight:"700",
                              cursor:"pointer",border:`2px solid ${currentQId===q.id?"#27ae60":"#d5ede0"}`,
                              background:currentQId!=null&&currentQId===q.id?"#d5f5e3":"#fff",
                              color:currentQId!=null&&currentQId===q.id?"#fff":"#7aaa88",flexShrink:0}}>
                              {currentQId!=null&&currentQId===q.id?"⏹":"▶ Activate"}
                            </button>
                          )}
                          <button onClick={()=>generateQSummary(q)} disabled={loadingSum===q.id}
                              style={{padding:"9px 14px",borderRadius:"9px",fontSize:"12px",fontWeight:"700",
                                cursor:loadingSum===q.id?"not-allowed":"pointer",border:`2px solid ${BD}`,
                                background:"#fff",color:DG,flexShrink:0,opacity:loadingSum===q.id?.6:1}}>
                              {loadingSum===q.id?"⏳ Summarizing...":qSummaries[q.id]?"🔄 Re-summarize":"Summarize"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* AI Summary */}
                      {qSummaries[q.id] && (
                        <div style={{background:LG,borderRadius:"10px",padding:"14px 16px",marginBottom:"16px",
                          border:`2px solid ${BD}`,fontSize:"14px",color:"#3a5a46",lineHeight:"1.8",whiteSpace:"pre-wrap"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                            <span style={{fontSize:"10px",fontWeight:"700",color:G,letterSpacing:"1px",textTransform:"uppercase"}}>AI Summary</span>
                            <button onClick={()=>{
                              navigator.clipboard.writeText(qSummaries[q.id]).then(()=>{
                                setCopiedSum(q.id); setTimeout(()=>setCopiedSum(null),2000);
                              });
                            }} style={{padding:"3px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:"600",
                              cursor:"pointer",border:`2px solid ${copiedSum===q.id?"#27ae60":BD}`,
                              background:copiedSum===q.id?"#d5f5e3":"#fff",
                              color:copiedSum===q.id?"#1a6b3a":"#7aaa88"}}>
                              {copiedSum===q.id?"✓ Copied!":"📋 Copy"}
                            </button>
                          </div>
                          {qSummaries[q.id]}
                        </div>
                      )}

                      {/* Answers */}
                      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                        {qResponses.map((r,ri)=>(
                          <div key={r.id} style={{padding:"12px 14px",background:"#fff",borderRadius:"10px",
                            border:`2px solid ${LG}`}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                              <span style={{fontSize:"11px",fontWeight:"700",color:"#1a3a26"}}>{r.flag} Participant #{r.id}</span>
                              <span style={{fontSize:"10px",color:"#7aaa88"}}>{r.langName} · {r.time}</span>
                            </div>
                            <p style={{fontSize:"14px",color:"#3a5a46",lineHeight:"1.65"}}>
                              {r.question_id ? (r.answers[0]||<em style={{color:"#bbb"}}>No answer</em>) : (r.answers[qi]||<em style={{color:"#bbb"}}>No answer</em>)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
                              {[q.zh,q.ja,q.ko].filter(Boolean).map((s,j)=>(
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
                        {[
                          {code:"zh",flag:"🇨🇳",name:"Chinese"},
                          {code:"ja",flag:"🇯🇵",name:"Japanese"},
                          {code:"ko",flag:"🇰🇷",name:"Korean"},
                          {code:"th",flag:"🇹🇭",name:"Thai"},
                          {code:"vi",flag:"🇻🇳",name:"Vietnamese"},
                          {code:"id",flag:"🇮🇩",name:"Indonesian"},
                          {code:"fil",flag:"🇵🇭",name:"Filipino"},
                        ].map(({code,flag,name}) => {
                          const key = q.id+"_"+code;
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
                                  <p onClick={()=>startEditTrans(q.id,code,q[code]||q.en)}
                                    style={{fontSize:"13px",color:q[code]&&q[code]!==q.en?"#1a3a26":"#aaa",
                                      lineHeight:"1.55",cursor:"pointer",padding:"4px 6px",borderRadius:"6px",
                                      border:"2px solid transparent",transition:"all .2s"}}
                                    onMouseEnter={e=>{e.target.style.borderColor=BD;e.target.style.background=LG;}}
                                    onMouseLeave={e=>{e.target.style.borderColor="transparent";e.target.style.background="transparent";}}>
                                    {q[code]&&q[code]!==q.en ? q[code] : <em style={{color:"#bbb"}}>Same as English — click to translate</em>}
                                  </p>
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
