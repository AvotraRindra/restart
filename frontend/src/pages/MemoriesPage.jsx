import { useEffect, useState } from "react";
import { deleteMemory, getMyMemories, hasApiSession, updateMemoryAccess, audioUrl } from "../services/memoryApi.js";
import friends from "../assets/friends.jpg"; import mountains from "../assets/mountains.jpg"; import workspace from "../assets/workspace.jpg";

const fallback=[
  {id:"d1",title:"Coucher de soleil avec mes amis",emotion:"joyeux",date:"2026-08-12",location:"Mahajanga",text_content:"Une soirée simple que je veux garder longtemps.",image:friends,access:"private"},
  {id:"d2",title:"Un endroit paisible",emotion:"nostalgique",date:"2026-07-03",location:"Fianarantsoa",text_content:"Le calme, les montagnes et le temps qui ralentit.",image:mountains,access:"private"},
  {id:"d3",title:"Mon espace préféré",emotion:"fier",date:"2026-09-01",location:"Fianarantsoa",text_content:"Un petit endroit où beaucoup d'idées sont nées.",image:workspace,access:"public"},
];

export default function MemoriesPage({ refreshKey=0, onCreate }){
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  useEffect(()=>{let live=true;(async()=>{setLoading(true);setError("");try{if(!hasApiSession()){if(live)setItems(fallback);return;}const r=await getMyMemories(); const data=r?.data?.memories ?? r?.data ?? []; if(live)setItems(Array.isArray(data)?data:[]);}catch(e){if(live){setError(e.message);setItems(fallback)}}finally{if(live)setLoading(false)}})();return()=>{live=false}},[refreshKey]);
  const changeAccess=async m=>{const next=m.access==="public"?"private":"public";try{if(hasApiSession())await updateMemoryAccess(m.id,next);setItems(xs=>xs.map(x=>x.id===m.id?{...x,access:next}:x));}catch(e){setError(e.message)}};
  const remove=async m=>{if(!confirm("Supprimer ce souvenir ?"))return;try{if(hasApiSession())await deleteMemory(m.id);setItems(xs=>xs.filter(x=>x.id!==m.id));}catch(e){setError(e.message)}};
  return <section className="page-shell">
    <div className="page-head"><div><span>VOTRE HISTOIRE</span><h1>Mes souvenirs</h1><p>Retrouvez, écoutez et organisez les moments qui comptent.</p></div><button className="primary-btn" onClick={onCreate}>+ Nouveau souvenir</button></div>
    {error&&<div className="inline-alert">{error} — affichage des données de démonstration.</div>}
    {loading?<div className="memories-grid">{Array.from({length:6}).map((_,i)=><article className="memory-card memory-card--skeleton" key={i}><div className="skeleton skeleton-cover"/><div className="memory-card-body"><div className="skeleton skeleton-line small"/><div className="skeleton skeleton-line medium"/><div className="skeleton skeleton-line wide"/><div className="skeleton skeleton-line wide"/></div></article>)}</div>:<div className="memories-grid">{items.map((m,i)=><article className="memory-card" key={m.id||i}>
      <div className="memory-cover">{m.image||m.image_url?<img src={m.image||m.image_url} alt=""/>:<div className="memory-gradient"/>}<span>{m.emotion||"souvenir"}</span></div>
      <div className="memory-card-body"><div className="memory-meta"><small>{m.date||"Date inconnue"}</small><small>{m.location||"Lieu non précisé"}</small></div><h3>{m.title||"Sans titre"}</h3><p>{m.text_content||m.text||"Souvenir vocal"}</p>{m.audio_url&&<audio controls src={audioUrl(m.audio_url)}/>}<div className="card-actions"><button onClick={()=>changeAccess(m)}>{m.access==="public"?"Rendre privé":"Partager"}</button><button className="danger" onClick={()=>remove(m)}>Supprimer</button></div></div>
    </article>)}</div>}
  </section>;
}
