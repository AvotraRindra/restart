# Memories — frontend après connexion

Projet React + Vite correspondant à la partie située **après la connexion** du projet RE:START.

## Inclus
- chargement animé basé sur les émotions ;
- dashboard clair/sombre ;
- sidebar rétractable assortie au thème rouge / blanc / bleu-noir du site ;
- bouton de déconnexion en bas de la sidebar ;
- interrupteur clair/sombre animé avec soleil, lune et étoiles ;
- animations UX : transitions de page, entrée progressive des cartes, feedback des boutons, pulse des notifications, animation du micro, skeleton loading et toast de succès ;
- création d'un souvenir en 3 étapes : émotion → texte/vocal → date/heure/lieu/visibilité ;
- enregistrement micro via `MediaRecorder` ;
- intégration API souvenirs RE:START ;
- Mes souvenirs, Partagés, Messages, Notifications et Paramètres ;
- mode démo automatique si aucun token n'est présent.

## Installation
```bash
npm install
npm run dev
```

Pour vérifier la version de production :
```bash
npm run build
```

## Backend
Par défaut : `http://localhost:5000`.
Vous pouvez créer un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:5000
VITE_LOGIN_URL=/login
```

`VITE_LOGIN_URL` indique où rediriger l'utilisateur après avoir cliqué sur **Déconnexion**. Adaptez-le à la route de login créée par le membre de votre équipe responsable de l'authentification.

Le frontend lit le JWT avec :

```js
localStorage.getItem("token")
```

Il suppose donc que la partie Login de votre équipe a déjà stocké le token sous la clé `token`.

## Routes souvenirs utilisées
- `POST /api/memories`
- `GET /api/memories/mine`
- `GET /api/memories/shared`
- `GET /api/memories/:id`
- `PATCH /api/memories/:id/access`
- `DELETE /api/memories/:id`

> Les valeurs exactes autorisées par votre backend pour `emotion` doivent correspondre à celles utilisées dans `src/pages/NewMemoryWizard.jsx`. Ajustez ce tableau si le backend utilise d'autres valeurs.

## Notes d'intégration
- Le site commence **après authentification** : aucune page login/register n'est incluse.
- Sans token, les pages de souvenirs utilisent des données de démonstration afin de permettre le travail frontend hors connexion backend.
- Le bouton de déconnexion supprime les données de session locales puis redirige vers `VITE_LOGIN_URL`.
- Le thème choisi est conservé dans `localStorage` sous `memories-theme`.

## Nouveauté — Atelier créatif

La navigation contient maintenant **Atelier créatif**. Il fonctionne entièrement côté frontend pour la maquette :

- transformation d'un souvenir en **BD** ;
- création d'un **livre souvenir** ;
- transformation en **poésie** ;
- nombreux menus de personnalisation et aperçu en direct ;
- seulement **3 styles par format** pour garder l'expérience claire ;
- enregistrement local des créations dans `localStorage` (`memories-creations`).

Les routes backend dédiées à ces créations ne font pas encore partie du contrat API fourni. L'interface est donc prête pour une future intégration sans modifier l'expérience utilisateur.
