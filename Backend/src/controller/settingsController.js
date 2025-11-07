// Settings Controller
const db = require("../config/db.js");

// Get settings by admin_id
const getSettings = async (req, res) => {
  const { admin_id } = req.params;

  if (!admin_id) {
    return res.status(400).json({
      message: "Admin ID is required",
    });
  }

  try {
    const query = `
      SELECT * FROM settings 
      WHERE admin_id = $1;
    `;
    const { rows } = await db.query(query, [admin_id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Settings not found for this admin",
      });
    }

    res.status(200).json({
      message: "Settings retrieved successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      message: "Error fetching settings",
      error: error.message,
    });
  }
};

// Create or Update settings
const upsertSettings = async (req, res) => {
  const { admin_id } = req.params;
  const {
    admin_name,
    hall_name,
    type1,
    type1_amount,
    type2,
    type2_amount,
    type3,
    type3_amount,
    type4,
    type4_amount,
  } = req.body;

  if (!admin_id || !admin_name || !hall_name) {
    return res.status(400).json({
      message: "Admin ID, admin name, and hall name are required",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Check if admin exists
    const adminCheckQuery = `SELECT * FROM admin_accounts WHERE admin_id = $1;`;
    const { rows: adminRows } = await client.query(adminCheckQuery, [admin_id]);

    if (adminRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    // Check if settings already exist
    const checkQuery = `SELECT * FROM settings WHERE admin_id = $1;`;
    const { rows: existingSettings } = await client.query(checkQuery, [
      admin_id,
    ]);

    let result;
    if (existingSettings.length > 0) {
      // Update existing settings
      const updateQuery = `
        UPDATE settings 
        SET admin_name = $1,
            hall_name = $2,
            type1 = $3,
            type1_amount = $4,
            type2 = $5,
            type2_amount = $6,
            type3 = $7,
            type3_amount = $8,
            type4 = $9,
            type4_amount = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE admin_id = $11
        RETURNING *;
      `;
      const { rows } = await client.query(updateQuery, [
        admin_name,
        hall_name,
        type1 || null,
        type1_amount || null,
        type2 || null,
        type2_amount || null,
        type3 || null,
        type3_amount || null,
        type4 || null,
        type4_amount || null,
        admin_id,
      ]);
      result = rows[0];
    } else {
      // Insert new settings
      const insertQuery = `
        INSERT INTO settings (
          admin_id, admin_name, hall_name, 
          type1, type1_amount, 
          type2, type2_amount, 
          type3, type3_amount, 
          type4, type4_amount
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
      const { rows } = await client.query(insertQuery, [
        admin_id,
        admin_name,
        hall_name,
        type1 || null,
        type1_amount || null,
        type2 || null,
        type2_amount || null,
        type3 || null,
        type3_amount || null,
        type4 || null,
        type4_amount || null,
      ]);
      result = rows[0];
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Settings saved successfully",
      data: result,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saving settings:", error);
    res.status(500).json({
      message: "Error saving settings",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Delete settings
const deleteSettings = async (req, res) => {
  const { admin_id } = req.params;

  if (!admin_id) {
    return res.status(400).json({
      message: "Admin ID is required",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const deleteQuery = `
      DELETE FROM settings 
      WHERE admin_id = $1
      RETURNING *;
    `;
    const { rows } = await client.query(deleteQuery, [admin_id]);

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Settings not found",
      });
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Settings deleted successfully",
      data: rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting settings:", error);
    res.status(500).json({
      message: "Error deleting settings",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getSettings,
  upsertSettings,
  deleteSettings,
};
