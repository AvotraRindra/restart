import ThemeToggle from "../components/ThemeToggle.jsx";
export default function SettingsPage({theme,setTheme}){
  return <section className="page-shell"><div className="page-head"><div><span>PRÉFÉRENCES</span><h1>Paramètres</h1><p>Personnalisez votre espace RE:START.</p></div></div><div className="settings-panel panel"><div className="settings-theme-row"><span>Apparence</span><p>Choisissez le thème qui vous convient.</p><ThemeToggle theme={theme} onToggle={()=>setTheme(theme==="dark"?"light":"dark")} compact /></div><div><span>Confidentialité</span><p>Les nouveaux souvenirs sont privés par défaut.</p><b>Privé</b></div></div></section>;
}
