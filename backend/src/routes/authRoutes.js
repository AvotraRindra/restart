const express = require("express");

const router =
  express.Router();

const auth =
  require("../middlewares/auth");

const authController =
  require("../controllers/authController");

/*
|--------------------------------------------------------------------------
| Authentification classique
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  authController.register
);

router.post(
  "/login",
  authController.login
);

/*
|--------------------------------------------------------------------------
| Mot de passe oublié
|--------------------------------------------------------------------------
*/

router.post(
  "/forgot-password",
  authController.forgotPassword
);

router.post(
  "/reset-password",
  authController.resetPassword
);

/*
|--------------------------------------------------------------------------
| Google OAuth
|--------------------------------------------------------------------------
*/

router.get(
  "/oauth/google",
  authController.googleStart
);

router.get(
  "/oauth/google/callback",
  authController.googleCallback
);

/*
|--------------------------------------------------------------------------
| Utilisateur connecté
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  auth,
  authController.me
);

module.exports = router;
