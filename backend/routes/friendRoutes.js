const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const {
  fetchFriendsOverview,
  addFriend,
  removeFriend,
} = require("../controllers/friendController.js");

const router = express.Router();

router.use(authenticateUser);

router.route("/").get(fetchFriendsOverview);
router.route("/").put(addFriend);
router.route("/").delete(removeFriend);

module.exports = router;
