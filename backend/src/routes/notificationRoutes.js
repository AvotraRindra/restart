const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/notificationController");
router.get("/", auth, c.list);
router.patch("/:id/read", auth, c.markRead);
module.exports = router;
