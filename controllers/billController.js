// controllers/billController.js
const Bill = require("../models/bill");
const User = require("../models/User");
const { sendNotification } = require("../config/onesignal"); // your wrapper


// Create a new Bill
exports.createBill = async (req, res) => {
  try {
    const {
      billUUID,
      billNumber,
      billDate,
      customer,
      items,
      notes,
      createdBy,
    } = req.body;

    // 1️⃣ Save new bill
    const newBill = new Bill({
      billUUID,
      billNumber,
      billDate,
      customer,
      items,
      notes,
      createdBy,
    });

    const savedBill = await newBill.save();

    // 2️⃣ Find existing user by mobile number
    let customerUser = null;
    if (customer?.phone) {
      customerUser = await User.findOne({
        mobileNumber: new RegExp("^" + customer.phone.replace("+", "\\+")),
      });
    }

    // 3️⃣ Send notification only if user exists
    if (customerUser) {
      try {
        await sendNotification({
          include_external_user_ids: [customerUser.userUUID], // OneSignal External ID
          headings: { en: "New Bill Created" },
          contents: {
            en: `Hi ${customerUser.name}, your bill ${savedBill.billNumber} is ready!`,
          },
          data: {
            billId: savedBill._id,
            billNumber: savedBill.billNumber,
            amount: savedBill.grandTotal,
            bill: savedBill,
          },
        });
      } catch (notifyErr) {
        console.error("❌ Notification failed:", notifyErr.message);
      }
    }

    // 4️⃣ Response (always return bill, user optional)
    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: savedBill,
      customerUser: customerUser || null, // will be null if no user found
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating bill",
      error: error.message,
    });
  }
};



// Fetch all bills
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate("createdBy", "name email");
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bills",
      error: error.message,
    });
  }
};

// Fetch single bill by ID
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }
    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bill",
      error: error.message,
    });
  }
};
