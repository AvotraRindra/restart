const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const emailService = require("../services/emailService");

/*
|--------------------------------------------------------------------------
| JWT
|--------------------------------------------------------------------------
*/

function makeToken(userId, tokenVersion = 0) {
  return jwt.sign(
    {
      id: Number(userId),
      kind: "session",
      ver: Number(tokenVersion || 0),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Tokens sécurisés
|--------------------------------------------------------------------------
|
| Ils servent encore au mot de passe oublié.
| Ils ne servent PLUS à vérifier l'adresse e-mail.
|
*/

function makeRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(String(token))
    .digest("hex");
}

function futureDate(minutes) {
  return new Date(
    Date.now() + minutes * 60 * 1000
  );
}

/*
|--------------------------------------------------------------------------
| Validation mot de passe
|--------------------------------------------------------------------------
*/

function validatePassword(password) {
  const value = String(password || "");

  if (value.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }

  if (
    !/[A-Za-z]/.test(value) ||
    !/\d/.test(value)
  ) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| URLs
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

function backendUrl() {
  return (
    process.env.BACKEND_PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, "");
}

/*
|--------------------------------------------------------------------------
| OAuth State
|--------------------------------------------------------------------------
*/

function oauthState(provider) {
  return jwt.sign(
    {
      kind: "oauth-state",
      provider,
      nonce: crypto
        .randomBytes(12)
        .toString("hex"),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );
}

function readOAuthState(state, provider) {
  const payload = jwt.verify(
    state,
    process.env.JWT_SECRET
  );

  if (
    payload.kind !== "oauth-state" ||
    payload.provider !== provider
  ) {
    throw new Error(
      "État OAuth invalide."
    );
  }

  return payload;
}

/*
|--------------------------------------------------------------------------
| Finalisation OAuth
|--------------------------------------------------------------------------
*/

async function finishOAuth({
  provider,
  providerId,
  email,
  name,
  photo,
}) {
  if (!email) {
    throw new Error(
      "Le fournisseur OAuth n'a pas fourni d'adresse e-mail exploitable."
    );
  }

  const normalizedEmail = String(email)
    .trim()
    .toLowerCase();

  let dbUser = await User.findByOAuth(
    provider,
    providerId
  );

  /*
  |--------------------------------------------------------------------------
  | Compte OAuth inexistant
  |--------------------------------------------------------------------------
  */

  if (!dbUser) {
    dbUser =
      await User.findByEmail(
        normalizedEmail
      );

    /*
    |--------------------------------------------------------------------------
    | Un compte RE:START existe déjà
    |--------------------------------------------------------------------------
    */

    if (dbUser) {
      await User.linkOAuth(
        dbUser.id,
        provider,
        providerId,
        photo
      );
    } else {
      /*
      |--------------------------------------------------------------------------
      | Création automatique via Google
      |--------------------------------------------------------------------------
      */

      const randomPassword =
        await bcrypt.hash(
          makeRawToken(),
          12
        );

      const created =
        await User.create({
          nom:
            name ||
            normalizedEmail.split("@")[0],

          email:
            normalizedEmail,

          passwordHash:
            randomPassword,

          sexe:
            "autre",

          /*
          | Cette valeur reste uniquement
          | compatible avec l'ancien schéma.
          | RE:START ne vérifie plus l'e-mail.
          */
          emailVerified: false,

          oauthProvider:
            provider,

          oauthProviderId:
            String(providerId),

          photo:
            photo || null,
        });

      dbUser =
        await User.findById(
          created.id
        );
    }
  }

  const sessionUser =
    await User.findById(
      dbUser.id
    );

  const publicUser =
    await User.findPublicById(
      dbUser.id
    );

  return {
    user:
      publicUser,

    token:
      makeToken(
        dbUser.id,
        sessionUser?.token_version
      ),
  };
}

/*
|--------------------------------------------------------------------------
| INSCRIPTION
|--------------------------------------------------------------------------
|
| IMPORTANT :
|
| L'inscription ne vérifie PLUS l'adresse e-mail.
| Aucun e-mail de confirmation n'est envoyé.
| L'utilisateur reçoit immédiatement son JWT.
|
*/

exports.register = async (
  req,
  res,
  next
) => {
  try {
    const {
      nom,
      email,
      password,
      sexe,
      dateNaissance,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (
      !nom ||
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "nom, email et password sont obligatoires.",
        });
    }

    const passwordError =
      validatePassword(
        password
      );

    if (passwordError) {
      return res
        .status(400)
        .json({
          success: false,
          message: passwordError,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Normalisation e-mail
    |--------------------------------------------------------------------------
    */

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | E-mail déjà utilisé
    |--------------------------------------------------------------------------
    */

    const existingUser =
      await User.findByEmail(
        normalizedEmail
      );

    if (existingUser) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "Cet email est déjà utilisé.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Hash du mot de passe
    |--------------------------------------------------------------------------
    */

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    /*
    |--------------------------------------------------------------------------
    | Création utilisateur
    |--------------------------------------------------------------------------
    |
    | Aucun token de vérification.
    | Aucun mail de validation.
    |
    */

    const user =
      await User.create({
        nom:
          String(nom).trim(),

        email:
          normalizedEmail,

        passwordHash,

        sexe,

        dateNaissance,

        /*
        | Héritage du schéma V3.
        | Cette propriété n'est plus utilisée
        | pour autoriser/refuser une connexion.
        */
        emailVerified:
          false,
      });

    /*
    |--------------------------------------------------------------------------
    | Récupération session
    |--------------------------------------------------------------------------
    */

    const sessionUser =
      await User.findById(
        user.id
      );

    const publicUser =
      await User.findPublicById(
        user.id
      );

    /*
    |--------------------------------------------------------------------------
    | Connexion immédiate
    |--------------------------------------------------------------------------
    */

    const token =
      makeToken(
        user.id,
        sessionUser?.token_version
      );

    /*
    |--------------------------------------------------------------------------
    | Réponse
    |--------------------------------------------------------------------------
    */

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Compte créé avec succès.",

        data: {
          user:
            publicUser,

          token,
        },
      });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CONNEXION
|--------------------------------------------------------------------------
|
| email_verified n'est PLUS contrôlé.
|
*/

exports.login = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Recherche utilisateur
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findByEmail(
        email
      );

    /*
    |--------------------------------------------------------------------------
    | Mot de passe
    |--------------------------------------------------------------------------
    */

    const passwordValid =
      user &&
      (
        await bcrypt.compare(
          password || "",
          user.password_hash || ""
        )
      );

    if (
      !user ||
      !passwordValid
    ) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Email ou mot de passe incorrect.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Compte désactivé
    |--------------------------------------------------------------------------
    */

    if (!user.is_active) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "Ce compte est désactivé.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    |
    | Plus aucun contrôle email_verified.
    |
    */

    const publicUser =
      await User.findPublicById(
        user.id
      );

    const token =
      makeToken(
        user.id,
        user.token_version
      );

    return res.json({
      success: true,

      data: {
        user:
          publicUser,

        token,
      },
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Utilisateur connecté
|--------------------------------------------------------------------------
*/

exports.me = async (
  req,
  res
) => {
  const user =
    await User.findPublicById(
      req.user.id
    );

  return res.json({
    success: true,
    data: user,
  });
};

/*
|--------------------------------------------------------------------------
| MOT DE PASSE OUBLIÉ
|--------------------------------------------------------------------------
|
| Ceci utilise toujours un e-mail.
|
| MAIS ce mail sert uniquement à
| réinitialiser le mot de passe.
|
*/

exports.forgotPassword = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findByEmail(
        req.body.email
      );

    if (
      user &&
      user.is_active
    ) {
      const rawToken =
        makeRawToken();

      await User.setResetToken(
        user.id,
        hashToken(rawToken),
        futureDate(20)
      );

      try {
        await emailService
          .sendPasswordResetEmail(
            user,
            rawToken
          );

      } catch (mailError) {
        console.error(
          "E-mail reset non envoyé:",
          mailError.message
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Réponse volontairement générique
    |--------------------------------------------------------------------------
    |
    | Cela évite de révéler si une adresse
    | existe dans la base.
    |
    */

    return res.json({
      success: true,

      message:
        "Si cette adresse correspond à un compte, un e-mail de réinitialisation a été envoyé.",
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| RÉINITIALISER LE MOT DE PASSE
|--------------------------------------------------------------------------
*/

exports.resetPassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      token,
      password,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validation nouveau password
    |--------------------------------------------------------------------------
    */

    const passwordError =
      validatePassword(
        password
      );

    if (passwordError) {
      return res
        .status(400)
        .json({
          success: false,
          message: passwordError,
        });
    }

    if (!token) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Token manquant.",
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Hash
    |--------------------------------------------------------------------------
    */

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    /*
    |--------------------------------------------------------------------------
    | Modification
    |--------------------------------------------------------------------------
    */

    const user =
      await User.resetPasswordByHash(
        hashToken(token),
        passwordHash
      );

    if (!user) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Lien de réinitialisation invalide ou expiré.",
        });
    }

    return res.json({
      success: true,

      message:
        "Mot de passe modifié. Vous pouvez vous connecter.",
    });

  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GOOGLE OAUTH - Début
|--------------------------------------------------------------------------
*/

exports.googleStart = (
  req,
  res
) => {
  if (
    !process.env
      .GOOGLE_CLIENT_ID
  ) {
    return res
      .status(503)
      .json({
        success: false,

        message:
          "OAuth Google n'est pas configuré.",
      });
  }

  const redirectUri =
    process.env
      .GOOGLE_REDIRECT_URI ||
    `${backendUrl()}/api/auth/oauth/google/callback`;

  const params =
    new URLSearchParams({
      client_id:
        process.env
          .GOOGLE_CLIENT_ID,

      redirect_uri:
        redirectUri,

      response_type:
        "code",

      scope:
        "openid email profile",

      access_type:
        "online",

      prompt:
        "select_account",

      state:
        oauthState(
          "google"
        ),
    });

  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
};

/*
|--------------------------------------------------------------------------
| GOOGLE OAUTH - Callback
|--------------------------------------------------------------------------
*/

exports.googleCallback = async (
  req,
  res
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validation state
    |--------------------------------------------------------------------------
    */

    readOAuthState(
      req.query.state,
      "google"
    );

    const redirectUri =
      process.env
        .GOOGLE_REDIRECT_URI ||
      `${backendUrl()}/api/auth/oauth/google/callback`;

    /*
    |--------------------------------------------------------------------------
    | Échange code → access token
    |--------------------------------------------------------------------------
    */

    const tokenResponse =
      await fetch(
        "https://oauth2.googleapis.com/token",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body:
            new URLSearchParams({
              code:
                req.query.code,

              client_id:
                process.env
                  .GOOGLE_CLIENT_ID,

              client_secret:
                process.env
                  .GOOGLE_CLIENT_SECRET,

              redirect_uri:
                redirectUri,

              grant_type:
                "authorization_code",
            }),
        }
      );

    if (!tokenResponse.ok) {
      throw new Error(
        "Échange OAuth Google impossible."
      );
    }

    const tokenData =
      await tokenResponse.json();

    /*
    |--------------------------------------------------------------------------
    | Profil Google
    |--------------------------------------------------------------------------
    */

    const profileResponse =
      await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
          headers: {
            Authorization:
              `Bearer ${tokenData.access_token}`,
          },
        }
      );

    if (!profileResponse.ok) {
      throw new Error(
        "Profil Google inaccessible."
      );
    }

    const profile =
      await profileResponse.json();

    /*
    |--------------------------------------------------------------------------
    | On exige seulement une adresse disponible.
    |--------------------------------------------------------------------------
    |
    | On ne vérifie PLUS profile.email_verified.
    |
    */

    if (!profile.email) {
      throw new Error(
        "Google n'a pas fourni d'adresse e-mail."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Création / connexion
    |--------------------------------------------------------------------------
    */

    const result =
      await finishOAuth({
        provider:
          "google",

        providerId:
          profile.sub,

        email:
          profile.email,

        name:
          profile.name,

        photo:
          profile.picture,
      });

    /*
    |--------------------------------------------------------------------------
    | Retour frontend
    |--------------------------------------------------------------------------
    */

    return res.redirect(
      `${frontendUrl()}/oauth/callback#token=${encodeURIComponent(
        result.token
      )}`
    );

  } catch (error) {
    console.error(
      "OAuth Google:",
      error
    );

    return res.redirect(
      `${frontendUrl()}/login?oauth_error=${encodeURIComponent(
        error.message
      )}`
    );
  }
};
