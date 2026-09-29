const Notification = require("../models/Notification");
exports.list = async (req, res, next) => {
  try { res.json({ success: true, data: await Notification.list(req.user.id) }); }
  catch (e) { next(e); }
};
exports.markRead = async (req, res, next) => {
  try {
    const ok = await Notification.markRead(req.params.id, req.user.id);
    if (!ok) return res.status(404).json({ success: false, message: "Notification introuvable." });
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const count = await Notification.markAllRead(req.user.id);
    res.json({ success: true, data: { updated: count } });
  } catch (e) { next(e); }
};
