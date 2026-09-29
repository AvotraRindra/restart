# RE:START Backend

Backend MVC Node.js + Express + MySQL pour le projet WebCup RE:START.

## Inclus

- Inscription / connexion JWT
- Mots de passe hachés avec bcrypt
- Recherche d'utilisateurs
- Création de souvenirs texte ou vocal
- Audio conservé sur le serveur
- Souvenir privé par défaut
- Publication / retour en privé
- Fil des souvenirs partagés
- Réactions aux souvenirs
- Commentaires + réponses
- Réactions aux commentaires
- Notifications temps réel avec Socket.IO
- Discussions privées et groupes
- Messages

## Installation

1. Importer `database.sql` dans MySQL.
2. Copier `.env.example` vers `.env`.
3. Configurer MySQL dans `.env`.
4. Installer puis lancer :

```bash
npm install
npm run dev
```

API locale : `http://localhost:5000`

## Authentification

Après `/api/auth/login`, envoyer le token :

```http
Authorization: Bearer VOTRE_TOKEN
```

## Routes principales

| Méthode | Route | Description |
|---|---|---|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| GET | /api/auth/me | Profil connecté |
| GET | /api/users/search?q=... | Chercher un utilisateur |
| POST | /api/memories | Créer un souvenir |
| GET | /api/memories/mine | Mes souvenirs |
| GET | /api/memories/shared | Souvenirs publics |
| GET | /api/memories/:id | Détail |
| PATCH | /api/memories/:id/access | privé/public |
| DELETE | /api/memories/:id | Supprimer |
| POST | /api/memories/:id/reactions | Réagir |
| GET | /api/memories/:id/comments | Commentaires |
| POST | /api/memories/:id/comments | Commenter/répondre |
| POST | /api/comments/:commentId/reactions | Réagir commentaire |
| GET | /api/notifications | Notifications |
| PATCH | /api/notifications/:id/read | Marquer lue |
| GET | /api/conversations | Discussions |
| POST | /api/conversations | Créer discussion/groupe |
| GET | /api/conversations/:id/messages | Messages |
| POST | /api/conversations/:id/messages | Envoyer message |
| POST | /api/conversations/:id/members | Ajouter membre |

## Créer un souvenir texte

`POST /api/memories`, JSON :

```json
{
  "emotion": "joyeux",
  "title": "Notre victoire",
  "text": "Aujourd'hui nous avons gagné la WebCup...",
  "date": "2042-11-08",
  "time": "21:30:00",
  "location": "Antananarivo",
  "access": "private"
}
```

## Créer un souvenir vocal

Envoyer `multipart/form-data` sur `POST /api/memories` :

- `emotion`: joyeux
- `date`: 2042-11-08
- `location`: Antananarivo
- `audio`: fichier audio
- `text`: transcription si déjà disponible côté service de transcription

Le fichier vocal est conservé dans `src/uploads/audio/`.

### Important sur la transcription

Ce backend prépare le stockage du vocal et de sa transcription, mais ne prétend pas transcrire localement l'audio. Pour la WebCup, branchez votre service Speech-to-Text dans `memoryController.create`, puis stockez le texte retourné dans `text_content`. Le fichier audio original reste conservé.

## Partager un souvenir

```json
PATCH /api/memories/12/access
{ "access": "public" }
```

Pour le remettre privé :

```json
{ "access": "private" }
```

## Répondre à un commentaire

```json
POST /api/memories/12/comments
{
  "content": "Je m'en souviens aussi !",
  "parentId": 8
}
```

## Créer une discussion privée

```json
POST /api/conversations
{
  "type": "private",
  "memberIds": [5]
}
```

## Créer un groupe

```json
POST /api/conversations
{
  "type": "group",
  "name": "Équipe WebCup",
  "memberIds": [2, 5, 9]
}
```

## À faire ensuite pour une version compétition

- WebSocket / Socket.IO pour messages et notifications temps réel
- Service Speech-to-Text pour transcription vocale
- Upload images/vidéos des souvenirs
- MNEMOS : analyse intelligente des souvenirs
- limitation métier à 100 souvenirs
- validation plus stricte avec Zod/Joi
- stockage cloud des médias en production


## Temps réel + transcription automatique

Cette version ajoute Socket.IO et une transcription automatique via OpenAI Speech-to-Text.
Renseignez `OPENAI_API_KEY` dans `.env`.

Le contrat complet à remettre à l'équipe React est dans `FRONTEND_API.md`.
