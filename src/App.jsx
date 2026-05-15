import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are the official AI Marketing Agent for Alien-Code, an IT company in Amman, Jordan with offices in Egypt and Turkey. Clients in Jordan, Saudi Arabia, Kuwait, UAE, Egypt, Oman, Yemen.

YOUR ROLE: Act like a warm, professional sales rep. NOT a scripted bot — have real natural conversations.

PERSONALITY:
- Auto-detect language: if Arabic → reply Arabic, if English → reply English. Never ask.
- Friendly, confident, concise — 2-4 sentences per reply
- Ask qualifying questions before quoting prices
- Light emojis naturally

SERVICES & PRICING:
- Mobile App (iOS+Android): from $5,000
- Website: from $1,500
- Educational Platform: $1,500–$3,000 (Jordan) / $5,000–$10,000 (international)
- Medical/Nutrition System: $1,500–$3,000
- ERP System: $1,000–$50,000
- AI Chatbot/Agent: custom pricing
- Website Rental: custom

COMPANY HIGHLIGHTS:
- 150+ projects, 50+ engineers, 6 countries
- Payment: 50% signing / 25% demo / 25% delivery
- Official contracts, 24/7 support

PAST WORK: Habiba Stores, Jetour Kuwait, Green Care, Qdemy, Taxi K, Al-Wasel, NGO 962, Mira Nutrition.

CONVERSATION RULES:
1. Greet warmly — don't list services immediately
2. Ask about their business before pricing
3. Quote ranges naturally after understanding needs
4. Close with: "أقدر أربطك مع فريقنا" / "I can connect you with our team"
5. Handle objections with payment terms
6. Keep it chat-style, not email-style`;

const QUICK = [
  { label: "📱 تطبيق موبايل", msg: "بدنا تطبيق موبايل لشركتنا" },
  { label: "🌐 موقع إلكتروني", msg: "كم سعر تصميم موقع إلكتروني؟" },
  { label: "🗂️ ERP System", msg: "I need an ERP system for my business" },
  { label: "💼 Portfolio", msg: "شو أعمالكم السابقة؟" },
];

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [msgs, setMsgs] = useState([
    {
      role: "bot",
      text: "مرحباً! 👋 أنا مساعد Alien-Code الذكي.\nسواء تكتب بالعربي أو English — أنا هنا!\n\nكيف أقدر أساعدك اليوم؟",
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text) {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput("");
    setShowQuick(false);
    setLoading(true);

    const userMsg = { role: "user", text: t, time: now() };
    setMsgs((m) => [...m, userMsg]);

    const newHistory = [...history, { role: "user", content: t }];
    setHistory(newHistory);

   try {

const res = await fetch("/apI/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: newHistory
  })
});

const data = await res.json();
if (data.error) throw new Error(data.error.message);
const reply = data.content?.[0]?.text || "...";

      setHistory((h) => [...h, { role: "assistant", content: reply }]);
      setMsgs((m) => [...m, { role: "bot", text: reply, time: now() }]);
    } catch (e) {
      setMsgs((m) => [
  ...m,
  { role: "bot", text: "Error: " + e.message, time: now() },
]);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>AC</div>
        <div style={{ flex: 1 }}>
          <div style={s.name}>Alien-Code Assistant</div>
          <div style={s.sub}>
            <span style={s.dot} />
            <span>Online · Powered by AI</span>
          </div>
        </div>
        <div style={s.badge}>WhatsApp Demo</div>
      </div>

      {/* Messages */}
      <div style={s.msgs}>
        {msgs.map((m, i) => (
          <div key={i} style={{ ...s.msgRow, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "bot" && <div style={{ ...s.av, background: "#f5a800", color: "#0f0f1a" }}>AC</div>}
            <div>
              <div style={m.role === "user" ? s.bubUser : s.bubBot}>
                {m.text.split("\n").map((line, j) => (
                  <span key={j}>{line}{j < m.text.split("\n").length - 1 && <br />}</span>
                ))}
              </div>
              <div style={{ ...s.time, textAlign: m.role === "user" ? "right" : "left" }}>{m.time}</div>
            </div>
            {m.role === "user" && <div style={{ ...s.av, background: "#2a2a3e", color: "#aaa" }}>You</div>}
          </div>
        ))}

        {loading && (
          <div style={{ ...s.msgRow, justifyContent: "flex-start" }}>
            <div style={{ ...s.av, background: "#f5a800", color: "#0f0f1a" }}>AC</div>
            <div style={s.typing}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ ...s.dot2, animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick buttons */}
      {showQuick && (
        <div style={s.quickBar}>
          {QUICK.map((q, i) => (
            <button key={i} style={s.qBtn} onClick={() => send(q.msg)}
              onMouseEnter={e => Object.assign(e.target.style, s.qBtnHover)}
              onMouseLeave={e => Object.assign(e.target.style, s.qBtn)}>
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={s.inputArea}>
        <textarea
          ref={textRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="اكتب هنا... / Type here..."
          rows={1}
          style={s.inp}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          ...s.sendBtn,
          background: loading || !input.trim() ? "#2a2a3e" : "#f5a800",
          cursor: loading || !input.trim() ? "not-allowed" : "pointer",
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill={loading || !input.trim() ? "#555" : "#0f0f1a"}>
            <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
          </svg>
        </button>
      </div>

      <div style={s.footer}>● LIVE DEMO — Alien-Code AI Agent v1.0</div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  );
}

const s = {
  root: { fontFamily: "'Space Grotesk', sans-serif", background: "#0f0f1a", minHeight: 520, display: "flex", flexDirection: "column", borderRadius: 16, overflow: "hidden", border: "1px solid #2a2a3e" },
  header: { background: "#1a1a2e", borderBottom: "1px solid #2a2a3e", padding: "13px 18px", display: "flex", alignItems: "center", gap: 12 },
  logo: { width: 36, height: 36, background: "#f5a800", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#0f0f1a", fontFamily: "monospace", flexShrink: 0 },
  name: { fontSize: 15, fontWeight: 600, color: "#fff" },
  sub: { fontSize: 11, color: "#888", display: "flex", alignItems: "center", gap: 5, marginTop: 2 },
  dot: { width: 7, height: 7, background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" },
  badge: { background: "#1e1e30", border: "1px solid #3a3a55", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#aaa", fontFamily: "monospace" },
  msgs: { flex: 1, overflowY: "auto", padding: "18px 14px", display: "flex", flexDirection: "column", gap: 14, minHeight: 320, maxHeight: 320, background: "#0f0f1a" },
  msgRow: { display: "flex", gap: 10, alignItems: "flex-end" },
  av: { width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 },
  bubBot: { background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#e0e0f0", padding: "10px 14px", borderRadius: "14px 14px 14px 4px", fontSize: 14, lineHeight: 1.65, maxWidth: 300, wordBreak: "break-word", direction: "rtl", unicodeBidi: "plaintext", textAlign: "right" },
bubUser: { background: "#f5a800", color: "#0f0f1a", padding: "10px 14px", borderRadius: "14px 14px 4px 14px", fontSize: 14, lineHeight: 1.65, fontWeight: 500, maxWidth: 280, wordBreak: "break-word", direction: "rtl", unicodeBidi: "plaintext", textAlign: "right" },
  time: { fontSize: 10, color: "#444", marginTop: 3, paddingLeft: 2, paddingRight: 2 },
  typing: { background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: "14px 14px 14px 4px", padding: "13px 16px", display: "flex", gap: 5, alignItems: "center" },
  dot2: { width: 7, height: 7, background: "#f5a800", borderRadius: "50%", display: "inline-block", animation: "bounce 1.2s infinite" },
  quickBar: { padding: "8px 14px 4px", display: "flex", gap: 7, flexWrap: "wrap" },
  qBtn: { background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#bbb", fontSize: 12, padding: "5px 11px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" },
  qBtnHover: { background: "#f5a800", color: "#0f0f1a", border: "1px solid #f5a800", fontWeight: 600, fontSize: 12, padding: "5px 11px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" },
  inputArea: { padding: "10px 14px 13px", borderTop: "1px solid #1e1e30", display: "flex", gap: 10, alignItems: "flex-end", background: "#0f0f1a" },
  inp: { flex: 1, background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#e8e8f0", borderRadius: 12, padding: "10px 13px", fontSize: 14, resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 90, minHeight: 40, outline: "none" },
  sendBtn: { width: 40, height: 40, border: "none", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" },
  footer: { textAlign: "center", padding: 5, fontSize: 10, color: "#333", fontFamily: "monospace", background: "#0a0a12", borderTop: "1px solid #151520" },
};