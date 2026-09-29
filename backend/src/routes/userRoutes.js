const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const c = require("../controllers/userController");

router.get("/search", auth, c.search);
router.patch("/me", auth, c.updateMe);
router.post("/me/photo", auth, upload.images.single("photo"), c.updatePhoto);

module.exports = router;
