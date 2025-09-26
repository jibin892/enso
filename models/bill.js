// models/bill.js
const mongoose = require("mongoose");

// ---------------- Bill Item Schema ----------------
const billItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "" },
    price: { type: Number, required: true },
    total: {
      type: Number,
      default: function () {
        return (this.quantity || 0) * (this.price || 0);
      },
    },
  },
  { _id: false }
);

// ---------------- Bill Schema ----------------
const billSchema = new mongoose.Schema(
  {
    billUUID: { type: String, required: true, unique: true },
    billNumber: { type: String, required: true, unique: true }, // INV-1000
    billDate: { type: Date, required: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String },
      email: { type: String },
      address: { type: String },
    },
    items: [billItemSchema],
    grandTotal: { type: Number, required: true, default: 0 },
    gst: { type: Number, required: false, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED"],
      default: "PENDING",
    },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-calc grand total before save
billSchema.pre("save", function (next) {
  this.grandTotal = this.items.reduce(
    (sum, item) => sum + (item.total || item.quantity * item.price),
    0
  );
  next();
});

module.exports = mongoose.model("Bill", billSchema);

