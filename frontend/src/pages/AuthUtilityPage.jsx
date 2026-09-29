import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import backgroundImage from "../assets/RegisterBg.png";
import logo from "../assets/Logo.png";
import { forgotPassword, resetPassword } from "../services/AuthServices.js";

export default function AuthUtilityPage({ mode }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = params.get("token") || "";
  const copy = useMemo(() => mode === "forgot" ? {
    title: "Mot de passe oublié", subtitle: "Entrez l'adresse e-mail de votre compte. Nous vous enverrons un lien sécurisé.", button: "Envoyer le lien"
  } : {
    title: "Nouveau mot de passe", subtitle: "Choisissez un nouveau mot de passe d'au moins 8 caractères avec une lettre et un chiffre.", button: "Réinitialiser"
  }, [mode]);

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      if (mode === "forgot") {
        const r = await forgotPassword(email.trim());
        setMessage(r.message);
      } else {
        if (!token) throw new Error("Lien de réinitialisation incomplet.");
        if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas.");
        const r = await resetPassword(token, password);
        setMessage(r.message);
        window.setTimeout(() => navigate("/login", { replace: true }), 1600);
      }
    } catch (e2) { setError(e2.message); }
    finally { setLoading(false); }
  }

  return <main className="auth-page auth-utility-page"><div className="auth-background" style={{backgroundImage:`url(${backgroundImage})`}}/><div className="auth-overlay"/><section className="auth-utility-card"><img src={logo} className="auth-card-logo" alt="RE:START"/><h1>{copy.title}</h1><p>{copy.subtitle}</p>{message && <div className="auth-success">{message}</div>}{error && <div className="auth-error">{error}</div>}<form onSubmit={submit}>{mode === "forgot" ? <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Adresse e-mail" required autoFocus/> : <><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Nouveau mot de passe" required autoFocus/><input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Confirmer le mot de passe" required/></>}<button className="auth-primary-button" disabled={loading}>{loading ? "Traitement…" : copy.button}</button></form><button className="auth-utility-back" onClick={()=>navigate("/login")}>← Retour à la connexion</button></section></main>;
}
