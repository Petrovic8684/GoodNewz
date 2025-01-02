const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const {
  fetchMessages,
  sendMessage,
  deleteMessage,
} = require("../controllers/messageController.js");

const router = express.Router();

router.use(authenticateUser);

router.route("/").get(fetchMessages);
router.route("/").put(sendMessage);
router.route("/:id").delete(deleteMessage);

module.exports = router;
