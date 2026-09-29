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
    eyebrow: "Récupération",
    heroTitle: "Retrouvez l’accès à vos",
    heroStrong: "souvenirs",
    heroText: "Un lien sécurisé vous permettra de choisir un nouveau mot de passe.",
    title: "Mot de passe oublié",
    subtitle: "Entrez l’adresse e-mail associée à votre compte.",
    button: "Envoyer le lien",
  } : {
    eyebrow: "Sécurité",
    heroTitle: "Protégez à nouveau vos",
    heroStrong: "souvenirs",
    heroText: "Choisissez un nouveau mot de passe sécurisé pour votre compte.",
    title: "Nouveau mot de passe",
    subtitle: "Utilisez au moins 8 caractères avec une lettre et un chiffre.",
    button: "Réinitialiser",
  }, [mode]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

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
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page auth-utility-page">
      <div className="auth-background" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="auth-overlay" />

      <section className="auth-left">
        <img src={logo} alt="Logo" className="auth-main-logo" />
        <div className="auth-hero">
          <div className="auth-eyebrow">
            <span className="auth-eyebrow-line" />
            <span>{copy.eyebrow}</span>
          </div>
          <h1>
            {copy.heroTitle}
            <strong>{copy.heroStrong}</strong>
          </h1>
          <p>{copy.heroText}</p>
        </div>
      </section>

      <section className="auth-right auth-utility-right">
        <div className="auth-top-link">
          <span>Vous vous souvenez de votre mot de passe ?</span>
          <button type="button" onClick={() => navigate("/login")}>
            Se connecter <span>→</span>
          </button>
        </div>

        <div className="auth-card-scene auth-utility-scene">
          <div className="auth-card-inner auth-utility-inner">
            <section className="auth-card-face auth-login-face auth-utility-face">
              <img src={logo} className="auth-card-logo" alt="RE:START" />
              <h2>{copy.title}</h2>
              <p className="auth-subtitle">{copy.subtitle}</p>

              {message && <div className="auth-success">{message}</div>}
              {error && <div className="auth-error">{error}</div>}

              <form className="auth-login-form auth-utility-form" onSubmit={submit}>
                {mode === "forgot" ? (
                  <label className="auth-field">
                    <span className="auth-utility-field-symbol">@</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Adresse e-mail"
                      required
                      autoFocus
                      autoComplete="email"
                    />
                  </label>
                ) : (
                  <>
                    <label className="auth-field">
                      <span className="auth-utility-field-symbol">●</span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        required
                        autoFocus
                        autoComplete="new-password"
                      />
                    </label>
                    <label className="auth-field">
                      <span className="auth-utility-field-symbol">✓</span>
                      <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Confirmer le mot de passe"
                        required
                        autoComplete="new-password"
                      />
                    </label>
                  </>
                )}

                <button className="auth-primary-button" disabled={loading}>
                  {loading ? "Traitement…" : copy.button}
                </button>
              </form>

              <button className="auth-utility-back" type="button" onClick={() => navigate("/login")}>
                ← Retour à la connexion
              </button>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
