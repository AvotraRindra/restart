const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const c = require("../controllers/socialController");
router.post("/memories/:id/reactions", auth, c.reactMemory);
router.get("/memories/:id/comments", auth, c.getComments);
router.post("/memories/:id/comments", auth, c.addComment);
router.post("/comments/:commentId/reactions", auth, c.reactComment);
module.exports = router;
