import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../services/AuthServices.js";
export default function VerifyEmailPage(){
  const [params]=useSearchParams(); const navigate=useNavigate(); const started=useRef(false);
  const [status,setStatus]=useState("Vérification de votre adresse e-mail…"); const [error,setError]=useState("");
  useEffect(()=>{if(started.current)return;started.current=true;const token=params.get("token"); if(!token){setError("Lien de vérification incomplet.");return;} verifyEmail(token).then(r=>{setStatus(r.message);setTimeout(()=>navigate("/login",{replace:true}),1600)}).catch(e=>setError(e.message));},[params,navigate]);
  return <div className="verification-page"><div className="panel verification-card"><span className="verify-mark">{error?"!":"✓"}</span><h1>{error?"Vérification impossible":"Vérification e-mail"}</h1><p>{error||status}</p><button className="primary-btn" onClick={()=>navigate("/login")}>Aller à la connexion</button></div></div>;
}
