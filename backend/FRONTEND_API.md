# CONTRAT API FRONTEND — RE:START

Base locale : `http://localhost:5000`

Toutes les routes protégées utilisent :

```http
Authorization: Bearer <token>
```

Réponse standard :

```json
{ "success": true, "message": "...", "data": {} }
```

Erreur :

```json
{ "success": false, "message": "...", "details": null }
```

## 1. AUTH

### POST `/api/auth/register`
Public.

Body JSON :
```json
{
  "nom": "Rindra",
  "email": "rindra@example.com",
  "password": "secret123",
  "sexe": "homme",
  "dateNaissance": "2006-05-20"
}
```

Réponse 201 :
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "nom": "Rindra", "email": "rindra@example.com" },
    "token": "JWT..."
  }
}
```

### POST `/api/auth/login`
Body :
```json
{ "email": "rindra@example.com", "password": "secret123" }
```
Retourne `user` + `token`.

### GET `/api/auth/me`
Protégé. Retourne l'utilisateur connecté.

## 2. UTILISATEURS

### GET `/api/users/search?q=rin`
Protégé. Sert à rechercher quelqu'un pour démarrer une discussion ou l'ajouter à un groupe.

## 3. SOUVENIRS

### POST `/api/memories`
Protégé.

#### Souvenir écrit
`Content-Type: application/json`

```json
{
  "emotion": "joyeux",
  "title": "Victoire WebCup",
  "text": "Nous avons gagné...",
  "date": "2042-11-08",
  "time": "21:30:00",
  "location": "Antananarivo",
  "access": "private"
}
```

`access` peut être omis : **private par défaut**.

#### Souvenir vocal + transcription automatique
`Content-Type: multipart/form-data`

Champs FormData :
```text
emotion = joyeux
title = Notre victoire
date = 2042-11-08
time = 21:30:00
location = Antananarivo
access = private
audio = <Blob/File audio>
```

Le frontend **n'envoie pas la transcription**. Le backend :
1. reçoit le fichier ;
2. conserve le vocal original ;
3. l'envoie au Speech-to-Text ;
4. place automatiquement le texte dans `text_content`;
5. retourne le souvenir avec `audio_url` et `text_content`.

Exemple React :
```js
const form = new FormData();
form.append("emotion", "joyeux");
form.append("date", "2042-11-08");
form.append("audio", audioBlob, "souvenir.webm");

await fetch(`${API}/api/memories`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: form
});
```

### GET `/api/memories/mine`
Mes souvenirs, privés et publics.

### GET `/api/memories/shared`
Fil de tous les souvenirs publics.

### GET `/api/memories/:id`
Détail. Accessible au propriétaire ou si public.

### PATCH `/api/memories/:id/access`
```json
{ "access": "public" }
```
Pour retirer du partage :
```json
{ "access": "private" }
```

### DELETE `/api/memories/:id`
Supprime son propre souvenir.

## 4. RÉACTIONS

### POST `/api/memories/:id/reactions`
```json
{ "type": "love" }
```
Types :
`like | love | support | wow | sad`

Même réaction une deuxième fois = retrait. Une autre réaction = modification.

Le propriétaire reçoit immédiatement l'événement Socket.IO `notification:new`.

## 5. COMMENTAIRES

### GET `/api/memories/:id/comments`
Liste commentaires + réponses.

### POST `/api/memories/:id/comments`
Commentaire :
```json
{ "content": "Très beau souvenir !" }
```

Réponse à un commentaire :
```json
{
  "content": "Merci beaucoup !",
  "parentId": 15
}
```

### POST `/api/comments/:commentId/reactions`
```json
{ "type": "love" }
```

## 6. NOTIFICATIONS

### GET `/api/notifications`
50 dernières notifications.

### PATCH `/api/notifications/:id/read`
Marque une notification comme lue.

## 7. DISCUSSIONS

### POST `/api/conversations`
Discussion privée :
```json
{
  "type": "private",
  "memberIds": [5]
}
```

Groupe :
```json
{
  "type": "group",
  "name": "Team RE:START",
  "memberIds": [2,5,9]
}
```

### GET `/api/conversations`
Toutes mes discussions.

### GET `/api/conversations/:id/messages`
Historique des messages.

### POST `/api/conversations/:id/messages`
```json
{ "content": "Salut 👋" }
```

La réponse est également envoyée en temps réel avec `message:new`.

### POST `/api/conversations/:id/members`
```json
{ "userId": 12 }
```

## 8. SOCKET.IO

Installation frontend :
```bash
npm install socket.io-client
```

Connexion React :
```js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token }
});
```

### Événements FRONTEND → BACKEND

Rejoindre une conversation :
```js
socket.emit("conversation:join", { conversationId: 7 }, (result) => {
  console.log(result);
});
```

Quitter :
```js
socket.emit("conversation:leave", { conversationId: 7 });
```

Utilisateur écrit :
```js
socket.emit("typing:start", { conversationId: 7 });
```

Fin de saisie :
```js
socket.emit("typing:stop", { conversationId: 7 });
```

**Important :** pour sauvegarder un message en base, utilisez `POST /api/conversations/:id/messages`.
Socket.IO sert ensuite à pousser immédiatement ce message aux clients connectés.

### Événements BACKEND → FRONTEND

Nouveau message :
```js
socket.on("message:new", (message) => {
  // ajouter message dans l'interface sans recharger
});
```

Payload :
```json
{
  "id": 54,
  "conversationId": 7,
  "senderId": 2,
  "content": "Salut 👋",
  "createdAt": "2042-11-08T18:00:00.000Z"
}
```

Nouvelle notification :
```js
socket.on("notification:new", (notification) => {
  // afficher toast + augmenter badge
});
```

Types :
```text
memory_reaction
memory_comment
comment_reply
comment_reaction
```

Utilisateur en train d'écrire :
```js
socket.on("typing:start", ({ conversationId, userId }) => {});
socket.on("typing:stop", ({ conversationId, userId }) => {});
```

## 9. AUDIO

Pour lire le vocal :
```jsx
<audio controls src={`${API}${memory.audio_url}`} />
```

Exemple :
`memory.audio_url = /uploads/audio/....webm`

## 10. CODES HTTP À GÉRER

- `200` succès
- `201` création réussie
- `400` données invalides
- `401` non connecté / JWT expiré
- `403` accès interdit
- `404` introuvable
- `409` conflit (ex. email déjà utilisé)
- `413` fichier trop gros
- `502` service de transcription indisponible
- `500` erreur serveur

---

# V3 — Authentification, profil, pièces jointes et accès public

## Authentification sécurisée

### `POST /api/auth/verify-email`
Vérifie une adresse après inscription.

```json
{ "token": "TOKEN_RECU_PAR_EMAIL" }
```

### `POST /api/auth/resend-verification`

```json
{ "email": "utilisateur@example.com" }
```

### `POST /api/auth/forgot-password`
La réponse reste volontairement générique afin de ne pas révéler si un compte existe.

```json
{ "email": "utilisateur@example.com" }
```

### `POST /api/auth/reset-password`

```json
{
  "token": "TOKEN_RECU_PAR_EMAIL",
  "password": "NouveauMotDePasse123"
}
```

Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.

### OAuth Google

```text
GET /api/auth/oauth/google
GET /api/auth/oauth/google/callback
```

Le frontend ouvre `/api/auth/oauth/google`. Après succès, le backend redirige vers :

```text
/oauth/callback#token=JWT
```

Seules les adresses Google vérifiées sont acceptées.

### OAuth GitHub

```text
GET /api/auth/oauth/github
GET /api/auth/oauth/github/callback
```

Une adresse e-mail GitHub vérifiée est exigée.

## Profil utilisateur

### `PATCH /api/users/me`

```json
{
  "nom": "Nouveau nom",
  "bio": "Quelques mots sur moi",
  "sexe": "autre",
  "dateNaissance": "2005-06-15"
}
```

### `POST /api/users/me/photo`
`multipart/form-data` :

```text
photo = fichier image
```

## Pièces jointes d'un souvenir

### `POST /api/memories/:id/attachments`
`multipart/form-data` avec plusieurs champs `attachments` (maximum 8).

Formats prévus : image, vidéo, audio, PDF, texte/Markdown, DOC/DOCX et XLS/XLSX. Taille maximale par fichier : 35 Mo.

## Visualisation publique sans connexion

Lorsqu'un souvenir possède `access_level = public`, ces routes ne nécessitent aucun JWT :

```text
GET /api/public/memories/:id
GET /api/public/memories/:id/creation
```

La deuxième route retourne le souvenir, les photos, personnages BD, pièces jointes et la création MNEMOS.

Lien frontend partageable :

```text
/memory/:id
```

## Présence Socket.IO

Le serveur envoie :

```text
presence:list
presence:update
```

Le client peut demander la liste des utilisateurs connectés :

```js
socket.emit("presence:get", response => {
  console.log(response.userIds);
});
```

Les événements de message existants restent :

```text
message:new
typing:start
typing:stop
notification:new
```

## Plusieurs clés Gemini

Le backend accepte soit :

```env
GEMINI_API_KEYS=cle1,cle2,cle3,cle4,cle5
```

soit :

```env
GEMINI_API_KEY_1=...
GEMINI_API_KEY_2=...
GEMINI_API_KEY_3=...
GEMINI_API_KEY_4=...
GEMINI_API_KEY_5=...
```

Ces clés restent exclusivement côté backend. Le service de génération essaie les clés suivantes en cas d'erreur temporaire ou de quota.
