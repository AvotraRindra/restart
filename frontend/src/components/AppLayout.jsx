import { useState } from "react";
import { Search } from "./Icons.jsx";
import Sidebar from "./Sidebar.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { imageUrl } from "../services/memoryApi.js";

export default function AppLayout({ page, setPage, theme, setTheme, user, onLogout, search, setSearch, onProfile, children }) {
  const [collapsed, setCollapsed] = useState(true);
  const submitSearch = (e) => { e.preventDefault(); setPage("memories"); };
  const avatar = user?.photo ? imageUrl(user.photo) : "";

  return <div className={`app-shell ${theme} ${collapsed ? "nav-collapsed" : "nav-open"}`}>
    <Sidebar page={page} setPage={setPage} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} onLogout={onLogout} />
    <div className="app-stage"><header className="topbar"><form className="search-box" onSubmit={submitSearch}><Search size={22}/><input value={search} onChange={(e) => setSearch?.(e.target.value)} placeholder="Rechercher dans vos souvenirs..." /></form><div className="topbar-actions"><ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} /><button className="icon-btn bell-btn" onClick={() => setPage("notifications")} aria-label="Notifications"><BellIcon/><i/></button><button className="profile-chip" onClick={onProfile} aria-label="Ouvrir le profil"><span>{avatar ? <img src={avatar} alt=""/> : (user?.name || "U")[0].toUpperCase()}</span><div><strong>{user?.name || "Utilisateur"}</strong><small>{user?.email || ""}</small></div></button></div></header><main className="app-content">{children}</main></div>
  </div>;
}

function BellIcon(){return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
