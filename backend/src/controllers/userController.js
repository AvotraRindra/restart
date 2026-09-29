const User = require("../models/User");
exports.search = async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) return res.json({ success: true, data: [] });
    const users = await User.search(q);
    res.json({ success: true, data: users.filter(u => u.id !== req.user.id) });
  } catch (error) { next(error); }
};
