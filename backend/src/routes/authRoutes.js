const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/authController");

router.post("/register", c.register);
router.post("/login", c.login);
router.post("/verify-email", c.verifyEmail);
router.post("/resend-verification", c.resendVerification);
router.post("/forgot-password", c.forgotPassword);
router.post("/reset-password", c.resetPassword);
router.get("/oauth/google", c.googleStart);
router.get("/oauth/google/callback", c.googleCallback);
router.get("/oauth/github", c.githubStart);
router.get("/oauth/github/callback", c.githubCallback);
router.get("/me", auth, c.me);

module.exports = router;
