const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const emailService = require("../services/emailService");

function makeToken(userId, tokenVersion = 0) {
  return jwt.sign({ id: Number(userId), kind: "session", ver: Number(tokenVersion || 0) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function makeRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function futureDate(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function validatePassword(password) {
  const value = String(password || "");
  if (value.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  return "";
}

function frontendUrl() {
  return (process.env.FRONTEND_PUBLIC_URL || (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0]).replace(/\/$/, "");
}

function backendUrl() {
  return (process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
}

function oauthState(provider) {
  return jwt.sign({ kind: "oauth-state", provider, nonce: crypto.randomBytes(12).toString("hex") }, process.env.JWT_SECRET, { expiresIn: "10m" });
}

function readOAuthState(state, provider) {
  const payload = jwt.verify(state, process.env.JWT_SECRET);
  if (payload.kind !== "oauth-state" || payload.provider !== provider) throw new Error("État OAuth invalide.");
  return payload;
}

async function finishOAuth({ provider, providerId, email, name, photo }) {
  if (!email) throw new Error("Le fournisseur OAuth n'a pas fourni d'adresse e-mail exploitable.");
  const normalizedEmail = String(email).trim().toLowerCase();
  let dbUser = await User.findByOAuth(provider, providerId);
  if (!dbUser) {
    dbUser = await User.findByEmail(normalizedEmail);
    if (dbUser) {
      await User.linkOAuth(dbUser.id, provider, providerId, photo);
    } else {
      const randomPassword = await bcrypt.hash(makeRawToken(), 12);
      const created = await User.create({
        nom: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        passwordHash: randomPassword,
        sexe: "autre",
        emailVerified: true,
        oauthProvider: provider,
        oauthProviderId: String(providerId),
        photo: photo || null,
      });
      dbUser = await User.findById(created.id);
    }
  }
  const sessionUser = await User.findById(dbUser.id);
  const publicUser = await User.findPublicById(dbUser.id);
  return { user: publicUser, token: makeToken(dbUser.id, sessionUser?.token_version) };
}

exports.register = async (req, res, next) => {
  try {
    const { nom, email, password, sexe, dateNaissance } = req.body;
    if (!nom || !email || !password) {
      return res.status(400).json({ success: false, message: "nom, email et password sont obligatoires." });
    }
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ success: false, message: passwordError });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.findByEmail(normalizedEmail)) {
      return res.status(409).json({ success: false, message: "Cet email est déjà utilisé." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ nom: String(nom).trim(), email: normalizedEmail, passwordHash, sexe, dateNaissance, emailVerified: false });
    const rawToken = makeRawToken();
    await User.setEmailVerification(user.id, hashToken(rawToken), futureDate(30));
    try {
      await emailService.sendVerificationEmail(user, rawToken);
    } catch (mailError) {
      console.error("E-mail de vérification non envoyé:", mailError.message);
      return res.status(503).json({
        success: false,
        message: "Le compte a été créé, mais l'e-mail de vérification n'a pas pu être envoyé. Vérifiez la configuration SMTP puis utilisez « Renvoyer l'e-mail ».",
      });
    }
    res.status(201).json({
      success: true,
      message: "Compte créé. Consultez votre e-mail pour l'activer.",
      data: { email: user.email, requiresVerification: true },
    });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password || "", user.password_hash || ""))) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }
    if (!user.is_active) return res.status(403).json({ success: false, message: "Ce compte est désactivé." });
    if (!Number(user.email_verified)) {
      return res.status(403).json({ success: false, code: "EMAIL_NOT_VERIFIED", message: "Vérifiez votre adresse e-mail avant de vous connecter." });
    }
    const publicUser = await User.findPublicById(user.id);
    res.json({ success: true, data: { user: publicUser, token: makeToken(user.id, user.token_version) } });
  } catch (error) { next(error); }
};

exports.me = async (req, res) => res.json({ success: true, data: await User.findPublicById(req.user.id) });

exports.verifyEmail = async (req, res, next) => {
  try {
    const raw = String(req.body.token || req.query.token || "");
    if (!raw) return res.status(400).json({ success: false, message: "Token de vérification manquant." });
    const user = await User.verifyEmailByHash(hashToken(raw));
    if (!user) return res.status(400).json({ success: false, message: "Lien de vérification invalide ou expiré." });
    res.json({ success: true, message: "Adresse e-mail vérifiée. Vous pouvez vous connecter." });
  } catch (error) { next(error); }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (user && !Number(user.email_verified)) {
      const rawToken = makeRawToken();
      await User.setEmailVerification(user.id, hashToken(rawToken), futureDate(30));
      await emailService.sendVerificationEmail(user, rawToken);
    }
    res.json({ success: true, message: "Si ce compte existe et doit être vérifié, un nouvel e-mail a été envoyé." });
  } catch (error) { next(error); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (user && user.is_active) {
      const rawToken = makeRawToken();
      await User.setResetToken(user.id, hashToken(rawToken), futureDate(20));
      try { await emailService.sendPasswordResetEmail(user, rawToken); }
      catch (mailError) { console.error("E-mail reset non envoyé:", mailError.message); }
    }
    res.json({ success: true, message: "Si cette adresse correspond à un compte, un e-mail de réinitialisation a été envoyé." });
  } catch (error) { next(error); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ success: false, message: passwordError });
    if (!token) return res.status(400).json({ success: false, message: "Token manquant." });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.resetPasswordByHash(hashToken(token), passwordHash);
    if (!user) return res.status(400).json({ success: false, message: "Lien de réinitialisation invalide ou expiré." });
    res.json({ success: true, message: "Mot de passe modifié. Vous pouvez vous connecter." });
  } catch (error) { next(error); }
};

exports.googleStart = (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ success: false, message: "OAuth Google n'est pas configuré." });
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${backendUrl()}/api/auth/oauth/google/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state: oauthState("google"),
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

exports.googleCallback = async (req, res) => {
  try {
    readOAuthState(req.query.state, "google");
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${backendUrl()}/api/auth/oauth/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code: req.query.code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    });
    if (!tokenResponse.ok) throw new Error("Échange OAuth Google impossible.");
    const tokenData = await tokenResponse.json();
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    if (!profileResponse.ok) throw new Error("Profil Google inaccessible.");
    const profile = await profileResponse.json();
    if (!profile.email || profile.email_verified !== true) {
      throw new Error("Votre adresse e-mail Google doit être vérifiée avant la connexion.");
    }
    const result = await finishOAuth({ provider: "google", providerId: profile.sub, email: profile.email, name: profile.name, photo: profile.picture });
    res.redirect(`${frontendUrl()}/oauth/callback#token=${encodeURIComponent(result.token)}`);
  } catch (error) {
    console.error("OAuth Google:", error);
    res.redirect(`${frontendUrl()}/login?oauth_error=${encodeURIComponent(error.message)}`);
  }
};

exports.githubStart = (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID) return res.status(503).json({ success: false, message: "OAuth GitHub n'est pas configuré." });
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${backendUrl()}/api/auth/oauth/github/callback`;
  const params = new URLSearchParams({ client_id: process.env.GITHUB_CLIENT_ID, redirect_uri: redirectUri, scope: "read:user user:email", state: oauthState("github") });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

exports.githubCallback = async (req, res) => {
  try {
    readOAuthState(req.query.state, "github");
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${backendUrl()}/api/auth/oauth/github/callback`;
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code: req.query.code, redirect_uri: redirectUri }),
    });
    if (!tokenResponse.ok) throw new Error("Échange OAuth GitHub impossible.");
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error(tokenData.error_description || "Jeton GitHub manquant.");
    const headers = { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json", "User-Agent": "RESTART-WebCup" };
    const profileResponse = await fetch("https://api.github.com/user", { headers });
    if (!profileResponse.ok) throw new Error("Profil GitHub inaccessible.");
    const profile = await profileResponse.json();
    const emailsResponse = await fetch("https://api.github.com/user/emails", { headers });
    if (!emailsResponse.ok) throw new Error("Les adresses e-mail GitHub sont inaccessibles.");
    const emails = await emailsResponse.json();
    const email = emails.find((x) => x.primary && x.verified)?.email || emails.find((x) => x.verified)?.email;
    if (!email) throw new Error("Votre compte GitHub doit disposer d'une adresse e-mail vérifiée.");
    const result = await finishOAuth({ provider: "github", providerId: profile.id, email, name: profile.name || profile.login, photo: profile.avatar_url });
    res.redirect(`${frontendUrl()}/oauth/callback#token=${encodeURIComponent(result.token)}`);
  } catch (error) {
    console.error("OAuth GitHub:", error);
    res.redirect(`${frontendUrl()}/login?oauth_error=${encodeURIComponent(error.message)}`);
  }
};
