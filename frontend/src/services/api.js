function inferredApiUrl() {
  if (typeof window === "undefined") return "http://localhost:5000";
  const { protocol, hostname } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  if (isLocal || isIp) return `${protocol}//${hostname}:5000`;
  return `${protocol}//api.${hostname}`;
}

export const API_URL = (import.meta.env.VITE_API_URL || inferredApiUrl()).replace(/\/$/, "");

export function getToken() { return localStorage.getItem("token") || ""; }
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("memories-user");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  let payload;
  try { payload = await response.json(); }
  catch { payload = { success: false, message: "Réponse serveur invalide." }; }
  if (response.status === 401) clearSession();
  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || `Erreur HTTP ${response.status}`);
    error.status = response.status; error.details = payload?.details; error.payload = payload;
    throw error;
  }
  return payload;
}

export function mediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
