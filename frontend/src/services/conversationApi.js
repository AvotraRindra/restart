import { apiFetch } from "./api.js";

export const getConversations = () => apiFetch("/api/conversations");
export const createConversation = (payload) => apiFetch("/api/conversations", { method: "POST", body: JSON.stringify(payload) });
export const getMessages = (id) => apiFetch(`/api/conversations/${id}/messages`);
export const sendMessage = (id, content) => apiFetch(`/api/conversations/${id}/messages`, { method: "POST", body: JSON.stringify({ content }) });
export const addConversationMember = (id, userId) => apiFetch(`/api/conversations/${id}/members`, { method: "POST", body: JSON.stringify({ userId }) });
export const searchUsers = (q) => apiFetch(`/api/users/search?q=${encodeURIComponent(q)}`);
