const NotificationTransaction = require("../models/NotificationTransactionSchema");

// Save notification transaction details
exports.saveNotificationTransaction = async (req, res) => {
  try {
    const { packageName, title, message, amount, username, upiId, type, event } = req.body;

    if (!amount || !username) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        error: {
          title: "Validation Error",
          description: "Amount and username are required"
        }
      });
    }

    // 1️⃣ Create a transaction record
    const txn = new NotificationTransaction({
      packageName,
      title,
      message,
      username,
      amount,
      upiId,
      type: type || "PAYMENT",   // PAYMENT / EXPENSE / ALERT
      event: event || "recorded", // confirmed / debited / credited
      createdAt: new Date()
    });

    await txn.save();

    return res.status(201).json({
      success: true,
      message: "Notification transaction saved",
      data: txn
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save transaction",
      error: {
        title: "Server Error",
        description: error.message
      }
    });
  }
};
