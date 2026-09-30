const { GoogleGenAI } = require("@google/genai");

function cleanJSON(text) {
  const cleaned = String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

function getGeminiKeys() {
  return [...new Set([
    ...(process.env.GEMINI_API_KEYS || "").split(","),
    process.env.GEMINI_API_KEY || "",
    process.env.GEMINI_API_KEY_1 || "",
    process.env.GEMINI_API_KEY_2 || "",
    process.env.GEMINI_API_KEY_3 || "",
    process.env.GEMINI_API_KEY_4 || "",
    process.env.GEMINI_API_KEY_5 || "",
  ].map((k) => k.trim()).filter(Boolean))];
}

async function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function askGeminiText(prompt) {
  const keys = getGeminiKeys();
  if (!keys.length) throw new Error("Aucune clé Gemini configurée. Ajoutez GEMINI_API_KEY ou GEMINI_API_KEYS.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  let lastError = null;

  for (let index = 0; index < keys.length; index += 1) {
    const ai = new GoogleGenAI({ apiKey: keys[index] });
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        const text = String(response.text || "").trim();
        if (!text) throw new Error("Réponse Gemini vide.");
        return text;
      } catch (error) {
        lastError = error;
        const message = error?.message || String(error);
        const retryable = /429|503|UNAVAILABLE|RESOURCE_EXHAUSTED|rate|quota|high demand|temporar/i.test(message);
        console.error(`Gemini clé ${index + 1}/${keys.length}, tentative ${attempt}/2:`, message);
        if (!retryable) throw error;
        if (attempt < 2) await sleep(800 * (index + 1));
      }
    }
  }
  throw lastError || new Error("Toutes les clés Gemini ont échoué.");
}

async function askGeminiJSON(prompt) { return cleanJSON(await askGeminiText(prompt)); }

async function generateBook(memory) {
  return askGeminiJSON(`
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
    {"page_number": 1, "title": "Titre facultatif", "content": "Contenu de la page", "image_prompt": "Description d'une illustration"}
  ]
}`);
}

async function generateVideo(memory, photos = []) {
  const photoHint = photos.length ? `L'utilisateur a fourni ${photos.length} photo(s). Les scènes pourront les utiliser comme références.` : "Aucune photo n'a encore été fournie.";
  return askGeminiJSON(`
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
    {"scene_number": 1, "duration_seconds": 5, "narration": "Narration de cette scène", "image_prompt": "Description visuelle de la scène"}
  ]
}`);
}

async function generateComic(memory, characters = []) {
  const characterHint = characters.length ? characters.map((c) => `- ${c.name}`).join("\n") : "Aucun personnage référencé n'a encore été ajouté.";
  return askGeminiJSON(`
Tu es MNEMOS, l'IA de RE:START.
Transforme ce souvenir en bande dessinée de 6 à 10 cases.
Les personnages doivent rester cohérents. Ne change pas les faits importants.

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
    {"panel_number": 1, "narration": "Narration éventuelle", "dialogue": "Dialogue éventuel", "image_prompt": "Description visuelle précise de la case"}
  ]
}`);
}

module.exports = { generateBook, generateVideo, generateComic, askGeminiText };
