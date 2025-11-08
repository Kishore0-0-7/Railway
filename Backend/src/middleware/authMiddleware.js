// Authentication Middleware for validating admin_id

const db = require("../config/db.js");

// Middleware to validate admin exists and is authenticated
const validateAdmin = async (req, res, next) => {
  try {
    // Get admin_id from query params, body, or headers
    const admin_id =
      req.query.admin_id ||
      req.body.admin_id ||
      req.params.admin_id ||
      req.headers["x-admin-id"];

    if (!admin_id) {
      return res.status(401).json({
        message: "Unauthorized: Admin ID is required",
        error: "MISSING_ADMIN_ID",
      });
    }

    // Verify admin exists in database
    const client = await db.connect();
    try {
      const query = `SELECT admin_id, full_name, email FROM admin_accounts WHERE admin_id = $1;`;
      const { rows } = await client.query(query, [admin_id]);

      if (rows.length === 0) {
        return res.status(403).json({
          message: "Forbidden: Invalid admin credentials",
          error: "INVALID_ADMIN",
        });
      }

      // Attach admin info to request object
      req.admin = rows[0];
      req.admin_id = admin_id;

      next();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      message: "Internal server error during authentication",
      error: "AUTH_ERROR",
    });
  }
};

// Optional: middleware for routes that can work with or without admin filtering
const optionalAdminFilter = (req, res, next) => {
  const admin_id =
    req.query.admin_id ||
    req.body.admin_id ||
    req.params.admin_id ||
    req.headers["x-admin-id"];

  req.admin_id = admin_id || null;
  next();
};

module.exports = {
  validateAdmin,
  optionalAdminFilter,
};
