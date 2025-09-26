// routes/billRoutes.js
const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");

// Insert
router.post("/create", billController.createBill);

// Fetch all
router.get("/", billController.getBills);

// Fetch by ID
router.get("/:id", billController.getBillById);

module.exports = router;
