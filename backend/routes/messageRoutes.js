const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const {
  fetchMessages,
  sendMessage,
} = require("../controllers/messageController.js");

const router = express.Router();

router.use(authenticateUser);

router.route("/").get(fetchMessages);
router.route("/").put(sendMessage);

module.exports = router;
