export const API_URL = "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] ??= "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let result;

  try {
    result = await response.json();
  } catch {
    result = {
      message: "Réponse invalide du serveur",
    };
  }

  if (response.status === 401) {
    localStorage.removeItem("token");
  }

  if (!response.ok) {
    const error = new Error(
      result.message || "Erreur API"
    );

    error.status = response.status;
    error.result = result;

    throw error;
  }

  return result;
}