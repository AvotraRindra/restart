const { GoogleGenAI } = require("@google/genai");

function cleanJSON(text) {
    const cleaned = String(text || "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function askGemini(prompt) {
    const keys = [
        ...(process.env.GEMINI_API_KEYS || "").split(","),
        process.env.GEMINI_API_KEY || "",
        process.env.GEMINI_API_KEY_1 || "",
        process.env.GEMINI_API_KEY_2 || "",
        process.env.GEMINI_API_KEY_3 || "",
        process.env.GEMINI_API_KEY_4 || "",
        process.env.GEMINI_API_KEY_5 || "",
    ].map(k => k.trim()).filter(Boolean);

    const uniqueKeys = [...new Set(keys)];
    if (!uniqueKeys.length) {
        throw new Error("Aucune clé Gemini configurée. Ajoutez GEMINI_API_KEY ou GEMINI_API_KEYS.");
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    let lastError = null;

    // Chaque clé est essayée. Les erreurs temporaires/rate limit passent automatiquement à la suivante.
    for (let index = 0; index < uniqueKeys.length; index++) {
        const key = uniqueKeys[index];
        const ai = new GoogleGenAI({ apiKey: key });

        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await ai.models.generateContent({ model, contents: prompt });
                return cleanJSON(response.text);
            } catch (error) {
                lastError = error;
                const message = error?.message || String(error);
                const retryable = /429|503|UNAVAILABLE|RESOURCE_EXHAUSTED|rate|quota|high demand|temporar/i.test(message);
                console.error(`Gemini clé ${index + 1}/${uniqueKeys.length}, tentative ${attempt}/2:`, message);
                if (!retryable) throw error;
                if (attempt < 2) await sleep(800 * (index + 1));
            }
        }
    }

    throw lastError || new Error("Toutes les clés Gemini ont échoué.");
}

async function generateBook(memory) {
    return askGemini(`
Tu es MNEMOS, l'IA de RE:START.

Transforme ce souvenir en petit livre émotionnel de 5 à 8 pages.
Reste fidèle aux faits. N'invente aucun événement important.

Titre du souvenir : ${memory.title}
Émotion : ${memory.emotion}
Date : ${memory.memory_date || ""}
Lieu : ${memory.location || ""}
Souvenir :
${memory.text_content || ""}

Retourne UNIQUEMENT un JSON valide :

{
  "title": "Titre du livre",
  "pages": [
    {
      "page_number": 1,
      "title": "Titre facultatif",
      "content": "Contenu de la page",
      "image_prompt": "Description d'une illustration"
    }
  ]
}
`);
}

async function generateVideo(memory, photos = []) {
    const photoHint = photos.length
        ? `L'utilisateur a fourni ${photos.length} photo(s). Les scènes pourront les utiliser comme références.`
        : "Aucune photo n'a encore été fournie.";

    return askGemini(`
Tu es MNEMOS, l'IA de RE:START.

Transforme ce souvenir en storyboard d'une vidéo émotionnelle de 30 à 60 secondes.
Le frontend ou un moteur vidéo assemblera ensuite les scènes.
${photoHint}

Titre : ${memory.title}
Émotion : ${memory.emotion}
Date : ${memory.memory_date || ""}
Lieu : ${memory.location || ""}
Souvenir :
${memory.text_content || ""}

Retourne UNIQUEMENT un JSON valide :

{
  "title": "Titre de la vidéo",
  "scenes": [
    {
      "scene_number": 1,
      "duration_seconds": 5,
      "narration": "Narration de cette scène",
      "image_prompt": "Description visuelle de la scène"
    }
  ]
}
`);
}

async function generateComic(memory, characters = []) {
    const characterHint = characters.length
        ? characters.map(c => `- ${c.name}`).join("\n")
        : "Aucun personnage référencé n'a encore été ajouté.";

    return askGemini(`
Tu es MNEMOS, l'IA de RE:START.

Transforme ce souvenir en bande dessinée de 6 à 10 cases.
Les personnages doivent rester cohérents.
Ne change pas les faits importants.

Personnages disponibles :
${characterHint}

Titre : ${memory.title}
Émotion : ${memory.emotion}
Date : ${memory.memory_date || ""}
Lieu : ${memory.location || ""}
Souvenir :
${memory.text_content || ""}

Retourne UNIQUEMENT un JSON valide :

{
  "title": "Titre de la BD",
  "panels": [
    {
      "panel_number": 1,
      "narration": "Narration éventuelle",
      "dialogue": "Dialogue éventuel",
      "image_prompt": "Description visuelle précise de la case"
    }
  ]
}
`);
}

module.exports = {
    generateBook,
    generateVideo,
    generateComic
};