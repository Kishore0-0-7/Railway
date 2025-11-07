// Settings Routes
const express = require("express");
const router = express.Router();
const {
  getSettings,
  upsertSettings,
  deleteSettings,
} = require("../controller/settingsController");

// Get settings by admin_id
router.get("/get-settings/:admin_id", getSettings);

// Create or update settings
router.post("/upsert-settings/:admin_id", upsertSettings);

// Delete settings
router.delete("/delete-settings/:admin_id", deleteSettings);

module.exports = router;
