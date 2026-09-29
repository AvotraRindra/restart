# RE:START / Memories

Version intégrée après fusion des branches frontend et du backend V2.

## Fonctionnalités branchées

- Landing page publique sans « Mes souvenirs ».
- Inscription et connexion JWT.
- Dashboard protégé après connexion.
- Création de souvenir texte ou vocal.
- Types : livre, vidéo, bande dessinée.
- Transcription vocale via Groq/Whisper côté backend.
- Upload de photos pour les souvenirs vidéo.
- Upload d'un personnage de référence pour une BD.
- Génération MNEMOS/Gemini et consultation du résultat.
- Mes souvenirs : recherche, lecture audio, public/privé, suppression.
- Souvenirs publics : réactions, commentaires, réponses, réactions aux commentaires.
- Messages privés/groupes, recherche d'utilisateurs et actualisation temps réel Socket.IO.
- Notifications et mise à jour temps réel.
- Mode clair/sombre.

## 1. Base MySQL

`backend/database.sql` contient le schéma complet V2 pour une nouvelle base. Il réinitialise les tables de l'application : sauvegardez vos données avant de l'importer si votre base contient déjà des données utiles.

## 2. Backend

```bash
cd backend
npm install
```

Copier `.env.example` vers `.env`, puis renseigner MySQL, JWT, Groq et Gemini.

```bash
npm run dev
```

Test : `GET http://localhost:5000/api/health`.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Dans `frontend/.env` :

```env
VITE_API_URL=http://localhost:5000
```

Si le frontend est sur un autre appareil du même réseau, remplacez `localhost` par l'IPv4 du PC backend, par exemple :

```env
VITE_API_URL=http://192.168.1.15:5000
```

Et dans `backend/.env`, autorisez l'origine Vite de l'autre PC :

```env
FRONTEND_URL=http://192.168.1.20:5173
```

Plusieurs origines peuvent être séparées par des virgules.

## Limite média actuelle

MNEMOS génère réellement le contenu structuré du livre, les cases/dialogues/prompts de la BD et le storyboard/narration de la vidéo. Le backend actuel ne fabrique pas encore automatiquement des illustrations IA finales pour les cases ni un fichier MP4 final. L'atelier affiche clairement ces résultats et permet de relancer la génération.
