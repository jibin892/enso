const express = require("express");
const router = express.Router();
const paymentRequestController = require("../controllers/paymentRequestController");

// Create a new payment request
router.post("/", paymentRequestController.createPaymentRequest);

// Get all payment requests for a user
router.get("/:userUUID", paymentRequestController.getPaymentRequests);

// Update payment request status
router.put("/:id/status", paymentRequestController.updatePaymentRequestStatus);

module.exports = router;
