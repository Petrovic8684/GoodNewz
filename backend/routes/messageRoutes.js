const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const {
  fetchMessages,
  sendMessage,
  deleteMessage,
  markAsRead,
  reactToMessage,
} = require("../controllers/messageController.js");

const router = express.Router();

router.use(authenticateUser);

router.route("/").get(fetchMessages);
router.route("/").put(sendMessage);
router.route("/:id").delete(deleteMessage);
router.route("/markAsRead").post(markAsRead);
router.route("/:id/react").post(reactToMessage);

module.exports = router;
