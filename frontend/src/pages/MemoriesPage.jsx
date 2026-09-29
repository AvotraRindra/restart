import { useEffect, useMemo, useState } from "react";
import { audioUrl, deleteMemory, getMyMemories, imageUrl, updateMemoryAccess } from "../services/memoryApi.js";

const TYPE_LABELS = { livre: "Livre", video: "Vidéo", bd: "BD" };
const STATUS_LABELS = { pending: "À générer", generating: "Génération…", completed: "Création prête", failed: "À relancer" };

function dateOf(m) {
  return m.memory_date || m.date || "Date inconnue";
}

export default function MemoriesPage({ refreshKey = 0, onCreate, search = "", onOpenStudio, onOpenViewer }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    getMyMemories()
      .then((r) => { if (live) setItems(Array.isArray(r?.data) ? r.data : []); })
      .catch((e) => { if (live) setError(e.message); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => [m.title, m.text_content, m.location, m.emotion, m.memory_type]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, search]);

  const changeAccess = async (m) => {
    const current = m.access_level || m.access || "private";
    const next = current === "public" ? "private" : "public";
    try {
      await updateMemoryAccess(m.id, next);
      setItems((xs) => xs.map((x) => x.id === m.id ? { ...x, access_level: next } : x));
    } catch (e) { setError(e.message); }
  };

  const remove = async (m) => {
    if (!window.confirm(`Supprimer « ${m.title} » ?`)) return;
    try {
      await deleteMemory(m.id);
      setItems((xs) => xs.filter((x) => x.id !== m.id));
    } catch (e) { setError(e.message); }
  };

  return (
    <section className="page-shell">
      <div className="page-head">
        <div><span>VOTRE HISTOIRE</span><h1>Mes souvenirs</h1><p>Retrouvez, écoutez, partagez et transformez les moments qui comptent.</p></div>
        <button className="primary-btn" onClick={onCreate}>+ Nouveau souvenir</button>
      </div>

      {search && <div className="search-result-note">Recherche : <strong>{search}</strong> · {filtered.length} résultat(s)</div>}
      {error && <div className="inline-alert">{error}</div>}

      {loading ? (
        <div className="memories-grid">{Array.from({ length: 6 }).map((_, i) => <article className="memory-card memory-card--skeleton" key={i}><div className="skeleton skeleton-cover"/><div className="memory-card-body"><div className="skeleton skeleton-line medium"/><div className="skeleton skeleton-line wide"/></div></article>)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><strong>{search ? "Aucun souvenir ne correspond à votre recherche." : "Aucun souvenir enregistré."}</strong><p>Créez un souvenir texte ou vocal pour commencer.</p>{!search && <button className="primary-btn" onClick={onCreate}>Créer un souvenir</button>}</div>
      ) : (
        <div className="memories-grid">
          {filtered.map((m) => {
            const access = m.access_level || "private";
            return (
              <article className="memory-card" key={m.id}>
                <div className={`memory-cover memory-cover--${m.memory_type || "livre"}`}>
                  {m.image_url ? <img src={imageUrl(m.image_url)} alt="" /> : <div className="memory-gradient"/>}
                  <span>{m.emotion || "souvenir"}</span>
                  <b className="memory-type-badge">{TYPE_LABELS[m.memory_type] || "Souvenir"}</b>
                </div>
                <div className="memory-card-body">
                  <div className="memory-meta"><small>{dateOf(m)}</small><small>{m.location || "Lieu non précisé"}</small></div>
                  <h3>{m.title || "Sans titre"}</h3>
                  <p>{m.text_content || (m.audio_url ? "Souvenir vocal" : "Aucun texte")}</p>
                  {m.audio_url && <audio controls src={audioUrl(m.audio_url)}/>} 
                  <div className="memory-state-row"><span className={access === "public" ? "state-public" : "state-private"}>{access === "public" ? "◎ Public" : "🔒 Privé"}</span><span>{STATUS_LABELS[m.generation_status] || "À générer"}</span></div>
                  <div className="card-actions">
                    <button onClick={() => onOpenViewer?.(m.id)}>Voir</button>
                    <button onClick={() => onOpenStudio?.(m.id)}>✦ {m.generation_status === "completed" ? "Atelier" : "Créer"}</button>
                    <button onClick={() => changeAccess(m)}>{access === "public" ? "Rendre privé" : "Partager"}</button>
                    {access === "public" && <button onClick={async () => { const url = `${window.location.origin}/memory/${m.id}`; try { await navigator.clipboard.writeText(url); } catch { window.prompt("Lien public", url); } }}>Copier le lien</button>}
                    <button className="danger" onClick={() => remove(m)}>Supprimer</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
