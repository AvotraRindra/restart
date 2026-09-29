import { useEffect, useRef, useState } from "react";
import { createTextMemory, createVoiceMemory, hasApiSession } from "../services/memoryApi.js";

const emotions = [
  ["joyeux","Joie","☀","#ffb21c"], ["amour","Amour","♥","#ff3859"], ["triste","Tristesse","☂","#5890d8"],
  ["peur","Peur","◐","#7c62c7"], ["nostalgique","Nostalgie","⌛","#d18d60"], ["fier","Fierté","★","#ff7a32"],
  ["serenite","Sérénité","☁","#57bca8"], ["excitation","Excitation","⚡","#f35f94"], ["gratitude","Gratitude","✦","#9c7be8"],
  ["surprise","Surprise","!","#58a8e8"], ["espoir","Espoir","↗","#4fbf7f"], ["tendresse","Tendresse","♡","#ef8aa0"],
];

export default function NewMemoryWizard({ onCancel, onSaved }) {
  const [step,setStep]=useState(1);
  const [emotion,setEmotion]=useState("");
  const [method,setMethod]=useState("");
  const [text,setText]=useState("");
  const [recording,setRecording]=useState(false);
  const [seconds,setSeconds]=useState(0);
  const [audioBlob,setAudioBlob]=useState(null);
  const [date,setDate]=useState("");
  const [time,setTime]=useState("");
  const [location,setLocation]=useState("");
  const [title,setTitle]=useState("");
  const [access,setAccess]=useState("private");
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const timer=useRef(null); const recorder=useRef(null); const stream=useRef(null); const chunks=useRef([]);

  useEffect(()=>()=>{clearInterval(timer.current); stream.current?.getTracks?.().forEach(t=>t.stop())},[]);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  async function toggleRecord(){
    if(recording){ recorder.current?.stop(); clearInterval(timer.current); setRecording(false); return; }
    try{
      const media=await navigator.mediaDevices.getUserMedia({audio:true});
      stream.current=media; chunks.current=[];
      const r=new MediaRecorder(media); recorder.current=r;
      r.ondataavailable=e=>{if(e.data.size)chunks.current.push(e.data)};
      r.onstop=()=>{setAudioBlob(new Blob(chunks.current,{type:r.mimeType||"audio/webm"})); media.getTracks().forEach(t=>t.stop())};
      r.start(); setSeconds(0); setRecording(true); timer.current=setInterval(()=>setSeconds(s=>s+1),1000);
    }catch{ setError("Impossible d'accéder au microphone. Vérifiez l'autorisation du navigateur."); }
  }

  async function save(){
    setSaving(true); setError("");
    const payload={emotion,title:title.trim(),date,time:time?`${time}:00`:undefined,location:location.trim(),access};
    try{
      let created;
      if(hasApiSession()){
        if(method==="voice") created=await createVoiceMemory({...payload,audioBlob});
        else created=await createTextMemory({...payload,text:text.trim()});
        created=created?.data?.memory ?? created?.data ?? created;
      }else{
        created={id:Date.now(),...payload,text_content:method==="text"?text.trim():`Souvenir vocal · ${fmt(seconds)}`,createdAt:new Date().toISOString(),demo:true};
        const old=JSON.parse(localStorage.getItem("memories-demo-items")||"[]"); localStorage.setItem("memories-demo-items",JSON.stringify([created,...old]));
      }
      onSaved?.(created);
    }catch(e){
      const msg={400:"Certaines informations sont invalides.",401:"Votre session a expiré.",413:"Le fichier audio est trop volumineux.",502:"La transcription audio est temporairement indisponible."}[e.status];
      setError(msg||e.message||"Impossible de sauvegarder le souvenir.");
    }finally{setSaving(false)}
  }

  return <div className="wizard-page">
    <div className="wizard-top"><button onClick={onCancel}>← Retour</button><div className="wizard-progress">{[1,2,3].map(n=><span key={n} className={step>=n?"active":""}>{n}</span>)}<i className={`p${step}`}/></div><small>Étape {step} sur 3</small></div>
    <div className="wizard-card">
      {error&&<div className="wizard-error">{error}</div>}
      {step===1&&<div className="wizard-step"><div className="step-kicker">01 · L'ÉMOTION</div><h1>Que ressentez-vous<br/>dans ce souvenir ?</h1><p>Choisissez l’émotion qui représente le mieux ce moment.</p><div className="emotion-grid">{emotions.map(([value,name,icon,color])=><button type="button" key={value} className={emotion===value?"selected":""} style={{"--emotion":color}} onClick={()=>setEmotion(value)}><span>{icon}</span><strong>{name}</strong><i>{emotion===value?"✓":""}</i></button>)}</div><div className="wizard-actions"><span>{emotion?"Émotion sélectionnée":"Choisissez une émotion"}</span><button disabled={!emotion} onClick={()=>setStep(2)}>Continuer →</button></div></div>}
      {step===2&&<div className="wizard-step"><div className="step-kicker">02 · LE RÉCIT</div><h1>Comment voulez-vous<br/>raconter ce souvenir ?</h1><p>Écrivez librement ou laissez votre voix raconter le moment.</p><div className="method-grid"><button className={method==="text"?"selected":""} onClick={()=>setMethod("text")}><span>✎</span><h3>Écrire manuellement</h3><p>Racontez votre souvenir avec vos propres mots.</p><b>Choisir →</b></button><button className={method==="voice"?"selected":""} onClick={()=>setMethod("voice")}><span>◉</span><h3>Enregistrer ma voix</h3><p>Le backend conservera le vocal et réalisera sa transcription.</p><b>Choisir →</b></button></div>{method==="text"&&<textarea autoFocus placeholder="Il faisait beau ce jour-là…" value={text} onChange={e=>setText(e.target.value)}/>} {method==="voice"&&<div className={`voice-recorder ${recording?"recording":""}`}><button onClick={toggleRecord}>{recording?"■":"●"}</button><div><strong>{recording?"Enregistrement en cours…":audioBlob?"Vocal prêt":"Prêt à enregistrer"}</strong><small>{fmt(seconds)}</small></div><div className="voice-wave">{Array.from({length:18}).map((_,i)=><i key={i} style={{"--i":i}}/>)}</div></div>}<div className="wizard-actions"><button className="ghost" onClick={()=>setStep(1)}>← Retour</button><button disabled={!method || (method==="text"&&!text.trim()) || (method==="voice"&&!audioBlob)} onClick={()=>setStep(3)}>Continuer →</button></div></div>}
      {step===3&&<div className="wizard-step"><div className="step-kicker">03 · LES DÉTAILS</div><h1>Où et quand<br/>ce souvenir a-t-il eu lieu ?</h1><p>Ajoutez les derniers repères avant la sauvegarde.</p><div className="details-form"><label><span>Titre</span><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. Notre victoire"/></label><label><span>Date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label><span>Heure</span><input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label><label><span>Visibilité</span><select value={access} onChange={e=>setAccess(e.target.value)}><option value="private">Privé</option><option value="public">Public</option></select></label><label className="full"><span>Lieu</span><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Ex. Antananarivo"/></label></div><div className="memory-summary"><div><span>Émotion</span><strong>{emotions.find(x=>x[0]===emotion)?.[1]}</strong></div><div><span>Récit</span><strong>{method==="voice"?`Vocal · ${fmt(seconds)}`:"Texte écrit"}</strong></div></div><div className="wizard-actions"><button className="ghost" onClick={()=>setStep(2)}>← Retour</button><button className="save-memory" disabled={!date||!location.trim()||saving} onClick={save}>{saving?"Sauvegarde…":"✓ Sauvegarder le souvenir"}</button></div></div>}
    </div>
  </div>;
}
