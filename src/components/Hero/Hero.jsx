import Boy from "./Boy";
import useCountUp from "../../hooks/useCountUp";
import "./Hero.css";

const polaroids = ["sunset", "friends", "mountain", "dog", "city"];
const icons = [["❤", "i1"], ["📁", "i2"], ["☁", "i3"]];
const stats = [[20, "Happy Clients"], [50, "Projects Completed"], [4, "Years Experience"]];

function Stat({ end, label }) {
  const n = useCountUp(end);
  return <div className="stat"><strong>{n}+</strong><span>{label}</span></div>;
}

export default function Hero() {
  // Parallaxe : la souris déplace les éléments flottants
  const onMove = (e) => {
    const s = e.currentTarget.style;
    s.setProperty("--mx", (e.clientX / window.innerWidth - 0.5).toFixed(3));
    s.setProperty("--my", (e.clientY / window.innerHeight - 0.5).toFixed(3));
  };

  return (
    <section className="hero" id="home" onMouseMove={onMove}>
      <span className="badge"><i /> Creative Digital Agency</span>

      <div className="stage">
        <svg className="orbit" viewBox="0 0 900 300"><ellipse cx="450" cy="150" rx="430" ry="110" /></svg>
        {polaroids.map((p, i) => <div key={p} className={`polaroid ${p}`} style={{ "--d": i }}><span /></div>)}
        {icons.map(([ic, c]) => <div key={c} className={`icon-chip ${c}`}>{ic}</div>)}
        {[...Array(6)].map((_, i) => <b key={i} className={`spark s${i}`}>✦</b>)}
        <Boy />
      </div>

      <h1 className="title">
        Turn Ideas <em>Into</em><br />
        <span className="red">Digital</span> Experiences
      </h1>
      <p className="lead">We design and build modern digital experiences<br />that help ambitious brands grow.</p>

      <div className="cta">
        <button className="btn btn-red">Get Started <span>→</span></button>
        <button className="play"><span>▶</span> Watch Showreel</button>
      </div>

      <div className="stats">{stats.map(([e, l]) => <Stat key={l} end={e} label={l} />)}</div>
    </section>
  );
}
