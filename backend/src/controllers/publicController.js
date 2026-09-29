const Memory = require("../models/Memory");
const Creation = require("../models/Creation");

exports.memory = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory || memory.access_level !== "public") {
      return res.status(404).json({ success: false, message: "Souvenir public introuvable." });
    }
    res.json({ success: true, data: memory });
  } catch (error) { next(error); }
};

exports.creation = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory || memory.access_level !== "public") {
      return res.status(404).json({ success: false, message: "Souvenir public introuvable." });
    }
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
  } catch (error) { next(error); }
};
