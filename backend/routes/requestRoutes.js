const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const {
  sendRequest,
  cancelRequest,
} = require("../controllers/requestController.js");

const router = express.Router();

router.use(authenticateUser);

router.route("/").put(sendRequest);
router.route("/").delete(cancelRequest);

module.exports = router;
