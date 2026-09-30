const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { attachments } = require("../middlewares/upload");
const c = require("../controllers/conversationController");

router.get("/", auth, c.list);
router.post("/", auth, c.create);
router.get("/:id/messages", auth, c.messages);
router.post("/:id/messages", auth, attachments.array("attachments", 5), c.sendMessage);
router.get("/:id/attachments/:attachmentId", auth, c.downloadAttachment);
router.post("/:id/members", auth, c.addMember);
module.exports = router;
