const { sendNotification } = require("../config/onesignal");
const User = require("../models/User");

// Send push notification from sender to receiver
exports.notifyUserByUUIDs = async (req, res) => {
  try {
    const { senderUserUUID, receiverUserUUID, type } = req.body;

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

    // 1️⃣ Get sender and receiver details from DB
    const sender = await User.findOne({ userUUID: senderUserUUID });
    const receiver = await User.findOne({ userUUID: receiverUserUUID });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        sender:sender,
        receiver:receiver,
        message: "Receiver not found",
        error: {
          title: "Not Found",
          description: `No user found with UUID: ${receiverUserUUID}`
        }
      });
    }

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
          sender:sender,
        receiver:receiver,
        error: {
          title: "Not Found",
          description: `No user found with UUID: ${senderUserUUID}`
        }
      });
    }

    // 2️⃣ Build notification payload based on type
    let payload = {
      include_aliases: { external_id: [receiver.userUUID,senderUserUUID] },
      target_channel: "push",
      data: {
        senderUserUUID: sender.userUUID,
        receiverUserUUID: receiver.userUUID,
        type
      },
      headings: { en: "New Notification" },
      contents: { en: "You have a new update 🚀" }
    };

    switch (type) {
     case "PAYMENT_REQUEST":
    payload.headings.en = "Payment Request 💰";
    payload.contents.en = `${sender.name} has requested a payment from you. Please review and complete the transaction.`;
    payload.data.paymentType = "REQUEST";
    break;

  case "PAYMENT_RECEIPT":
    payload.headings.en = "Payment Received ✅";
    payload.contents.en = `Your payment to ${sender.name} has been received successfully. Thank you!`;
    payload.data.paymentType = "RECEIPT";
    break;


      case "MESSAGE":
        payload.headings.en = `New message from ${sender.name}`;
        payload.contents.en = `${sender.name} sent you a message.`;
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
        break;

      default:
        payload.contents.en = `Hi ${receiver.name}, you got a new notification from ${sender.name}.`;
    }

    // 3️⃣ Send notification via OneSignal
    const result = await sendNotification(payload);

    res.status(200).json({
      success: true,
         sender:sender,
        receiver:receiver,
        payload:payload,
      message: "Notification sent successfully",
      error: null,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
        sender:sender,
        receiver:receiver,
        payload:payload,
      message: "Failed to send notification",
      error: {
        title: "OneSignal Error",
        description: error.message
      }
    });
  }
};
