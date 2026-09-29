import { useEffect, useState } from "react";
import Book3DViewer from "../components/Book3DViewer.jsx";
import { audioUrl, getCreation, getMemory, getPublicCreation, imageUrl } from "../services/memoryApi.js";

const labels = { livre: "Livre souvenir", video: "Vidéo", bd: "Bande dessinée" };

export default function MemoryViewerPage({ memoryId, publicMode = false, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    const request = publicMode ? getPublicCreation(memoryId) : getCreation(memoryId);
    request.then((r) => active && setData(r?.data || null)).catch(async (e) => {
      if (!publicMode) {
        try {
          const r = await getMemory(memoryId);
          if (active) setData({ memory: r?.data, creation: [], photos: [], characters: [], attachments: [] });
          return;
        } catch {}
      }
      if (active) setError(e.message || "Impossible d'ouvrir ce souvenir.");
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [memoryId, publicMode]);

  if (loading) return <section className="page-shell"><div className="empty-state"><p>Ouverture du souvenir…</p></div></section>;
  if (error || !data?.memory) return <section className="page-shell"><button className="ghost-btn" onClick={onBack}>← Retour</button><div className="inline-alert">{error || "Souvenir introuvable."}</div></section>;

  const m = data.memory;
  return (
    <section className="page-shell memory-view-page">
      <div className="memory-view-toolbar">
        <button className="ghost-btn" onClick={onBack}>← Retour</button>
        {m.access_level === "public" && <span className="public-pill">◎ Souvenir public</span>}
      </div>
      <header className="memory-view-hero panel">
        <div>
          <span>{labels[m.memory_type] || "Souvenir"} · {m.emotion || "autre"}</span>
          <h1>{m.generated_title || m.title}</h1>
          <p>{m.text_content || "Souvenir vocal"}</p>
          <div className="memory-view-meta"><small>{m.memory_date || "Date non précisée"}</small><small>{m.location || "Lieu non précisé"}</small><small>par {m.owner_name || "vous"}</small></div>
          {m.audio_url && <audio controls src={audioUrl(m.audio_url)} />}
        </div>
        {data.photos?.[0]?.image_url || m.image_url ? <img src={imageUrl(data.photos?.[0]?.image_url || m.image_url)} alt="Illustration du souvenir"/> : null}
      </header>

      <div className="memory-creation-view panel">
        {m.memory_type === "livre" && <Book3DViewer pages={data.creation || []} title={m.generated_title || m.title}/>} 
        {m.memory_type === "bd" && <ComicViewer data={data}/>} 
        {m.memory_type === "video" && <VideoViewer data={data}/>} 
      </div>

      {data.attachments?.length > 0 && <section className="panel attachment-view"><h2>Pièces jointes</h2><div className="attachment-grid">{data.attachments.map((a) => <Attachment key={a.id} item={a}/>)}</div></section>}
    </section>
  );
}

function ComicViewer({ data }) {
  if (!data.creation?.length) return <div className="empty-state"><strong>La bande dessinée n'a pas encore été générée.</strong></div>;
  return <div className="comic-reader">{data.creation.map((p) => <article key={p.id || p.panel_number}><div className="comic-reader-art">{p.image_url ? <img src={imageUrl(p.image_url)} alt=""/> : <><b>CASE {p.panel_number}</b><small>{p.image_prompt}</small></>}</div>{p.narration && <p>{p.narration}</p>}{p.dialogue && <blockquote>“{p.dialogue}”</blockquote>}</article>)}</div>;
}

function VideoViewer({ data }) {
  if (!data.creation?.length) return <div className="empty-state"><strong>La vidéo n'a pas encore été préparée.</strong></div>;
  return <div className="video-reader">{data.photos?.length > 0 && <div className="reference-strip">{data.photos.map((p) => <figure key={p.id}><img src={imageUrl(p.image_url)} alt="Photo du souvenir"/></figure>)}</div>}<div className="video-timeline">{data.creation.map((s) => <article key={s.id || s.scene_number}><span>{s.scene_number}</span><div><strong>Scène {s.scene_number} · {s.duration_seconds || 5}s</strong><p>{s.narration}</p><small>{s.image_prompt}</small></div></article>)}</div></div>;
}

function Attachment({ item }) {
  const url = imageUrl(item.file_url);
  if (item.category === "image") return <a className="attachment-card" href={url} target="_blank" rel="noreferrer"><img src={url} alt={item.original_name}/><span>{item.original_name}</span></a>;
  if (item.category === "video") return <div className="attachment-card"><video controls src={url}/><span>{item.original_name}</span></div>;
  if (item.category === "audio") return <div className="attachment-card"><audio controls src={url}/><span>{item.original_name}</span></div>;
  return <a className="attachment-card attachment-file" href={url} target="_blank" rel="noreferrer"><b>↗</b><span>{item.original_name}</span></a>;
}
