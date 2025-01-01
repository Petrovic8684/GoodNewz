const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const {
  fetchUser,
  registerUser,
  loginUser,
  updateUsername,
  uploadImage,
} = require("../controllers/userController.js");

const router = express.Router();

router.route("/:id").get(authenticateUser, fetchUser);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/:id/").put(authenticateUser, updateUsername);
router.route("/:id/uploadImage").post(authenticateUser, uploadImage);

module.exports = router;
