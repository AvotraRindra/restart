import { useEffect, useMemo, useState } from "react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../services/notificationApi.js";
import { getSocket } from "../services/socketApi.js";

const labels = {
  memory_reaction: "a réagi à votre souvenir",
  memory_comment: "a commenté votre souvenir",
  comment_reply: "a répondu à votre commentaire",
  comment_reaction: "a réagi à votre commentaire",
  message: "vous a envoyé un message",
};

export default function NotificationsPage({ onOpenMemory, onOpenConversation }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const unread = useMemo(() => rows.filter((n) => !Number(n.is_read)).length, [rows]);

  async function load() {
    try { const r = await getNotifications(); setRows(Array.isArray(r?.data) ? r.data : []); }
    catch (e) { setError(e.message); }
  }

  useEffect(() => { load(); const timer = window.setInterval(load, 10000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    let socket;
    const handler = (notification) => setRows((xs) => xs.some((x) => Number(x.id) === Number(notification.id)) ? xs : [notification, ...xs]);
    getSocket().then((s) => { socket = s; s.on("notification:new", handler); }).catch(() => {});
    return () => socket?.off("notification:new", handler);
  }, []);

  async function readOne(n) {
    if (!Number(n.is_read)) {
      try { await markNotificationRead(n.id); setRows((xs) => xs.map((x) => x.id === n.id ? { ...x, is_read: 1 } : x)); }
      catch (e) { setError(e.message); }
    }
  }

  async function openNotification(n) {
    await readOne(n);
    if (n.type === "message" && n.conversation_id) return onOpenConversation?.(n.conversation_id);
    if (n.memory_id) return onOpenMemory?.(n.memory_id);
  }

  async function readAll() {
    try { await markAllNotificationsRead(); setRows((xs) => xs.map((x) => ({ ...x, is_read: 1 }))); }
    catch (e) { setError(e.message); }
  }

  const countType = (type) => rows.filter((n) => n.type === type).length;

  return <section className="page-shell">
    <div className="page-head"><div><span>ACTIVITÉ</span><h1>Notifications</h1><p>Cliquez sur une notification pour ouvrir directement le souvenir ou la discussion correspondante.</p></div><button className="primary-btn" disabled={!unread} onClick={readAll}>✓ Tout marquer comme lu</button></div>
    {error && <div className="inline-alert">{error}</div>}
    <div className="notification-page-grid">
      <div className="notification-list">{rows.length === 0 ? <div className="empty-state"><strong>Aucune notification.</strong></div> : rows.map((n) => <article onClick={() => openNotification(n)} onKeyDown={(e) => e.key === "Enter" && openNotification(n)} className={`notification-row ${!Number(n.is_read) ? "unread" : ""}`} key={n.id} role="button" tabIndex={0}><span className="avatar">{(n.actor_name || "N")[0]}</span><div><strong>{n.message || `${n.actor_name || "Un utilisateur"} ${labels[n.type] || "a interagi avec vous"}.`}</strong><small>{new Date(n.created_at).toLocaleString("fr-FR")}</small></div><button aria-label="Ouvrir">›</button></article>)}</div>
      <aside className="notification-summary panel"><h3>Résumé rapide</h3><div><strong>{unread}</strong><span>Non lues</span></div><div><strong>{countType("memory_reaction") + countType("comment_reaction")}</strong><span>Réactions</span></div><div><strong>{countType("memory_comment") + countType("comment_reply")}</strong><span>Commentaires</span></div><div><strong>{countType("message")}</strong><span>Messages</span></div></aside>
    </div>
  </section>;
}
