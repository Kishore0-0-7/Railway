const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// Configure storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      // Extract admin_id from route params
      const admin_id = req.params.admin_id;

      if (!admin_id) {
        return cb(new Error("Admin ID is required in route params"), null);
      }

      // Get admin email from database
      const result = await db.query(
        "SELECT email FROM admin_accounts WHERE admin_id = $1",
        [admin_id]
      );

      if (result.rows.length === 0) {
        return cb(new Error("Admin not found"), null);
      }

      const adminEmail = result.rows[0].email;
      // Sanitize email for folder name (replace @ and . with _)
      const sanitizedEmail = adminEmail.replace(/@/g, "_").replace(/\./g, "_");

      // Create folder path: uploads/admin_email/
      const uploadDir = path.join(__dirname, "../../uploads", sanitizedEmail);

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    } catch (error) {
      console.error("Error in multer destination:", error);
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename: logo_timestamp.extension
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `logo_${timestamp}${ext}`);
  },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
