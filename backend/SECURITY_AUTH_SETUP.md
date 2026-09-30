# Authentification, e-mail et OAuth

## E-mail

RE:START envoie deux types de liens à durée limitée :
- vérification de compte : 30 minutes ;
- réinitialisation de mot de passe : 20 minutes.

Les tokens ne sont pas stockés en clair en base : seul leur SHA-256 est enregistré.

## Google

Créez un client OAuth Web et renseignez :

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.lien.de.frontend/api/auth/oauth/google/callback
```

Enregistrez exactement la même Redirect URI auprès de Google.

## Frontend/backend publics

```env
BACKEND_PUBLIC_URL=https://api.lien.de.frontend
FRONTEND_PUBLIC_URL=https://lien.de.frontend
FRONTEND_URL=https://lien.de.frontend
```

Pour un réseau local, ajoutez aussi l'origine Vite exacte à `FRONTEND_URL`.

## Renforcement de session

Chaque JWT de session embarque une version de session. Une réinitialisation du mot de passe incrémente cette version et rend les anciens JWT inutilisables, y compris pour Socket.IO. Google doit fournir une adresse e-mail vérifiée avant que RE:START n'ouvre une session.
