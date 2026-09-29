import { useEffect, useRef, useState } from "react";
import {
  addComicCharacter,
  createTextMemory,
  createVoiceMemory,
  generateMemory,
  uploadMemoryPhotos,
  uploadMemoryAttachments,
} from "../services/memoryApi.js";

const emotions = [
  ["joyeux", "Joie", "☀", "#ffb21c"],
  ["triste", "Tristesse", "☂", "#5890d8"],
  ["colere", "Colère", "⚡", "#e65757"],
  ["peur", "Peur", "◐", "#7c62c7"],
  ["surprise", "Surprise", "!", "#58a8e8"],
  ["nostalgique", "Nostalgie", "⌛", "#d18d60"],
  ["calme", "Sérénité", "≈", "#57bca8"],
  ["autre", "Autre", "✦", "#9c7be8"],
];

const types = [
  ["livre", "Livre souvenir", "▱", "MNEMOS organise votre récit en pages."],
  ["video", "Vidéo", "▶", "Ajoutez vos photos pour créer un storyboard."],
  ["bd", "Bande dessinée", "▤", "Ajoutez un personnage et créez des cases."],
];

export default function NewMemoryWizard({ onCancel, onSaved }) {
  const [step, setStep] = useState(1);
  const [memoryType, setMemoryType] = useState("");
  const [emotion, setEmotion] = useState("");
  const [method, setMethod] = useState("");
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [access, setAccess] = useState("private");
  const [photos, setPhotos] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [characterName, setCharacterName] = useState("");
  const [characterImage, setCharacterImage] = useState(null);
  const [generateNow, setGenerateNow] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [progressText, setProgressText] = useState("");
  const timer = useRef(null);
  const recorder = useRef(null);
  const stream = useRef(null);
  const chunks = useRef([]);

  useEffect(() => () => {
    clearInterval(timer.current);
    stream.current?.getTracks?.().forEach((t) => t.stop());
  }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  async function toggleRecord() {
    if (recording) {
      recorder.current?.stop();
      clearInterval(timer.current);
      setRecording(false);
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      chunks.current = [];
      const r = new MediaRecorder(media);
      recorder.current = r;
      r.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      r.onstop = () => {
        setAudioBlob(new Blob(chunks.current, { type: r.mimeType || "audio/webm" }));
        media.getTracks().forEach((t) => t.stop());
      };
      r.start();
      setSeconds(0);
      setRecording(true);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Impossible d'accéder au microphone. Vérifiez l'autorisation du navigateur.");
    }
  }

  async function save() {
    if (!memoryType || !emotion || !title.trim() || !date) return;
    setSaving(true);
    setError("");
    setProgressText("Sauvegarde du souvenir…");

    const payload = {
      memoryType,
      emotion,
      title: title.trim(),
      date,
      time: time ? `${time}:00` : undefined,
      location: location.trim(),
      access,
    };

    let created;
    try {
      const response = method === "voice"
        ? await createVoiceMemory({ ...payload, audioBlob })
        : await createTextMemory({ ...payload, text: text.trim() });
      created = response?.data;
      if (!created?.id) throw new Error("Le backend n'a pas retourné l'identifiant du souvenir.");

      if (memoryType === "video" && photos.length) {
        setProgressText("Envoi des photos…");
        await uploadMemoryPhotos(created.id, photos);
      }

      if (memoryType === "bd" && characterImage && characterName.trim()) {
        setProgressText("Ajout du personnage…");
        await addComicCharacter(created.id, characterName.trim(), characterImage);
      }

      if (attachments.length) {
        setProgressText("Envoi des pièces jointes…");
        await uploadMemoryAttachments(created.id, attachments);
      }

      if (generateNow) {
        setProgressText("MNEMOS prépare votre création…");
        try {
          await generateMemory(created.id);
          created = { ...created, generation_status: "completed" };
        } catch (generationError) {
          created = {
            ...created,
            generation_status: "failed",
            _generationWarning: generationError.details || generationError.message || "La génération MNEMOS pourra être relancée depuis l'atelier créatif.",
          };
        }
      }

      onSaved?.(created);
    } catch (e) {
      const msg = {
        400: "Certaines informations sont invalides.",
        401: "Votre session a expiré. Reconnectez-vous.",
        413: "Un fichier est trop volumineux.",
        502: "Le service IA est temporairement indisponible.",
      }[e.status];
      setError(msg || e.message || "Impossible de sauvegarder le souvenir.");
    } finally {
      setSaving(false);
      setProgressText("");
    }
  }

  return (
    <div className="wizard-page">
      <div className="wizard-top">
        <button onClick={onCancel}>← Retour</button>
        <div className="wizard-progress">{[1, 2, 3].map((n) => <span key={n} className={step >= n ? "active" : ""}>{n}</span>)}<i className={`p${step}`}/></div>
        <small>Étape {step} sur 3</small>
      </div>

      <div className="wizard-card">
        {error && <div className="wizard-error">{error}</div>}

        {step === 1 && (
          <div className="wizard-step">
            <div className="step-kicker">01 · FORME & ÉMOTION</div>
            <h1>Quelle forme voulez-vous<br/>donner à ce souvenir ?</h1>
            <p>Choisissez le résultat créatif puis l'émotion principale du moment.</p>

            <div className="memory-type-grid">
              {types.map(([value, name, icon, desc]) => (
                <button key={value} type="button" className={memoryType === value ? "selected" : ""} onClick={() => setMemoryType(value)}>
                  <span>{icon}</span><div><strong>{name}</strong><small>{desc}</small></div><b>{memoryType === value ? "✓" : ""}</b>
                </button>
              ))}
            </div>

            <h3 className="wizard-subtitle">Que ressentez-vous dans ce souvenir ?</h3>
            <div className="emotion-grid">
              {emotions.map(([value, name, icon, color]) => (
                <button type="button" key={value} className={emotion === value ? "selected" : ""} style={{ "--emotion": color }} onClick={() => setEmotion(value)}>
                  <span>{icon}</span><strong>{name}</strong><i>{emotion === value ? "✓" : ""}</i>
                </button>
              ))}
            </div>
            <div className="wizard-actions"><span>{memoryType && emotion ? "Prêt à raconter" : "Choisissez un type et une émotion"}</span><button disabled={!memoryType || !emotion} onClick={() => setStep(2)}>Continuer →</button></div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <div className="step-kicker">02 · LE RÉCIT</div>
            <h1>Comment voulez-vous<br/>raconter ce souvenir ?</h1>
            <p>Écrivez librement ou laissez votre voix raconter le moment. La voix sera transcrite par le backend.</p>
            <div className="method-grid">
              <button className={method === "text" ? "selected" : ""} onClick={() => setMethod("text")}><span>✎</span><h3>Écrire manuellement</h3><p>Racontez votre souvenir avec vos propres mots.</p><b>Choisir →</b></button>
              <button className={method === "voice" ? "selected" : ""} onClick={() => setMethod("voice")}><span>◉</span><h3>Enregistrer ma voix</h3><p>L'audio original est conservé après transcription.</p><b>Choisir →</b></button>
            </div>
            {method === "text" && <textarea autoFocus placeholder="Il faisait beau ce jour-là…" value={text} onChange={(e) => setText(e.target.value)}/>} 
            {method === "voice" && <div className={`voice-recorder ${recording ? "recording" : ""}`}><button type="button" onClick={toggleRecord}>{recording ? "■" : "●"}</button><div><strong>{recording ? "Enregistrement en cours…" : audioBlob ? "Vocal prêt" : "Prêt à enregistrer"}</strong><small>{fmt(seconds)}</small></div><div className="voice-wave">{Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ "--i": i }}/>)}</div></div>}
            <div className="wizard-actions"><button className="ghost" onClick={() => setStep(1)}>← Retour</button><button disabled={!method || (method === "text" && !text.trim()) || (method === "voice" && !audioBlob)} onClick={() => setStep(3)}>Continuer →</button></div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <div className="step-kicker">03 · LES DÉTAILS</div>
            <h1>Complétez les repères<br/>de ce souvenir.</h1>
            <p>Ces informations aident à retrouver le moment et permettent à MNEMOS de mieux le raconter.</p>
            <div className="details-form">
              <label><span>Titre *</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Notre première WebCup"/></label>
              <label><span>Date *</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)}/></label>
              <label><span>Heure</span><input type="time" value={time} onChange={(e) => setTime(e.target.value)}/></label>
              <label><span>Visibilité</span><select value={access} onChange={(e) => setAccess(e.target.value)}><option value="private">Privé</option><option value="public">Public</option></select></label>
              <label className="full"><span>Lieu</span><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex. Fianarantsoa"/></label>
            </div>

            {memoryType === "video" && (
              <div className="media-extra-box"><strong>Photos pour la vidéo</strong><p>Jusqu'à 10 photos. MNEMOS les utilisera comme références pour le storyboard.</p><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setPhotos([...e.target.files].slice(0, 10))}/><small>{photos.length} photo(s) sélectionnée(s)</small></div>
            )}

            {memoryType === "bd" && (
              <div className="media-extra-box"><strong>Personnage de référence (optionnel)</strong><p>Ajoutez un nom et une photo pour guider la création de la BD.</p><div className="character-upload-row"><input value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Nom du personnage"/><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCharacterImage(e.target.files?.[0] || null)}/></div></div>
            )}


            <div className="media-extra-box attachment-picker"><strong>Pièces jointes du souvenir</strong><p>Ajoutez jusqu'à 8 fichiers : photos, vidéos, audios, PDF ou documents. Ils seront conservés avec le souvenir.</p><input type="file" multiple accept="image/*,video/mp4,video/webm,audio/*,.pdf,.txt,.md,.doc,.docx,.xls,.xlsx" onChange={(e) => setAttachments([...e.target.files].slice(0, 8))}/><small>{attachments.length} pièce(s) jointe(s) sélectionnée(s)</small></div>

            <label className="generate-toggle"><input type="checkbox" checked={generateNow} onChange={(e) => setGenerateNow(e.target.checked)}/><span>Générer automatiquement avec MNEMOS après la sauvegarde</span></label>

            <div className="memory-summary">
              <div><span>Type</span><strong>{types.find((x) => x[0] === memoryType)?.[1]}</strong></div>
              <div><span>Émotion</span><strong>{emotions.find((x) => x[0] === emotion)?.[1]}</strong></div>
              <div><span>Récit</span><strong>{method === "voice" ? `Vocal · ${fmt(seconds)}` : "Texte écrit"}</strong></div>
              <div><span>Accès</span><strong>{access === "public" ? "Public" : "Privé"}</strong></div>
            </div>
            {progressText && <div className="progress-note">{progressText}</div>}
            <div className="wizard-actions"><button className="ghost" onClick={() => setStep(2)}>← Retour</button><button className="save-memory" disabled={!title.trim() || !date || saving || (memoryType === "bd" && characterImage && !characterName.trim())} onClick={save}>{saving ? "Traitement…" : generateNow ? "✓ Sauvegarder & générer" : "✓ Sauvegarder le souvenir"}</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
