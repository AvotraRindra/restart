const express = require("express");
const router = express.Router();
const c = require("../controllers/publicController");
router.get("/memories/:id", c.memory);
router.get("/memories/:id/creation", c.creation);
module.exports = router;
