const express = require("express");
const router = express.Router();
const paymentRequestController = require("../controllers/paymentRequestController");

// Create a new payment request
router.post("/", paymentRequestController.createPaymentRequest);

// Get all payment requests for a user
router.get("/:userUUID", paymentRequestController.getPaymentRequests);

// Update payment request status
router.put("/:id/status", paymentRequestController.updatePaymentRequestStatus);


router.put("/:id/decline", paymentRequestController.declinePaymentRequest);


// New route for single request
router.get("/detail/:id", paymentRequestController.getPaymentRequestById);

// ✅ New paid route
router.post("/paid/:id", paymentRequestController.markPaymentRequestPaid);

// Existing routes...
router.post("/repay/:id", paymentRequestController.addRepayment); // 👈 New route


// ✅ New route to fetch all requests for a user
router.get("/user/:userUUID", paymentRequestController.getAllUserPaymentRequests);


module.exports = router;
