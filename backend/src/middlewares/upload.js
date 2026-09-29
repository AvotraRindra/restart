const multer = require("multer");
const path = require("path");
const fs = require("fs");

function ensureFolder(folder) { fs.mkdirSync(folder, { recursive: true }); }
function uniqueName(file) {
  const ext = path.extname(file.originalname || "");
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
}

const audioDir = path.join(__dirname, "..", "uploads", "audio");
const imageDir = path.join(__dirname, "..", "uploads", "images");
ensureFolder(audioDir);
ensureFolder(imageDir);

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => cb(null, uniqueName(file)),
});
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename: (req, file, cb) => cb(null, uniqueName(file)),
});

const allowedAudio = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/webm", "audio/ogg", "audio/mp4", "audio/x-m4a"]);
const allowedImages = new Set(["image/jpeg", "image/png", "image/webp"]);

const audio = multer({
  storage: audioStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => allowedAudio.has(file.mimetype) ? cb(null, true) : cb(new Error("Format audio non supporte.")),
});

const images = multer({
  storage: imageStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => allowedImages.has(file.mimetype) ? cb(null, true) : cb(new Error("Format image non supporte.")),
});

module.exports = { audio, images };
