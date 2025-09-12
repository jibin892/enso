const { sendNotification } = require("../config/onesignal");

exports.sendUserNotification = async (req, res) => {
  try {
    // everything from curl body can be passed here
    const payload = req.body;

    if (!payload.contents || !payload.contents.en) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        error: {
          title: "Validation Error",
          description: "At least 'contents.en' is required"
        }
      });
    }

    const result = await sendNotification(payload);

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
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
