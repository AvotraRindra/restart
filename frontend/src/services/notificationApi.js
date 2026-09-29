import { apiFetch } from "./api.js";

export const getNotifications = () => apiFetch("/api/notifications");
export const markNotificationRead = (id) => apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
export const markAllNotificationsRead = () => apiFetch("/api/notifications/read-all", { method: "PATCH" });
