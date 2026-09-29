const Memory = require("../models/Memory");
const Creation = require("../models/Creation");
const service = require("../services/creationService");

exports.generate = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ success: false, message: "Souvenir introuvable." });
    if (memory.owner_id !== req.user.id) return res.status(403).json({ success: false, message: "Vous ne pouvez pas generer ce souvenir." });
    if (!memory.text_content) return res.status(400).json({ success: false, message: "Une transcription ou un texte est necessaire avant la generation." });
    await Memory.setGenerationStatus(memory.id, "generating");
    try {
      let result;
      if (memory.memory_type === "livre") {
        result = await service.generateBook(memory);
        await Creation.saveBook(memory.id, result.pages);
      } else if (memory.memory_type === "video") {
        result = await service.generateVideo(memory, await Memory.photos(memory.id));
        await Creation.saveVideo(memory.id, result.scenes);
      } else {
        result = await service.generateComic(memory, await Memory.characters(memory.id));
        await Creation.saveComic(memory.id, result.panels);
      }
      await Memory.setGenerationStatus(memory.id, "completed", result.title || null);
      res.json({ success: true, data: { type: memory.memory_type, creation: result } });
    } catch (error) {
      await Memory.setGenerationStatus(memory.id, "failed");
      res.status(502).json({ success: false, message: "Le souvenir est sauvegarde mais sa generation a echoue.", details: error.message });
    }
  } catch (e) { next(e); }
};

exports.getCreation = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ success: false, message: "Souvenir introuvable." });
    if (memory.owner_id !== req.user.id && memory.access_level !== "public") return res.status(403).json({ success: false, message: "Acces refuse." });
    res.json({
      success: true,
      data: {
        memory,
        photos: await Memory.photos(memory.id),
        characters: memory.memory_type === "bd" ? await Memory.characters(memory.id) : [],
        attachments: await Memory.attachments(memory.id),
        creation: await Creation.get(memory),
      },
    });
  } catch (e) { next(e); }
};
