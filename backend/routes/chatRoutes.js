const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const {
  fetchChats,
  fetchChat,
  createChat,
  deleteChat,
} = require("../controllers/chatController.js");

const router = express.Router();

router.use(authenticateUser);

router.route("/").get(fetchChats);
router.route("/:id").get(fetchChat);
router.route("/").post(createChat);
router.route("/:id").delete(deleteChat);

module.exports = router;
