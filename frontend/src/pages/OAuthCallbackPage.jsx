import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/AuthServices.js";
export default function OAuthCallbackPage(){
  const navigate=useNavigate(); const [message,setMessage]=useState("Connexion sécurisée en cours…");
  useEffect(()=>{const p=new URLSearchParams(window.location.hash.replace(/^#/,""));const token=p.get("token");if(!token){setMessage("Jeton OAuth manquant.");return;}localStorage.setItem("token",token);getCurrentUser().then(r=>{localStorage.setItem("user",JSON.stringify(r.data));navigate("/dashboard",{replace:true})}).catch(e=>{localStorage.removeItem("token");setMessage(e.message)})},[navigate]);
  return <div className="verification-page"><div className="panel verification-card"><span className="verify-mark">↻</span><h1>Connexion</h1><p>{message}</p></div></div>;
}
