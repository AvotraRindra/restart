import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "./Icons.jsx";
import { chatWithMnemos } from "../services/assistantApi.js";

const welcome = { role: "assistant", content: "Bonjour, je suis MNEMOS. Je peux vous aider à retrouver, organiser ou mettre en valeur vos souvenirs." };

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcome]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open, loading]);

  async function submit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || loading) return;
    const userMessage = { role: "user", content: text };
    const history = messages.slice(-8);
    setMessages((xs) => [...xs, userMessage]); setDraft(""); setLoading(true); setError("");
    try {
      const result = await chatWithMnemos(text, history);
      setMessages((xs) => [...xs, { role: "assistant", content: result?.data?.answer || "Je n'ai pas pu formuler une réponse." }]);
    } catch (err) { setError(err.message || "MNEMOS est momentanément indisponible."); }
    finally { setLoading(false); }
  }

  return <div className={`mnemos-float ${open ? "open" : ""}`}>
    {open && <section className="mnemos-chat" aria-label="Assistant MNEMOS">
      <header><div><span><Bot size={21}/></span><div><strong>MNEMOS</strong><small>Assistant RE:START</small></div></div><button onClick={() => setOpen(false)} aria-label="Fermer"><X size={19}/></button></header>
      <div className="mnemos-messages">{messages.map((m, index) => <div key={index} className={`mnemos-msg ${m.role}`}><p>{m.content}</p></div>)}{loading && <div className="mnemos-msg assistant"><p className="mnemos-typing"><i/><i/><i/></p></div>}{error && <div className="mnemos-error">{error}</div>}<div ref={endRef}/></div>
      <form onSubmit={submit}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Demandez quelque chose à MNEMOS…" maxLength={2000}/><button type="submit" disabled={!draft.trim() || loading} aria-label="Envoyer"><Send size={18}/></button></form>
    </section>}
    <button className="mnemos-launcher" onClick={() => setOpen((v) => !v)} aria-label={open ? "Fermer MNEMOS" : "Ouvrir MNEMOS"} title="Assistant MNEMOS"><Bot size={28}/><i/></button>
  </div>;
}
