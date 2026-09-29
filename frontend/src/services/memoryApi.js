import { apiFetch, getToken, mediaUrl } from "./api.js";

export const getMyMemories = () => apiFetch("/api/memories/mine");
export const getSharedMemories = () => apiFetch("/api/memories/shared");
export const getMemory = (id) => apiFetch(`/api/memories/${id}`);
export const getPublicMemory = (id) => apiFetch(`/api/public/memories/${id}`);
export const getPublicCreation = (id) => apiFetch(`/api/public/memories/${id}/creation`);

export function createTextMemory(memory) {
  return apiFetch("/api/memories", {
    method: "POST",
    body: JSON.stringify(memory),
  });
}

export function createVoiceMemory(memory) {
  const form = new FormData();
  form.append("memoryType", memory.memoryType);
  form.append("emotion", memory.emotion || "autre");
  form.append("title", memory.title || "Souvenir vocal");
  if (memory.date) form.append("date", memory.date);
  if (memory.time) form.append("time", memory.time);
  if (memory.location) form.append("location", memory.location);
  form.append("access", memory.access || "private");
  form.append("audio", memory.audioBlob, memory.audioName || "souvenir.webm");
  return apiFetch("/api/memories", { method: "POST", body: form });
}

export const updateMemoryAccess = (id, access) => apiFetch(`/api/memories/${id}/access`, {
  method: "PATCH",
  body: JSON.stringify({ access }),
});

export const deleteMemory = (id) => apiFetch(`/api/memories/${id}`, { method: "DELETE" });

export function uploadMemoryPhotos(id, files) {
  const form = new FormData();
  [...files].forEach((file) => form.append("photos", file));
  return apiFetch(`/api/memories/${id}/photos`, { method: "POST", body: form });
}

export function uploadMemoryAttachments(id, files) {
  const form = new FormData();
  [...files].forEach((file) => form.append("attachments", file));
  return apiFetch(`/api/memories/${id}/attachments`, { method: "POST", body: form });
}

export function addComicCharacter(id, name, image) {
  const form = new FormData();
  form.append("name", name);
  form.append("image", image);
  return apiFetch(`/api/memories/${id}/characters`, { method: "POST", body: form });
}

export const generateMemory = (id) => apiFetch(`/api/memories/${id}/generate`, { method: "POST" });
export const getCreation = (id) => apiFetch(`/api/memories/${id}/creation`);
export const audioUrl = mediaUrl;
export const imageUrl = mediaUrl;
export const hasApiSession = () => Boolean(getToken());
