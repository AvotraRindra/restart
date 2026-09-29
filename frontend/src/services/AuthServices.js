import { API_URL, apiFetch } from "./api.js";

export function registerUser(userData) {
  return apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(userData) });
}
export function loginUser(credentials) {
  return apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) });
}
export function getCurrentUser() { return apiFetch("/api/auth/me"); }
export function forgotPassword(email) {
  return apiFetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}
export function resetPassword(token, password) {
  return apiFetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
}
export function verifyEmail(token) {
  return apiFetch("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) });
}
export function resendVerification(email) {
  return apiFetch("/api/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) });
}
export function oauthUrl(provider) { return `${API_URL}/api/auth/oauth/${provider}`; }
