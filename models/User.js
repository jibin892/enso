const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userUUID: { type: String, required: true, unique: true }, // unique user identifier
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true, unique: true },
  platform: { 
    type: String, 
    enum: ["ANDROID", "IOS", "WEB", "DESKTOP", "UNKNOWN"], 
    default: "UNKNOWN" 
  },
  imageUrl: { type: String, default: "https://cdn-icons-png.flaticon.com/512/9187/9187604.png" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

