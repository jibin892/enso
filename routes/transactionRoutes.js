const express = require("express");
const router = express.Router();
const { saveNotificationTransaction } = require("../controllers/transactionController");

router.post("/transaction/save", saveNotificationTransaction);

module.exports = router;
