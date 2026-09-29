// Garçon en SVG, entièrement animé en CSS (voir Hero.css)
const curls = [[98,70,30],[125,50,32],[158,46,34],[190,56,30],[208,84,26],[92,100,20],[214,108,18],[140,64,28]];
const skin = "#f8c9a4";

export default function Boy() {
  return (
    <svg className="boy" viewBox="0 0 300 280" aria-label="Garçon souriant">
      <g className="boy-body">
        <path d="M30 280C30 205 85 172 150 172s120 33 120 108z" fill="#d61a1a" />
        <path d="M112 174q38 40 76 0" fill="#f3b48c" />
        <path d="M128 200v34M172 200v34" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="boy-head">
        <circle cx="150" cy="108" r="62" fill={skin} />
        <g fill="#2b1a14">
          {curls.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} className="curl" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </g>
        <g className="brows" stroke="#2b1a14" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M112 96q12-8 24 0M164 96q12-8 24 0" />
        </g>
        <g className="eyes" stroke="#2b1a14" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M114 112q11 9 22 0M164 112q11 9 22 0" />
        </g>
        <circle cx="112" cy="130" r="9" fill="#f4907e" opacity=".6" />
        <circle cx="188" cy="130" r="9" fill="#f4907e" opacity=".6" />
        <path className="smile" d="M136 136q14 14 28 0" stroke="#8a3b2d" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
      <ellipse className="hand hand-l" cx="88" cy="168" rx="30" ry="24" fill={skin} />
      <ellipse className="hand hand-r" cx="212" cy="168" rx="30" ry="24" fill={skin} />
    </svg>
  );
}
