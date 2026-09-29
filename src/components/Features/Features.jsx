import useReveal from "../../hooks/useReveal";
import "./Features.css";

const items = [
  { icon: "🔒", title: "Store", hl: "Safely", text: "Keep your photos, videos and important files secure in one trusted place." },
  { icon: "🗂️", title: "Organize", hl: "Moments", text: "Automatically sort and organize your memories so you can always find what matters." },
  { icon: "▶️", title: "Relive", hl: "Anytime", text: "Enjoy your memories beautifully, whenever you want, on any device." },
  { icon: "❤️", title: "Share", hl: "Privately", text: "Share the moments that matter with the people who matter, on your terms." },
];

export default function Features() {
  const head = useReveal();
  const grid = useReveal();
  return (
    <section className="features" id="services">
      <div ref={head} className="reveal features-head">
        <p className="eyebrow"><i /> OUR FEATURES <i /></p>
        <h2>Why Your <span className="red">Memories</span> Matter</h2>
        <p className="sub">More than just files — your memories are stories, milestones,<br />and moments that deserve to be kept, organized, and relived beautifully.</p>
      </div>

      <div className="features-body">
        <div className="chest">
          <div className="lid" />
          <div className="box"><b className="ph p1" /><b className="ph p2" /><b className="ph p3" /></div>
          <div className="ribbon" />
        </div>

        <div ref={grid} className="reveal cards">
          {items.map((it, i) => (
            <article key={it.title} className="card" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="card-icon">{it.icon}</div>
              <h3>{it.title} <span className="red">{it.hl}</span></h3>
              <p>{it.text}</p>
              <button aria-label={it.title}>→</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
