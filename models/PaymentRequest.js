const mongoose = require("mongoose");

const paymentRequestSchema = new mongoose.Schema(
  {
    senderUserUUID: { type: String, required: true },   // UUID of the user requesting payment
    receiverUserUUID: { type: String, required: true }, // UUID of the user receiving the request
    amount: { type: Number, required: true },           // requested amount
    currency: { type: String, default: "INR" },         // optional, defaults to INR
    notes: { type: String, default: "" },               // optional additional note
    status: { 
      type: String, 
      enum: ["PENDING", "PAID", "DECLINED"], 
      default: "PENDING" 
    }, // payment request lifecycle
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    transactionId: { type: String, default: null },
    paymentMethod: { type: String, default: null },
    paidAt: { type: Date, default: null },
    markAsFriendCredit: { type: Boolean, default: false }

  },
  { timestamps: true }
);

// Optional: add an index for faster lookups
paymentRequestSchema.index({ senderUserUUID: 1, receiverUserUUID: 1 });

module.exports = mongoose.model("PaymentRequest", paymentRequestSchema);
