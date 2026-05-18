// ════════════════════════════════════════════════════════════════════════
//  PRE_EVENT_SURVEYS — Main App Component
// ════════════════════════════════════════════════════════════════════════
//  ENTREGA 2: Admin + Frontend Participante (multi-page survey form)
//  Próxima: Entrega 3 — Auto-traducción AI + Export CSV
// ════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";

// ── Colors (Herbalife green theme) ─────────────────────────────────────
const DG   = "#1F6B3A";
const G    = "#27ae60";
const LG   = "#e8f5ec";
const BD   = "#d4e8da";
const TXT  = "#2c3e35";
const MUT  = "#7aaa88";

// ── Languages catalog ──────────────────────────────────────────────────
const ALL_LANGS = {
  en:      { name: "English",         full: "English",            flag: "🇬🇧" },
  es:      { name: "Español",         full: "Spanish",            flag: "🇲🇽" },
  fr:      { name: "Français",        full: "French",             flag: "🇫🇷" },
  "pt-br": { name: "Português",       full: "Portuguese (BR)",    flag: "🇧🇷" },
  ru:      { name: "Русский",         full: "Russian",            flag: "🇷🇺" },
  hi:      { name: "हिन्दी",            full: "Hindi",              flag: "🇮🇳" },
  ko:      { name: "한국어",           full: "Korean",             flag: "🇰🇷" },
  zh:      { name: "中文",             full: "Chinese (Simplified)", flag: "🇨🇳" },
  ja:      { name: "日本語",           full: "Japanese",           flag: "🇯🇵" },
};

// ── UI strings translated to all 9 languages ───────────────────────────
// These are the words OF the app (Next, Submit, etc.) — NOT the survey content.
// Pre-translated upfront so the user always sees the shell in their language.
const UI_STRINGS = {
  en: {
    selectLang: "Select your language",
    next: "Next", back: "Back", submit: "Submit",
    thankYou: "Thank you!",
    thankYouSub: "Your responses have been recorded.",
    pleaseAnswerRequired: "Please answer all required questions",
    page: "Page", of: "of",
    required: "Required",
    selectUpTo: "Select up to", options: "options",
    selectExactly: "Select",
    other: "Other", pleaseSpecify: "Please specify",
    submitting: "Submitting...",
    submitError: "There was a problem submitting your responses. Please try again.",
    yourAnswerHere: "Your answer here...",
    optional: "Optional",
    backToStart: "Back to start",
  },
  es: {
    selectLang: "Selecciona tu idioma",
    next: "Siguiente", back: "Atrás", submit: "Enviar",
    thankYou: "¡Gracias!",
    thankYouSub: "Tus respuestas han sido registradas.",
    pleaseAnswerRequired: "Por favor responde todas las preguntas obligatorias",
    page: "Página", of: "de",
    required: "Obligatorio",
    selectUpTo: "Selecciona hasta", options: "opciones",
    selectExactly: "Selecciona",
    other: "Otro", pleaseSpecify: "Por favor especifica",
    submitting: "Enviando...",
    submitError: "Hubo un problema enviando tus respuestas. Por favor intenta de nuevo.",
    yourAnswerHere: "Tu respuesta aquí...",
    optional: "Opcional",
    backToStart: "Volver al inicio",
  },
  fr: {
    selectLang: "Choisissez votre langue",
    next: "Suivant", back: "Retour", submit: "Soumettre",
    thankYou: "Merci !",
    thankYouSub: "Vos réponses ont été enregistrées.",
    pleaseAnswerRequired: "Veuillez répondre à toutes les questions obligatoires",
    page: "Page", of: "sur",
    required: "Obligatoire",
    selectUpTo: "Sélectionnez jusqu'à", options: "options",
    selectExactly: "Sélectionnez",
    other: "Autre", pleaseSpecify: "Veuillez préciser",
    submitting: "Envoi en cours...",
    submitError: "Un problème est survenu lors de l'envoi. Veuillez réessayer.",
    yourAnswerHere: "Votre réponse ici...",
    optional: "Optionnel",
    backToStart: "Retour au début",
  },
  "pt-br": {
    selectLang: "Selecione seu idioma",
    next: "Próximo", back: "Voltar", submit: "Enviar",
    thankYou: "Obrigado!",
    thankYouSub: "Suas respostas foram registradas.",
    pleaseAnswerRequired: "Por favor responda todas as perguntas obrigatórias",
    page: "Página", of: "de",
    required: "Obrigatório",
    selectUpTo: "Selecione até", options: "opções",
    selectExactly: "Selecione",
    other: "Outro", pleaseSpecify: "Por favor especifique",
    submitting: "Enviando...",
    submitError: "Houve um problema ao enviar. Por favor tente novamente.",
    yourAnswerHere: "Sua resposta aqui...",
    optional: "Opcional",
    backToStart: "Voltar ao início",
  },
  ru: {
    selectLang: "Выберите язык",
    next: "Далее", back: "Назад", submit: "Отправить",
    thankYou: "Спасибо!",
    thankYouSub: "Ваши ответы записаны.",
    pleaseAnswerRequired: "Пожалуйста, ответьте на все обязательные вопросы",
    page: "Страница", of: "из",
    required: "Обязательно",
    selectUpTo: "Выберите до", options: "вариантов",
    selectExactly: "Выберите",
    other: "Другое", pleaseSpecify: "Пожалуйста, уточните",
    submitting: "Отправка...",
    submitError: "Произошла ошибка при отправке. Пожалуйста, попробуйте снова.",
    yourAnswerHere: "Ваш ответ здесь...",
    optional: "Необязательно",
    backToStart: "В начало",
  },
  hi: {
    selectLang: "अपनी भाषा चुनें",
    next: "आगे", back: "वापस", submit: "जमा करें",
    thankYou: "धन्यवाद!",
    thankYouSub: "आपके उत्तर दर्ज कर लिए गए हैं।",
    pleaseAnswerRequired: "कृपया सभी आवश्यक प्रश्नों के उत्तर दें",
    page: "पृष्ठ", of: "में से",
    required: "आवश्यक",
    selectUpTo: "अधिकतम चुनें", options: "विकल्प",
    selectExactly: "चुनें",
    other: "अन्य", pleaseSpecify: "कृपया निर्दिष्ट करें",
    submitting: "जमा कर रहे हैं...",
    submitError: "जमा करने में समस्या हुई। कृपया पुनः प्रयास करें।",
    yourAnswerHere: "अपना उत्तर यहाँ लिखें...",
    optional: "वैकल्पिक",
    backToStart: "शुरू से",
  },
  ko: {
    selectLang: "언어를 선택하세요",
    next: "다음", back: "이전", submit: "제출",
    thankYou: "감사합니다!",
    thankYouSub: "응답이 기록되었습니다.",
    pleaseAnswerRequired: "모든 필수 질문에 답변해 주세요",
    page: "페이지", of: "/",
    required: "필수",
    selectUpTo: "최대 선택", options: "개",
    selectExactly: "선택",
    other: "기타", pleaseSpecify: "자세히 알려주세요",
    submitting: "제출 중...",
    submitError: "제출 중 문제가 발생했습니다. 다시 시도해 주세요.",
    yourAnswerHere: "답변을 입력하세요...",
    optional: "선택사항",
    backToStart: "처음으로",
  },
  zh: {
    selectLang: "选择您的语言",
    next: "下一步", back: "返回", submit: "提交",
    thankYou: "谢谢！",
    thankYouSub: "您的回答已记录。",
    pleaseAnswerRequired: "请回答所有必填问题",
    page: "页", of: "/",
    required: "必填",
    selectUpTo: "最多选择", options: "项",
    selectExactly: "选择",
    other: "其他", pleaseSpecify: "请详细说明",
    submitting: "提交中...",
    submitError: "提交时出现问题。请重试。",
    yourAnswerHere: "在此输入您的答案...",
    optional: "可选",
    backToStart: "返回开始",
  },
  ja: {
    selectLang: "言語を選択してください",
    next: "次へ", back: "戻る", submit: "送信",
    thankYou: "ありがとうございます！",
    thankYouSub: "回答が記録されました。",
    pleaseAnswerRequired: "必須項目すべてにお答えください",
    page: "ページ", of: "/",
    required: "必須",
    selectUpTo: "最大", options: "件選択",
    selectExactly: "選択",
    other: "その他", pleaseSpecify: "詳しく教えてください",
    submitting: "送信中...",
    submitError: "送信中に問題が発生しました。もう一度お試しください。",
    yourAnswerHere: "ここに回答を入力...",
    optional: "任意",
    backToStart: "最初に戻る",
  },
};

const ADMIN_PASSWORD = "admin123";

const QUESTION_TYPES = [
  { value: "short_text",    label: "Short text" },
  { value: "long_text",     label: "Long text" },
  { value: "single_choice", label: "Single choice" },
  { value: "multi_choice",  label: "Multiple choice" },
];

// ── Helpers ────────────────────────────────────────────────────────────
const translatedText = (jsonbField, lang, fallback = "") => {
  if (!jsonbField || typeof jsonbField !== "object") return fallback;
  return jsonbField[lang] || jsonbField.en || fallback;
};
const ui = (lang, key) => (UI_STRINGS[lang] || UI_STRINGS.en)[key] || UI_STRINGS.en[key] || key;
const generateToken = () =>
  "p_" + Math.random().toString(36).slice(2, 11) + "_" + Date.now().toString(36);

// ════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════
export default function SurveyApp() {
  // Screens: "lang" | "survey" | "thanks" | "admin"
  const [screen, setScreen] = useState("lang");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminPwdError, setAdminPwdError] = useState("");
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [activePages, setActivePages] = useState([]);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [participantLang, setParticipantLang] = useState(null);

  useEffect(() => {
    loadActiveSurvey();
  }, []);

  const loadActiveSurvey = () => {
    fetch("/api/surveys?active")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setActiveSurvey(data.survey);
          setActivePages(data.pages || []);
          setActiveQuestions(data.questions || []);
        }
        setLoadingActive(false);
      })
      .catch(() => setLoadingActive(false));
  };

  // ── Participant picks a language ─────────────────────────────────────
  const onPickLanguage = (code) => {
    setParticipantLang(code);
    setScreen("survey");
  };

  // ── Participant finishes the survey ──────────────────────────────────
  const onSurveyComplete = () => {
    setScreen("thanks");
  };

  // ── Reset and go back to landing ─────────────────────────────────────
  const goToLanding = () => {
    setScreen("lang");
    setParticipantLang(null);
  };

  return (
    <>
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: ${TXT}; -webkit-font-smoothing: antialiased; background: #f5f9f6; min-height: 100vh; }
        button { font-family: inherit; cursor: pointer; }
        button:disabled { cursor: not-allowed; opacity: 0.6; }
        input, textarea, select { font-family: inherit; }
        .fade { animation: fade .3s ease both; }
        @keyframes fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ─── PARTICIPANT LANDING ─────────────────────────────────────── */}
      {screen === "lang" && (
        <ParticipantLanding
          loading={loadingActive}
          activeSurvey={activeSurvey}
          onPickLanguage={onPickLanguage}
          onOpenAdmin={() => setScreen("admin")}
        />
      )}

      {/* ─── PARTICIPANT SURVEY ──────────────────────────────────────── */}
      {screen === "survey" && activeSurvey && participantLang && (
        <ParticipantSurvey
          survey={activeSurvey}
          pages={activePages}
          questions={activeQuestions}
          lang={participantLang}
          onComplete={onSurveyComplete}
          onCancel={goToLanding}
        />
      )}

      {/* ─── THANK YOU ────────────────────────────────────────────────── */}
      {screen === "thanks" && (
        <ThankYouScreen
          lang={participantLang || "en"}
          survey={activeSurvey}
          onBack={goToLanding}
        />
      )}

      {/* ─── ADMIN ───────────────────────────────────────────────────── */}
      {screen === "admin" && !adminAuthed && (
        <AdminLogin
          pwd={adminPwd} setPwd={setAdminPwd}
          err={adminPwdError}
          onLogin={() => {
            if (adminPwd === ADMIN_PASSWORD) { setAdminAuthed(true); setAdminPwdError(""); }
            else setAdminPwdError("Wrong password");
          }}
          onBack={() => { setScreen("lang"); setAdminPwd(""); setAdminPwdError(""); }}
        />
      )}
      {screen === "admin" && adminAuthed && (
        <AdminPanel
          onExit={() => { setScreen("lang"); setAdminAuthed(false); setAdminPwd(""); loadActiveSurvey(); }}
          onActiveSurveyChange={loadActiveSurvey}
        />
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  PARTICIPANT LANDING
// ════════════════════════════════════════════════════════════════════════
function ParticipantLanding({ loading, activeSurvey, onPickLanguage, onOpenAdmin }) {
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:"40px 20px",
      background:`linear-gradient(135deg, ${DG} 0%, ${G} 100%)`, position:"relative",
    }}>
      <div style={{maxWidth:"720px", width:"100%", textAlign:"center"}}>
        <img src="/herbalife-logo-white.png" alt="Herbalife"
          style={{height:"clamp(40px, 5vw, 56px)", marginBottom:"40px", opacity:0.95}} />

        {loading && <p style={{color:"#fff", fontSize:"15px", opacity:0.8}}>Loading...</p>}

        {!loading && !activeSurvey && (
          <div style={{background:"rgba(255,255,255,0.15)", borderRadius:"16px",
            padding:"32px 28px", color:"#fff"}}>
            <div style={{fontSize:"40px", marginBottom:"16px"}}>📋</div>
            <p style={{fontSize:"18px", fontWeight:"600", marginBottom:"8px"}}>No active survey</p>
            <p style={{fontSize:"14px", opacity:0.85}}>
              There is no active survey at this time. Please check back later.
            </p>
          </div>
        )}

        {!loading && activeSurvey && (
          <>
            <h1 style={{color:"#fff", fontSize:"clamp(24px, 3vw, 36px)",
              fontWeight:"700", marginBottom:"12px", lineHeight:"1.2"}}>
              {activeSurvey.name}
            </h1>
            {activeSurvey.description && (
              <p style={{color:"rgba(255,255,255,0.85)", fontSize:"15px",
                marginBottom:"40px", lineHeight:"1.55", maxWidth:"560px", margin:"0 auto 40px"}}>
                {activeSurvey.description}
              </p>
            )}
            <p style={{color:"rgba(255,255,255,0.9)", fontSize:"13px",
              letterSpacing:"3px", textTransform:"uppercase",
              fontWeight:"600", marginBottom:"24px"}}>
              Select your language
            </p>
            <div style={{display:"flex", flexWrap:"wrap", gap:"12px",
              justifyContent:"center", maxWidth:"560px", margin:"0 auto"}}>
              {(activeSurvey.languages || Object.keys(ALL_LANGS)).map(code => {
                const L = ALL_LANGS[code];
                if (!L) return null;
                return (
                  <button key={code}
                    onClick={() => onPickLanguage(code)}
                    style={{
                      background:"rgba(255,255,255,0.18)",
                      border:"2px solid rgba(255,255,255,0.3)",
                      color:"#fff", padding:"14px 22px", borderRadius:"12px",
                      fontSize:"15px", fontWeight:"600", display:"flex",
                      alignItems:"center", gap:"10px", minWidth:"140px",
                      transition:"all 0.2s",
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}>
                    <span style={{fontSize:"22px"}}>{L.flag}</span>
                    <span>{L.name}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <button onClick={onOpenAdmin}
        style={{
          position:"absolute", bottom:"24px", right:"24px",
          background:"rgba(255,255,255,0.12)",
          border:"1px solid rgba(255,255,255,0.25)",
          color:"rgba(255,255,255,0.85)",
          padding:"8px 16px", borderRadius:"8px",
          fontSize:"12px", fontWeight:"600",
          letterSpacing:"1px", textTransform:"uppercase",
        }}>Admin Panel</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  PARTICIPANT SURVEY — multi-page form with all 4 question types
// ════════════════════════════════════════════════════════════════════════
function ParticipantSurvey({ survey, pages, questions, lang, onComplete, onCancel }) {
  // Sort pages by page_number and questions by sort_order
  const sortedPages = [...pages].sort((a, b) => a.page_number - b.page_number);
  const sortedQuestions = [...questions].sort((a, b) => a.sort_order - b.sort_order);

  const [pageIndex, setPageIndex] = useState(0);
  // answers: { [questionId]: { value: "..." } | { selected_index: N, other_text: "..." } | { selected_indices: [...], other_text: "..." } }
  const [answers, setAnswers] = useState({});
  const [validationError, setValidationError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const participantTokenRef = useRef(null);
  if (!participantTokenRef.current) participantTokenRef.current = generateToken();

  // Filter questions for the current page
  const currentPage = sortedPages[pageIndex];
  const pageQuestions = sortedQuestions.filter(q => q.page_id === currentPage?.id);
  const isLastPage = pageIndex === sortedPages.length - 1;
  const isFirstPage = pageIndex === 0;
  const totalPages = sortedPages.length;

  // ── Update an answer ─────────────────────────────────────────────────
  const setAnswer = (qId, newValue) => {
    setAnswers(prev => ({ ...prev, [qId]: newValue }));
    setValidationError("");
  };

  // ── Validate the current page before moving on ───────────────────────
  const validateCurrentPage = () => {
    for (const q of pageQuestions) {
      if (!q.required) continue;
      const a = answers[q.id];
      if (!a) return q;
      if (q.question_type === "short_text" || q.question_type === "long_text") {
        if (!a.value || !String(a.value).trim()) return q;
      }
      if (q.question_type === "single_choice") {
        if (a.selected_index === undefined || a.selected_index === null) return q;
      }
      if (q.question_type === "multi_choice") {
        if (!Array.isArray(a.selected_indices) || a.selected_indices.length === 0) return q;
      }
    }
    return null;
  };

  // ── Move to next page ────────────────────────────────────────────────
  const goNext = () => {
    const missing = validateCurrentPage();
    if (missing) {
      setValidationError(ui(lang, "pleaseAnswerRequired"));
      return;
    }
    if (isLastPage) {
      submit();
    } else {
      setPageIndex(pageIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (isFirstPage) {
      if (Object.keys(answers).length === 0 || confirm("Are you sure? Your answers will be lost.")) {
        onCancel();
      }
      return;
    }
    setPageIndex(pageIndex - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit all responses ─────────────────────────────────────────────
  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // Build a bulk array of response objects
      const responses = [];
      for (const q of sortedQuestions) {
        const a = answers[q.id];
        if (!a) continue;     // skip unanswered (only required were enforced)
        // Skip truly empty answers
        if ((q.question_type === "short_text" || q.question_type === "long_text") && (!a.value || !String(a.value).trim())) continue;
        if (q.question_type === "single_choice" && (a.selected_index === undefined || a.selected_index === null)) continue;
        if (q.question_type === "multi_choice" && (!Array.isArray(a.selected_indices) || a.selected_indices.length === 0)) continue;

        responses.push({
          survey_id: survey.id,
          question_id: q.id,
          participant_token: participantTokenRef.current,
          lang,
          answer: a,
          question_text_snapshot: translatedText(q.text, lang, translatedText(q.text, "en")),
        });
      }

      const r = await fetch("/api/responses?bulk=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });
      if (!r.ok) {
        const errData = await r.json().catch(() => ({}));
        throw new Error(errData.error || "Submit failed");
      }
      onComplete();
    } catch (e) {
      setSubmitError(ui(lang, "submitError") + " (" + e.message + ")");
      setSubmitting(false);
    }
  };

  // Progress bar percentage
  const progress = totalPages > 0 ? ((pageIndex + 1) / totalPages) * 100 : 100;

  return (
    <div style={{minHeight:"100vh", background:"#f5f9f6", paddingBottom:"40px"}}>
      {/* Header with survey title + progress */}
      <div style={{background:`linear-gradient(135deg, ${DG} 0%, ${G} 100%)`,
        color:"#fff", padding:"24px 28px"}}>
        <div style={{maxWidth:"720px", margin:"0 auto"}}>
          <div style={{display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:"10px"}}>
            <h1 style={{fontSize:"clamp(16px, 2vw, 22px)", fontWeight:"700"}}>
              {survey.name}
            </h1>
            <span style={{fontSize:"12px", opacity:0.85, fontWeight:"600"}}>
              {ui(lang, "page")} {pageIndex + 1} {ui(lang, "of")} {totalPages}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{height:"4px", background:"rgba(255,255,255,0.25)",
            borderRadius:"4px", overflow:"hidden"}}>
            <div style={{height:"100%", background:"#fff", width:`${progress}%`,
              transition:"width 0.3s ease"}} />
          </div>
        </div>
      </div>

      <div style={{maxWidth:"720px", margin:"0 auto", padding:"32px 24px"}} className="fade" key={pageIndex}>
        {/* Page title */}
        {currentPage && translatedText(currentPage.title, lang) && (
          <h2 style={{fontSize:"22px", fontWeight:"700", color:DG,
            marginBottom:"24px", paddingBottom:"12px",
            borderBottom:`2px solid ${BD}`}}>
            {translatedText(currentPage.title, lang)}
          </h2>
        )}

        {/* No questions? */}
        {pageQuestions.length === 0 && (
          <p style={{color:MUT, textAlign:"center", padding:"40px 0",
            fontSize:"14px"}}>(This page has no questions.)</p>
        )}

        {/* Render questions */}
        {pageQuestions.map((q, idx) => (
          <QuestionRenderer key={q.id}
            question={q}
            number={idx + 1}
            value={answers[q.id]}
            onChange={v => setAnswer(q.id, v)}
            lang={lang} />
        ))}

        {/* Validation error */}
        {validationError && (
          <div style={{background:"#fdecea", color:"#c0392b", padding:"12px 16px",
            borderRadius:"8px", marginTop:"16px", fontSize:"14px",
            border:"1px solid #f5b7b1"}}>
            ⚠️ {validationError}
          </div>
        )}

        {/* Submit error */}
        {submitError && (
          <div style={{background:"#fdecea", color:"#c0392b", padding:"12px 16px",
            borderRadius:"8px", marginTop:"16px", fontSize:"14px",
            border:"1px solid #f5b7b1"}}>
            ⚠️ {submitError}
          </div>
        )}

        {/* Nav buttons */}
        <div style={{display:"flex", justifyContent:"space-between",
          marginTop:"32px", gap:"12px"}}>
          <button onClick={goBack} disabled={submitting}
            style={{
              background:"#fff", color:DG, border:`1px solid ${BD}`,
              padding:"12px 22px", borderRadius:"10px",
              fontSize:"14px", fontWeight:"700",
            }}>← {ui(lang, "back")}</button>

          <button onClick={goNext} disabled={submitting}
            style={{
              background:DG, color:"#fff", border:"none",
              padding:"12px 28px", borderRadius:"10px",
              fontSize:"14px", fontWeight:"700",
              minWidth:"120px",
            }}>
            {submitting
              ? ui(lang, "submitting")
              : (isLastPage ? ui(lang, "submit") + " ✓" : ui(lang, "next") + " →")
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  QUESTION RENDERER — picks the right input based on question_type
// ════════════════════════════════════════════════════════════════════════
function QuestionRenderer({ question, number, value, onChange, lang }) {
  const text = translatedText(question.text, lang, translatedText(question.text, "en", ""));
  const helpText = translatedText(question.help_text, lang, "");

  return (
    <div style={{background:"#fff", border:`1px solid ${BD}`,
      borderRadius:"12px", padding:"22px 24px", marginBottom:"16px"}}>
      <div style={{display:"flex", gap:"12px", marginBottom:"14px"}}>
        <span style={{
          background:LG, color:DG, fontWeight:"700",
          fontSize:"13px", minWidth:"30px", height:"30px",
          borderRadius:"50%", display:"flex",
          alignItems:"center", justifyContent:"center",
          flexShrink:0,
        }}>{number}</span>
        <div style={{flex:1}}>
          <p style={{fontSize:"16px", fontWeight:"600", color:TXT, lineHeight:"1.5"}}>
            {text}
            {question.required && (
              <span style={{color:"#e74c3c", marginLeft:"4px"}}>*</span>
            )}
          </p>
          {helpText && (
            <p style={{fontSize:"13px", color:MUT, marginTop:"4px",
              fontStyle:"italic"}}>{helpText}</p>
          )}
        </div>
      </div>

      <div style={{marginLeft:"42px"}}>
        {question.question_type === "short_text" && (
          <input type="text"
            value={value?.value || ""}
            onChange={e => onChange({ value: e.target.value })}
            placeholder={ui(lang, "yourAnswerHere")}
            style={{width:"100%", padding:"10px 14px",
              border:`1px solid ${BD}`, borderRadius:"8px",
              fontSize:"15px", outline:"none"}}
            onFocus={e => e.currentTarget.style.borderColor = G}
            onBlur={e => e.currentTarget.style.borderColor = BD} />
        )}

        {question.question_type === "long_text" && (
          <textarea
            value={value?.value || ""}
            onChange={e => onChange({ value: e.target.value })}
            placeholder={ui(lang, "yourAnswerHere")}
            rows={4}
            style={{width:"100%", padding:"10px 14px",
              border:`1px solid ${BD}`, borderRadius:"8px",
              fontSize:"15px", outline:"none", resize:"vertical",
              fontFamily:"inherit", lineHeight:"1.5"}}
            onFocus={e => e.currentTarget.style.borderColor = G}
            onBlur={e => e.currentTarget.style.borderColor = BD} />
        )}

        {question.question_type === "single_choice" && (
          <SingleChoiceInput
            options={question.options || []}
            value={value} onChange={onChange}
            lang={lang} hasOther={question.has_other} />
        )}

        {question.question_type === "multi_choice" && (
          <MultiChoiceInput
            options={question.options || []}
            value={value} onChange={onChange}
            lang={lang} hasOther={question.has_other}
            maxSelections={question.max_selections} />
        )}
      </div>
    </div>
  );
}

// ── Single-choice input (radio buttons styled as cards) ────────────────
function SingleChoiceInput({ options, value, onChange, lang, hasOther }) {
  const lastIdx = options.length - 1;
  return (
    <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
      {options.map((opt, i) => {
        const optLabel = translatedText(opt, lang, translatedText(opt, "en", `Option ${i+1}`));
        const isOther = hasOther && i === lastIdx;
        const selected = value?.selected_index === i;
        return (
          <label key={i}
            onClick={() => onChange({ selected_index: i, other_text: selected ? value?.other_text : "" })}
            style={{
              display:"flex", alignItems:"center", gap:"10px",
              padding:"10px 14px",
              border:`2px solid ${selected ? G : BD}`,
              background: selected ? LG : "#fff",
              borderRadius:"8px", cursor:"pointer",
              transition:"all 0.15s",
            }}>
            <span style={{
              width:"18px", height:"18px", borderRadius:"50%",
              border:`2px solid ${selected ? G : "#ccc"}`,
              background:"#fff", flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {selected && <span style={{width:"8px", height:"8px",
                borderRadius:"50%", background:G}} />}
            </span>
            <span style={{flex:1, fontSize:"14px", color:TXT}}>{optLabel}</span>
          </label>
        );
      })}
      {/* "Other" text input */}
      {hasOther && value?.selected_index === lastIdx && (
        <input
          value={value?.other_text || ""}
          onChange={e => onChange({ ...value, other_text: e.target.value })}
          placeholder={ui(lang, "pleaseSpecify")}
          style={{marginLeft:"32px", padding:"8px 12px",
            border:`1px solid ${BD}`, borderRadius:"8px",
            fontSize:"14px", outline:"none"}}
          onFocus={e => e.currentTarget.style.borderColor = G}
          onBlur={e => e.currentTarget.style.borderColor = BD} />
      )}
    </div>
  );
}

// ── Multi-choice input (checkboxes with optional max) ──────────────────
function MultiChoiceInput({ options, value, onChange, lang, hasOther, maxSelections }) {
  const lastIdx = options.length - 1;
  const selected = value?.selected_indices || [];

  const toggle = (i) => {
    if (selected.includes(i)) {
      onChange({ ...value, selected_indices: selected.filter(x => x !== i) });
    } else {
      if (maxSelections && selected.length >= maxSelections) return; // limit reached
      onChange({ ...value, selected_indices: [...selected, i] });
    }
  };

  return (
    <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
      {maxSelections && (
        <p style={{fontSize:"12px", color:MUT, marginBottom:"4px",
          fontStyle:"italic"}}>
          {ui(lang, "selectUpTo")} {maxSelections} {ui(lang, "options")}
          {selected.length > 0 && ` (${selected.length}/${maxSelections})`}
        </p>
      )}
      {options.map((opt, i) => {
        const optLabel = translatedText(opt, lang, translatedText(opt, "en", `Option ${i+1}`));
        const isOther = hasOther && i === lastIdx;
        const isSelected = selected.includes(i);
        const disabled = !isSelected && maxSelections && selected.length >= maxSelections;
        return (
          <label key={i}
            onClick={() => !disabled && toggle(i)}
            style={{
              display:"flex", alignItems:"center", gap:"10px",
              padding:"10px 14px",
              border:`2px solid ${isSelected ? G : BD}`,
              background: isSelected ? LG : "#fff",
              borderRadius:"8px",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.4 : 1,
              transition:"all 0.15s",
            }}>
            <span style={{
              width:"18px", height:"18px", borderRadius:"4px",
              border:`2px solid ${isSelected ? G : "#ccc"}`,
              background: isSelected ? G : "#fff",
              flexShrink:0, display:"flex",
              alignItems:"center", justifyContent:"center",
            }}>
              {isSelected && <span style={{color:"#fff", fontSize:"14px",
                lineHeight:1, fontWeight:"700"}}>✓</span>}
            </span>
            <span style={{flex:1, fontSize:"14px", color:TXT}}>{optLabel}</span>
          </label>
        );
      })}
      {hasOther && selected.includes(lastIdx) && (
        <input
          value={value?.other_text || ""}
          onChange={e => onChange({ ...value, other_text: e.target.value })}
          placeholder={ui(lang, "pleaseSpecify")}
          style={{marginLeft:"32px", padding:"8px 12px",
            border:`1px solid ${BD}`, borderRadius:"8px",
            fontSize:"14px", outline:"none"}}
          onFocus={e => e.currentTarget.style.borderColor = G}
          onBlur={e => e.currentTarget.style.borderColor = BD} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  THANK YOU SCREEN
// ════════════════════════════════════════════════════════════════════════
function ThankYouScreen({ lang, survey, onBack }) {
  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", padding:"40px 20px",
      background:`linear-gradient(135deg, ${DG} 0%, ${G} 100%)`,
    }}>
      <div className="fade" style={{textAlign:"center", maxWidth:"500px"}}>
        <img src="/herbalife-logo-white.png" alt="Herbalife"
          style={{height:"clamp(40px, 5vw, 56px)", marginBottom:"32px", opacity:0.95}} />
        <div style={{
          background:"rgba(255,255,255,0.18)",
          borderRadius:"20px", padding:"40px 36px",
          backdropFilter:"blur(10px)",
        }}>
          <div style={{fontSize:"56px", marginBottom:"16px"}}>✓</div>
          <h1 style={{color:"#fff", fontSize:"clamp(24px, 3vw, 32px)",
            fontWeight:"700", marginBottom:"12px"}}>
            {ui(lang, "thankYou")}
          </h1>
          <p style={{color:"rgba(255,255,255,0.9)", fontSize:"15px",
            lineHeight:"1.55"}}>
            {ui(lang, "thankYouSub")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  ADMIN LOGIN
// ════════════════════════════════════════════════════════════════════════
function AdminLogin({ pwd, setPwd, err, onLogin, onBack }) {
  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", padding:"40px 20px",
      background:`linear-gradient(135deg, ${DG} 0%, ${G} 100%)`,
    }}>
      <div style={{background:"#fff", padding:"40px 36px", borderRadius:"16px",
        maxWidth:"400px", width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        <div style={{textAlign:"center", marginBottom:"28px"}}>
          <div style={{fontSize:"36px", marginBottom:"12px"}}>🔒</div>
          <h2 style={{fontSize:"22px", fontWeight:"700", color:DG, marginBottom:"6px"}}>Admin Panel</h2>
          <p style={{fontSize:"13px", color:MUT}}>Enter password to continue</p>
        </div>
        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onLogin()}
          placeholder="Password" autoFocus
          style={{width:"100%", padding:"12px 14px", border:`2px solid ${BD}`,
            borderRadius:"10px", fontSize:"15px", marginBottom:"12px", outline:"none"}} />
        {err && <p style={{color:"#e74c3c", fontSize:"13px", marginBottom:"12px"}}>{err}</p>}
        <button onClick={onLogin} style={{
          width:"100%", padding:"12px", background:DG, color:"#fff",
          border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:"700",
          marginBottom:"10px",
        }}>Sign in</button>
        <button onClick={onBack} style={{
          width:"100%", padding:"10px", background:"transparent", color:MUT,
          border:"none", fontSize:"13px",
        }}>← Back to landing</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  ADMIN PANEL (unchanged from Entrega 1)
// ════════════════════════════════════════════════════════════════════════
function AdminPanel({ onExit, onActiveSurveyChange }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/surveys");
      const data = await r.json();
      setSurveys(data.surveys || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadSurveys(); }, []);

  const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);

  const createSurvey = async () => {
    const name = prompt("Survey name?");
    if (!name) return;
    const description = prompt("Description (optional)?") || "";
    try {
      const r = await fetch("/api/surveys", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await r.json();
      if (data.survey) { await loadSurveys(); setSelectedSurveyId(data.survey.id); }
    } catch (e) { alert("Error: " + e.message); }
  };

  const toggleActive = async (survey) => {
    const setting = !survey.active;
    if (setting && !confirm(`Make "${survey.name}" the active survey?`)) return;
    try {
      const r = await fetch("/api/surveys", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: survey.id, active: setting }),
      });
      const data = await r.json();
      if (data.survey) {
        await loadSurveys();
        onActiveSurveyChange();
      }
    } catch (e) { alert("Error: " + e.message); }
  };

  const deleteSurvey = async (survey) => {
    if (!confirm(`Delete "${survey.name}"? Cannot be undone.`)) return;
    try {
      await fetch(`/api/surveys?id=${survey.id}`, { method: "DELETE" });
      if (selectedSurveyId === survey.id) setSelectedSurveyId(null);
      await loadSurveys();
    } catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div style={{minHeight:"100vh", background:"#f5f9f6"}}>
      <div style={{background:DG, color:"#fff", padding:"18px 28px",
        display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{display:"flex", alignItems:"center", gap:"14px"}}>
          <img src="/herbalife-logo-white.png" alt="Herbalife"
            style={{height:"28px", opacity:0.9}} />
          <h1 style={{fontSize:"18px", fontWeight:"700"}}>Pre-Event Surveys — Admin</h1>
        </div>
        <button onClick={onExit} style={{
          background:"rgba(255,255,255,0.15)", color:"#fff",
          border:"1px solid rgba(255,255,255,0.3)",
          padding:"7px 14px", borderRadius:"8px", fontSize:"13px", fontWeight:"600",
        }}>Exit admin →</button>
      </div>

      <div style={{maxWidth:"1100px", margin:"0 auto", padding:"32px 28px"}}>
        {selectedSurvey ? (
          <SurveyEditor survey={selectedSurvey}
            onBack={() => { setSelectedSurveyId(null); loadSurveys(); }}
            onSurveyUpdated={loadSurveys} />
        ) : (
          <>
            <div style={{display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:"22px"}}>
              <h2 style={{fontSize:"22px", fontWeight:"700", color:DG}}>Surveys</h2>
              <button onClick={createSurvey} style={{
                background:DG, color:"#fff", border:"none",
                padding:"10px 18px", borderRadius:"10px",
                fontSize:"14px", fontWeight:"700",
              }}>+ New Survey</button>
            </div>
            {loading && <p style={{color:MUT}}>Loading...</p>}
            {!loading && surveys.length === 0 && (
              <div style={{background:"#fff", padding:"40px", borderRadius:"12px",
                textAlign:"center", color:MUT}}>
                <p style={{fontSize:"15px"}}>No surveys yet. Click "+ New Survey" to create one.</p>
              </div>
            )}
            {!loading && surveys.map(s => (
              <SurveyCard key={s.id} survey={s}
                onOpen={() => setSelectedSurveyId(s.id)}
                onToggleActive={() => toggleActive(s)}
                onDelete={() => deleteSurvey(s)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function SurveyCard({ survey, onOpen, onToggleActive, onDelete }) {
  return (
    <div style={{
      background:"#fff", border:`1px solid ${BD}`,
      borderRadius:"12px", padding:"18px 20px", marginBottom:"14px",
      display:"flex", justifyContent:"space-between", alignItems:"center",
    }}>
      <div style={{flex:1}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px"}}>
          <h3 style={{fontSize:"17px", fontWeight:"700", color:TXT}}>{survey.name}</h3>
          {survey.active && (
            <span style={{background:G, color:"#fff", fontSize:"10px",
              padding:"3px 8px", borderRadius:"20px",
              fontWeight:"700", letterSpacing:"1px"}}>● ACTIVE</span>
          )}
        </div>
        {survey.description && (
          <p style={{fontSize:"13px", color:MUT, marginBottom:"6px"}}>{survey.description}</p>
        )}
        <p style={{fontSize:"11px", color:MUT}}>
          Languages: {(survey.languages || []).join(", ") || "—"}
        </p>
      </div>
      <div style={{display:"flex", gap:"8px"}}>
        <button onClick={onOpen} style={{
          background:DG, color:"#fff", border:"none",
          padding:"8px 14px", borderRadius:"8px",
          fontSize:"13px", fontWeight:"700",
        }}>Open →</button>
        <button onClick={onToggleActive} style={{
          background: survey.active ? "#fff3cd" : LG,
          color: survey.active ? "#856404" : DG,
          border:`1px solid ${survey.active ? "#ffe69c" : BD}`,
          padding:"8px 12px", borderRadius:"8px",
          fontSize:"12px", fontWeight:"700",
        }}>{survey.active ? "Deactivate" : "Make Active"}</button>
        <button onClick={onDelete} style={{
          background:"#fff", color:"#e74c3c",
          border:"1px solid #fadbd8",
          padding:"8px 12px", borderRadius:"8px",
          fontSize:"12px", fontWeight:"700",
        }}>Delete</button>
      </div>
    </div>
  );
}

function SurveyEditor({ survey, onBack, onSurveyUpdated }) {
  const [pages, setPages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMeta, setEditingMeta] = useState(false);
  const [name, setName] = useState(survey.name);
  const [description, setDescription] = useState(survey.description || "");
  const [selectedLangs, setSelectedLangs] = useState(survey.languages || Object.keys(ALL_LANGS));

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pagesR, qsR] = await Promise.all([
        fetch(`/api/pages?survey_id=${survey.id}`).then(r => r.json()),
        fetch(`/api/questions?survey_id=${survey.id}`).then(r => r.json()),
      ]);
      setPages(pagesR.pages || []);
      setQuestions(qsR.questions || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [survey.id]);

  const saveMeta = async () => {
    try {
      await fetch("/api/surveys", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: survey.id, name, description, languages: selectedLangs }),
      });
      setEditingMeta(false);
      onSurveyUpdated();
    } catch (e) { alert("Save error: " + e.message); }
  };

  const addPage = async () => {
    const titleEn = prompt("Section title (in English, translate later):");
    if (!titleEn) return;
    try {
      await fetch("/api/pages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ survey_id: survey.id, title: { en: titleEn } }),
      });
      loadAll();
    } catch (e) { alert("Error: " + e.message); }
  };

  const deletePage = async (page) => {
    const pageQs = questions.filter(q => q.page_id === page.id);
    const msg = pageQs.length
      ? `Delete this page and its ${pageQs.length} question(s)? Cannot be undone.`
      : `Delete this page?`;
    if (!confirm(msg)) return;
    try {
      await fetch(`/api/pages?id=${page.id}`, { method: "DELETE" });
      loadAll();
    } catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div className="fade">
      <div style={{display:"flex", alignItems:"center", gap:"14px", marginBottom:"22px"}}>
        <button onClick={onBack} style={{
          background:"#fff", color:DG, border:`1px solid ${BD}`,
          padding:"8px 14px", borderRadius:"8px",
          fontSize:"13px", fontWeight:"700",
        }}>← All surveys</button>
        <div style={{flex:1}}>
          <h2 style={{fontSize:"22px", fontWeight:"700", color:DG}}>{survey.name}</h2>
          {survey.description && (
            <p style={{fontSize:"13px", color:MUT, marginTop:"2px"}}>{survey.description}</p>
          )}
        </div>
        <button onClick={() => setEditingMeta(!editingMeta)} style={{
          background:editingMeta ? G : "#fff", color:editingMeta ? "#fff" : DG,
          border:`1px solid ${editingMeta ? G : BD}`,
          padding:"8px 14px", borderRadius:"8px",
          fontSize:"13px", fontWeight:"700",
        }}>{editingMeta ? "✓ Save settings" : "Edit settings"}</button>
      </div>

      {editingMeta && (
        <div style={{background:"#fff", padding:"22px", borderRadius:"12px",
          border:`1px solid ${BD}`, marginBottom:"22px"}}>
          <label style={{fontSize:"12px", fontWeight:"700", color:MUT,
            textTransform:"uppercase", letterSpacing:"1px"}}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{width:"100%", padding:"10px 12px", border:`1px solid ${BD}`,
              borderRadius:"8px", fontSize:"14px", marginTop:"6px", marginBottom:"16px"}} />
          <label style={{fontSize:"12px", fontWeight:"700", color:MUT,
            textTransform:"uppercase", letterSpacing:"1px"}}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{width:"100%", padding:"10px 12px", border:`1px solid ${BD}`,
              borderRadius:"8px", fontSize:"14px", marginTop:"6px",
              marginBottom:"16px", resize:"vertical", fontFamily:"inherit"}} />
          <label style={{fontSize:"12px", fontWeight:"700", color:MUT,
            textTransform:"uppercase", letterSpacing:"1px",
            display:"block", marginBottom:"10px"}}>
            Languages offered ({selectedLangs.length} selected)
          </label>
          <div style={{display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"16px"}}>
            {Object.entries(ALL_LANGS).map(([code, L]) => {
              const sel = selectedLangs.includes(code);
              return (
                <button key={code}
                  onClick={() => setSelectedLangs(sel
                    ? selectedLangs.filter(c => c !== code)
                    : [...selectedLangs, code])}
                  style={{
                    padding:"8px 12px", borderRadius:"8px", fontSize:"13px",
                    fontWeight:"600", border:`2px solid ${sel ? G : BD}`,
                    background: sel ? LG : "#fff",
                    color: sel ? DG : MUT,
                    display:"flex", alignItems:"center", gap:"6px",
                  }}>
                  <span>{L.flag}</span><span>{L.name}</span>
                </button>
              );
            })}
          </div>
          <button onClick={saveMeta} style={{
            background:DG, color:"#fff", border:"none",
            padding:"10px 18px", borderRadius:"8px",
            fontSize:"14px", fontWeight:"700",
          }}>Save settings</button>
        </div>
      )}

      <div style={{display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:"14px"}}>
        <h3 style={{fontSize:"16px", fontWeight:"700", color:TXT}}>Pages & Questions</h3>
        <button onClick={addPage} style={{
          background:LG, color:DG, border:`1px solid ${BD}`,
          padding:"8px 14px", borderRadius:"8px",
          fontSize:"13px", fontWeight:"700",
        }}>+ Add page</button>
      </div>

      {loading && <p style={{color:MUT}}>Loading...</p>}
      {!loading && pages.length === 0 && (
        <div style={{background:"#fff", padding:"32px", borderRadius:"12px",
          textAlign:"center", color:MUT, border:`1px solid ${BD}`}}>
          <p style={{fontSize:"14px"}}>No pages yet. Click "+ Add page" to create your first section.</p>
        </div>
      )}
      {!loading && pages.map((page, idx) => (
        <PageEditor key={page.id} page={page} pageIndex={idx}
          questions={questions.filter(q => q.page_id === page.id)}
          surveyId={survey.id}
          onChange={loadAll}
          onDelete={() => deletePage(page)} />
      ))}
    </div>
  );
}

function PageEditor({ page, pageIndex, questions, surveyId, onChange, onDelete }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleEn, setTitleEn] = useState(translatedText(page.title, "en"));

  const saveTitle = async () => {
    try {
      await fetch("/api/pages", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: page.id, title: { ...(page.title || {}), en: titleEn } }),
      });
      setEditingTitle(false); onChange();
    } catch (e) { alert("Error: " + e.message); }
  };

  const addQuestion = async (qType) => {
    try {
      await fetch("/api/questions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_id: surveyId, page_id: page.id, question_type: qType,
          text: { en: "New question" },
          options: (qType === "single_choice" || qType === "multi_choice")
            ? [{ en: "Option 1" }, { en: "Option 2" }] : null,
        }),
      });
      onChange();
    } catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div style={{background:"#fff", border:`1px solid ${BD}`,
      borderRadius:"12px", marginBottom:"18px", overflow:"hidden"}}>
      <div style={{background:LG, padding:"14px 18px",
        display:"flex", alignItems:"center", gap:"12px",
        borderBottom:`1px solid ${BD}`}}>
        <span style={{background:DG, color:"#fff", fontSize:"11px",
          fontWeight:"700", padding:"4px 10px", borderRadius:"6px",
          letterSpacing:"1px"}}>PAGE {pageIndex + 1}</span>
        {!editingTitle && (
          <>
            <h4 style={{fontSize:"15px", fontWeight:"700", color:TXT, flex:1}}>
              {translatedText(page.title, "en", "Untitled section")}
            </h4>
            <button onClick={() => setEditingTitle(true)} style={{
              background:"transparent", color:DG, border:"none",
              fontSize:"13px", fontWeight:"600", cursor:"pointer",
            }}>✏️ Edit</button>
          </>
        )}
        {editingTitle && (
          <>
            <input value={titleEn} onChange={e => setTitleEn(e.target.value)}
              autoFocus onKeyDown={e => e.key === "Enter" && saveTitle()}
              style={{flex:1, padding:"6px 10px", border:`1px solid ${BD}`,
                borderRadius:"6px", fontSize:"14px"}} />
            <button onClick={saveTitle} style={{
              background:G, color:"#fff", border:"none",
              padding:"6px 12px", borderRadius:"6px", fontSize:"12px", fontWeight:"700",
            }}>Save</button>
            <button onClick={() => { setEditingTitle(false); setTitleEn(translatedText(page.title, "en")); }}
              style={{background:"transparent", color:MUT, border:"none",
              fontSize:"12px", cursor:"pointer"}}>Cancel</button>
          </>
        )}
        <button onClick={onDelete} style={{
          background:"transparent", color:"#e74c3c", border:"none",
          fontSize:"14px", fontWeight:"700", cursor:"pointer", marginLeft:"8px",
        }}>🗑</button>
      </div>
      <div style={{padding:"14px 18px"}}>
        {questions.length === 0 && (
          <p style={{color:MUT, fontSize:"13px", textAlign:"center", padding:"16px"}}>
            No questions yet.
          </p>
        )}
        {questions.map((q, i) => (
          <QuestionEditor key={q.id} question={q} questionIndex={i} onChange={onChange} />
        ))}
        <div style={{display:"flex", gap:"8px", flexWrap:"wrap",
          paddingTop:"12px", borderTop:`1px dashed ${BD}`, marginTop:"8px"}}>
          <span style={{fontSize:"12px", color:MUT, fontWeight:"600", padding:"7px 0"}}>
            + Add question:
          </span>
          {QUESTION_TYPES.map(qt => (
            <button key={qt.value} onClick={() => addQuestion(qt.value)} style={{
              background:"#fff", color:DG, border:`1px solid ${BD}`,
              padding:"6px 12px", borderRadius:"6px",
              fontSize:"12px", fontWeight:"600",
            }}>{qt.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestionEditor({ question, questionIndex, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [textEn, setTextEn] = useState(translatedText(question.text, "en", ""));
  const [helpEn, setHelpEn] = useState(translatedText(question.help_text, "en", ""));
  const [options, setOptions] = useState(
    Array.isArray(question.options)
      ? question.options.map(o => translatedText(o, "en", ""))
      : []
  );
  const [maxSel, setMaxSel] = useState(question.max_selections || "");
  const [required, setRequired] = useState(question.required || false);
  const [hasOther, setHasOther] = useState(question.has_other || false);

  const save = async () => {
    const updates = {
      id: question.id,
      text: { ...(question.text || {}), en: textEn },
      help_text: { ...(question.help_text || {}), en: helpEn },
      required, has_other: hasOther,
    };
    if (question.question_type === "single_choice" || question.question_type === "multi_choice") {
      updates.options = options.map((label, i) => ({
        ...(Array.isArray(question.options) ? (question.options[i] || {}) : {}),
        en: label,
      }));
    }
    if (question.question_type === "multi_choice") {
      updates.max_selections = maxSel ? parseInt(maxSel) : null;
    }
    try {
      await fetch("/api/questions", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setExpanded(false); onChange();
    } catch (e) { alert("Save error: " + e.message); }
  };

  const deleteQ = async () => {
    if (!confirm("Delete this question?")) return;
    try {
      await fetch(`/api/questions?id=${question.id}`, { method: "DELETE" });
      onChange();
    } catch (e) { alert("Error: " + e.message); }
  };

  const addOption = () => setOptions([...options, ""]);
  const updateOption = (i, val) => setOptions(options.map((o, idx) => idx === i ? val : o));
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));

  const isChoice = question.question_type === "single_choice" || question.question_type === "multi_choice";

  return (
    <div style={{
      background: expanded ? LG : "#fafdfb",
      border: `1px solid ${expanded ? G : BD}`,
      borderRadius:"10px", padding:"14px 16px", marginBottom:"10px",
    }}>
      {!expanded && (
        <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
          <span style={{background:DG, color:"#fff", fontSize:"11px",
            fontWeight:"700", padding:"2px 8px", borderRadius:"4px",
            minWidth:"22px", textAlign:"center"}}>Q{questionIndex + 1}</span>
          <span style={{fontSize:"10px", color:MUT, fontWeight:"700",
            background:"#fff", padding:"2px 6px", borderRadius:"4px",
            textTransform:"uppercase", letterSpacing:"0.5px"}}>
            {question.question_type.replace("_", " ")}
          </span>
          <p style={{flex:1, fontSize:"14px", color:TXT}}>
            {translatedText(question.text, "en", "(no text)")}
          </p>
          {question.required && (
            <span style={{color:"#e74c3c", fontSize:"11px", fontWeight:"700"}}>★ REQUIRED</span>
          )}
          <button onClick={() => setExpanded(true)} style={{
            background:"#fff", color:DG, border:`1px solid ${BD}`,
            padding:"5px 10px", borderRadius:"6px",
            fontSize:"12px", fontWeight:"600",
          }}>✏️ Edit</button>
        </div>
      )}
      {expanded && (
        <div className="fade">
          <div style={{display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:"12px"}}>
            <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
              <span style={{background:DG, color:"#fff", fontSize:"11px",
                fontWeight:"700", padding:"2px 8px", borderRadius:"4px"}}>Q{questionIndex + 1}</span>
              <span style={{fontSize:"11px", color:MUT, fontWeight:"600",
                textTransform:"uppercase"}}>
                {question.question_type.replace("_", " ")}
              </span>
            </div>
            <button onClick={deleteQ} style={{
              background:"transparent", color:"#e74c3c", border:"none",
              fontSize:"12px", fontWeight:"700", cursor:"pointer",
            }}>🗑 Delete</button>
          </div>
          <label style={{fontSize:"11px", color:MUT, fontWeight:"700",
            textTransform:"uppercase", letterSpacing:"0.5px"}}>
            Question (English)
          </label>
          <textarea value={textEn} onChange={e => setTextEn(e.target.value)}
            rows={2}
            style={{width:"100%", padding:"8px 10px", border:`1px solid ${BD}`,
              borderRadius:"6px", fontSize:"14px", marginTop:"4px",
              marginBottom:"12px", resize:"vertical", fontFamily:"inherit"}} />
          <label style={{fontSize:"11px", color:MUT, fontWeight:"700",
            textTransform:"uppercase", letterSpacing:"0.5px"}}>
            Help text (optional)
          </label>
          <input value={helpEn} onChange={e => setHelpEn(e.target.value)}
            placeholder="e.g. 'Please select at most 3'"
            style={{width:"100%", padding:"8px 10px", border:`1px solid ${BD}`,
              borderRadius:"6px", fontSize:"13px", marginTop:"4px",
              marginBottom:"12px"}} />
          {isChoice && (
            <div style={{marginBottom:"12px"}}>
              <label style={{fontSize:"11px", color:MUT, fontWeight:"700",
                textTransform:"uppercase", letterSpacing:"0.5px"}}>Options</label>
              <div style={{marginTop:"6px"}}>
                {options.map((opt, i) => (
                  <div key={i} style={{display:"flex", gap:"6px", marginBottom:"6px"}}>
                    <span style={{width:"28px", display:"flex", alignItems:"center",
                      justifyContent:"center", color:MUT, fontSize:"13px"}}>{i + 1}.</span>
                    <input value={opt} onChange={e => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      style={{flex:1, padding:"7px 10px", border:`1px solid ${BD}`,
                        borderRadius:"6px", fontSize:"13px"}} />
                    <button onClick={() => removeOption(i)} style={{
                      background:"transparent", color:"#e74c3c", border:"none",
                      padding:"4px 8px", cursor:"pointer", fontSize:"14px",
                    }}>✕</button>
                  </div>
                ))}
                <button onClick={addOption} style={{
                  background:"#fff", color:DG, border:`1px dashed ${BD}`,
                  padding:"6px 12px", borderRadius:"6px",
                  fontSize:"12px", fontWeight:"600", marginTop:"4px",
                }}>+ Add option</button>
              </div>
            </div>
          )}
          <div style={{display:"flex", gap:"16px", alignItems:"center",
            flexWrap:"wrap", paddingTop:"10px", borderTop:`1px solid ${BD}`}}>
            <label style={{display:"flex", alignItems:"center", gap:"6px",
              fontSize:"13px", color:TXT, cursor:"pointer"}}>
              <input type="checkbox" checked={required}
                onChange={e => setRequired(e.target.checked)} />
              Required
            </label>
            {isChoice && (
              <label style={{display:"flex", alignItems:"center", gap:"6px",
                fontSize:"13px", color:TXT, cursor:"pointer"}}>
                <input type="checkbox" checked={hasOther}
                  onChange={e => setHasOther(e.target.checked)} />
                Last option is "Other" (free text)
              </label>
            )}
            {question.question_type === "multi_choice" && (
              <label style={{display:"flex", alignItems:"center", gap:"6px",
                fontSize:"13px", color:TXT}}>
                Max selections:
                <input type="number" value={maxSel}
                  onChange={e => setMaxSel(e.target.value)}
                  placeholder="None"
                  style={{width:"60px", padding:"4px 8px",
                    border:`1px solid ${BD}`, borderRadius:"6px", fontSize:"13px"}} />
              </label>
            )}
          </div>
          <div style={{display:"flex", gap:"8px", marginTop:"14px"}}>
            <button onClick={save} style={{
              background:DG, color:"#fff", border:"none",
              padding:"8px 16px", borderRadius:"6px",
              fontSize:"13px", fontWeight:"700",
            }}>✓ Save question</button>
            <button onClick={() => setExpanded(false)} style={{
              background:"transparent", color:MUT, border:"none",
              padding:"8px 12px", fontSize:"13px", cursor:"pointer",
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
