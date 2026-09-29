const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    const error = new Error("SMTP non configure. Renseignez SMTP_HOST, SMTP_USER et SMTP_PASS dans .env.");
    error.code = "SMTP_NOT_CONFIGURED";
    throw error;
  }
  return tx.sendMail({
    from: process.env.MAIL_FROM || "RE:START <no-reply@restart.local>",
    to,
    subject,
    html,
    text,
  });
}

function frontendUrl() {
  return (process.env.FRONTEND_PUBLIC_URL || (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0]).replace(/\/$/, "");
}

async function sendVerificationEmail(user, token) {
  const url = `${frontendUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  return sendMail({
    to: user.email,
    subject: "Vérifiez votre adresse e-mail — RE:START",
    text: `Bonjour ${user.nom}, vérifiez votre adresse e-mail : ${url}`,
    html: `<p>Bonjour <strong>${escapeHtml(user.nom)}</strong>,</p><p>Confirmez votre adresse e-mail pour activer votre compte RE:START.</p><p><a href="${url}">Vérifier mon adresse e-mail</a></p><p>Ce lien expire dans 30 minutes.</p>`,
  });
}

async function sendPasswordResetEmail(user, token) {
  const url = `${frontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  return sendMail({
    to: user.email,
    subject: "Réinitialisation du mot de passe — RE:START",
    text: `Bonjour ${user.nom}, réinitialisez votre mot de passe : ${url}`,
    html: `<p>Bonjour <strong>${escapeHtml(user.nom)}</strong>,</p><p>Une demande de réinitialisation de mot de passe a été reçue.</p><p><a href="${url}">Choisir un nouveau mot de passe</a></p><p>Ce lien expire dans 20 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>`,
  });
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
}

module.exports = { sendMail, sendVerificationEmail, sendPasswordResetEmail };
