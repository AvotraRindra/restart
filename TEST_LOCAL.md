# TEST LOCAL — RE:START V3

## 1. Base de données

Démarrez MySQL/XAMPP. Vérifiez que `DB_NAME` correspond à votre base. Le backend met automatiquement à niveau le schéma si `AUTO_MIGRATE=true`.

## 2. Backend

```bash
cd backend
npm install
node src/server.js
```

Test : `http://localhost:5000/api/health`.

## 3. Frontend

Créez `frontend/.env` :

```env
VITE_API_URL=http://localhost:5000
```

Puis :

```bash
cd frontend
npm install
npm run dev
```

Pour tester depuis un téléphone du même réseau :

```bash
npm run dev -- --host 0.0.0.0
```

et utilisez l'IPv4 du PC dans `VITE_API_URL` et `FRONTEND_URL`.

## 4. Ordre de test conseillé

1. Inscription → réception e-mail → lien `/verify-email` → connexion.
2. Mot de passe oublié → e-mail → `/reset-password` → nouveau login ; vérifier qu'un ancien JWT n'est plus accepté.
3. Google / GitHub après configuration des applications OAuth.
4. Profil → modifier nom/bio/photo → recharger la page.
5. Nouveau souvenir texte → ajouter des pièces jointes → sauvegarder.
6. Nouveau souvenir vocal → vérifier `transcription_status=completed`.
7. Livre → MNEMOS → lecteur 3D double page → pages précédentes/suivantes.
8. Passer un souvenir en Public → copier son URL `/memory/:id` → ouvrir dans une fenêtre privée sans connexion.
9. Dashboard → cliquer un souvenir récent → lecteur direct.
10. Partagés → Voir le souvenir → réactions/commentaires.
11. Deux comptes dans deux navigateurs → Messages → vérifier le point vert En ligne, typing et message temps réel.
12. Depuis le second compte, réagir/commenter → depuis le premier compte cliquer la notification → ouverture du bon souvenir.
13. Tester à 390px/430px de large : barre de navigation basse, messages, création souvenir, profil et lecteur.

## 5. E-mail

Si aucun e-mail n'arrive, regarder le terminal backend. La configuration SMTP est obligatoire pour vérification et mot de passe oublié.

## 6. Gemini

Ajoutez jusqu'à 5 clés. Testez une génération Livre/BD/Vidéo. Le backend essaie les clés suivantes sur les erreurs temporaires/quota.
