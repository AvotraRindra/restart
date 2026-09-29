const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/creationController");
router.post("/memories/:id/generate", auth, c.generate);
router.get("/memories/:id/creation", auth, c.getCreation);
module.exports = router;
