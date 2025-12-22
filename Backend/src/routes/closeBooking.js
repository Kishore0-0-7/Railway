// Settings Routes
const express = require("express");
const { closeBooking,getWorkerDashboard,updateWorkerBalance } = require("../controller/closingController");
const router = express.Router();

router.get("/get-bookings-worker/:adminId/:workerId", closeBooking);
router.get("/worker-dashboard/:adminId/:workerId", getWorkerDashboard);
router.put("/update-worker-balance/:adminId/:workerId", updateWorkerBalance);
module.exports = router;
