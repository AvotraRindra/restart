import { Home, Images, Globe2, MessageCircle, Bell, Plus, PanelLeftClose, PanelLeftOpen, LogOut, WandSparkles, Users } from "./Icons.jsx";
import Logo from "./Logo.jsx";

const items = [
  ["dashboard", Home, "Accueil"],
  ["memories", Images, "Mes souvenirs"],
  ["studio", WandSparkles, "Atelier créatif"],
  ["shared", Globe2, "Partagés"],
  ["messages", MessageCircle, "Messages"],
  ["notifications", Bell, "Notifications"],
  ["profile", Users, "Profil"],
];

export default function Sidebar({ page, setPage, collapsed, onToggle, onLogout }) {
  return <aside className={`side-nav ${collapsed ? "collapsed" : ""}`}>
    <div className="side-brand"><Logo compact={collapsed} /></div>
    <button className="side-create" onClick={() => setPage("new-memory")} title={collapsed ? "Créer un souvenir" : undefined}><Plus size={30}/>{!collapsed && <span>Nouveau souvenir</span>}</button>
    <nav>{items.map(([id, Icon, label]) => <button key={id} className={page===id ? "active" : ""} onClick={()=>setPage(id)} title={collapsed ? label : undefined}><Icon size={29}/>{!collapsed && <span>{label}</span>}{id === "notifications" && <i className="notif-dot"/>}</button>)}</nav>
    <div className="side-bottom"><button className="side-logout" onClick={onLogout} title={collapsed ? "Déconnexion" : undefined}><LogOut size={28}/>{!collapsed && <span>Déconnexion</span>}</button><button className="side-toggle" onClick={onToggle} title={collapsed ? "Développer" : "Réduire"}>{collapsed ? <PanelLeftOpen size={28}/> : <PanelLeftClose size={28}/>} {!collapsed && <span>Réduire</span>}</button></div>
  </aside>;
}
