const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/assistantController");
router.post("/chat", auth, c.chat);
module.exports = router;
