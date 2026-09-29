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
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY manquante.");
    }

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
                contents: prompt
            });

            return cleanJSON(response.text);

        } catch (error) {
            const message = error?.message || String(error);

            const temporaryError =
                message.includes("503") ||
                message.includes("UNAVAILABLE") ||
                message.includes("high demand");

            console.error(
                `Gemini tentative ${attempt}/${maxAttempts}:`,
                message
            );

            if (!temporaryError || attempt === maxAttempts) {
                throw error;
            }

            const delay =
                attempt === 1 ? 1000 :
                attempt === 2 ? 2000 :
                attempt === 3 ? 4000 :
                8000;

            await sleep(delay);
        }
    }
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