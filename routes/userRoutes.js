const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/upload"); // multer-cloudinary middleware

// CRUD endpoints
router.get("/", userController.getUsers);
router.post("/", userController.createUser);
router.get("/:id", userController.getUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// ✅ New route: get user by userUUID or mobileNumber
router.get("/find/by", userController.getUserByUUIDOrMobile);
router.post("/update-image", userController.updateUserImage);

// ✅ IMAGE UPLOAD
router.post("/", upload.single("image"), userController.createUser);


module.exports = router;
