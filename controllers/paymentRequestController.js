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
      status: { $nin: ["DECLINED", "PAID"] } // ✅ must use $nin
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


 

// ✅ Get a single payment request by ID (with sender & receiver details + history + readable date)
exports.getPaymentRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Fetch the request by ID
    const reqDoc = await PaymentRequest.findOne({
      _id: id,
      status: { $ne: "DECLINED" } // exclude declined
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

    // 4️⃣ Fetch previous payment requests between same sender & receiver
    const previousRequests = await PaymentRequest.find({
      _id: { $ne: reqDoc._id }, // exclude current request
      $or: [
        { senderUserUUID: reqDoc.senderUserUUID, receiverUserUUID: reqDoc.receiverUserUUID },
        { senderUserUUID: reqDoc.receiverUserUUID, receiverUserUUID: reqDoc.senderUserUUID }
      ],
      status: { $ne: "DECLINED" }
    }).sort({ createdAt: -1 });

    const enrichedPrevious = await Promise.all(
      previousRequests.map(async (p) => {
        const pSender = await User.findOne({ userUUID: p.senderUserUUID }).select(
          "userUUID name email mobileNumber platform imageUrl"
        );
        const pReceiver = await User.findOne({ userUUID: p.receiverUserUUID }).select(
          "userUUID name email mobileNumber platform imageUrl"
        );
        return {
          _id: p._id,
          sender: pSender || null,
          receiver: pReceiver || null,
          amount: p.amount,
          currency: p.currency,
          notes: p.notes,
          status: p.status,
          readableDate: new Date(p.createdAt).toLocaleString("en-IN", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        };
      })
    );

    // 5️⃣ Return enriched current request + history
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
        markAsFriendCredit:reqDoc.markAsFriendCredit,
        readableDate: humanReadableDate,
        previousRequests: enrichedPrevious.filter((p) => p._id.toString() !== reqDoc._id.toString()) // ✅ Added history
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


 
// helper to generate random transaction IDs
function generateTransactionId() {
  return "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// ✅ Mark a payment request as PAID by ObjectId
exports.markPaymentRequestPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, method, paidAt, markAsFriendCredit } = req.body; // 👈 added param

    // generate random ID if not provided
    const finalTransactionId = transactionId || generateTransactionId();

    const request = await PaymentRequest.findByIdAndUpdate(
      id,
      {
        status: "PAID",
        transactionId: finalTransactionId,
        paymentMethod: method || "UPI", // 👈 default UPI
        paidAt: paidAt || new Date(),
        markAsFriendCredit: markAsFriendCredit === true // store boolean safely
      },
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

    // make human readable
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
      message: "Payment request marked as PAID successfully",
      data: {
        ...request.toObject(),
        readableDate: humanReadableDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark payment as PAID",
      error: {
        title: "Server Error",
        description: error.message
      }
    });
  }
};
