# API souvenirs utilisée

Base : `http://localhost:5000` ou `VITE_API_URL`.

Toutes les requêtes protégées envoient :
`Authorization: Bearer <token>`

Le token est lu depuis `localStorage.getItem("token")`.

## Routes
- POST `/api/memories` — création texte JSON ou vocal FormData
- GET `/api/memories/mine` — souvenirs personnels
- GET `/api/memories/shared` — souvenirs publics
- GET `/api/memories/:id` — détail
- PATCH `/api/memories/:id/access` — `private` / `public`
- DELETE `/api/memories/:id` — suppression

Pour l'audio, `audio_url` est préfixé automatiquement par l'URL de l'API.
