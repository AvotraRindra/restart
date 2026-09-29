import { useState } from "react";
import "./Footer.css";

const columns = {
  Explore: ["Home", "Gallery", "Features", "Pricing", "Testimonials"],
  Support: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service", "FAQs"],
  Company: ["About Us", "Our Story", "Careers", "Blog"],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <footer className="footer" id="contact">
      <div className="footer-grid">
        <div>
          <div className="brand"><span className="brand-logo">🏞️</span> Mem<span className="red">ories</span></div>
          <p className="tag">A place to keep, share, and relive the moments that matter.</p>
          <div className="socials">{["f", "◎", "▶", "𝕏"].map((s) => <a key={s} href="#">{s}</a>)}</div>
        </div>

        {Object.entries(columns).map(([title, links]) => (
          <div key={title}>
            <h4>{title}</h4>
            <ul>{links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>
        ))}

        <div>
          <h4>Stay Updated</h4>
          <p className="tag">Get the latest updates and new features.</p>
          <form onSubmit={submit} className="news">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={sent ? "Merci ! ✔" : "Your email address"} />
            <button aria-label="Subscribe">→</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Memories. All rights reserved.</span>
        <span>Made with <b className="heart">❤</b> for better memories.</span>
      </div>
      <svg className="wave" viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0 80C300 0 600 120 900 70S1300 30 1440 60V120H0Z" /></svg>
    </footer>
  );
}
