import { useMemo, useState } from "react";

function BookPage({ page, side, pageNumber, total }) {
  if (!page) {
    return <article className={`book3d-sheet ${side} book3d-blank`} aria-hidden="true"><div className="book3d-paper-texture" /></article>;
  }
  return <article className={`book3d-sheet ${side}`}>
    <div className="book3d-sheet-inner">
      <small>PAGE {pageNumber} / {total}</small>
      <h3>{page.title || `Page ${pageNumber}`}</h3>
      <div className="book3d-reading-text">{page.content}</div>
      <span className="book3d-page-number">{pageNumber}</span>
    </div>
  </article>;
}

export default function Book3DViewer({ pages = [], title = "Livre souvenir" }) {
  const ordered = useMemo(() => [...pages].sort((a, b) => Number(a.page_number) - Number(b.page_number)), [pages]);
  const [spread, setSpread] = useState(0);

  if (!ordered.length) return <div className="empty-state"><strong>Aucune page générée.</strong></div>;

  const maxSpread = Math.max(0, Math.ceil(ordered.length / 2) - 1);
  const safeSpread = Math.min(spread, maxSpread);
  const leftIndex = safeSpread * 2;
  const left = ordered[leftIndex];
  const right = ordered[leftIndex + 1];

  function previous() { setSpread((value) => Math.max(0, value - 1)); }
  function next() { setSpread((value) => Math.min(maxSpread, value + 1)); }

  return <section className="book3d-wrap" aria-label={`Lecture de ${title}`}>
    <div className="book3d-titlebar"><span>RE:START · MNEMOS</span><strong>{title}</strong></div>
    <div className="book3d-stage">
      <div className="book3d-open-book" key={safeSpread}>
        <div className="book3d-hardcover" />
        <div className="book3d-page-stack left-stack" />
        <BookPage page={left} side="left" pageNumber={leftIndex + 1} total={ordered.length} />
        <BookPage page={right} side="right" pageNumber={leftIndex + 2} total={ordered.length} />
        <div className="book3d-page-stack right-stack" />
        <div className="book3d-spine" />
      </div>
    </div>
    <div className="book3d-controls">
      <button disabled={safeSpread === 0} onClick={previous}>← Pages précédentes</button>
      <span>{Math.min(leftIndex + 1, ordered.length)}–{Math.min(leftIndex + 2, ordered.length)} / {ordered.length}</span>
      <button disabled={safeSpread === maxSpread} onClick={next}>Pages suivantes →</button>
    </div>
  </section>;
}
