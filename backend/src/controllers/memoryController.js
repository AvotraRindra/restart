const Memory = require("../models/Memory");
const transcription = require("../services/transcriptionService");
const TYPES = new Set(["livre", "video", "bd"]);
const EMOTIONS = new Set(["joyeux","triste","colere","peur","surprise","nostalgique","calme","autre"]);

exports.create = async (req, res, next) => {
  try {
    const { memoryType, emotion = "autre", title, text, date, time, location, access = "private" } = req.body;
    if (!TYPES.has(memoryType)) return res.status(400).json({ success: false, message: "memoryType doit etre livre, video ou bd." });
    if (!EMOTIONS.has(emotion)) return res.status(400).json({ success: false, message: "Emotion invalide." });
    if (!title) return res.status(400).json({ success: false, message: "Le titre est obligatoire." });
    if (!["private","public"].includes(access)) return res.status(400).json({ success: false, message: "access doit etre private ou public." });

    let textContent = text?.trim() || null;
    let audioUrl = null;
    let transcriptionStatus = "none";
    let warning = null;

    if (req.file) {
      audioUrl = `/uploads/audio/${req.file.filename}`;
      transcriptionStatus = "pending";
      try {
        textContent = await transcription.transcribe(audioUrl);
        transcriptionStatus = "completed";
      } catch (error) {
        transcriptionStatus = "failed";
        warning = error.message;
      }
    }

    if (!textContent && !audioUrl) return res.status(400).json({ success: false, message: "Ajoutez un texte ou un fichier audio." });

    const memory = await Memory.create({ ownerId: req.user.id, memoryType, emotion, title, textContent, audioUrl, transcriptionStatus, date, time, location, access });
    res.status(201).json({
      success: true,
      message: warning ? "Souvenir sauvegarde. La transcription a echoue mais l'audio est conserve." : "Souvenir cree avec succes.",
      warning,
      data: memory,
    });
  } catch (error) { next(error); }
};

exports.mine = async (req, res, next) => { try { res.json({ success: true, data: await Memory.mine(req.user.id) }); } catch (e) { next(e); } };
exports.shared = async (req, res, next) => { try { res.json({ success: true, data: await Memory.shared() }); } catch (e) { next(e); } };

exports.getOne = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ success: false, message: "Souvenir introuvable." });
    if (memory.owner_id !== req.user.id && memory.access_level !== "public") return res.status(403).json({ success: false, message: "Acces refuse." });
    res.json({ success: true, data: memory });
  } catch (e) { next(e); }
};

exports.updateAccess = async (req, res, next) => {
  try {
    const { access } = req.body;
    if (!["private","public"].includes(access)) return res.status(400).json({ success: false, message: "access doit etre private ou public." });
    const ok = await Memory.updateAccess(req.params.id, req.user.id, access);
    if (!ok) return res.status(404).json({ success: false, message: "Souvenir introuvable." });
    res.json({ success: true, message: `Souvenir passe en ${access}.` });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const ok = await Memory.remove(req.params.id, req.user.id);
    if (!ok) return res.status(404).json({ success: false, message: "Souvenir introuvable." });
    res.json({ success: true, message: "Souvenir supprime." });
  } catch (e) { next(e); }
};

exports.addPhotos = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory || memory.owner_id !== req.user.id) return res.status(404).json({ success: false, message: "Souvenir introuvable." });
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: "Aucune photo recue." });
    const urls = files.map(f => `/uploads/images/${f.filename}`);
    await Memory.addPhotos(memory.id, urls);
    res.status(201).json({ success: true, data: await Memory.photos(memory.id) });
  } catch (e) { next(e); }
};

exports.addCharacter = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory || memory.owner_id !== req.user.id) return res.status(404).json({ success: false, message: "Souvenir introuvable." });
    if (memory.memory_type !== "bd") return res.status(400).json({ success: false, message: "Les personnages sont reserves aux souvenirs de type bd." });
    if (!req.file || !req.body.name) return res.status(400).json({ success: false, message: "name et image sont obligatoires." });
    const imageUrl = `/uploads/images/${req.file.filename}`;
    const id = await Memory.addCharacter(memory.id, req.body.name, imageUrl);
    res.status(201).json({ success: true, data: { id, name: req.body.name, image_url: imageUrl } });
  } catch (e) { next(e); }
};
