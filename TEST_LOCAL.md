# Tests locaux rapides

1. Démarrer MySQL/XAMPP.
2. Démarrer `backend` avec `npm run dev`.
3. Vérifier `GET /api/health`.
4. Démarrer `frontend` avec `npm run dev`.
5. Créer un compte puis vérifier la redirection vers `/dashboard`.
6. Créer un souvenir `livre` en texte et laisser MNEMOS générer les pages.
7. Créer un souvenir `video`, ajouter des photos puis vérifier le storyboard dans Atelier créatif.
8. Créer un souvenir `bd`, ajouter un personnage puis vérifier les cases/dialogues.
9. Dans Mes souvenirs : tester recherche, public/privé, audio et suppression.
10. Avec deux comptes : rendre un souvenir public, tester réaction, commentaire et réponse.
11. Avec deux comptes : créer une discussion privée, envoyer des messages et vérifier les notifications en temps réel.
12. Tester le mode clair/sombre puis recharger la page.

## Deux PC sur le même réseau

Frontend : `VITE_API_URL=http://IP_DU_PC_BACKEND:5000`

Backend : `FRONTEND_URL=http://IP_DU_PC_FRONTEND:5173`

Le serveur Node écoute déjà sur `0.0.0.0`.
