import { useEffect, useMemo, useRef, useState } from "react";

function PageBody({ page, pageNumber, total }) {
  if (!page) return <div className="book3d-paper-texture" aria-hidden="true" />;
  return <div className="book3d-sheet-inner">
    <small>PAGE {pageNumber} / {total}</small>
    <h3>{page.title || `Page ${pageNumber}`}</h3>
    <div className="book3d-reading-text">{page.content}</div>
    <span className="book3d-page-number">{pageNumber}</span>
  </div>;
}

function BookPage({ page, side, pageNumber, total }) {
  return <article className={`book3d-sheet ${side} ${page ? "" : "book3d-blank"}`}>
    <PageBody page={page} pageNumber={pageNumber} total={total} />
  </article>;
}

export default function Book3DViewer({ pages = [], title = "Livre souvenir" }) {
  const ordered = useMemo(() => [...pages].sort((a, b) => Number(a.page_number) - Number(b.page_number)), [pages]);
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  useEffect(() => { setSpread(0); setTurn(null); }, [ordered.length, title]);

  if (!ordered.length) return <div className="empty-state"><strong>Aucune page générée.</strong></div>;

  const maxSpread = Math.max(0, Math.ceil(ordered.length / 2) - 1);
  const safeSpread = Math.min(spread, maxSpread);
  const leftIndex = safeSpread * 2;
  const left = ordered[leftIndex];
  const right = ordered[leftIndex + 1];

  const nextLeftIndex = Math.min((safeSpread + 1) * 2, ordered.length);
  const previousLeftIndex = Math.max((safeSpread - 1) * 2, 0);

  function startTurn(direction) {
    if (turn) return;
    if (direction === "next" && safeSpread >= maxSpread) return;
    if (direction === "prev" && safeSpread <= 0) return;
    setTurn(direction);
    timerRef.current = window.setTimeout(() => {
      setSpread((value) => direction === "next" ? Math.min(maxSpread, value + 1) : Math.max(0, value - 1));
      setTurn(null);
    }, 820);
  }

  const frontPage = turn === "next" ? right : left;
  const frontNumber = turn === "next" ? leftIndex + 2 : leftIndex + 1;
  const backPage = turn === "next" ? ordered[nextLeftIndex] : ordered[previousLeftIndex + 1];
  const backNumber = turn === "next" ? nextLeftIndex + 1 : previousLeftIndex + 2;
  // La page située sous la feuille qui tourne affiche déjà la destination,
  // ce qui évite l'effet de duplication et renforce l'illusion d'un vrai livre.
  const displayLeft = turn === "prev" ? ordered[previousLeftIndex] : left;
  const displayLeftNumber = turn === "prev" ? previousLeftIndex + 1 : leftIndex + 1;
  const displayRight = turn === "next" ? ordered[nextLeftIndex + 1] : right;
  const displayRightNumber = turn === "next" ? nextLeftIndex + 2 : leftIndex + 2;

  return <section className="book3d-wrap" aria-label={`Lecture de ${title}`}>
    <div className="book3d-titlebar"><span>RE:START · MNEMOS</span><strong>{title}</strong></div>
    <div className="book3d-stage">
      <div className="book3d-open-book">
        <div className="book3d-hardcover" />
        <div className="book3d-page-stack left-stack" />
        <BookPage page={displayLeft} side="left" pageNumber={displayLeftNumber} total={ordered.length} />
        <BookPage page={displayRight} side="right" pageNumber={displayRightNumber} total={ordered.length} />
        <div className="book3d-page-stack right-stack" />
        <div className="book3d-spine" />

        {turn && <div className={`book3d-turning-page ${turn}`} aria-hidden="true">
          <div className="book3d-turn-face front"><PageBody page={frontPage} pageNumber={frontNumber} total={ordered.length} /></div>
          <div className="book3d-turn-face back"><PageBody page={backPage} pageNumber={backNumber} total={ordered.length} /></div>
        </div>}
      </div>
    </div>
    <div className="book3d-controls">
      <button disabled={safeSpread === 0 || Boolean(turn)} onClick={() => startTurn("prev")}>← Pages précédentes</button>
      <span>{Math.min(leftIndex + 1, ordered.length)}–{Math.min(leftIndex + 2, ordered.length)} / {ordered.length}</span>
      <button disabled={safeSpread === maxSpread || Boolean(turn)} onClick={() => startTurn("next")}>Pages suivantes →</button>
    </div>
  </section>;
}
