const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const outputDir = path.join(
  __dirname,
  "..",
  "uploads",
  "generated",
  "comics"
);

fs.mkdirSync(outputDir, {
  recursive: true,
});


/* =========================================================
   CLÉS GEMINI
========================================================= */

function getGeminiKeys() {
  return [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY,
  ]
    .map((key) => key?.trim())
    .filter(Boolean)
    .filter(
      (key, index, array) =>
        array.indexOf(key) === index
    );
}


/* =========================================================
   ATTENTE
========================================================= */

function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}


/* =========================================================
   ERREURS TEMPORAIRES
========================================================= */

function isTemporaryError(error) {
  const message =
    error?.message ||
    String(error);

  return (
    message.includes("429") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("UNAVAILABLE") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("high demand") ||
    message.includes("timeout")
  );
}


/* =========================================================
   URL UPLOAD -> FICHIER LOCAL
========================================================= */

function uploadUrlToPath(url) {
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
   TYPE MIME
========================================================= */

function getMimeType(filePath) {
  const extension =
    path.extname(
      filePath
    ).toLowerCase();

  if (
    extension === ".jpg" ||
    extension === ".jpeg"
  ) {
    return "image/jpeg";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  return "image/png";
}


/* =========================================================
   INPUT GEMINI
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
    Maximum 4 personnages de référence.
    Gemini 3.1 Flash Image prend en charge
    la cohérence de plusieurs personnages.
  */

  for (
    const character
    of characters.slice(0, 4)
  ) {

    const filePath =
      uploadUrlToPath(
        character.image_url
      );


    if (
      !filePath ||
      !fs.existsSync(filePath)
    ) {
      continue;
    }


    const data =
      fs
        .readFileSync(
          filePath
        )
        .toString(
          "base64"
        );


    input.push({
      type: "text",

      text:
        `Photo de référence du personnage ` +
        `"${character.name}". ` +
        `Conserve son visage, ses cheveux ` +
        `et son apparence entre les cases.`,
    });


    input.push({
      type: "image",

      mime_type:
        getMimeType(
          filePath
        ),

      data,
    });
  }


  return input;
}


/* =========================================================
   PROMPT
========================================================= */

function buildPrompt(
  memory,
  panel
) {
  return `
Create one professional comic-book panel.

Memory title:
${memory.title || ""}

Main emotion:
${memory.emotion || ""}

Location:
${memory.location || ""}

Memory:
${memory.text_content || ""}

Panel visual description:
${panel.image_prompt || ""}

Narration:
${panel.narration || ""}

Dialogue:
${panel.dialogue || ""}

Requirements:
- cinematic graphic novel illustration
- professional comic book artwork
- preserve character appearance across panels
- use supplied reference images when available
- expressive faces
- detailed environment
- mood consistent with the emotion
- no written text in the generated image
- no dialogue bubbles
- no captions
- no logo
- no extra watermark
- landscape 4:3 composition
- generate exactly one image
`.trim();
}


/* =========================================================
   EXTRAIRE IMAGE DE LA RÉPONSE
========================================================= */

function extractImage(interaction) {

  /*
    Format principal documenté :
    interaction.output_image.data
  */

  if (
    interaction
      ?.output_image
      ?.data
  ) {

    return {
      data:
        interaction
          .output_image
          .data,

      mimeType:
        interaction
          .output_image
          .mime_type ||
        "image/png",
    };
  }


  /*
    Fallback :
    chercher dans steps
  */

  for (
    const step
    of interaction?.steps || []
  ) {

    if (
      step.type !==
      "model_output"
    ) {
      continue;
    }


    for (
      const block
      of step.content || []
    ) {

      if (
        block.type === "image" &&
        block.data
      ) {

        return {
          data:
            block.data,

          mimeType:
            block.mime_type ||
            "image/png",
        };
      }
    }
  }


  return null;
}


/* =========================================================
   EXTENSION
========================================================= */

function extensionFromMime(
  mimeType
) {

  if (
    mimeType ===
    "image/jpeg"
  ) {
    return ".jpg";
  }

  if (
    mimeType ===
    "image/webp"
  ) {
    return ".webp";
  }

  return ".png";
}


/* =========================================================
   UNE TENTATIVE GEMINI
========================================================= */

async function callGeminiImage({
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


  return interaction;
}


/* =========================================================
   GÉNÉRATION CASE BD
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
      "Aucune clé Gemini configurée."
    );
  }


  /*
    Modèle principal + fallback.
  */

  const models = [
    process.env
      .GEMINI_IMAGE_MODEL ||
      "gemini-3.1-flash-image",

    process.env
      .GEMINI_IMAGE_FALLBACK_MODEL ||
      "gemini-3.1-flash-lite-image",
  ];


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
    of models
  ) {

    /* ===================================================
       CLÉS
    =================================================== */

    for (
      let keyIndex = 0;
      keyIndex < keys.length;
      keyIndex++
    ) {

      const apiKey =
        keys[keyIndex];


      /* =================================================
         TENTATIVES
      ================================================= */

      for (
        let attempt = 1;
        attempt <= 2;
        attempt++
      ) {

        try {

          console.log(
            `Gemini Image ${model} ` +
            `clé ${keyIndex + 1}/${keys.length}, ` +
            `tentative ${attempt}/2, ` +
            `case ${panel.panel_number}`
          );


          const interaction =
            await callGeminiImage({
              apiKey,
              model,
              input,
            });


          const image =
            extractImage(
              interaction
            );


          if (!image) {

            /*
              Utile pour diagnostiquer
              ce que Gemini a réellement retourné.
            */

            console.error(
              "Réponse Gemini Image sans image :",
              JSON.stringify(
                interaction,
                null,
                2
              ).slice(
                0,
                4000
              )
            );


            throw new Error(
              "Gemini n'a retourné aucune image exploitable."
            );
          }


          /* =============================================
             SAUVEGARDE
          ============================================= */

          const extension =
            extensionFromMime(
              image.mimeType
            );


          const filename =
            `memory-${memory.id}` +
            `-panel-${panel.panel_number}` +
            `-${Date.now()}` +
            extension;


          const filePath =
            path.join(
              outputDir,
              filename
            );


          fs.writeFileSync(
            filePath,

            Buffer.from(
              image.data,
              "base64"
            )
          );


          console.log(
            `Image BD créée : ${filename}`
          );


          return (
            `/uploads/generated/comics/` +
            filename
          );

        } catch (error) {

          lastError = error;


          console.error(
            `Gemini Image ${model} ` +
            `clé ${keyIndex + 1}/${keys.length}, ` +
            `tentative ${attempt}/2, ` +
            `case ${panel.panel_number}:`,
            error?.message ||
            error
          );


          /*
            Erreur temporaire :
            attendre puis réessayer.
          */

          if (
            isTemporaryError(
              error
            )
          ) {

            if (
              attempt < 2
            ) {

              await sleep(
                attempt === 1
                  ? 2000
                  : 5000
              );
            }

            continue;
          }


          /*
            Erreur permanente :
            passer à la clé suivante.
          */

          break;
        }
      }
    }
  }


  throw (
    lastError ||
    new Error(
      "Impossible de générer l'image."
    )
  );
}


module.exports = {
  generateComicPanelImage,
};
