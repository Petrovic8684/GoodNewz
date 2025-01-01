const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const {
  fetchChats,
  fetchChat,
  createChat,
} = require("../controllers/chatController.js");

const router = express.Router();

router.use(authenticateUser);

router.route("/").get(fetchChats);
router.route("/:id").get(fetchChat);
router.route("/").post(createChat);

module.exports = router;
