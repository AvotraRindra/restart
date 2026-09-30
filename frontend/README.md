# RE:START Frontend V3

Frontend React + Vite intégré : Landing Page, authentification et espace connecté.

## Installation

```bash
npm install
npm run dev
```

Pour rendre Vite accessible aux téléphones du même réseau :

```bash
npm run dev -- --host 0.0.0.0
```

Copiez `.env.example` vers `.env` :

```env
VITE_API_URL=http://localhost:5000
```

Sur un autre appareil du réseau, utilisez l'IPv4 du PC backend, par exemple `http://192.168.137.138:5000`.

## Fonctionnalités

- Landing Page sans accès « Mes souvenirs » avant authentification ;
- Login/Register + vérification e-mail ;
- mot de passe oublié et reset par e-mail ;
- Google OAuth ;
- redirection automatique vers le Dashboard si une session existe ;
- Dashboard et souvenirs récents directement ouvrables ;
- Mes souvenirs, partage public/privé et lien public `/memory/:id` ;
- visualisation Livre/BD/Vidéo ;
- lecteur Livre 3D en double page ;
- création texte/vocale et pièces jointes ;
- Atelier MNEMOS ;
- Partagés, réactions et commentaires ;
- Notifications cliquables ;
- Messages temps réel et présence « En ligne » ;
- Profil avec photo, nom, bio et préférences ;
- navigation responsive mobile avec accès aux fonctions principales.

## Session

Le JWT est conservé sous `localStorage.token`. Les routes `/login` et `/register` renvoient vers `/dashboard` tant que cette session est présente et valide. Le bouton Déconnexion supprime la session et ferme Socket.IO.

Les secrets Gemini, Groq, SMTP, Google ne doivent jamais être placés dans le frontend.
