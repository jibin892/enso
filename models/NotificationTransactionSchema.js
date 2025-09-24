const mongoose = require("mongoose");

const NotificationTransactionSchema = new mongoose.Schema({
  packageName: String,
  title: String,
  message: String,
  username: String,
  amount: Number,
  upiId: String,
  type: String,  // PAYMENT / EXPENSE / ALERT
  event: String, // confirmed / debited / credited
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("NotificationTransaction", NotificationTransactionSchema);
