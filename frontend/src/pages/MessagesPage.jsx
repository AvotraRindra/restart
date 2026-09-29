import { useEffect, useMemo, useRef, useState } from "react";
import { createConversation, getConversations, getMessages, searchUsers, sendMessage } from "../services/conversationApi.js";
import { getSocket } from "../services/socketApi.js";
import { imageUrl } from "../services/memoryApi.js";

export default function MessagesPage({ user, initialConversationId = null }) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(initialConversationId || null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [conversationType, setConversationType] = useState("private");
  const [groupName, setGroupName] = useState("");
  const [typingUser, setTypingUser] = useState(false);
  const [onlineIds, setOnlineIds] = useState(() => new Set());
  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const bottomRef = useRef(null);

  const selected = useMemo(() => conversations.find((c) => Number(c.id) === Number(selectedId)), [conversations, selectedId]);
  const onlineCount = [...onlineIds].filter((id) => Number(id) !== Number(user?.id)).length;

  function conversationIsOnline(c) {
    if (!c) return false;
    if (c.type === "private") return onlineIds.has(Number(c.other_user_id));
    const ids = String(c.member_ids || "").split(",").map(Number).filter(Boolean).filter((id) => id !== Number(user?.id));
    return ids.some((id) => onlineIds.has(id));
  }

  async function loadConversations() {
    try {
      const r = await getConversations();
      const list = Array.isArray(r?.data) ? r.data : [];
      setConversations(list);
      setSelectedId((current) => {
        if (initialConversationId && list.some((c) => Number(c.id) === Number(initialConversationId))) return initialConversationId;
        if (current && list.some((c) => Number(c.id) === Number(current))) return current;
        return list[0]?.id || null;
      });
    } catch (e) { setError(e.message); }
  }

  async function loadMessages(id = selectedId) {
    if (!id) { setMessages([]); return; }
    try { const r = await getMessages(id); setMessages(Array.isArray(r?.data) ? r.data : []); }
    catch (e) { setError(e.message); }
  }

  useEffect(() => { loadConversations(); const timer = window.setInterval(loadConversations, 12000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (initialConversationId) setSelectedId(initialConversationId); }, [initialConversationId]);
  useEffect(() => { if (!selectedId) return; loadMessages(selectedId); }, [selectedId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, selectedId]);

  useEffect(() => {
    let mounted = true; let socket;
    getSocket().then((s) => {
      if (!mounted) return;
      socket = s; socketRef.current = s;
      if (selectedId) s.emit("conversation:join", { conversationId: selectedId });
      s.emit("presence:get", (r) => { if (r?.userIds) setOnlineIds(new Set(r.userIds.map(Number))); });
      const onPresenceList = (data) => setOnlineIds(new Set((data?.userIds || []).map(Number)));
      const onPresenceUpdate = ({ userId, online }) => setOnlineIds((prev) => { const next = new Set(prev); online ? next.add(Number(userId)) : next.delete(Number(userId)); return next; });
      const onMessage = (message) => {
        if (Number(message.conversation_id) === Number(selectedId)) setMessages((xs) => xs.some((x) => Number(x.id) === Number(message.id)) ? xs : [...xs, message]);
        loadConversations();
      };
      const onTyping = (data) => { if (Number(data.conversationId) === Number(selectedId) && Number(data.userId) !== Number(user?.id)) setTypingUser(true); };
      const onTypingStop = (data) => { if (Number(data.conversationId) === Number(selectedId)) setTypingUser(false); };
      s.on("presence:list", onPresenceList); s.on("presence:update", onPresenceUpdate); s.on("message:new", onMessage); s.on("typing:start", onTyping); s.on("typing:stop", onTypingStop);
      s.__restartMessageHandlers = { onPresenceList, onPresenceUpdate, onMessage, onTyping, onTypingStop };
    }).catch(() => {});
    return () => {
      mounted = false;
      if (socket?.__restartMessageHandlers) {
        const h=socket.__restartMessageHandlers; socket.off("presence:list",h.onPresenceList); socket.off("presence:update",h.onPresenceUpdate); socket.off("message:new",h.onMessage); socket.off("typing:start",h.onTyping); socket.off("typing:stop",h.onTypingStop);
      }
      if (socket && selectedId) socket.emit("conversation:leave", { conversationId: selectedId });
    };
  }, [selectedId, user?.id]);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) { setResults([]); return; }
    const t = window.setTimeout(() => searchUsers(q).then((r) => setResults(Array.isArray(r?.data) ? r.data : [])).catch((e) => setError(e.message)), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  async function submitMessage(e) {
    e.preventDefault(); if (!draft.trim() || !selectedId) return;
    const content = draft.trim(); setDraft("");
    try {
      const r = await sendMessage(selectedId, content);
      if (r?.data) setMessages((xs) => xs.some((x) => Number(x.id) === Number(r.data.id)) ? xs : [...xs, r.data]);
      socketRef.current?.emit("typing:stop", { conversationId: selectedId }); loadConversations();
    } catch (e2) { setDraft(content); setError(e2.message); }
  }

  function toggleUser(item) {
    if (conversationType === "private") return setSelectedUsers([item]);
    setSelectedUsers((xs) => xs.some((x) => x.id === item.id) ? xs.filter((x) => x.id !== item.id) : [...xs, item]);
  }

  async function createNewConversation(e) {
    e.preventDefault();
    if (conversationType === "private" && selectedUsers.length !== 1) return setError("Choisissez une personne.");
    if (conversationType === "group" && selectedUsers.length < 1) return setError("Ajoutez au moins une personne au groupe.");
    try {
      const r = await createConversation({ type: conversationType, name: conversationType === "group" ? (groupName.trim() || "Nouveau groupe") : undefined, memberIds: selectedUsers.map((x) => x.id) });
      setShowCreate(false); setSelectedUsers([]); setSearch(""); setGroupName(""); await loadConversations(); if (r?.data?.id) setSelectedId(r.data.id);
    } catch (e2) { setError(e2.message); }
  }

  const displayName = selected?.display_name || selected?.name || (selected ? `Conversation #${selected.id}` : "Discussion");
  const selectedOnline = conversationIsOnline(selected);

  return <section className="page-shell messages-page">
    <div className="page-head"><div><span>DISCUSSIONS · {onlineCount} EN LIGNE</span><h1>Messages</h1><p>Échangez en temps réel et voyez qui est actuellement actif.</p></div><button className="primary-btn" onClick={() => setShowCreate(true)}>+ Nouvelle discussion</button></div>
    {error && <div className="inline-alert">{error}<button onClick={() => setError("")}>×</button></div>}
    <div className="chat-shell">
      <aside className="chat-list"><div className="chat-search">{conversations.length} discussion(s) · <b>{onlineCount} actif(s)</b></div>{conversations.length === 0 ? <p className="muted">Aucune discussion.</p> : conversations.map((c) => {
        const online=conversationIsOnline(c); const photo=c.display_photo ? imageUrl(c.display_photo) : "";
        return <button className={Number(c.id) === Number(selectedId) ? "active" : ""} key={c.id} onClick={() => setSelectedId(c.id)}><span className="chat-avatar">{photo ? <img src={photo} alt=""/> : (c.display_name || c.name || "D")[0].toUpperCase()}{online && <i className="online-dot"/>}</span><div><strong>{c.display_name || c.name || `Discussion #${c.id}`}</strong><small>{online ? "En ligne" : c.last_message || (c.type === "group" ? "Groupe" : "Nouvelle conversation")}</small></div></button>;
      })}</aside>
      <div className="chat-panel">{selected ? <><header><span className="chat-avatar">{selected.display_photo ? <img src={imageUrl(selected.display_photo)} alt=""/> : displayName[0]?.toUpperCase()}{selectedOnline && <i className="online-dot"/>}</span><div><strong>{displayName}</strong><small>{typingUser ? "écrit…" : selectedOnline ? "En ligne" : selected.type === "group" ? `${selected.members_count || ""} membres` : "Hors ligne"}</small></div></header><div className="chat-messages">{messages.length === 0 ? <p className="chat-empty">Aucun message. Envoyez le premier 👋</p> : messages.map((m) => { const mine=Number(m.sender_id)===Number(user?.id); return <div key={m.id} className={`message-wrap ${mine?"mine":"other"}`}><small>{mine?"Vous":m.sender_name}</small><p className={mine?"sent":"received"}>{m.content}</p></div>; })}<div ref={bottomRef}/></div><form className="chat-compose" onSubmit={submitMessage}><span/><input value={draft} onChange={(e)=>{setDraft(e.target.value);socketRef.current?.emit("typing:start",{conversationId:selectedId});window.clearTimeout(typingTimer.current);typingTimer.current=window.setTimeout(()=>socketRef.current?.emit("typing:stop",{conversationId:selectedId}),900)}} placeholder="Écrire un message…"/><button className="send" type="submit" disabled={!draft.trim()}>➤</button></form></> : <div className="empty-state"><strong>Sélectionnez une discussion.</strong></div>}</div>
    </div>
    {showCreate && <div className="modal-backdrop" onMouseDown={(e)=>e.currentTarget===e.target&&setShowCreate(false)}><form className="conversation-modal panel" onSubmit={createNewConversation}><div className="modal-head"><div><small>NOUVELLE DISCUSSION</small><h2>Choisir les participants</h2></div><button type="button" onClick={()=>setShowCreate(false)}>×</button></div><div className="conversation-type-row"><button type="button" className={conversationType==="private"?"active":""} onClick={()=>{setConversationType("private");setSelectedUsers([])}}>Privée</button><button type="button" className={conversationType==="group"?"active":""} onClick={()=>{setConversationType("group");setSelectedUsers([])}}>Groupe</button></div>{conversationType==="group"&&<input className="modal-input" value={groupName} onChange={(e)=>setGroupName(e.target.value)} placeholder="Nom du groupe"/>}<input className="modal-input" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Rechercher par nom ou email…" autoFocus/><div className="user-search-results">{results.map((u)=>{const active=onlineIds.has(Number(u.id));return <button type="button" key={u.id} className={selectedUsers.some((x)=>x.id===u.id)?"selected":""} onClick={()=>toggleUser(u)}><span className="chat-avatar">{u.photo?<img src={imageUrl(u.photo)} alt=""/>:u.nom?.[0]||"U"}{active&&<i className="online-dot"/>}</span><div><strong>{u.nom}</strong><small>{active?"En ligne":u.email}</small></div><b>{selectedUsers.some((x)=>x.id===u.id)?"✓":"+"}</b></button>})}</div><div className="modal-actions"><span>{selectedUsers.length} sélectionné(s)</span><button className="primary-btn" type="submit">Créer la discussion</button></div></form></div>}
  </section>;
}
