const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function makeToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

exports.register = async (req, res, next) => {
  try {
    const { nom, email, password, sexe, dateNaissance } = req.body;
    if (!nom || !email || !password)
      return res
        .status(400)
        .json({
          success: false,
          message: "nom, email et password sont obligatoires.",
        });
    if (password.length < 6)
      return res
        .status(400)
        .json({
          success: false,
          message: "Le mot de passe doit contenir au moins 6 caracteres.",
        });
    if (await User.findByEmail(email))
      return res
        .status(409)
        .json({ success: false, message: "Cet email est deja utilise." });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      nom,
      email,
      passwordHash,
      sexe,
      dateNaissance,
    });
    res
      .status(201)
      .json({ success: true, data: { user, token: makeToken(user.id) } });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
      return res
        .status(401)
        .json({ success: false, message: "Email ou mot de passe incorrect." });
    }
    const publicUser = await User.findPublicById(user.id);
    res.json({
      success: true,
      data: { user: publicUser, token: makeToken(user.id) },
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => res.json({ success: true, data: req.user });
