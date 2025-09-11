const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userUUID: { type: String, required: true, unique: true }, // matches KMP userUUID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true, unique: true },
  imageUrl: { type: String, default: "l" } // default value same as Kotlin
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
