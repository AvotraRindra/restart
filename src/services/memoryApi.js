import { API, apiFetch, getToken } from "./api.js";

export async function getMyMemories() {
  return apiFetch("/api/memories/mine");
}

export async function getSharedMemories() {
  return apiFetch("/api/memories/shared");
}

export async function getMemory(id) {
  return apiFetch(`/api/memories/${id}`);
}

export async function createTextMemory(memory) {
  return apiFetch("/api/memories", {
    method: "POST",
    body: JSON.stringify(memory),
  });
}

export async function createVoiceMemory(memory) {
  const form = new FormData();
  form.append("emotion", memory.emotion);
  if (memory.title) form.append("title", memory.title);
  if (memory.date) form.append("date", memory.date);
  if (memory.time) form.append("time", memory.time);
  if (memory.location) form.append("location", memory.location);
  form.append("access", memory.access || "private");
  form.append("audio", memory.audioBlob, "souvenir.webm");

  return apiFetch("/api/memories", { method: "POST", body: form });
}

export async function updateMemoryAccess(id, access) {
  return apiFetch(`/api/memories/${id}/access`, {
    method: "PATCH",
    body: JSON.stringify({ access }),
  });
}

export async function deleteMemory(id) {
  return apiFetch(`/api/memories/${id}`, { method: "DELETE" });
}

export function audioUrl(path) {
  return path ? `${API}${path}` : "";
}

export function hasApiSession() {
  return Boolean(getToken());
}
