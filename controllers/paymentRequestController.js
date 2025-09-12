const PaymentRequest = require("../models/PaymentRequest");

// ✅ Create new payment request
exports.createPaymentRequest = async (req, res) => {
  try {
    const { senderUserUUID, receiverUserUUID, amount, notes, currency } = req.body;

    if (!senderUserUUID || !receiverUserUUID || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        error: {
          title: "Validation Error",
          description: "senderUserUUID, receiverUserUUID, and amount are required"
        }
      });
    }

    const paymentRequest = new PaymentRequest({
      senderUserUUID,
      receiverUserUUID,
      amount,
      currency: currency || "INR",
      notes: notes || ""
    });

    await paymentRequest.save();

    res.status(201).json({
      success: true,
      message: "Payment request created successfully",
      data: paymentRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create payment request",
      error: {
        title: "Server Error",
        description: error.message
      }
    });
  }
};

// ✅ Get all payment requests for a user
exports.getPaymentRequests = async (req, res) => {
  try {
    const { userUUID } = req.params;

    const requests = await PaymentRequest.find({
      $or: [{ senderUserUUID: userUUID }, { receiverUserUUID: userUUID }]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Payment requests retrieved successfully",
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment requests",
      error: {
        title: "Server Error",
        description: error.message
      }
    });
  }
};

// ✅ Update payment request status
exports.updatePaymentRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, PAID, DECLINED

    if (!["PENDING", "PAID", "DECLINED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        error: {
          title: "Validation Error",
          description: "Status must be PENDING, PAID, or DECLINED"
        }
      });
    }

    const request = await PaymentRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Payment request not found",
        error: {
          title: "Not Found",
          description: `No request found with ID: ${id}`
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment request status updated successfully",
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update payment request status",
      error: {
        title: "Server Error",
        description: error.message
      }
    });
  }
};
