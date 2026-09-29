const User = require("../models/User");

exports.search = async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) return res.json({ success: true, data: [] });
    const users = await User.search(q);
    res.json({ success: true, data: users.filter((u) => Number(u.id) !== Number(req.user.id)) });
  } catch (error) { next(error); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { nom, bio, sexe, dateNaissance } = req.body;
    if (nom != null && String(nom).trim().length < 2) {
      return res.status(400).json({ success: false, message: "Le nom doit contenir au moins 2 caractères." });
    }
    if (sexe && !["homme", "femme", "autre"].includes(sexe)) {
      return res.status(400).json({ success: false, message: "Valeur de sexe invalide." });
    }
    const user = await User.updateProfile(req.user.id, { nom, bio, sexe, dateNaissance });
    res.json({ success: true, data: user, message: "Profil mis à jour." });
  } catch (error) { next(error); }
};

exports.updatePhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Aucune photo reçue." });
    const photo = `/uploads/images/${req.file.filename}`;
    const user = await User.updatePhoto(req.user.id, photo);
    res.json({ success: true, data: user, message: "Photo de profil mise à jour." });
  } catch (error) { next(error); }
};
