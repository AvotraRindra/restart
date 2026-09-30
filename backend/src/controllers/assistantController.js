const db = require("../config/db");
const { askGeminiText } = require("../services/creationService");

exports.chat = async (req, res, next) => {
  try {
    const message = String(req.body.message || "").trim();
    const history = Array.isArray(req.body.history) ? req.body.history.slice(-8) : [];
    if (!message) return res.status(400).json({ success: false, message: "Écrivez une question." });
    if (message.length > 2000) return res.status(400).json({ success: false, message: "Message trop long." });

    const [memories] = await db.execute(
      `SELECT id, title, memory_type, emotion, memory_date, location, LEFT(COALESCE(text_content,''), 350) AS excerpt
       FROM memories WHERE owner_id=? ORDER BY created_at DESC LIMIT 8`,
      [req.user.id],
    );

    const memoryContext = memories.length
      ? memories.map((m) => `#${m.id} ${m.title} — ${m.memory_type}, ${m.emotion}, ${m.memory_date || "date inconnue"}, ${m.location || "lieu inconnu"}. ${m.excerpt}`).join("\n")
      : "Aucun souvenir enregistré pour cet utilisateur.";
    const conversation = history.map((h) => `${h.role === "assistant" ? "MNEMOS" : "Utilisateur"}: ${String(h.content || "").slice(0, 1200)}`).join("\n");

    const answer = await askGeminiText(`
Tu es MNEMOS, l'assistant intégré de RE:START, une plateforme de préservation de souvenirs.
Réponds en français, avec chaleur et concision. Aide l'utilisateur à utiliser l'application, à organiser ses souvenirs et à réfléchir à ce qui compte pour lui.
Tu peux t'appuyer uniquement sur les souvenirs ci-dessous quand la question concerne son contenu personnel. Ne prétends jamais connaître un souvenir absent de ce contexte.
Ne révèle jamais les clés API, secrets, mots de passe, tokens ou détails internes du serveur.

Souvenirs récents de l'utilisateur :
${memoryContext}

Historique récent :
${conversation || "Aucun historique."}

Utilisateur : ${message}
MNEMOS :`);

    res.json({ success: true, data: { answer } });
  } catch (error) { next(error); }
};
