const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get user by userUUID or mobileNumber
exports.getUserByUUIDOrMobile = async (req, res) => {
  try {
    const { userUUID, mobileNumber } = req.query;

    if (!userUUID && !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide either userUUID or mobileNumber",
        data: null
      });
    }

    const user = await User.findOne({
      $or: [
        { userUUID: userUUID },
        { mobileNumber: mobileNumber }
      ]
    });

    if (!user) {
      return res.json({
        success: true,
        message: "No user found with the given criteria",
        data: null
      });
    }

    return res.json({
      success: true,
      message: "User retrieved successfully",
      data: {
        userUUID: user.userUUID,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Create new user
 
exports.createUser = async (req, res) => {
  try {
    const user = new User({
      userUUID: req.body.userUUID,
      name: req.body.name,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      imageUrl: req.body.imageUrl || "", // default "l" if not provided
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        userUUID: user.userUUID,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    let friendlyMessage = "Failed to create user";

    if (error.code === 11000) {
      friendlyMessage = `Duplicate field: ${Object.keys(error.keyPattern).join(", ")} already exists.`;
    }

    res.status(400).json({
      success: false,
      message: friendlyMessage,
      data:null,
      error: error.message,
    });
  }
};


// exports.createUser = async (req, res) => {
//   try {
//     let imageUrl = "";

//     // If an image file is included in the request, upload it to Cloudinary
//     if (req.file) {
//       const result = await cloudinary.uploader.upload(req.file.path, {
//         folder: "user_images",
//       });
//       imageUrl = result.secure_url;
//     }

//     // Merge imageUrl with other user data
//     const userData = {
//       ...req.body,
//       imageUrl: imageUrl || req.body.imageUrl || "l" // fallback to default "l"
//     };

//     const user = new User(userData);
//     await user.save();

//     res.status(201).json({
//       success: true,
//       message: "User created successfully",
//       data: user
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
