const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// ✅ New route: send notification
router.post("/send", notificationController.sendUserNotification);

module.exports = router;
