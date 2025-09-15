const PaymentRequest = require("../models/PaymentRequest");
const User = require("../models/User");

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

// ✅ Get all payment requests for a user (with sender & receiver details + readable date)
exports.getPaymentRequests = async (req, res) => {
  try {
    const { userUUID } = req.params;

    // 1️⃣ Fetch all requests involving this user
    const requests = await PaymentRequest.find({
      $or: [ { receiverUserUUID: userUUID }],
      status: { $ne: "DECLINED" }   // 👈 exclude declined
    }).sort({ createdAt: -1 });

    // 2️⃣ Enrich with user details and readable date
    const enrichedRequests = await Promise.all(
      requests.map(async (reqDoc) => {
        const sender = await User.findOne({ userUUID: reqDoc.senderUserUUID }).select(
          "userUUID name email mobileNumber platform imageUrl"
        );
        const receiver = await User.findOne({ userUUID: reqDoc.receiverUserUUID }).select(
          "userUUID name email mobileNumber platform imageUrl"
        );

        // Format createdAt to human-readable
        const humanReadableDate = new Date(reqDoc.createdAt).toLocaleString("en-IN", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        return {
          _id: reqDoc._id,
          sender: sender || null,
          receiver: receiver || null,
          amount: reqDoc.amount,
          currency: reqDoc.currency,
          notes: reqDoc.notes,
          status: reqDoc.status,
          createdAt: reqDoc.createdAt,
          updatedAt: reqDoc.updatedAt,
          readableDate: humanReadableDate // ✅ Added field
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Payment requests retrieved successfully",
      data: enrichedRequests
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

// ✅ Decline a payment request
exports.declinePaymentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await PaymentRequest.findByIdAndUpdate(
      id,
      { status: "DECLINED" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Payment request not found",
        error: {
          title: "Not Found",
          description: `No payment request found with ID: ${id}`
        }
      });
    }

    // Add human-readable date
    const humanReadableDate = new Date(request.updatedAt).toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    res.status(200).json({
      success: true,
      message: "Payment request declined successfully",
      data: {
        ...request.toObject(),
        readableDate: humanReadableDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to decline payment request",
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


// ✅ Get a single payment request by ID (with sender & receiver details + readable date)
exports.getPaymentRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Fetch the request by ID (excluding declined if needed)
    const reqDoc = await PaymentRequest.findOne({
      _id: id,
      status: { $ne: "DECLINED" }  // exclude declined
    });

    if (!reqDoc) {
      return res.status(404).json({
        success: false,
        message: "Payment request not found",
        error: {
          title: "Not Found",
          description: `No active payment request found with ID: ${id}`
        }
      });
    }

    // 2️⃣ Get sender and receiver details
    const sender = await User.findOne({ userUUID: reqDoc.senderUserUUID }).select(
      "userUUID name email mobileNumber platform imageUrl"
    );
    const receiver = await User.findOne({ userUUID: reqDoc.receiverUserUUID }).select(
      "userUUID name email mobileNumber platform imageUrl"
    );

    // 3️⃣ Format createdAt to human-readable
    const humanReadableDate = new Date(reqDoc.createdAt).toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    // 4️⃣ Return enriched request
    res.status(200).json({
      success: true,
      message: "Payment request retrieved successfully",
      data: {
        _id: reqDoc._id,
        sender: sender || null,
        receiver: receiver || null,
        amount: reqDoc.amount,
        currency: reqDoc.currency,
        notes: reqDoc.notes,
        status: reqDoc.status,
        createdAt: reqDoc.createdAt,
        updatedAt: reqDoc.updatedAt,
        readableDate: humanReadableDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment request",
      error: {
        title: "Server Error",
        description: error.message
      }
    });
  }
};
