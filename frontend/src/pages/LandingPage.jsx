import { useEffect, useState } from "react";
import "./Landing.css";
import { Link } from "react-router-dom";
function Landing() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={darkMode ? "landing dark" : "landing light"}>
      {/* =========================
          NAVBAR
      ========================== */}
      <header className="navbar">
        <div className="navbar-content">
          <a href="#accueil" className="logo">
            <div className="logo-icon">M</div>

            <div className="logo-text">
              Memo<span>ries</span>
            </div>
          </a>

          <nav className="nav-menu">
            <a href="#accueil" className="active">
              <span className="nav-icon">⌂</span>
              Accueil
            </a>

            <a href="#fonctionnalites">
              <span className="nav-icon">✦</span>
              Fonctionnalités
            </a>
            <a href="#Explorer">
              <span classsName="nav-icon">✦</span>
              Explorer
              </a>
            <a href="/MesSouvenirs">
              <span>▧</span>
             Mes souvenirs
             </a>
            <a href="#apropos">
              <span className="nav-icon">ⓘ</span>
              À propos
            </a>
          </nav>

          <div className="nav-actions">
            {/* MODE CLAIR / SOMBRE */}
            <button
              className={`theme-switch ${darkMode ? "active" : ""}`}
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Changer le thème"
            >
              <span className="theme-icon sun">☀</span>

              <span className="switch-circle">
                {darkMode ? "☾" : "☀"}
              </span>

              <span className="theme-icon moon">☾</span>
            </button>

            <button className="login-button">
              Se connecter
            </button>

            <button className="register-button">
              S'inscrire
            </button>
          </div>
        </div>
      </header>

      {/* =========================
          PAGE
      ========================== */}
      <main className="page">
        {/* =========================
            HERO
        ========================== */}
        <section className="hero" id="accueil">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=90"
            alt="Paysage de montagne"
          />

          <div className="hero-overlay"></div>

          <div className="hero-content">
            <span className="small-title">
              VOS SOUVENIRS, TOUJOURS AVEC VOUS
            </span>

            <h1>
              Revivez ce qui compte,
              <br />
              <span>à tout moment.</span>
            </h1>

            <p>
              Conservez vos photos, vos histoires, vos émotions et tous
              les petits détails qui rendent chaque moment unique.
            </p>

            <div className="hero-buttons">
              <button className="primary-button">
                Commencer gratuitement
                <span>→</span>
              </button>

              <button className="secondary-button">
                <span className="play-icon">▶</span>
                Découvrir Memories
              </button>
            </div>
          </div>

          <div className="hero-badge">
            <span>♡</span>
            Des souvenirs pour la vie
          </div>
        </section>

        {/* =========================
            INTRO
        ========================== */}
        <section className="intro-section reveal">
          <div className="section-title">
            <span>POURQUOI MEMORIES ?</span>

            <h2>
              Vos moments méritent plus qu'une simple photo
            </h2>

            <p>
              Memories vous permet de garder toute l'histoire qui se cache
              derrière chacun de vos souvenirs.
            </p>
          </div>

          <div className="intro-grid">
            <IntroCard
              icon="▧"
              title="Photos"
              text="Conservez vos photos importantes dans un espace personnel."
            />

            <IntroCard
              icon="◉"
              title="Votre voix"
              text="Racontez votre souvenir avec votre propre voix."
            />

            <IntroCard
              icon="♡"
              title="Vos émotions"
              text="Gardez une trace de ce que vous ressentiez."
            />

            <IntroCard
              icon="⌖"
              title="Lieu & date"
              text="Souvenez-vous exactement d'où et quand."
            />
          </div>
        </section>

        {/* =========================
            FEATURES
        ========================== */}
        <section
          className="feature-section reveal"
          id="fonctionnalites"
        >
          <div className="section-title">
            <span>FONCTIONNALITÉS</span>

            <h2>
              Tout ce qu'il faut pour garder vos souvenirs vivants
            </h2>

            <p>
              Une expérience simple pour conserver, enrichir et partager
              les moments qui comptent vraiment.
            </p>
          </div>

          <div className="feature-cards">
            <FeatureCard
              icon="▧"
              title="Photos & galeries"
              text="Conservez vos photos et regroupez vos meilleurs moments."
            />

            <FeatureCard
              icon="◉"
              title="Souvenirs vocaux"
              text="Enregistrez votre voix et racontez naturellement votre histoire."
            />

            <FeatureCard
              icon="♡"
              title="Émotions"
              text="Associez une émotion à chaque souvenir."
            />

            <FeatureCard
              icon="⌖"
              title="Lieu & date"
              text="Ajoutez le lieu, la date et l'heure de chaque moment."
            />

            <FeatureCard
              icon="▱"
              title="Albums"
              text="Organisez vos souvenirs par voyage, événement ou période."
            />

            <FeatureCard
              icon="↗"
              title="Partage"
              text="Gardez vos souvenirs privés ou partagez-les avec vos proches."
            />

            <FeatureCard
              icon="☵"
              title="Commentaires"
              text="Échangez avec les personnes autour des souvenirs partagés."
            />

            <FeatureCard
              icon="♢"
              title="Notifications"
              text="Recevez les nouvelles interactions importantes."
            />
          </div>
        </section>

        {/* =========================
            STORY
        ========================== */}
        <section className="story-section reveal">
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1100&q=90"
              alt="Groupe d'amis"
            />

            <div className="floating-box">
              <div className="floating-icon">♡</div>

              <div>
                <small>NOUVEAU SOUVENIR</small>
                <strong>Une journée inoubliable</strong>
              </div>
            </div>
          </div>

          <div className="story-content">
            <span className="small-red">
              VOS HISTOIRES
            </span>

            <h2>
              Une photo garde l'image.
              <br />
              Memories garde <span>l'histoire.</span>
            </h2>

            <p>
              Ajoutez les personnes présentes, le contexte, le lieu,
              la date et votre émotion pour conserver bien plus qu'une image.
            </p>

            <div className="story-list">
              <div>
                <span>✓</span>
                Photos et galeries
              </div>

              <div>
                <span>✓</span>
                Texte et voix
              </div>

              <div>
                <span>✓</span>
                Date et localisation
              </div>

              <div>
                <span>✓</span>
                Partage privé ou public
              </div>
            </div>

            <button className="primary-button">
              Créer un souvenir
              <span>→</span>
            </button>
          </div>
        </section>

        {/* =========================
            HOW IT WORKS
        ========================== */}
        <section
          className="how-section reveal"
          id="comment"
        >
          <div className="section-title">
            <span>SIMPLE ET RAPIDE</span>

            <h2>Comment ça marche ?</h2>

            <p>
              Quelques étapes suffisent pour commencer à construire
              votre collection de souvenirs.
            </p>
          </div>

          <div className="steps">
            <StepCard
              number="01"
              icon="♙"
              title="Créez votre compte"
              text="Créez gratuitement votre espace personnel."
            />

            <StepCard
              number="02"
              icon="▧"
              title="Ajoutez un souvenir"
              text="Ajoutez votre photo, votre texte, votre voix ou votre émotion."
            />

            <StepCard
              number="03"
              icon="▱"
              title="Organisez"
              text="Classez vos souvenirs dans vos albums."
            />

            <StepCard
              number="04"
              icon="↗"
              title="Revivez ou partagez"
              text="Retrouvez vos moments ou partagez-les avec vos proches."
            />
          </div>
        </section>

        {/* =========================
            COMIC
        ========================== */}
        <section className="comic-section reveal">
          <div className="comic-content">
            <span className="small-red">
              CRÉEZ AUTREMENT
            </span>

            <h2>
              Transformez vos souvenirs en bande dessinée
            </h2>

            <p>
              Ajoutez les photos des personnes présentes puis transformez
              votre souvenir en une histoire illustrée originale.
            </p>

            <button className="primary-button">
              Découvrir la fonctionnalité
              <span>→</span>
            </button>
          </div>

          <div className="comic-cards">
            <div className="comic-card">
              <span>01</span>

              <div className="comic-icon">♙</div>

              <strong>Ajoutez les personnages</strong>

              <p>
                Importez leurs photos depuis votre galerie.
              </p>
            </div>

            <div className="comic-card">
              <span>02</span>

              <div className="comic-icon">☵</div>

              <strong>Racontez votre souvenir</strong>

              <p>
                Ajoutez les événements et les détails importants.
              </p>
            </div>

            <div className="comic-card">
              <span>03</span>

              <div className="comic-icon">✦</div>

              <strong>Créez votre histoire</strong>

              <p>
                Transformez votre souvenir en bande dessinée.
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            CTA
        ========================== */}
        <section className="cta-section reveal">
          <div>
            <span>VOTRE HISTOIRE COMMENCE ICI</span>

            <h2>
              Prêt à garder vos souvenirs autrement ?
            </h2>

            <p>
              Créez votre compte et commencez votre collection
              de souvenirs dès aujourd'hui.
            </p>
          </div>

          <button className="primary-button">
            Créer un compte gratuitement
            <span>→</span>
          </button>
        </section>

        {/* =========================
            FOOTER
        ========================== */}
        <footer id="apropos" className="reveal">
          <div>
            <div className="footer-brand">
              Memo<span>ries</span>
            </div>

            <p>
              Gardez vos souvenirs. Revivez vos émotions.
            </p>
          </div>

          <div className="footer-links">
            <a href="#accueil">Accueil</a>
            <a href="#fonctionnalites">Fonctionnalités</a>
            <a href="#comment">Comment ça marche</a>
            <a href="#">Confidentialité</a>
            <a href="#">Contact</a>
          </div>

          <small>
            © 2026 Memories
          </small>
        </footer>
      </main>
    </div>
  );
}

function IntroCard({ icon, title, text }) {
  return (
    <article className="intro-card">
      <div className="intro-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </article>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <article className="feature-glass-card">
      <div className="feature-card-icon">
        {icon}
      </div>

      <div className="feature-card-text">
        <h3>{title}</h3>

        <p>{text}</p>
      </div>

      <span className="feature-card-arrow">
        →
      </span>
    </article>
  );
}

function StepCard({ number, icon, title, text }) {
  return (
    <article className="step-card">
      <div className="step-top">
        <div className="step-icon">
          {icon}
        </div>

        <span>{number}</span>
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </article>
  );
}

export default Landing;

