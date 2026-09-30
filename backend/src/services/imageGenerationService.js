const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");


/* =========================================================
   DOSSIER DE SORTIE
========================================================= */

const generatedDir = path.join(
  __dirname,
  "..",
  "uploads",
  "generated",
  "comics"
);

fs.mkdirSync(generatedDir, {
  recursive: true,
});


/* =========================================================
   UTILITAIRES
========================================================= */

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


/* =========================================================
   RÉCUPÉRER LES CLÉS GEMINI
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

  return [...new Set(keys)];
}


/* =========================================================
   ERREURS TEMPORAIRES
========================================================= */

function isRetryable(error) {
  const message =
    error?.message ||
    String(error);

  return /429|500|502|503|504|UNAVAILABLE|RESOURCE_EXHAUSTED|rate|quota|high demand|temporar|timeout/i.test(
    message
  );
}


/* =========================================================
   URL /uploads/... → CHEMIN LOCAL
========================================================= */

function localPathFromUploadUrl(url) {
  if (
    !url ||
    !url.startsWith("/uploads/")
  ) {
    return null;
  }

  const relative =
    url.replace(
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
   MIME TYPE
========================================================= */

function mimeTypeForFile(filePath) {
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

  return "image/png";
}


/* =========================================================
   PROMPT DE LA CASE
========================================================= */

function buildPrompt(
  memory,
  panel
) {
  return `
Create exactly ONE professional comic-book panel for the RE:START memory application.

MEMORY

Title:
${memory.title || ""}

Emotion:
${memory.emotion || "other"}

Date:
${memory.memory_date || "not specified"}

Location:
${memory.location || "not specified"}

Original memory:
${memory.text_content || ""}


PANEL

Visual description:
${
  panel.image_prompt ||
  panel.narration ||
  ""
}

Narration context:
${panel.narration || "none"}

Dialogue context:
${panel.dialogue || "none"}


VISUAL REQUIREMENTS

- cinematic graphic-novel illustration
- professional comic-book artwork
- preserve the identity and appearance of supplied reference characters
- expressive faces
- natural poses
- detailed environment
- environment faithful to the memory and location
- atmosphere consistent with the emotion "${memory.emotion || "other"}"
- landscape 4:3 composition
- no written text inside the image
- no dialogue bubbles
- no captions
- no logo
- no extra watermark
- generate exactly one final image
`.trim();
}


/* =========================================================
   AJOUTER LES PHOTOS DES PERSONNAGES
========================================================= */

function buildInput(
  prompt,
  characters = []
) {
  const input = [
    {
      type: "text",
      text: prompt,
    },
  ];


  /*
    On utilise maximum 4 personnages
    pour conserver une bonne cohérence.
  */

  for (
    const character
    of characters.slice(0, 4)
  ) {
    const filePath =
      localPathFromUploadUrl(
        character.image_url
      );


    if (
      !filePath ||
      !fs.existsSync(filePath)
    ) {
      continue;
    }


    input.push({
      type: "text",

      text:
        `Reference image for the character named "${character.name}". ` +
        `Keep this person's facial features, hair, skin tone and overall appearance ` +
        `consistent in the generated comic panel.`,
    });


    input.push({
      type: "image",

      mime_type:
        mimeTypeForFile(
          filePath
        ),

      data:
        fs
          .readFileSync(filePath)
          .toString("base64"),
    });
  }


  return input;
}


/* =========================================================
   EXTRAIRE L'IMAGE GEMINI
========================================================= */

function extractImage(
  interaction
) {
  /*
    Format principal actuel :
    interaction.output_image.data
  */

  if (
    interaction
      ?.output_image
      ?.data
  ) {
    return interaction
      .output_image
      .data;
  }


  /*
    Fallback utile lorsque Gemini
    renvoie plusieurs blocs.
  */

  for (
    const step
    of interaction?.steps || []
  ) {
    if (
      step?.type !==
      "model_output"
    ) {
      continue;
    }


    for (
      const block
      of step?.content || []
    ) {
      if (
        block?.type === "image" &&
        block?.data
      ) {
        return block.data;
      }
    }
  }


  return null;
}


/* =========================================================
   APPEL GEMINI IMAGE
========================================================= */

async function requestImage({
  apiKey,
  model,
  input,
}) {
  const ai =
    new GoogleGenAI({
      apiKey,
    });


  const interaction =
    await ai.interactions.create({

      model,

      input,

      response_format: {
        type: "image",

        mime_type:
          "image/png",

        aspect_ratio:
          "4:3",

        image_size:
          "1K",
      },

    });


  const imageData =
    extractImage(
      interaction
    );


  if (!imageData) {
    throw new Error(
      "Gemini n'a retourné aucune image exploitable."
    );
  }


  return imageData;
}


/* =========================================================
   GÉNÉRER UNE CASE BD
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


  /*
    Modèle principal + fallback.
  */

  const models = [
    process.env.GEMINI_IMAGE_MODEL ||
      "gemini-3.1-flash-image",

    process.env.GEMINI_IMAGE_FALLBACK_MODEL ||
      "gemini-3.1-flash-lite-image",
  ]
    .filter(Boolean);


  const uniqueModels =
    [...new Set(models)];


  const prompt =
    buildPrompt(
      memory,
      panel
    );


  const input =
    buildInput(
      prompt,
      characters
    );


  let lastError = null;


  /* =====================================================
     MODÈLES
  ===================================================== */

  for (
    const model
    of uniqueModels
  ) {

    /* ===================================================
       CLÉS GEMINI
    =================================================== */

    for (
      let keyIndex = 0;
      keyIndex < keys.length;
      keyIndex++
    ) {

      /* =================================================
         MAXIMUM 2 TENTATIVES PAR CLÉ
      ================================================= */

      for (
        let attempt = 1;
        attempt <= 2;
        attempt++
      ) {

        try {

          console.log(
            `Gemini Image ${model}, ` +
            `clé ${keyIndex + 1}/${keys.length}, ` +
            `tentative ${attempt}/2, ` +
            `case ${panel.panel_number}`
          );


          const imageData =
            await requestImage({

              apiKey:
                keys[keyIndex],

              model,

              input,

            });


          /* =============================================
             FICHIER
          ============================================= */

          const filename =
            `memory-${memory.id}` +
            `-panel-${panel.panel_number}` +
            `-${Date.now()}.png`;


          const absolutePath =
            path.join(
              generatedDir,
              filename
            );


          /* =============================================
             SAUVEGARDE
          ============================================= */

          fs.writeFileSync(

            absolutePath,

            Buffer.from(
              imageData,
              "base64"
            )

          );


          console.log(
            `Image BD créée : ${filename}`
          );


          /* =============================================
             URL SAUVEGARDÉE EN MYSQL
          ============================================= */

          return (
            `/uploads/generated/comics/` +
            filename
          );

        } catch (error) {

          lastError =
            error;


          const message =
            error?.message ||
            String(error);


          console.error(

            `Gemini Image ${model}, ` +
            `clé ${keyIndex + 1}/${keys.length}, ` +
            `tentative ${attempt}/2, ` +
            `case ${panel.panel_number}:`,

            message

          );


          /*
            Pas d'erreur temporaire :
            inutile de refaire exactement
            le même appel avec cette clé.
          */

          if (
            !isRetryable(error)
          ) {
            break;
          }


          /*
            Si deuxième tentative terminée,
            passer à la clé suivante.
          */

          if (
            attempt === 2
          ) {
            break;
          }


          await sleep(
            attempt === 1
              ? 1800
              : 3500
          );
        }
      }
    }
  }


  throw (
    lastError ||

    new Error(
      "Impossible de générer l'image de cette case."
    )
  );
}


module.exports = {
  generateComicPanelImage,
};
