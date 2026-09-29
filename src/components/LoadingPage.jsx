import { useEffect, useMemo, useRef, useState } from "react";
import Logo from "./Logo.jsx";

const emotions = [
  { name: "Joie", icon: "☀", tone: "#ff4a4f", glow: "rgba(255,74,79,.48)", message: "Les instants qui font sourire" },
  { name: "Amour", icon: "♥", tone: "#ff3150", glow: "rgba(255,49,80,.50)", message: "Les liens que l'on garde près du cœur" },
  { name: "Nostalgie", icon: "◔", tone: "#a778ff", glow: "rgba(167,120,255,.44)", message: "Les moments qu'on aime retrouver" },
  { name: "Fierté", icon: "✦", tone: "#ff8f45", glow: "rgba(255,143,69,.46)", message: "Les étapes qui nous ont fait grandir" },
  { name: "Sérénité", icon: "≈", tone: "#5f8cff", glow: "rgba(95,140,255,.44)", message: "Les souvenirs qui apaisent" },
  { name: "Espoir", icon: "↗", tone: "#ff6570", glow: "rgba(255,101,112,.46)", message: "Les souvenirs qui donnent envie d'avancer" },
];

const sparks = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  angle: i * 20,
  delay: (i % 6) * 0.16,
  size: 3 + (i % 3) * 2,
}));

export default function LoadingPage({ onDone, theme = "dark" }) {
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timers = useRef([]);

  const emotion = emotions[index];
  const progress = ((index + 1) / emotions.length) * 100;

  const satellites = useMemo(
    () =>
      emotions.map((item, itemIndex) => {
        const angle = -90 + itemIndex * (360 / emotions.length);
        const rad = (angle * Math.PI) / 180;
        const radius = 122;
        return {
          ...item,
          x: Math.cos(rad) * radius,
          y: Math.sin(rad) * radius,
        };
      }),
    []
  );

  useEffect(() => {
    const later = (fn, delay) => {
      const id = window.setTimeout(fn, delay);
      timers.current.push(id);
      return id;
    };

    const stepDuration = 760;

    emotions.forEach((_, i) => {
      if (i === 0) return;
      later(() => {
        setTransitioning(true);
        later(() => {
          setIndex(i);
          setTransitioning(false);
        }, 180);
      }, i * stepDuration);
    });

    later(() => {
      setTransitioning(true);
      later(onDone, 520);
    }, emotions.length * stepDuration + 280);

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [onDone]);

  return (
    <div
      className={`emotion-loader ${theme === "dark" ? "is-dark" : "is-light"}`}
      style={{
        "--emotion": emotion.tone,
        "--emotion-glow": emotion.glow,
        "--progress": `${progress * 3.6}deg`,
      }}
    >
      <div className="emotion-loader__mesh" aria-hidden="true" />
      <div className="emotion-loader__ribbon emotion-loader__ribbon--one" aria-hidden="true" />
      <div className="emotion-loader__ribbon emotion-loader__ribbon--two" aria-hidden="true" />
      <div className="emotion-loader__ambient emotion-loader__ambient--one" />
      <div className="emotion-loader__ambient emotion-loader__ambient--two" />

      <div className="emotion-loader__content">
        <div className="emotion-loader__brand"><Logo /></div>

        <div className="emotion-stage" aria-label={`Chargement : ${emotion.name}`}>
          <div className="emotion-stage__halo emotion-stage__halo--one" />
          <div className="emotion-stage__halo emotion-stage__halo--two" />
          <div className="emotion-stage__progress" />

          <div className="emotion-satellites">
            {satellites.map((item, itemIndex) => (
              <div
                key={item.name}
                className={`emotion-satellite ${itemIndex === index ? "is-active" : ""}`}
                style={{
                  "--x": `${item.x}px`,
                  "--y": `${item.y}px`,
                  "--tone": item.tone,
                  "--glow": item.glow,
                  "--delay": `${itemIndex * -0.32}s`,
                }}
              >
                <span>{item.icon}</span>
              </div>
            ))}
          </div>

          {sparks.map((spark) => (
            <span
              key={spark.id}
              className="emotion-spark"
              style={{
                "--spark-angle": `${spark.angle}deg`,
                "--spark-delay": `${spark.delay}s`,
                "--spark-size": `${spark.size}px`,
              }}
            />
          ))}

          <div className={`emotion-core ${transitioning ? "is-switching" : ""}`}>
            <div className="emotion-core__glass" />
            <div className="emotion-core__pulse" />
            <div className="emotion-core__pulse emotion-core__pulse--late" />
            <div className="emotion-core__symbol">{emotion.icon}</div>
          </div>
        </div>

        <div className={`emotion-copy ${transitioning ? "is-switching" : ""}`}>
          <span>Chaque souvenir porte une émotion</span>
          <strong>{emotion.name}</strong>
          <p>{emotion.message}</p>
        </div>

        <div className="emotion-loader__timeline" aria-hidden="true">
          <div className="emotion-loader__timeline-fill" style={{ width: `${progress}%` }} />
          {emotions.map((item, itemIndex) => (
            <span
              key={item.name}
              className={`${itemIndex <= index ? "is-done" : ""} ${itemIndex === index ? "is-current" : ""}`}
              style={{ left: `${(itemIndex / (emotions.length - 1)) * 100}%` }}
            />
          ))}
        </div>

        <p className="emotion-loader__status">Préparation de votre espace souvenirs…</p>
      </div>
    </div>
  );
}
