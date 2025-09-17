 const { sendNotification } = require("../config/onesignal");
const User = require("../models/User");
const PaymentRequest = require("../models/PaymentRequest");

// Send push notification from sender to receiver
exports.notifyUserByUUIDs = async (req, res) => {
  try {
    const { senderUserUUID, receiverUserUUID, type, amount, notes, currency } = req.body;

    if (!senderUserUUID || !receiverUserUUID || !type) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        error: {
          title: "Validation Error",
          description: "senderUserUUID, receiverUserUUID and type are required"
        }
      });
    }

    // 1️⃣ Get sender and receiver details
    const sender = await User.findOne({ userUUID: senderUserUUID });
    const receiver = await User.findOne({ userUUID: receiverUserUUID });

    if (!receiver || !sender) {
      return res.status(404).json({
        success: false,
        message: !receiver ? "Receiver not found" : "Sender not found",
        error: {
          title: "Not Found",
          description: !receiver
            ? `No user found with UUID: ${receiverUserUUID}`
            : `No user found with UUID: ${senderUserUUID}`
        }
      });
    }

    // 2️⃣ If PAYMENT_REQUEST, create the payment request first
    let paymentRequest = null;
    if (type === "PAYMENT_REQUEST") {
      if (!amount) {
        return res.status(400).json({
          success: false,
          message: "Amount required for payment request",
          error: {
            title: "Validation Error",
            description: "Amount must be provided when type is PAYMENT_REQUEST"
          }
        });
      }

      paymentRequest = new PaymentRequest({
        senderUserUUID,
        receiverUserUUID,
        amount,
        currency: currency || "INR",
        notes: notes || ""
      });

      await paymentRequest.save();
    }

    // 3️⃣ Build notification payload
    let payload = {
      include_aliases: { external_id: [receiver.userUUID] }, // Only notify receiver
      target_channel: "push",
      data: {
        senderUserUUID: sender.userUUID,
        receiverUserUUID: receiver.userUUID,
        type,
        amount: amount || null,
        currency: currency || "INR",
        notes: notes || null,
        paymentRequestId: paymentRequest ? paymentRequest._id : null // 👈 Include ID if created
      },
      headings: { en: "New Notification" },
      contents: { en: "You have a new update 🚀" }
    };

    // 4️⃣ Customize notification text
    switch (type) {
      case "PAYMENT_REQUEST":
        payload.headings.en = "Payment Request 💰";
        payload.contents.en = `${sender.name} has requested a payment of ₹${amount}.`;
        if (notes) payload.contents.en += ` Note: ${notes}`;
        payload.data.paymentType = "REQUEST";
        break;

  
      case "PAYMENT_REMINDER":
    payload.headings.en = "Payment Reminder ⏰";
    payload.contents.en = amount
      ? `Reminder: You still owe ₹${amount} to ${sender.name}.`
      : `Reminder: You have a pending payment to ${sender.name}.`;
    if (notes) payload.contents.en += ` Note: ${notes}`;
    payload.data.paymentType = "REMINDER";
    break;

      case "PAYMENT_RECEIPT":
        payload.headings.en = "Payment Received ✅";
        payload.contents.en = `Your payment of ₹${amount} to ${sender.name} was successful.`;
        if (notes) payload.contents.en += ` Note: ${notes}`;
        payload.data.paymentType = "RECEIPT";
        break;

      case "MESSAGE":
        payload.headings.en = `New message from ${sender.name}`;
        payload.contents.en = notes || `${sender.name} sent you a message.`;
        break;

      case "INVITE":
        payload.headings.en = "You have a new invite 🎉";
        payload.contents.en = `${sender.name} invited you to connect.`;
        break;

      case "PARTNER_MOTIVATION":
        payload.headings.en = "Stronger Together 💼";
        payload.contents.en = `Great partnerships create great success, ${receiver.name}. — ${sender.name}`;
        break;

      case "ALERT":
        payload.headings.en = "Important Alert ⚡";
        payload.contents.en = `${sender.name} sent you an urgent update.`;
        if (notes) payload.contents.en += ` Note: ${notes}`;
        break;

      default:
        payload.contents.en = `Hi ${receiver.name}, you got a new notification from ${sender.name}.`;
        if (notes) payload.contents.en += ` Note: ${notes}`;
    }

    // 5️⃣ Send via OneSignal
    const result = await sendNotification(payload);

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      sender,
      receiver,
      paymentRequest,
      payload,
      error: null,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: {
        title: "OneSignal Error",
        description: error.message
      }
    });
  }
};
