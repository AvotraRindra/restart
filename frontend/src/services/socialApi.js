import { apiFetch } from "./api.js";

export const reactToMemory = (memoryId, type = "like") => apiFetch(`/api/memories/${memoryId}/reactions`, {
  method: "POST",
  body: JSON.stringify({ type }),
});
export const getComments = (memoryId) => apiFetch(`/api/memories/${memoryId}/comments`);
export const addComment = (memoryId, content, parentId = null) => apiFetch(`/api/memories/${memoryId}/comments`, {
  method: "POST",
  body: JSON.stringify({ content, parentId }),
});
export const reactToComment = (commentId, type = "like") => apiFetch(`/api/comments/${commentId}/reactions`, {
  method: "POST",
  body: JSON.stringify({ type }),
});
