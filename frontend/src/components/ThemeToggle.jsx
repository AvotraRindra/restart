import { Moon, Sun } from "./Icons.jsx";

export default function ThemeToggle({ theme = "light", onToggle, compact = false }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? "theme-toggle--dark" : ""} ${compact ? "theme-toggle--compact" : ""}`}
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      <span className="theme-toggle__sky" aria-hidden="true">
        <span className="theme-toggle__sun"><Sun size={16} strokeWidth={2.2} /></span>
        <span className="theme-toggle__moon"><Moon size={15} strokeWidth={2.35} /></span>
        <span className="toggle-star star-1" />
        <span className="toggle-star star-2" />
        <span className="toggle-star star-3" />
        <span className="toggle-star star-4" />
        <span className="toggle-accent-glow" />
      </span>
      <span className="theme-toggle__thumb" aria-hidden="true">
        <span className="theme-toggle__thumb-inner" />
      </span>
    </button>
  );
}
