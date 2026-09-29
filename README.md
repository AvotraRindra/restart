# RE:START — V3 intégré

Version intégrée du projet WebCup : React + Vite, Node.js/Express, MySQL, Socket.IO, Groq et Gemini/MNEMOS.

## Démarrage

### Backend

```bash
cd backend
npm install
node src/server.js
```

Au démarrage, `AUTO_MIGRATE=true` met à niveau une ancienne base RE:START sans supprimer les souvenirs existants. `migration_v3.sql` est fourni si vous préférez faire la migration manuellement.

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Copiez `frontend/.env.example` vers `frontend/.env` et renseignez `VITE_API_URL`.

## V3 — fonctionnalités ajoutées

- inscription avec vérification e-mail ;
- mot de passe oublié + lien de réinitialisation par e-mail ;
- connexion Google et GitHub ;
- routes Login/Register automatiquement inaccessibles tant qu'une session JWT valide existe ;
- page Profil : nom, bio, photo, sexe, date de naissance, thème ;
- page Paramètres nettoyée : aucune clé/API n'est affichée ;
- notifications cliquables vers le souvenir ou la discussion concernée ;
- lecteur de souvenir et URL publique `/memory/:id` pour les souvenirs publics ;
- souvenirs récents du Dashboard directement ouvrables ;
- lecteur de livre 3D en double page, avec perspective et navigation comme un vrai livre ;
- messagerie temps réel améliorée, présence/en ligne et auto-scroll ;
- pièces jointes de souvenir : images, vidéos, audio, PDF et documents ;
- navigation mobile transformée en barre basse pour garder toutes les fonctions accessibles ;
- rotation Gemini sur jusqu'à 5 clés ;
- Helmet, limitation de débit sur l'authentification, hash bcrypt, JWT, état OAuth signé ;
- révocation des anciennes sessions JWT après une réinitialisation de mot de passe ;
- Google/GitHub n'acceptent que des adresses e-mail vérifiées.

## Configuration e-mail

Le backend utilise SMTP. Exemple Gmail :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-adresse@gmail.com
SMTP_PASS=votre-mot-de-passe-application
MAIL_FROM=RE:START <votre-adresse@gmail.com>
```

Ne mettez jamais le mot de passe normal de votre compte dans Git. Utilisez les identifiants SMTP prévus par votre fournisseur.

## OAuth

Variables Google :

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://VOTRE-BACKEND/api/auth/oauth/google/callback
```

Variables GitHub :

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=https://VOTRE-BACKEND/api/auth/oauth/github/callback
```

Le même callback doit être enregistré dans la console du fournisseur OAuth.

Pour le développement local, adaptez `BACKEND_PUBLIC_URL`, `FRONTEND_PUBLIC_URL` et les callback URLs à votre environnement.

## Cinq clés Gemini

Deux formats sont supportés :

```env
GEMINI_API_KEYS=cle1,cle2,cle3,cle4,cle5
```

ou :

```env
GEMINI_API_KEY_1=
GEMINI_API_KEY_2=
GEMINI_API_KEY_3=
GEMINI_API_KEY_4=
GEMINI_API_KEY_5=
```

`GEMINI_API_KEY` reste aussi supportée. MNEMOS change automatiquement de clé si une clé subit une erreur temporaire, un quota/rate-limit ou une indisponibilité.

## Important avant déploiement

- utilisez HTTPS ;
- gardez `.env` hors de Git ;
- remplacez `JWT_SECRET` par une longue valeur aléatoire ;
- renseignez uniquement les origines frontend nécessaires dans `FRONTEND_URL` ;
- utilisez un compte MySQL dédié avec les droits nécessaires ;
- faites une sauvegarde MySQL avant toute migration manuelle.


## Limite média actuelle

Le livre est généré et rendu en lecteur 3D. La BD et la vidéo utilisent toujours le moteur MNEMOS existant : il produit les cases/dialogues/prompts de BD et le storyboard/narration vidéo. La génération automatique des images finales de BD et d'un fichier MP4 final nécessite un moteur image/vidéo supplémentaire et n'est pas simulée dans cette version.
