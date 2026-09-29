const API_URL = import.meta.env.VITE_API_URL;


/* =========================================
   REGISTER
========================================= */

export async function registerUser(userData) {
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(userData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Erreur lors de l'inscription"
    );
  }

  return data;
}


/* =========================================
   LOGIN
========================================= */

export async function loginUser(credentials) {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(credentials),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Email ou mot de passe incorrect"
    );
  }

  return data;
}