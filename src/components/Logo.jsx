export default function Logo({ compact = false }) {
  return (
    <div className={`brand-logo ${compact ? "compact" : ""}`}>
      <span className="brand-mark"><i /></span>
      {!compact && <span className="brand-logo-text">Memo<span>ries</span></span>}
    </div>
  );
}
