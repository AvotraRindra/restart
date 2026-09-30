const nodemailer =
  require("nodemailer");

let transporter = null;

/*
|--------------------------------------------------------------------------
| Transport SMTP
|--------------------------------------------------------------------------
*/

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  /*
  |--------------------------------------------------------------------------
  | SMTP incomplet
  |--------------------------------------------------------------------------
  */

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Création Nodemailer
  |--------------------------------------------------------------------------
  */

  transporter =
    nodemailer.createTransport({
      host:
        process.env.SMTP_HOST,

      port:
        Number(
          process.env.SMTP_PORT ||
          587
        ),

      secure:
        String(
          process.env.SMTP_SECURE ||
          "false"
        ).toLowerCase() ===
        "true",

      auth: {
        user:
          process.env.SMTP_USER,

        pass:
          process.env.SMTP_PASS,
      },
    });

  return transporter;
}

/*
|--------------------------------------------------------------------------
| Envoi générique
|--------------------------------------------------------------------------
*/

async function sendMail({
  to,
  subject,
  html,
  text,
}) {
  const tx =
    getTransporter();

  if (!tx) {
    const error =
      new Error(
        "SMTP non configuré. Renseignez SMTP_HOST, SMTP_USER et SMTP_PASS dans .env."
      );

    error.code =
      "SMTP_NOT_CONFIGURED";

    throw error;
  }

  return tx.sendMail({
    from:
      process.env.MAIL_FROM ||
      "RE:START <no-reply@restart.local>",

    to,

    subject,

    html,

    text,
  });
}

/*
|--------------------------------------------------------------------------
| URL frontend
|--------------------------------------------------------------------------
*/

function frontendUrl() {
  return (
    process.env.FRONTEND_PUBLIC_URL ||
    (
      process.env.FRONTEND_URL ||
      "http://localhost:5173"
    ).split(",")[0]
  ).replace(/\/$/, "");
}

/*
|--------------------------------------------------------------------------
| Mot de passe oublié
|--------------------------------------------------------------------------
|
| C'est désormais la seule fonctionnalité
| d'authentification qui envoie un e-mail.
|
*/

async function sendPasswordResetEmail(
  user,
  token
) {
  const url =
    `${frontendUrl()}/reset-password?token=${encodeURIComponent(
      token
    )}`;

  return sendMail({
    to:
      user.email,

    subject:
      "Réinitialisation du mot de passe — RE:START",

    text:
      `Bonjour ${user.nom}, réinitialisez votre mot de passe : ${url}`,

    html:
      `
        <div
          style="
            font-family:Arial,sans-serif;
            max-width:600px;
            margin:auto;
            padding:32px;
          "
        >
          <h2>
            RE:START
          </h2>

          <p>
            Bonjour
            <strong>
              ${escapeHtml(
                user.nom
              )}
            </strong>,
          </p>

          <p>
            Une demande de réinitialisation
            de votre mot de passe a été reçue.
          </p>

          <p
            style="
              margin:32px 0;
            "
          >
            <a
              href="${url}"
              style="
                background:#ff2943;
                color:#ffffff;
                padding:14px 22px;
                border-radius:10px;
                text-decoration:none;
                font-weight:bold;
              "
            >
              Choisir un nouveau mot de passe
            </a>
          </p>

          <p>
            Ce lien expire dans
            <strong>
              20 minutes
            </strong>.
          </p>

          <p>
            Si vous n'êtes pas à l'origine
            de cette demande, ignorez simplement
            cet e-mail.
          </p>
        </div>
      `,
  });
}

/*
|--------------------------------------------------------------------------
| Sécurité HTML
|--------------------------------------------------------------------------
*/

function escapeHtml(
  value = ""
) {
  return String(value)
    .replace(
      /[&<>'"]/g,
      (character) =>
        ({
          "&":
            "&amp;",

          "<":
            "&lt;",

          ">":
            "&gt;",

          "'":
            "&#39;",

          '"':
            "&quot;",
        })[character]
    );
}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  sendMail,
  sendPasswordResetEmail,
};
