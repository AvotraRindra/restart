import { useState } from "react";
import { Search } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function AppLayout({ page, setPage, theme, setTheme, user, onLogout, children }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={`app-shell ${theme} ${collapsed ? "nav-collapsed" : "nav-open"}`}>
      <Sidebar
        page={page}
        setPage={setPage}
        collapsed={collapsed}
        onToggle={()=>setCollapsed(v=>!v)}
        onLogout={onLogout}
      />

      <div className="app-stage">
        <header className="topbar">
          <div className="search-box"><Search size={18}/><input placeholder="Rechercher dans vos souvenirs..."/></div>

          <div className="topbar-actions">
            <ThemeToggle theme={theme} onToggle={()=>setTheme(theme==="dark"?"light":"dark")} />
            <button className="icon-btn bell-btn" onClick={()=>setPage("notifications")} aria-label="Notifications"><BellIcon/><i/></button>
            <div className="profile-chip"><span>{(user?.name||"V")[0].toUpperCase()}</span><div><strong>{user?.name||"Vigny"}</strong><small>{user?.email||"vigny@example.com"}</small></div></div>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

function BellIcon(){return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
