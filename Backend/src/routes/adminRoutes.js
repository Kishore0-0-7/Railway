// Imports from the packages
const express = require("express");

// Imports from the folder Controller
const {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin,
  adminLogin,
  getBookingStats,
  getTotalRevenue,
  getTotalBookings,
  getAvgBookingHours,
  getTodayBookings,
} = require("../controller/adminController");

// Imports from the folder Middleware for the authentication (if you have one)
// const { authMiddleware } = require("../middleware/auth.middleware");

// Routes
const router = express.Router();

// ==================== POST Routes ====================

// Admin Login
router.post("/login", adminLogin);

// Create Admin Account
router.post("/register", createAdmin);

// ==================== GET Routes ====================

// Get All Admins
router.get("/get-all-admins", getAllAdmins);

// Get Admin by ID
router.get("/get-admin/:id", getAdminById);

// Get Booking Statistics (Total, Active, Completed)
router.get("/booking-stats", getBookingStats);

// Get Total Revenue
router.get("/total-revenue", getTotalRevenue);

// Get Total Bookings Count
router.get("/total-bookings", getTotalBookings);

// Get Average Booking Hours
router.get("/avg-booking-hours", getAvgBookingHours);

// Get Today's Bookings Count
router.get("/today-bookings", getTodayBookings);

// ==================== PUT Routes ====================

// Update Admin Details
router.put("/update-admin/:id", updateAdmin);

// Update Admin Password
router.put("/update-password/:id", updateAdminPassword);

// ==================== DELETE Routes ====================

// Delete Admin Account
router.delete("/delete-admin/:id", deleteAdmin);

module.exports = router;
