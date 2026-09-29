import { useEffect, useMemo, useState } from "react";
import AppLayout from "./components/AppLayout.jsx";
import LoadingPage from "./components/LoadingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MemoriesPage from "./pages/MemoriesPage.jsx";
import SharedPage from "./pages/SharedPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import NewMemoryWizard from "./pages/NewMemoryWizard.jsx";
import CreativeStudioPage from "./pages/CreativeStudioPage.jsx";
import { getMyMemories, hasApiSession } from "./services/memoryApi.js";

const defaultUser={name:"Vigny",email:"vigny@example.com"};

export default function App(){
  const [showLoader,setShowLoader]=useState(()=>sessionStorage.getItem("memories-loader-seen")!=="1");
  const [page,setPage]=useState("dashboard");
  const [theme,setTheme]=useState(()=>localStorage.getItem("memories-theme")||"light");
  const [user]=useState(()=>{try{return JSON.parse(localStorage.getItem("user"))||JSON.parse(localStorage.getItem("memories-user"))||defaultUser}catch{return defaultUser}});
  const [memories,setMemories]=useState([]);
  const [refreshKey,setRefreshKey]=useState(0);
  const [toast,setToast]=useState("");

  useEffect(()=>localStorage.setItem("memories-theme",theme),[theme]);
  useEffect(()=>{
    if(!hasApiSession()){
      setMemories(JSON.parse(localStorage.getItem("memories-demo-items")||"[]"));
      return;
    }
    getMyMemories().then(r=>{
      const d=r?.data?.memories??r?.data;
      if(Array.isArray(d))setMemories(d);
    }).catch(()=>{});
  },[refreshKey]);

  const doneLoading=()=>{sessionStorage.setItem("memories-loader-seen","1");setShowLoader(false)};
  const handleSaved=m=>{
    setMemories(xs=>[m,...xs]);
    setRefreshKey(k=>k+1);
    setPage("dashboard");
    setToast("Souvenir sauvegardé avec succès ♥");
    setTimeout(()=>setToast(""),3000);
  };

  const handleLogout=()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("memories-user");
    sessionStorage.removeItem("memories-loader-seen");
    const loginUrl=import.meta.env.VITE_LOGIN_URL || "/login";
    window.location.assign(loginUrl);
  };

  const content=useMemo(()=>{
    if(page==="dashboard")return <Dashboard user={user} memories={memories} setPage={setPage}/>;
    if(page==="memories")return <MemoriesPage refreshKey={refreshKey} onCreate={()=>setPage("new-memory")}/>;
    if(page==="shared")return <SharedPage/>;
    if(page==="messages")return <MessagesPage/>;
    if(page==="notifications")return <NotificationsPage/>;
    if(page==="settings")return <SettingsPage theme={theme} setTheme={setTheme}/>;
    if(page==="studio")return <CreativeStudioPage memories={memories} user={user} setPage={setPage}/>;
    if(page==="new-memory")return <NewMemoryWizard onCancel={()=>setPage("dashboard")} onSaved={handleSaved}/>;
    return <Dashboard user={user} memories={memories} setPage={setPage}/>;
  },[page,user,memories,refreshKey,theme]);

  if(showLoader)return <LoadingPage theme={theme} onDone={doneLoading}/>;

  return <>
    <AppLayout page={page} setPage={setPage} theme={theme} setTheme={setTheme} user={user} onLogout={handleLogout}>
      <div key={page} className="page-transition">{content}</div>
    </AppLayout>
    {toast&&<div className="toast-success">{toast}</div>}
  </>;
}
