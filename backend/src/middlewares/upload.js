const multer = require("multer");
const path = require("path");
const fs = require("fs");

function ensureFolder(folder) { fs.mkdirSync(folder, { recursive: true }); }
function uniqueName(file) {
  const ext = path.extname(file.originalname || "").toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 10);
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
}

const uploadRoot = path.join(__dirname, "..", "uploads");
const audioDir = path.join(uploadRoot, "audio");
const imageDir = path.join(uploadRoot, "images");
const filesDir = path.join(uploadRoot, "files");
[audioDir, imageDir, filesDir].forEach(ensureFolder);

function storageFor(dir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => cb(null, uniqueName(file)),
  });
}

const allowedAudio = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/webm", "audio/ogg", "audio/mp4", "audio/x-m4a"]);
const allowedImages = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const allowedAttachments = new Set([
  ...allowedAudio,
  ...allowedImages,
  "video/mp4", "video/webm", "video/quicktime",
  "application/pdf", "text/plain", "text/markdown",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const audio = multer({
  storage: storageFor(audioDir),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => allowedAudio.has(file.mimetype) ? cb(null, true) : cb(new Error("Format audio non supporté.")),
});

const images = multer({
  storage: storageFor(imageDir),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => allowedImages.has(file.mimetype) ? cb(null, true) : cb(new Error("Format image non supporté.")),
});

const attachments = multer({
  storage: storageFor(filesDir),
  limits: { fileSize: 35 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => allowedAttachments.has(file.mimetype) ? cb(null, true) : cb(new Error("Type de pièce jointe non autorisé.")),
});

module.exports = { audio, images, attachments };
