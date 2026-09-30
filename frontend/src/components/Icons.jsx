import React from "react";

function IconBase({ size = 20, className = "", title, children, fill = "none", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const ArrowLeft = (p) => <IconBase {...p}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></IconBase>;
export const Bell = (p) => <IconBase {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></IconBase>;
export const BookOpen = (p) => <IconBase {...p}><path d="M2.8 5.5A3.5 3.5 0 0 1 6.2 4H11v15H6.2a3.5 3.5 0 0 0-3.4 1.5z"/><path d="M21.2 5.5A3.5 3.5 0 0 0 17.8 4H13v15h4.8a3.5 3.5 0 0 1 3.4 1.5z"/></IconBase>;
export const Check = (p) => <IconBase {...p}><path d="m5 12.5 4.2 4.2L19 7"/></IconBase>;
export const ChevronRight = (p) => <IconBase {...p}><path d="m9 18 6-6-6-6"/></IconBase>;
export const Download = (p) => <IconBase {...p}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></IconBase>;
export const Feather = (p) => <IconBase {...p}><path d="M20.2 3.8c-4.8-1.3-9.2.1-12.5 3.4C4.3 10.6 3 15 4.3 19.8c4.8 1.3 9.2-.1 12.6-3.5 3.3-3.3 4.7-7.7 3.3-12.5Z"/><path d="M4.5 19.5 16 8"/><path d="M8 16h5"/><path d="M11 13V8"/></IconBase>;
export const Globe2 = (p) => <IconBase {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.8 2.7 4.2 5.7 4.2 9S14.8 18.3 12 21c-2.8-2.7-4.2-5.7-4.2-9S9.2 5.7 12 3Z"/></IconBase>;
export const Home = (p) => <IconBase {...p}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></IconBase>;
export const ImageIcon = (p) => <IconBase {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></IconBase>;
export const Images = (p) => <IconBase {...p}><rect x="6" y="5" width="15" height="14" rx="2"/><path d="M3 16V6a2 2 0 0 1 2-2h12"/><circle cx="11" cy="10" r="1.5"/><path d="m21 15-4-4-7 8"/></IconBase>;
export const LayoutGrid = (p) => <IconBase {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></IconBase>;
export const LogOut = (p) => <IconBase {...p}><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M14 8l4 4-4 4"/><path d="M18 12H9"/></IconBase>;
export const MessageCircle = (p) => <IconBase {...p}><path d="M21 11.5a8.3 8.3 0 0 1-9 8.3 9.2 9.2 0 0 1-3.6-.8L3 21l1.8-5.1A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></IconBase>;
export const MessageSquareText = (p) => <IconBase {...p}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M7 8h10M7 12h7"/></IconBase>;
export const Moon = (p) => <IconBase {...p}><path d="M20.5 14.2A8.3 8.3 0 0 1 9.8 3.5 8.7 8.7 0 1 0 20.5 14.2Z"/></IconBase>;
export const Palette = (p) => <IconBase {...p}><path d="M12 3a9 9 0 0 0 0 18h1.2a2 2 0 0 0 1.7-3c-.5-.8.1-2 1.1-2h1a4 4 0 0 0 4-4c0-5-4-9-9-9Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="6.8" r="1"/><circle cx="14" cy="6.8" r="1"/><circle cx="16.5" cy="10" r="1"/></IconBase>;
export const PanelLeftClose = (p) => <IconBase {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path d="m16 9-3 3 3 3"/></IconBase>;
export const PanelLeftOpen = (p) => <IconBase {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path d="m14 9 3 3-3 3"/></IconBase>;
export const PenLine = (p) => <IconBase {...p}><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m14 7 3 3"/></IconBase>;
export const Plus = (p) => <IconBase {...p}><path d="M12 5v14M5 12h14"/></IconBase>;
export const RefreshCcw = (p) => <IconBase {...p}><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.1 8A7 7 0 0 1 18.4 6L20 12"/><path d="M17.9 16A7 7 0 0 1 5.6 18L4 12"/></IconBase>;
export const Save = (p) => <IconBase {...p}><path d="M5 3h12l4 4v14H3V3z"/><path d="M7 3v6h10V3"/><rect x="7" y="14" width="10" height="7" rx="1"/></IconBase>;
export const Search = (p) => <IconBase {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></IconBase>;
export const Settings = (p) => <IconBase {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></IconBase>;
export const Sparkles = (p) => <IconBase {...p}><path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/><path d="m5 13 .7 1.8L7.5 15l-1.8.7L5 17.5l-.7-1.8L2.5 15l1.8-.7L5 13Z"/></IconBase>;
export const Sun = (p) => <IconBase {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></IconBase>;
export const Users = (p) => <IconBase {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></IconBase>;
export const User = (p) => <IconBase {...p}><circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></IconBase>;
export const WandSparkles = (p) => <IconBase {...p}><path d="m15 4 5 5L8 21H3v-5L15 4Z"/><path d="m13 6 5 5"/><path d="M6 3v3M4.5 4.5h3M20 16v4M18 18h4"/></IconBase>;
export const Video = (p) => <IconBase {...p}><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2z"/></IconBase>;
export const Paperclip = (p) => <IconBase {...p}><path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/></IconBase>;
export const Send = (p) => <IconBase {...p}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></IconBase>;
export const Bot = (p) => <IconBase {...p}><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/></IconBase>;
export const X = (p) => <IconBase {...p}><path d="m6 6 12 12M18 6 6 18"/></IconBase>;
export const File = (p) => <IconBase {...p}><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5"/></IconBase>;
