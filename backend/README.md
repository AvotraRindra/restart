# RE:START Backend V3

Backend Node.js + Express + MySQL + Socket.IO du projet WebCup RE:START.

## Fonctionnalités

- JWT + bcrypt ;
- vérification de l'adresse e-mail ;
- mot de passe oublié / réinitialisation par e-mail ;
- OAuth Google avec e-mail vérifié ;
- révocation des anciennes sessions après changement de mot de passe ;
- profil utilisateur : nom, bio, photo, sexe et date de naissance ;
- souvenirs texte ou vocal, transcription Groq/Whisper ;
- Livre / BD / Vidéo via MNEMOS/Gemini ;
- rotation automatique sur jusqu'à 5 clés Gemini ;
- souvenirs privés/publics et lecture publique sans authentification ;
- pièces jointes ;
- réactions, commentaires et notifications ;
- discussions privées/groupes, présence en ligne, typing et messages Socket.IO ;
- migration V3 automatique non destructive pour une base V2 existante.

## Installation

Pour une base neuve, importer `database.sql`. Pour une base existante, faites d'abord une sauvegarde : `AUTO_MIGRATE=true` complète automatiquement le schéma au démarrage. `migration_v3.sql` est également fourni pour une migration manuelle.

```bash
cp .env.example .env
npm install
node src/server.js
```

API : `http://localhost:5000` par défaut.

## Variables importantes

Configurez dans `.env` :

- `DB_*`, `JWT_SECRET`, `FRONTEND_URL` ;
- `GROQ_API_KEY` ;
- `GEMINI_API_KEY` ou `GEMINI_API_KEY_1..5` ;
- `SMTP_*` pour les e-mails ;
- identifiants OAuth Google si ces connexions sont activées.

Ne poussez jamais `.env` dans Git.

## Auth V3

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/oauth/google
```

Les routes protégées attendent :

```http
Authorization: Bearer VOTRE_JWT
```

## Profil

```text
GET   /api/users/search?q=...
PATCH /api/users/me
POST  /api/users/me/photo
```

## Souvenirs

```text
POST   /api/memories
GET    /api/memories/mine
GET    /api/memories/shared
GET    /api/memories/:id
PATCH  /api/memories/:id/access
DELETE /api/memories/:id
POST   /api/memories/:id/photos
POST   /api/memories/:id/characters
POST   /api/memories/:id/attachments
POST   /api/memories/:id/generate
GET    /api/memories/:id/creation
```

Accès public sans JWT si le souvenir est publié :

```text
GET /api/public/memories/:id
GET /api/public/memories/:id/creation
```

## Social / temps réel

```text
POST /api/memories/:id/reactions
GET  /api/memories/:id/comments
POST /api/memories/:id/comments
POST /api/comments/:commentId/reactions
GET  /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
GET  /api/conversations
POST /api/conversations
GET  /api/conversations/:id/messages
POST /api/conversations/:id/messages
POST /api/conversations/:id/members
```

Socket.IO fournit notamment `message:new`, `notification:new`, `presence:list`, `presence:update`, `typing:start` et `typing:stop`.

Voir `FRONTEND_API.md` et `SECURITY_AUTH_SETUP.md` pour les détails d'intégration.
