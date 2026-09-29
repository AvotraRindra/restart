import { useEffect, useMemo, useState } from "react";
import { addComicCharacter, generateMemory, getCreation, imageUrl, uploadMemoryPhotos } from "../services/memoryApi.js";
import Book3DViewer from "../components/Book3DViewer.jsx";

const typeLabel = { livre: "Livre souvenir", video: "Vidéo", bd: "Bande dessinée" };
const typeIcon = { livre: "▱", video: "▶", bd: "▤" };

export default function CreativeStudioPage({ memories = [], setPage, onChanged, initialMemoryId = "" }) {
  const [selectedId, setSelectedId] = useState(() => initialMemoryId || memories[0]?.id || "");
  const [creation, setCreation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [photos, setPhotos] = useState([]);
  const [characterName, setCharacterName] = useState("");
  const [characterImage, setCharacterImage] = useState(null);

  useEffect(() => {
    if (initialMemoryId && memories.some((m) => String(m.id) === String(initialMemoryId))) {
      setSelectedId(initialMemoryId);
    } else if (!selectedId && memories[0]?.id) {
      setSelectedId(memories[0].id);
    }
  }, [memories, selectedId, initialMemoryId]);

  const memory = useMemo(() => memories.find((m) => String(m.id) === String(selectedId)) || null, [memories, selectedId]);

  async function refresh(id = selectedId, quiet = false) {
    if (!id) return;
    if (!quiet) setLoading(true);
    setError("");
    try {
      const r = await getCreation(id);
      setCreation(r?.data || null);
    } catch (e) {
      if (e.status === 404) setCreation(null);
      else setError(e.message);
    } finally { if (!quiet) setLoading(false); }
  }

  useEffect(() => {
    setCreation(null);
    setNotice("");
    if (selectedId) refresh(selectedId, true);
  }, [selectedId]);

  async function generate() {
    if (!memory) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (memory.memory_type === "video" && photos.length) {
        setNotice("Envoi des photos…");
        await uploadMemoryPhotos(memory.id, photos);
      }
      if (memory.memory_type === "bd" && characterImage) {
        if (!characterName.trim()) throw new Error("Donnez un nom au personnage avant d'envoyer sa photo.");
        setNotice("Ajout du personnage…");
        await addComicCharacter(memory.id, characterName.trim(), characterImage);
      }
      setNotice("MNEMOS génère la création…");
      await generateMemory(memory.id);
      await refresh(memory.id, true);
      setNotice("Création générée avec succès.");
      onChanged?.();
    } catch (e) {
      setError(e.details || e.message || "La génération a échoué.");
      setNotice("");
    } finally { setLoading(false); }
  }

  if (!memories.length) {
    return <section className="page-shell"><div className="page-head"><div><span>MNEMOS</span><h1>Atelier créatif</h1><p>Transformez un souvenir en livre, vidéo ou bande dessinée.</p></div></div><div className="empty-state"><strong>Vous n'avez encore aucun souvenir.</strong><p>Créez d'abord un souvenir en choisissant sa forme créative.</p><button className="primary-btn" onClick={() => setPage?.("new-memory")}>Créer un souvenir</button></div></section>;
  }

  return (
    <section className="page-shell studio-live-page">
      <div className="page-head"><div><span>MNEMOS · ATELIER CRÉATIF</span><h1>Donnez une nouvelle forme à vos souvenirs.</h1><p>Sélectionnez un souvenir, ajoutez les références nécessaires puis lancez ou relancez sa génération.</p></div><button className="primary-btn" onClick={() => setPage?.("new-memory")}>+ Nouveau souvenir</button></div>
      {error && <div className="inline-alert">{error}</div>}
      {notice && <div className="success-note">{notice}</div>}

      <div className="studio-live-grid">
        <aside className="panel studio-memory-list">
          <h3>Mes souvenirs</h3>
          {memories.map((m) => <button key={m.id} className={String(m.id) === String(selectedId) ? "active" : ""} onClick={() => setSelectedId(m.id)}><span>{typeIcon[m.memory_type] || "✦"}</span><div><strong>{m.title}</strong><small>{typeLabel[m.memory_type] || m.memory_type} · {m.generation_status || "pending"}</small></div></button>)}
        </aside>

        <main className="panel studio-live-main">
          {memory && <>
            <div className="studio-live-head"><div><span>{typeIcon[memory.memory_type]} {typeLabel[memory.memory_type]}</span><h2>{memory.title}</h2><p>{memory.text_content || "Souvenir vocal"}</p></div><button className="primary-btn" disabled={loading} onClick={generate}>{loading ? "Traitement…" : memory.generation_status === "completed" ? "↻ Régénérer" : "✦ Générer avec MNEMOS"}</button></div>

            {memory.memory_type === "video" && <div className="studio-upload-box"><strong>Photos de la vidéo</strong><p>Ajoutez des photos du souvenir avant de générer ou régénérer le storyboard.</p><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setPhotos([...e.target.files].slice(0, 10))}/><small>{photos.length} photo(s) prête(s) à être envoyée(s)</small></div>}
            {memory.memory_type === "bd" && <div className="studio-upload-box"><strong>Personnage de référence</strong><p>Optionnel : ajoutez une photo pour renforcer la cohérence des personnages.</p><div className="character-upload-row"><input value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Nom du personnage"/><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCharacterImage(e.target.files?.[0] || null)}/></div></div>}

            <div className="studio-result-head"><div><span>RÉSULTAT</span><h3>{creation?.memory?.generated_title || "Création MNEMOS"}</h3></div><button onClick={() => refresh()} disabled={loading}>Actualiser</button></div>
            {loading && !creation ? <div className="empty-state"><p>Chargement…</p></div> : <CreationViewer data={creation} type={memory.memory_type}/>} 
          </>}
        </main>
      </div>
    </section>
  );
}

function CreationViewer({ data, type }) {
  if (!data || !Array.isArray(data.creation) || data.creation.length === 0) {
    return <div className="empty-state"><strong>Aucune création disponible.</strong><p>Lancez MNEMOS pour générer le contenu de ce souvenir.</p></div>;
  }

  if (type === "livre") {
    return <Book3DViewer pages={data.creation} title={data.memory?.generated_title || data.memory?.title || "Livre souvenir"}/>;
  }

  if (type === "bd") {
    return <div>{data.characters?.length > 0 && <div className="reference-strip">{data.characters.map((c) => <figure key={c.id}><img src={imageUrl(c.image_url)} alt={c.name}/><figcaption>{c.name}</figcaption></figure>)}</div>}<div className="comic-result">{data.creation.map((p) => <article key={p.id || p.panel_number}><div className="comic-placeholder"><span>CASE {p.panel_number}</span><small>{p.image_prompt || "Illustration à générer"}</small></div>{p.narration && <p className="narration">{p.narration}</p>}{p.dialogue && <blockquote>“{p.dialogue}”</blockquote>}</article>)}</div></div>;
  }

  return <div className="video-result">{data.photos?.length > 0 && <div className="reference-strip">{data.photos.map((p) => <figure key={p.id}><img src={imageUrl(p.image_url)} alt="Référence vidéo"/></figure>)}</div>}<div className="video-timeline">{data.creation.map((s) => <article key={s.id || s.scene_number}><span>{s.scene_number}</span><div><strong>Scène {s.scene_number} · {s.duration_seconds || 5}s</strong><p>{s.narration || "Sans narration"}</p><small>{s.image_prompt}</small></div></article>)}</div><p className="studio-limit-note">Le backend actuel génère le storyboard et la narration. L'assemblage en MP4 reste une étape média supplémentaire.</p></div>;
}
