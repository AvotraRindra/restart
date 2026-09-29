import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "../styles/Auth.css";

import backgroundImage from "../assets/RegisterBg.png";
import logo from "../assets/Logo.png";

import {
  loginUser,
  registerUser,
  oauthUrl,
  resendVerification,
} from "../services/AuthServices.js";


export default function Auth({
  initialMode = "login",
}) {
  const navigate = useNavigate();

  /* =========================================
     LOGIN / REGISTER
  ========================================= */

  const [mode, setMode] =
    useState(initialMode);

  const [isAnimating, setIsAnimating] =
    useState(false);


  /* =========================================
     CHARGEMENT / ERREUR
  ========================================= */

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] = useState("");


  /* =========================================
     PASSWORD VISIBILITY
  ========================================= */

  const [
    showLoginPassword,
    setShowLoginPassword,
  ] = useState(false);

  const [
    showRegisterPassword,
    setShowRegisterPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  /* =========================================
     GENDER MENU
  ========================================= */

  const [genderOpen, setGenderOpen] =
    useState(false);

  const genderRef = useRef(null);


  /* =========================================
     LOGIN DATA
  ========================================= */

  const [loginData, setLoginData] =
    useState({
      email: "",
      password: "",
    });


  /* =========================================
     REGISTER DATA
  ========================================= */

  const [registerData, setRegisterData] =
    useState({
      fullName: "",
      email: "",
      gender: "",
      birthDate: "",
      password: "",
      confirmPassword: "",
    });


  const isRegister =
    mode === "register";


  /* =========================================
     SYNCHRONISER LE MODE AVEC LA ROUTE
  ========================================= */

  useEffect(() => {
    setMode(initialMode);
    setError("");
    const pendingSuccess = sessionStorage.getItem("auth-success") || "";
    if (pendingSuccess) sessionStorage.removeItem("auth-success");
    setSuccess(pendingSuccess);
    setGenderOpen(false);
  }, [initialMode]);


  /* =========================================
     FERMER LE MENU SEXE SI CLIC EXTÉRIEUR
  ========================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        genderRef.current &&
        !genderRef.current.contains(
          event.target
        )
      ) {
        setGenderOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  /* =========================================
     CHANGEMENT LOGIN / REGISTER
  ========================================= */

  const switchMode = (nextMode) => {
    if (
      nextMode === mode ||
      isAnimating
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setGenderOpen(false);
    setIsAnimating(true);

    /*
      On déclenche d'abord la rotation.
    */

    setMode(nextMode);

    /*
      Puis on modifie l'URL à la fin
      de l'animation.
    */

    setTimeout(() => {
      navigate(
        nextMode === "register"
          ? "/register"
          : "/login"
      );

      setIsAnimating(false);
    }, 800);
  };


  /* =========================================
     LOGIN CHANGE
  ========================================= */

  const handleLoginChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setError("");
    setSuccess("");

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* =========================================
     REGISTER CHANGE
  ========================================= */

  const handleRegisterChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setError("");
    setSuccess("");

    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* =========================================
     CHOIX DU SEXE
  ========================================= */

  const handleGenderSelect = (
    value
  ) => {
    setRegisterData((prev) => ({
      ...prev,
      gender: value,
    }));

    setError("");
    setSuccess("");
    setGenderOpen(false);
  };


  /* =========================================
     SAUVEGARDER AUTH
  ========================================= */

  const saveAuthentication = (
    response
  ) => {
    const token =
      response?.data?.token;

    const user =
      response?.data?.user;

    if (token) {
      localStorage.setItem(
        "token",
        token
      );
    }

    if (user) {
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );
    }
  };


  /* =========================================
     LOGIN
  ========================================= */

  const handleLoginSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      /*
        Le backend attend :

        {
          email,
          password
        }
      */

      const credentials = {
        email:
          loginData.email.trim(),

        password:
          loginData.password,
      };

      const response =
        await loginUser(credentials);


      /*
        Réponse attendue :

        {
          success: true,
          data: {
            user: {...},
            token: "JWT..."
          }
        }
      */

      saveAuthentication(response);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(
        "Erreur login :",
        err
      );

      setError(
        err.message ||
          "Impossible de se connecter."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================
     REGISTER
  ========================================= */

  const handleRegisterSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    /* Vérification mots de passe */

    if (
      registerData.password !==
      registerData.confirmPassword
    ) {
      setError(
        "Les mots de passe ne correspondent pas."
      );

      return;
    }


    /* Vérification sexe */

    if (!registerData.gender) {
      setError(
        "Veuillez sélectionner votre sexe."
      );

      return;
    }


    /* Vérification date */

    if (!registerData.birthDate) {
      setError(
        "Veuillez renseigner votre date de naissance."
      );

      return;
    }


    setLoading(true);

    try {
      /*
        Le formulaire React utilise :

        fullName
        email
        gender
        birthDate
        password

        Mais l'API attend :

        nom
        email
        password
        sexe
        dateNaissance
      */

      const userToSend = {
        nom:
          registerData.fullName.trim(),

        email:
          registerData.email.trim(),

        password:
          registerData.password,

        sexe:
          registerData.gender,

        dateNaissance:
          registerData.birthDate,
      };



      const response =
        await registerUser(
          userToSend
        );



      /*
        Réponse attendue :

        {
          success: true,
          data: {
            user: {
              id,
              nom,
              email
            },
            token: "JWT..."
          }
        }
      */

      if (response?.data?.token) {
        saveAuthentication(response);
        navigate("/dashboard", { replace: true });
      } else {
        const message = response?.message || "Compte créé. Consultez votre e-mail pour le vérifier.";
        sessionStorage.setItem("auth-success", message);
        setLoginData((prev) => ({ ...prev, email: registerData.email.trim() }));
        navigate("/login", { replace: true });
      }

    } catch (err) {
      console.error(
        "Erreur register :",
        err
      );

      setError(
        err.message ||
          "Impossible de créer le compte."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="auth-page">

      {/* ==================================
          BACKGROUND
      =================================== */}

      <div
        className="auth-background"
        style={{
          backgroundImage:
            `url(${backgroundImage})`,
        }}
      />

      <div className="auth-overlay" />


      {/* ==================================
          LEFT
      =================================== */}

      <section className="auth-left">

        <img
          src={logo}
          alt="Logo"
          className="auth-main-logo"
        />


        <div className="auth-hero">

          <div className="auth-eyebrow">

            <span className="auth-eyebrow-line" />

            <span>
              Bon retour
            </span>

          </div>


          <h1>
            Retrouvez vos

            <strong>
              souvenirs
            </strong>
          </h1>


          <p>
            Replongez dans les moments

            <br />

            qui comptent pour vous.
          </p>

        </div>

      </section>


      {/* ==================================
          RIGHT
      =================================== */}

      <section className="auth-right">

        {/* TOP LINK */}

        <div className="auth-top-link">

          {isRegister ? (
            <>
              <span>
                Vous avez déjà un compte ?
              </span>

              <button
                type="button"
                disabled={isAnimating}
                onClick={() =>
                  switchMode("login")
                }
              >
                Se connecter

                <span>
                  →
                </span>
              </button>
            </>
          ) : (
            <>
              <span>
                Pas encore de compte ?
              </span>

              <button
                type="button"
                disabled={isAnimating}
                onClick={() =>
                  switchMode(
                    "register"
                  )
                }
              >
                S'inscrire

                <span>
                  →
                </span>
              </button>
            </>
          )}

        </div>


        {/* ==================================
            3D CARD
        =================================== */}

        <div className="auth-card-scene">

          <div
            className={`
              auth-card-inner
              ${
                isRegister
                  ? "auth-card-flipped"
                  : ""
              }
            `}
          >

            {/* =================================
                LOGIN FACE
            ================================== */}

            <div
              className="
                auth-card-face
                auth-login-face
              "
            >

              <img
                src={logo}
                alt="Logo"
                className="auth-card-logo"
              />


              <h2>
                Bon{" "}

                <span>
                  retour
                </span>
              </h2>


              <p className="auth-subtitle">
                Connectez-vous pour retrouver

                <br />

                vos souvenirs.
              </p>


              {/* ERROR */}

              {error && !isRegister && (
                <div className="auth-error">
                  {error}
                  {loginData.email && /vérifi/i.test(error) && <button type="button" className="auth-resend-link" onClick={async () => { try { const r = await resendVerification(loginData.email); setSuccess(r.message); setError(""); } catch (e) { setError(e.message); } }}>Renvoyer l'e-mail</button>}
                </div>
              )}
              {success && !isRegister && <div className="auth-success">{success}</div>}


              <form
                className="auth-login-form"
                onSubmit={
                  handleLoginSubmit
                }
              >

                {/* EMAIL */}

                <div className="auth-field">

                  <MailIcon />

                  <input
                    type="email"
                    name="email"
                    placeholder="Adresse e-mail"
                    value={
                      loginData.email
                    }
                    onChange={
                      handleLoginChange
                    }
                    autoComplete="email"
                    required
                  />

                </div>


                {/* PASSWORD */}

                <div className="auth-field">

                  <LockIcon />

                  <input
                    type={
                      showLoginPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Mot de passe"
                    value={
                      loginData.password
                    }
                    onChange={
                      handleLoginChange
                    }
                    autoComplete="current-password"
                    required
                  />


                  <button
                    type="button"
                    className="auth-eye-button"
                    aria-label={
                      showLoginPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    onClick={() =>
                      setShowLoginPassword(
                        (prev) => !prev
                      )
                    }
                  >

                    <EyeIcon />

                  </button>

                </div>


                {/* OPTIONS */}

                <div className="auth-login-options">

                  <label>
                    <input
                      type="checkbox"
                    />

                    <span>
                      Se souvenir de moi
                    </span>
                  </label>


                  <button
                    type="button"
                    className="auth-forgot-password"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Mot de passe oublié ?
                  </button>

                </div>


                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  className="auth-primary-button"
                  disabled={loading}
                >

                  <span>
                    {loading
                      ? "Connexion..."
                      : "Se connecter"}
                  </span>


                  {!loading && (
                    <span className="auth-button-arrow">
                      →
                    </span>
                  )}

                </button>

              </form>


              <Divider />


              <SocialButtons />


              <div className="auth-bottom-link">

                <span>
                  Pas encore de compte ?
                </span>


                <button
                  type="button"
                  disabled={isAnimating}
                  onClick={() =>
                    switchMode(
                      "register"
                    )
                  }
                >
                  S'inscrire
                </button>


                <span className="auth-bottom-arrow">
                  →
                </span>

              </div>

            </div>


            {/* =================================
                REGISTER FACE
            ================================== */}

            <div
              className="
                auth-card-face
                auth-register-face
              "
            >

              <img
                src={logo}
                alt="Logo"
                className="
                  auth-card-logo
                  auth-register-logo
                "
              />


              <h2>
                Ins

                <span>
                  cription
                </span>
              </h2>


              <p
                className="
                  auth-subtitle
                  auth-register-subtitle
                "
              >
                Créez votre espace pour commencer

                <br />

                votre voyage dans vos souvenirs.
              </p>


              {/* ERROR */}

              {error && isRegister && (
                <div className="auth-error">{error}</div>
              )}
              {success && isRegister && <div className="auth-success">{success}</div>}


              <form
                className="auth-register-form"
                onSubmit={
                  handleRegisterSubmit
                }
              >

                {/* NOM */}

                <div className="auth-field">

                  <UserIcon />

                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nom complet"
                    value={
                      registerData.fullName
                    }
                    onChange={
                      handleRegisterChange
                    }
                    autoComplete="name"
                    required
                  />

                </div>


                {/* EMAIL */}

                <div className="auth-field">

                  <MailIcon />

                  <input
                    type="email"
                    name="email"
                    placeholder="Adresse e-mail"
                    value={
                      registerData.email
                    }
                    onChange={
                      handleRegisterChange
                    }
                    autoComplete="email"
                    required
                  />

                </div>


                {/* =================================
                    SEXE + DATE
                ================================== */}

                <div className="auth-register-row">

                  {/* SEXE */}

                  <div
                    className="auth-gender-wrapper"
                    ref={genderRef}
                  >

                    <button
                      type="button"
                      className={`
                        auth-gender-trigger
                        ${
                          genderOpen
                            ? "auth-gender-trigger-open"
                            : ""
                        }
                      `}
                      onClick={() =>
                        setGenderOpen(
                          (prev) => !prev
                        )
                      }
                    >

                      <UserIcon />


                      <span
                        className={
                          registerData.gender
                            ? "auth-gender-value"
                            : "auth-gender-placeholder"
                        }
                      >
                        {
                          registerData.gender
                            ? registerData.gender ===
                              "homme"
                              ? "Homme"
                              : "Femme"
                            : "Sexe"
                        }
                      </span>


                      <ChevronIcon />

                    </button>


                    {/* MENU SEXE */}

                    {genderOpen && (
                      <div className="auth-gender-menu">

                        {/* HOMME */}

                        <button
                          type="button"
                          className={`
                            auth-gender-option
                            ${
                              registerData.gender ===
                              "homme"
                                ? "auth-gender-option-selected"
                                : ""
                            }
                          `}
                          onClick={() =>
                            handleGenderSelect(
                              "homme"
                            )
                          }
                        >

                          <span className="auth-gender-option-left">

                            <UserIcon />

                            <span>
                              Homme
                            </span>

                          </span>


                          {registerData.gender ===
                            "homme" && (
                            <CheckIcon />
                          )}

                        </button>


                        {/* FEMME */}

                        <button
                          type="button"
                          className={`
                            auth-gender-option
                            ${
                              registerData.gender ===
                              "femme"
                                ? "auth-gender-option-selected"
                                : ""
                            }
                          `}
                          onClick={() =>
                            handleGenderSelect(
                              "femme"
                            )
                          }
                        >

                          <span className="auth-gender-option-left">

                            <UserIcon />

                            <span>
                              Femme
                            </span>

                          </span>


                          {registerData.gender ===
                            "femme" && (
                            <CheckIcon />
                          )}

                        </button>

                      </div>
                    )}

                  </div>


                  {/* DATE */}

                  <div
                    className="
                      auth-field
                      auth-date-field
                    "
                  >

                    <CalendarIcon />


                    <input
                      type="date"
                      name="birthDate"
                      value={
                        registerData.birthDate
                      }
                      onChange={
                        handleRegisterChange
                      }
                      required
                    />

                  </div>

                </div>


                {/* PASSWORD */}

                <div className="auth-field">

                  <LockIcon />


                  <input
                    type={
                      showRegisterPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Mot de passe"
                    value={
                      registerData.password
                    }
                    onChange={
                      handleRegisterChange
                    }
                    autoComplete="new-password"
                    required
                  />


                  <button
                    type="button"
                    className="auth-eye-button"
                    aria-label={
                      showRegisterPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    onClick={() =>
                      setShowRegisterPassword(
                        (prev) => !prev
                      )
                    }
                  >

                    <EyeIcon />

                  </button>

                </div>


                {/* CONFIRM PASSWORD */}

                <div className="auth-field">

                  <LockIcon />


                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Confirmer le mot de passe"
                    value={
                      registerData.confirmPassword
                    }
                    onChange={
                      handleRegisterChange
                    }
                    autoComplete="new-password"
                    required
                  />


                  <button
                    type="button"
                    className="auth-eye-button"
                    aria-label={
                      showConfirmPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                  >

                    <EyeIcon />

                  </button>

                </div>


                {/* REGISTER BUTTON */}

                <button
                  type="submit"
                  className="
                    auth-primary-button
                    auth-register-button
                  "
                  disabled={loading}
                >

                  <span>
                    {loading
                      ? "Création..."
                      : "Créer un compte"}
                  </span>


                  {!loading && (
                    <span className="auth-button-arrow">
                      →
                    </span>
                  )}

                </button>

              </form>


              <Divider compact />


              <SocialButtons compact />


              <div
                className="
                  auth-bottom-link
                  auth-register-bottom
                "
              >

                <span>
                  Vous avez déjà un compte ?
                </span>


                <button
                  type="button"
                  disabled={isAnimating}
                  onClick={() =>
                    switchMode(
                      "login"
                    )
                  }
                >
                  Se connecter
                </button>


                <span className="auth-bottom-arrow">
                  →
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


/* =========================================
   DIVIDER
========================================= */

function Divider({
  compact = false,
}) {
  return (
    <div
      className={`
        auth-divider
        ${
          compact
            ? "auth-divider-compact"
            : ""
        }
      `}
    >
      <span />

      <small>
        ou
      </small>

      <span />
    </div>
  );
}


/* =========================================
   SOCIAL BUTTONS
========================================= */

function SocialButtons({ compact = false }) {
  const connect = (provider) => window.location.assign(oauthUrl(provider));
  return (
    <div className={`auth-socials ${compact ? "auth-socials-compact" : ""}`}>
      <button type="button" aria-label="Continuer avec Google" onClick={() => connect("google")}>
        <GoogleIcon />
      </button>
      <button type="button" aria-label="Continuer avec GitHub" onClick={() => connect("github")}>
        <GithubIcon />
      </button>
    </div>
  );
}


/* =========================================
   USER ICON
========================================= */

function UserIcon() {
  return (
    <svg
      className="auth-field-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}


/* =========================================
   MAIL ICON
========================================= */

function MailIcon() {
  return (
    <svg
      className="auth-field-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}


/* =========================================
   LOCK ICON
========================================= */

function LockIcon() {
  return (
    <svg
      className="auth-field-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}


/* =========================================
   CALENDAR ICON
========================================= */

function CalendarIcon() {
  return (
    <svg
      className="auth-field-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}


/* =========================================
   EYE ICON
========================================= */

function EyeIcon() {
  return (
    <svg
      className="auth-eye-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />

      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
    </svg>
  );
}


/* =========================================
   CHEVRON
========================================= */

function ChevronIcon() {
  return (
    <svg
      className="auth-chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 9 5 5 5-5" />
    </svg>
  );
}


/* =========================================
   CHECK ICON
========================================= */

function CheckIcon() {
  return (
    <svg
      className="auth-check-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}


/* =========================================
   GOOGLE ICON
========================================= */

function GoogleIcon() {
  return (
    <svg
      className="auth-google-icon"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.6 20H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4Z"
      />

      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7Z"
      />

      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.4 16.2 44 24 44Z"
      />

      <path
        fill="#1976D2"
        d="M43.6 20H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.2 5.3C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-4Z"
      />
    </svg>
  );
}


/* =========================================
   GITHUB ICON
========================================= */

function GithubIcon() {
  return (
    <svg
      className="auth-social-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .7A11.5 11.5 0 0 0 8.36 23.1c.58.1.79-.25.79-.56v-2.2c-3.23.7-3.91-1.37-3.91-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.39.97.1-.75.41-1.27.74-1.56-2.58-.29-5.3-1.29-5.3-5.75 0-1.27.45-2.31 1.2-3.12-.12-.29-.52-1.48.11-3.08 0 0 .98-.31 3.16 1.19A10.9 10.9 0 0 1 12 6.03c.98 0 1.95.13 2.87.39 2.18-1.5 3.15-1.19 3.15-1.19.63 1.6.23 2.79.11 3.08.75.81 1.2 1.85 1.2 3.12 0 4.47-2.72 5.45-5.31 5.74.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}