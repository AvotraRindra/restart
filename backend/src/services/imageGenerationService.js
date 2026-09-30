const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const generatedRoot = path.join(
  __dirname,
  "..",
  "uploads",
  "generated",
  "comics"
);

// Le dossier est créé automatiquement s'il n'existe pas.
fs.mkdirSync(generatedRoot, {
  recursive: true,
});


/* =========================================================
   RÉCUPÉRATION DES CLÉS GEMINI
========================================================= */

function getGeminiKeys() {
  const keys = [
    ...(process.env.GEMINI_API_KEYS || "").split(","),

    process.env.GEMINI_API_KEY || "",

    process.env.GEMINI_API_KEY_1 || "",
    process.env.GEMINI_API_KEY_2 || "",
    process.env.GEMINI_API_KEY_3 || "",
    process.env.GEMINI_API_KEY_4 || "",
    process.env.GEMINI_API_KEY_5 || "",
  ]
    .map((key) => key.trim())
    .filter(Boolean);

  // Enlève les doublons.
  return [...new Set(keys)];
}


/* =========================================================
   OUTILS
========================================================= */

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


function isRetryable(error) {
  const message =
    error?.message ||
    String(error);

  return /429|500|502|503|504|UNAVAILABLE|RESOURCE_EXHAUSTED|rate|quota|high demand|temporar|timeout/i.test(
    message
  );
}


function mimeFromFile(filePath) {
  const ext =
    path.extname(filePath).toLowerCase();

  if (
    ext === ".jpg" ||
    ext === ".jpeg"
  ) {
    return "image/jpeg";
  }

  if (ext === ".webp") {
    return "image/webp";
  }

  if (ext === ".png") {
    return "image/png";
  }

  return null;
}


function extensionFromMime(mimeType) {
  if (mimeType === "image/jpeg") {
    return ".jpg";
  }

  if (mimeType === "image/webp") {
    return ".webp";
  }

  return ".png";
}


/* =========================================================
   CONVERTIR UNE URL /uploads/... EN FICHIER LOCAL
========================================================= */

function uploadUrlToLocalPath(uploadUrl) {
  if (
    !uploadUrl ||
    !uploadUrl.startsWith("/uploads/")
  ) {
    return null;
  }

  const relative =
    uploadUrl.replace(
      /^\/uploads\//,
      ""
    );

  return path.join(
    __dirname,
    "..",
    "uploads",
    relative
  );
}


/* =========================================================
   PHOTOS DE RÉFÉRENCE DES PERSONNAGES
========================================================= */

function buildCharacterReferenceParts(
  characters = []
) {
  const parts = [];

  /*
    On limite à 4 personnages de référence.

    Exemple :
    Rindra -> sa photo
    Avotra -> sa photo
  */

  for (
    const character of characters.slice(0, 4)
  ) {
    const filePath =
      uploadUrlToLocalPath(
        character.image_url
      );

    if (
      !filePath ||
      !fs.existsSync(filePath)
    ) {
      continue;
    }

    const mimeType =
      mimeFromFile(filePath);

    if (!mimeType) {
      continue;
    }

    const base64 =
      fs
        .readFileSync(filePath)
        .toString("base64");

    /*
      On précise à Gemini quel personnage
      correspond à quelle image.
    */

    parts.push({
      text: `
Image de référence du personnage nommé
« ${character.name} ».

Conserve son apparence générale,
son visage,
ses cheveux
et ses traits distinctifs
quand il apparaît dans la scène.
      `.trim(),
    });

    parts.push({
      inlineData: {
        mimeType,
        data: base64,
      },
    });
  }

  return parts;
}


/* =========================================================
   PROMPT DE LA CASE BD
========================================================= */

function buildComicPrompt({
  memory,
  panel,
  characters,
}) {
  const knownCharacters =
    characters.length > 0
      ? characters
          .map(
            (character) =>
              character.name
          )
          .join(", ")
      : "aucun personnage de référence";

  return `
Crée UNE SEULE case de bande dessinée professionnelle
pour l'application RE:START.

CONTEXTE DU SOUVENIR

Titre :
${memory.title || "Souvenir"}

Émotion dominante :
${memory.emotion || "autre"}

Date :
${memory.memory_date || "non précisée"}

Lieu :
${memory.location || "non précisé"}

Personnages connus :
${knownCharacters}


DESCRIPTION VISUELLE DE LA CASE

${
  panel.image_prompt ||
  panel.narration ||
  memory.text_content ||
  "Souvenir personnel"
}


NARRATION ASSOCIÉE

${panel.narration || "Aucune"}


DIALOGUE ASSOCIÉ

${panel.dialogue || "Aucun"}


CONSIGNES VISUELLES

- illustration professionnelle de roman graphique ;
- style bande dessinée cinématographique ;
- composition claire et expressive ;
- conserver les mêmes personnages d'une case à l'autre ;
- utiliser les photos de référence fournies ;
- conserver le visage et les caractéristiques physiques
  du personnage ;
- lumière adaptée à l'émotion
  « ${memory.emotion || "autre"} » ;
- respecter le lieu du souvenir ;
- respecter l'époque du souvenir ;
- cadrage naturel ;
- décor détaillé mais pas surchargé ;
- format paysage 4:3 ;
- aucun texte incrusté dans l'image ;
- aucune bulle de dialogue ;
- aucun sous-titre ;
- aucune légende ;
- aucun logo ;
- aucun filigrane ajouté volontairement ;
- ne pas inventer de personnage important absent du souvenir.

Retourne uniquement l'image finale de la case.
  `.trim();
}


/* =========================================================
   GÉNÉRER UNE IMAGE DE CASE BD
========================================================= */

async function generateComicPanelImage({
  memory,
  panel,
  characters = [],
}) {
  const keys =
    getGeminiKeys();

  if (!keys.length) {
    throw new Error(
      "Aucune clé Gemini configurée pour la génération d'images."
    );
  }

  const model =
    process.env.GEMINI_IMAGE_MODEL ||
    "gemini-3.1-flash-image";

  const prompt =
    buildComicPrompt({
      memory,
      panel,
      characters,
    });

  const referenceParts =
    buildCharacterReferenceParts(
      characters
    );

  let lastError = null;


  /* =======================================================
     ROTATION DES CLÉS GEMINI
  ======================================================= */

  for (
    let keyIndex = 0;
    keyIndex < keys.length;
    keyIndex++
  ) {
    const ai =
      new GoogleGenAI({
        apiKey: keys[keyIndex],
      });


    /*
      Deux essais maximum
      sur chaque clé.
    */

    for (
      let attempt = 1;
      attempt <= 2;
      attempt++
    ) {
      try {
        const response =
          await ai.models.generateContent({
            model,

            contents: [
              {
                text: prompt,
              },

              ...referenceParts,
            ],

            config: {
              responseModalities: [
                "IMAGE",
              ],

              responseFormat: {
                image: {
                  aspectRatio: "4:3",
                  imageSize: "1K",
                },
              },
            },
          });


        /* ===============================================
           RÉCUPÉRER L'IMAGE RETOURNÉE PAR GEMINI
        =============================================== */

        const parts =
          response
            ?.candidates?.[0]
            ?.content?.parts ||
          [];


        /*
          Certains modèles Image peuvent
          produire des parties internes de réflexion.

          On prend seulement l'image finale.
        */

        const imageParts =
          parts.filter(
            (part) =>
              !part.thought &&
              part.inlineData?.data
          );


        const imagePart =
          imageParts.at(-1);


        if (!imagePart) {
          throw new Error(
            "Gemini n'a retourné aucune image exploitable."
          );
        }


        /* ===============================================
           TYPE DE L'IMAGE
        =============================================== */

        const mimeType =
          imagePart.inlineData
            .mimeType ||
          "image/png";


        const extension =
          extensionFromMime(
            mimeType
          );


        /* ===============================================
           NOM DU FICHIER
        =============================================== */

        const filename =
          `memory-${memory.id}` +
          `-panel-${panel.panel_number}` +
          `-${Date.now()}` +
          extension;


        const absolutePath =
          path.join(
            generatedRoot,
            filename
          );


        /* ===============================================
           SAUVEGARDE
        =============================================== */

        fs.writeFileSync(
          absolutePath,

          Buffer.from(
            imagePart.inlineData.data,
            "base64"
          )
        );


        /* ===============================================
           URL ENREGISTRÉE DANS MYSQL
        =============================================== */

        return (
          `/uploads/generated/comics/` +
          filename
        );

      } catch (error) {

        lastError = error;

        const message =
          error?.message ||
          String(error);


        console.error(
          `Gemini Image clé ${
            keyIndex + 1
          }/${keys.length}, ` +
          `tentative ${attempt}/2, ` +
          `case ${panel.panel_number}:`,
          message
        );


        /*
          Si erreur permanente :
          on passe directement
          à la clé suivante.
        */

        if (
          !isRetryable(error)
        ) {
          break;
        }


        /*
          Petit délai avant nouvel essai.
        */

        if (attempt < 2) {
          await sleep(
            1000 * attempt
          );
        }
      }
    }
  }


  throw (
    lastError ||
    new Error(
      "Toutes les clés Gemini Image ont échoué."
    )
  );
}


module.exports = {
  generateComicPanelImage,
};