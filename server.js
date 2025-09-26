const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); // ✅ Parse form data

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

const notificationRoutes = require("./routes/onesignal");
app.use("/api/notifications", notificationRoutes);

const paymentRequestRoutes = require("./routes/paymentRequestRoutes");
app.use("/api/payment-requests", paymentRequestRoutes);


// Routes
const billRoutes = require("./routes/billRoutes");
app.use("/api/bills", billRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));



  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
 








// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Routes
// const userRoutes = require("./routes/userRoutes");
// app.use("/api/users", userRoutes);

// const uploadRoutes = require("./routes/uploadRoutes");
// app.use("/api/upload", uploadRoutes);

// // Connect MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// mongoose.connection.once("open", async () => {
//   console.log("✅ MongoDB Connected");

//   try {
//     const db = mongoose.connection.db;
//     const indexes = await db.collection("users").indexes(); // ✅ correct way in Mongoose 7+
//     console.log("📌 Current Indexes:", indexes);

//     // Check if `platform_1` is unique
//     const platformIndex = indexes.find(
//       (idx) => idx.name === "platform_1" && idx.unique
//     );

//     if (platformIndex) {
//       console.log("⚠️ Found unique index on platform. Dropping...");
//       await db.collection("users").dropIndex("platform_1");
//       console.log("✅ Dropped unique index on platform");
//     }
//   } catch (err) {
//     console.error("❌ Index Check Error:", err.message);
//   }
// });

// mongoose.connection.on("error", (err) => {
//   console.error("❌ DB Connection Error:", err);
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

