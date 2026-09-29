const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

async function transcribe(relativeAudioUrl) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY manquante.");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const filename = path.basename(relativeAudioUrl);
  const absolutePath = path.join(__dirname, "..", "uploads", "audio", filename);
  if (!fs.existsSync(absolutePath)) throw new Error(`Fichier audio introuvable : ${absolutePath}`);

  const result = await groq.audio.transcriptions.create({
    file: fs.createReadStream(absolutePath),
    model: process.env.TRANSCRIPTION_MODEL || "whisper-large-v3-turbo",
    response_format: "json",
    temperature: 0,
  });

  return String(result.text || "").trim();
}

module.exports = { transcribe };
