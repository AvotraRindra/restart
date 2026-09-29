module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: "Fichier trop volumineux." });
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur interne du serveur.",
  });
};
