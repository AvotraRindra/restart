export const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("token") || "";
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData) && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API}${path}`, { ...options, headers });
  let payload = null;
  try { payload = await response.json(); } catch { payload = { success: false, message: "Réponse serveur invalide." }; }
  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || `Erreur HTTP ${response.status}`);
    error.status = response.status;
    error.details = payload?.details;
    throw error;
  }
  return payload;
}
