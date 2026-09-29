import { useEffect, useState } from "react";
import { getSharedMemories, imageUrl } from "../services/memoryApi.js";
import { addComment, getComments, reactToComment, reactToMemory } from "../services/socialApi.js";

export default function SharedPage({ onOpenMemory }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => getSharedMemories().then((r) => setItems(Array.isArray(r?.data) ? r.data : []));
  useEffect(() => { load().catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);

  async function openComments(memory) {
    setSelected(memory);
    setError("");
    try {
      const r = await getComments(memory.id);
      setComments(Array.isArray(r?.data) ? r.data : []);
    } catch (e) { setError(e.message); }
  }

  async function like(memory) {
    try {
      const r = await reactToMemory(memory.id, "love");
      setItems((xs) => xs.map((x) => x.id === memory.id ? { ...x, reactions_count: Math.max(0, Number(x.reactions_count || 0) + (r.active ? 1 : -1)) } : x));
    } catch (e) { setError(e.message); }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!comment.trim() || !selected) return;
    try {
      await addComment(selected.id, comment.trim(), replyTo?.id || null);
      setComment("");
      setReplyTo(null);
      const r = await getComments(selected.id);
      setComments(Array.isArray(r?.data) ? r.data : []);
      setItems((xs) => xs.map((x) => x.id === selected.id ? { ...x, comments_count: Number(x.comments_count || 0) + 1 } : x));
    } catch (e2) { setError(e2.message); }
  }

  async function likeComment(c) {
    try {
      const r = await reactToComment(c.id, "like");
      setComments((xs) => xs.map((x) => x.id === c.id ? { ...x, reactions_count: Math.max(0, Number(x.reactions_count || 0) + (r.active ? 1 : -1)) } : x));
    } catch (e) { setError(e.message); }
  }

  return (
    <section className="page-shell">
      <div className="page-head"><div><span>COMMUNAUTÉ</span><h1>Souvenirs partagés</h1><p>Réagissez et échangez autour des souvenirs rendus publics.</p></div></div>
      {error && <div className="inline-alert">{error}</div>}
      {loading ? <div className="empty-state"><p>Chargement des souvenirs publics…</p></div> : items.length === 0 ? <div className="empty-state"><strong>Aucun souvenir public pour le moment.</strong></div> : (
        <div className="shared-grid">
          {items.map((m) => <article className="shared-card" key={m.id}>
            {m.image_url ? <img src={imageUrl(m.image_url)} alt="" /> : <div className={`shared-placeholder type-${m.memory_type || "livre"}`}><span>{m.memory_type === "bd" ? "▤" : m.memory_type === "video" ? "▶" : "▱"}</span></div>}
            <div><small>{m.emotion || "souvenir"} · {m.location || "Lieu non précisé"}</small><h3>{m.title || "Un souvenir partagé"}</h3><p>{(m.text_content || "Souvenir vocal").slice(0, 120)}</p><p>Publié par <strong>{m.owner_name || "un membre"}</strong></p><div><button onClick={() => onOpenMemory?.(m.id)}>Voir le souvenir</button><button onClick={() => like(m)}>♡ {Number(m.reactions_count || 0)}</button><button onClick={() => openComments(m)}>▢ {Number(m.comments_count || 0)} commentaires</button></div></div>
          </article>)}
        </div>
      )}

      {selected && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
        <section className="comment-modal panel">
          <div className="modal-head"><div><small>COMMENTAIRES</small><h2>{selected.title}</h2></div><button onClick={() => setSelected(null)}>×</button></div>
          <div className="comment-list">{comments.length === 0 ? <p className="muted">Soyez le premier à commenter.</p> : comments.map((c) => <article className={`comment-item ${c.parent_comment_id ? "is-reply" : ""}`} key={c.id}><span>{(c.nom || "U")[0]}</span><div><strong>{c.nom || "Utilisateur"}</strong><p>{c.content}</p><div className="comment-actions"><button onClick={() => likeComment(c)}>♡ {Number(c.reactions_count || 0)}</button><button onClick={() => setReplyTo(c)}>Répondre</button></div></div></article>)}</div>
          {replyTo && <div className="reply-banner">Réponse à <strong>{replyTo.nom || "Utilisateur"}</strong><button onClick={() => setReplyTo(null)}>×</button></div>}
          <form className="comment-compose" onSubmit={submitComment}><input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={replyTo ? "Écrire une réponse…" : "Ajouter un commentaire…"}/><button type="submit">Envoyer</button></form>
        </section>
      </div>}
    </section>
  );
}
