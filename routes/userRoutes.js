const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// CRUD endpoints
router.get("/", userController.getUsers);
router.post("/", userController.createUser);
router.get("/:id", userController.getUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// ✅ New route: get user by userUUID or mobileNumber
router.get("/find/by", userController.getUserByUUIDOrMobile);


module.exports = router;
