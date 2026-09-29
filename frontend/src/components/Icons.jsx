import React from "react";

function makeIcon(glyph) {
  return function Icon({ size = 20, className = "", title, ...props }) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        aria-hidden={title ? undefined : "true"}
        role={title ? "img" : undefined}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        <text x="12" y="16" textAnchor="middle" fontSize="17.5" fill="currentColor" fontFamily="Arial, sans-serif">
          {glyph}
        </text>
      </svg>
    );
  };
}

export const ArrowLeft = makeIcon("←");
export const Bell = makeIcon("●");
export const BookOpen = makeIcon("▤");
export const Check = makeIcon("✓");
export const ChevronRight = makeIcon("›");
export const Download = makeIcon("↓");
export const Feather = makeIcon("✎");
export const Globe2 = makeIcon("◎");
export const Home = makeIcon("⌂");
export const ImageIcon = makeIcon("▧");
export const Images = makeIcon("▧");
export const LayoutGrid = makeIcon("▦");
export const LogOut = makeIcon("↪");
export const MessageCircle = makeIcon("◌");
export const MessageSquareText = makeIcon("≡");
export const Moon = makeIcon("☾");
export const Palette = makeIcon("◉");
export const PanelLeftClose = makeIcon("◀");
export const PanelLeftOpen = makeIcon("▶");
export const PenLine = makeIcon("✎");
export const Plus = makeIcon("+");
export const RefreshCcw = makeIcon("↻");
export const Save = makeIcon("✓");
export const Search = makeIcon("⌕");
export const Settings = makeIcon("⚙");
export const Sparkles = makeIcon("✦");
export const Sun = makeIcon("☀");
export const Users = makeIcon("♟");
export const WandSparkles = makeIcon("✦");
export const Video = makeIcon("▶");
