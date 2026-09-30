import { API_URL, apiFetch, getToken } from "./api.js";

export const getConversations = () => apiFetch("/api/conversations");
export const createConversation = (payload) => apiFetch("/api/conversations", { method: "POST", body: JSON.stringify(payload) });
export const getMessages = (id) => apiFetch(`/api/conversations/${id}/messages`);
export function sendMessage(id, content, files = []) {
  const form = new FormData();
  if (content) form.append("content", content);
  files.forEach((file) => form.append("attachments", file));
  return apiFetch(`/api/conversations/${id}/messages`, { method: "POST", body: form });
}
export const addConversationMember = (id, userId) => apiFetch(`/api/conversations/${id}/members`, { method: "POST", body: JSON.stringify({ userId }) });
export const searchUsers = (q) => apiFetch(`/api/users/search?q=${encodeURIComponent(q)}`);

export async function downloadMessageAttachment(conversationId, attachment) {
  const response = await fetch(`${API_URL}/api/conversations/${conversationId}/attachments/${attachment.id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error("Téléchargement impossible.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = attachment.original_name || "piece-jointe";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
