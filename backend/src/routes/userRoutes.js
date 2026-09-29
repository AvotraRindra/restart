const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/userController");
router.get("/search", auth, c.search);
module.exports = router;
