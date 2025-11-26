// Imports from the packages
const express = require("express");

// Imports from the folder Controller
const {
  createSettings,
  getSettings,
  getAllSettings,
  updateSettings,
  partialUpdateSettings,
  upsertSettings,
  deleteSettings,
  getSettingById,
  uploadLogo,
} = require("../controller/settingController");

// Imports from the folder Middleware
const upload = require("../middleware/uploadMiddleware");
// const { authMiddleware } = require("../middleware/auth.middleware");

// Routes
const router = express.Router();

// ==================== SETTINGS CRUD ROUTES ====================

// Create new settings for an admin
// POST /api/settings/create-settings/:admin_id
router.post("/create-settings/:admin_id", createSettings);

// Get settings by admin_id (Primary endpoint for frontend)
// GET /api/settings/get-settings/:admin_id
router.get("/get-settings/:admin_id", getSettings);

// Get all settings for all admins
// GET /api/settings/get-all-settings
router.get("/get-all-settings", getAllSettings);

// Get setting by setting ID (primary key)
// GET /api/settings/get-setting-by-id/:id
router.get("/get-setting-by-id/:id", getSettingById);

// Full update of settings
// PUT /api/settings/update-settings/:admin_id
router.put("/update-settings/:admin_id", updateSettings);

// Partial update (PATCH) of settings
// PATCH /api/settings/partial-update-settings/:admin_id
router.patch("/partial-update-settings/:admin_id", partialUpdateSettings);

// Create or update settings (Upsert - Main endpoint used by frontend)
// POST /api/settings/upsert-settings/:admin_id
router.post("/upsert-settings/:admin_id", upsertSettings);

// Upload logo image for admin
// POST /api/settings/upload-logo/:admin_id
router.post(
  "/upload-logo/:admin_id",
  (req, res, next) => {
    upload.single("logo")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }
      next();
    });
  },
  uploadLogo
);

// Delete settings by admin_id
// DELETE /api/settings/delete-settings/:admin_id
router.delete("/delete-settings/:admin_id", deleteSettings);

module.exports = router;
