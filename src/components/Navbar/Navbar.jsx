import "./Navbar.css";

const links = ["Home", "Services", "Work", "About", "Contact"];

export default function Navbar() {
  return (
    <header className="nav">
      <a href="#" className="nav-logo">
        <span className="ring" /> Vigny<b className="red">.</b>
      </a>
      <nav className="nav-links">
        {links.map((l, i) => (
          <a key={l} href={`#${l.toLowerCase()}`} className={i === 0 ? "active" : ""}>{l}</a>
        ))}
      </nav>
      <button className="btn btn-dark">Get Started <span className="arrow">→</span></button>
    </header>
  );
}
