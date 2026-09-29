const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/authController");
router.post("/register", c.register);
router.post("/login", c.login);
router.get("/me", auth, c.me);
module.exports = router;
