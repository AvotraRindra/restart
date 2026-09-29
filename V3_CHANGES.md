# RE:START V3 — modifications intégrées

Cette version conserve le design existant et branche les fonctionnalités demandées :

- mot de passe oublié + e-mail ;
- vérification e-mail à l'inscription ;
- Google/GitHub OAuth, Apple supprimé ;
- blocage automatique de Login/Register pendant une session ;
- Dashboard : récents ouvrables directement ;
- notifications ouvrant le souvenir ou la discussion ;
- lien de visualisation publique pour les souvenirs publics ;
- messagerie temps réel, présence en ligne et amélioration mobile ;
- profil utilisateur + photo + bio + préférences ;
- section API supprimée des paramètres ;
- pièces jointes de souvenirs ;
- lecteur Livre 3D double page ;
- navigation/icônes Dashboard plus visibles ;
- responsive mobile ;
- jusqu'à 5 clés Gemini avec rotation ;
- sécurité renforcée : Helmet, rate-limit, tokens e-mail hachés, OAuth state signé, révocation JWT après reset password.

## Obligatoire après extraction

1. `backend/.env.example` → `backend/.env`, puis remplir MySQL, JWT, SMTP, Gemini/Groq et éventuellement OAuth.
2. `frontend/.env.example` → `frontend/.env`, puis renseigner `VITE_API_URL`.
3. Dans `backend` : `npm install` (le lock backend est volontairement régénéré, car de nouvelles dépendances ont été ajoutées).
4. Dans `frontend` : `npm install`.
5. Sauvegarder MySQL avant migration. `AUTO_MIGRATE=true` met à niveau automatiquement une base existante.

Voir aussi `TEST_LOCAL.md`, `backend/SECURITY_AUTH_SETUP.md` et `backend/FRONTEND_API.md`.

## V3.1
- Icônes de navigation légèrement agrandies (desktop + mobile).
- Mot de passe oublié/réinitialisation replacé dans la même zone et le même panneau visuel que la connexion.
- Profil : enregistrement persistant des informations et upload immédiat de la photo de profil avec aperçu/validation.
