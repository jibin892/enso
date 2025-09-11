const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

// POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: req.file.path, // Cloudinary URL
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
