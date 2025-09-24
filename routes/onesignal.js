const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Send notification from sender to receiver
router.post("/send-between", notificationController.notifyUserByUUIDs);


module.exports = router;