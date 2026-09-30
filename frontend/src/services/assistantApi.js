import { apiFetch } from "./api.js";
export const chatWithMnemos = (message, history = []) => apiFetch("/api/assistant/chat", {
  method: "POST",
  body: JSON.stringify({ message, history }),
});
