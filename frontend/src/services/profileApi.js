import { apiFetch } from "./api.js";
export const updateProfile = (payload) => apiFetch("/api/users/me", { method: "PATCH", body: JSON.stringify(payload) });
export function updateProfilePhoto(file) {
  const form = new FormData();
  form.append("photo", file);
  return apiFetch("/api/users/me/photo", { method: "POST", body: form });
}
