// Import database connection
const db = require("../config/db.js");

// ==================== HELPER FUNCTIONS ====================
const parseNumericValue = (value, defaultValue = null) => {
  if (value === null || value === undefined || value === "")
    return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const insertType2Breakdown = async (client, settingId, breakdown) => {
  if (
    !breakdown ||
    typeof breakdown !== "object" ||
    Object.keys(breakdown).length === 0
  )
    return;

  const queries = Object.entries(breakdown)
    .filter(
      ([_, value]) =>
        value !== null && value !== undefined && value !== "" && value !== "0"
    )
    .map(([key, value]) => {
      const [minDuration, maxDuration] = key.split("-").map(Number);
      if (!isNaN(minDuration) && !isNaN(maxDuration) && value !== null) {
        return client.query(
          `INSERT INTO type2_amount (setting_id, min_duration, max_duration, amount) VALUES ($1, $2, $3, $4)`,
          [settingId, minDuration, maxDuration, parseFloat(value)]
        );
      }
    })
    .filter(Boolean);

  if (queries.length > 0) {
    await Promise.all(queries);
  }
};

const getType2Breakdown = async (client, settingId) => {
  const result = await client.query(
    `SELECT min_duration, max_duration, amount FROM type2_amount WHERE setting_id = $1 ORDER BY min_duration ASC`,
    [settingId]
  );

  if (result.rows.length === 0) return null;

  return result.rows.reduce((acc, row) => {
    acc[`${row.min_duration}-${row.max_duration}`] = row.amount;
    return acc;
  }, {});
};

const normalizeType2BreakdownPayload = (breakdown, type2Amount) => {
  const normalized = { ...(breakdown || {}) };
  if (type2Amount !== undefined && type2Amount !== null && type2Amount !== "") {
    normalized["1-24"] = type2Amount;
  }
  return Object.keys(normalized).length > 0 ? normalized : null;
};

const formatSettingsResponse = (
  printer,
  settings,
  type2Breakdown,
  adminId,
  adminName = ""
) => {
  const breakdown = type2Breakdown || null;
  const defaultType2Amount = breakdown?.["1-24"] ?? null;

  return {
    admin_id: adminId,
    admin_name: adminName,
    hall_name: printer.hall_name || "",
    heading1: printer.heading1 || "",
    heading2: printer.heading2 || "",
    info1: printer.info1 || "",
    info2: printer.info2 || "",
    note: printer.note || "",
    logo_url: printer.logo_url || "",
    type1: settings.type_1 || "Sitting",
    type1_amount: settings.type_1_amount ?? null,
    type1_grace_time: settings.grace_amount ?? null,
    type2: settings.type_2 || "Sleeping",
    type2_amount: defaultType2Amount,
    type2_grace_time: settings.grace_amount_type2 ?? null,
    type2_breakdown: breakdown,
    advance_payment_enabled: settings.advance_payment_enabled ?? false,
    default_advance_percentage: settings.advanced_payment ?? 20,
  };
};

// ==================== CREATE SETTINGS ====================
const createSettings = async (req, res) => {
  const { admin_id } = req.params;
  const {
    hall_name,
    heading1,
    heading2,
    info1,
    info2,
    note,
    logo_url,
    type1,
    type1_amount,
    grace_amount,
    type1_grace_time,
    type2,
    type2_amount,
    grace_amount_type2,
    type2_grace_time,
    type2_breakdown,
    advance_payment_enabled,
    default_advance_percentage,
  } = req.body;

  if (!admin_id) {
    return res
      .status(400)
      .json({ success: false, message: "Admin ID is required" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Check duplicates
    const [printerExists, settingsExists] = await Promise.all([
      client.query(`SELECT id FROM printer WHERE admin_id = $1`, [admin_id]),
      client.query(`SELECT id FROM settings WHERE admin_id = $1`, [admin_id]),
    ]);

    if (printerExists.rows.length > 0 || settingsExists.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "Settings already exist for this admin. Use update instead.",
      });
    }

    const printerResult = await client.query(
      `INSERT INTO printer (id, admin_id, heading1, heading2, info1, info2, note, hall_name, logo_url)
       VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM printer), $1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        admin_id,
        heading1 || "",
        heading2 || "",
        info1 || "",
        info2 || "",
        note || "",
        hall_name || "",
        logo_url || "",
      ]
    );

    // Parse and log values
    const parsedType1Amount = parseNumericValue(type1_amount);
    const type1GraceInput = type1_grace_time ?? grace_amount;
    const parsedGraceAmount = parseNumericValue(type1GraceInput, 0);
    const parsedType2Amount = parseNumericValue(type2_amount);
    const type2GraceInput = type2_grace_time ?? grace_amount_type2;
    const parsedGraceAmountType2 = parseNumericValue(type2GraceInput, 0);
    const parsedAdvancePayment = parseNumericValue(
      default_advance_percentage,
      20
    );
    const normalizedType2Breakdown = normalizeType2BreakdownPayload(
      type2_breakdown,
      type2_amount
    );
    const shouldRewriteBreakdown =
      normalizedType2Breakdown !== null ||
      type2_breakdown !== undefined ||
      type2_amount !== undefined;

    const settingsResult = await client.query(
      `INSERT INTO settings (admin_id, type_1, type_1_amount, type_2, grace_amount,
        advance_payment_enabled, advanced_payment, grace_amount_type2)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        admin_id,
        type1 || "Sitting",
        parsedType1Amount,
        type2 || "Sleeping",
        parsedGraceAmount,
        advance_payment_enabled ?? false,
        parsedAdvancePayment,
        parsedGraceAmountType2,
      ]
    );

    const settingId = settingsResult.rows[0].id;

    // Insert type2 breakdown if provided
    if (normalizedType2Breakdown) {
      await insertType2Breakdown(client, settingId, normalizedType2Breakdown);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Settings created successfully",
      data: { admin_id, setting_id: settingId, printer: printerResult.rows[0] },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create settings",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ==================== GET SETTINGS (READ BY ADMIN_ID) ====================
const getSettings = async (req, res) => {
  const { admin_id } = req.params;
  if (!admin_id) {
    return res
      .status(400)
      .json({ success: false, message: "Admin ID is required" });
  }

  const client = await db.connect();
  try {
    const [printerResult, settingsResult, adminResult] = await Promise.all([
      client.query(
        `SELECT id, admin_id, heading1, heading2, info1, info2, note, hall_name, logo_url FROM printer WHERE admin_id = $1 LIMIT 1`,
        [admin_id]
      ),
      client.query(
        `SELECT id, admin_id, type_1, type_1_amount, type_2, grace_amount, advance_payment_enabled, advanced_payment, grace_amount_type2 FROM settings WHERE admin_id = $1 LIMIT 1`,
        [admin_id]
      ),
      client.query(
        `SELECT full_name FROM admin_accounts WHERE admin_id = $1 LIMIT 1`,
        [admin_id]
      ),
    ]);

    if (printerResult.rows.length === 0 && settingsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No settings found for this admin" });
    }

    const type2Breakdown =
      settingsResult.rows.length > 0
        ? await getType2Breakdown(client, settingsResult.rows[0].id)
        : null;

    const responseData = formatSettingsResponse(
      printerResult.rows[0] || {},
      settingsResult.rows[0] || {},
      type2Breakdown,
      admin_id,
      adminResult.rows[0]?.full_name || ""
    );

    return res.status(200).json({
      success: true,
      message: "Settings retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ==================== GET ALL SETTINGS (READ ALL) ====================
const getAllSettings = async (req, res) => {
  const client = await db.connect();
  try {
    const [printerResult, settingsResult, adminResult] = await Promise.all([
      client.query(
        `SELECT id, admin_id, heading1, heading2, info1, info2, note, hall_name, logo_url FROM printer ORDER BY admin_id ASC`
      ),
      client.query(
        `SELECT id, admin_id, type_1, type_1_amount, type_2, grace_amount, advance_payment_enabled, advanced_payment, grace_amount_type2 FROM settings ORDER BY admin_id ASC`
      ),
      client.query(`SELECT admin_id, full_name FROM admin_accounts`),
    ]);

    // Get all type2 breakdowns
    const type2Result = await client.query(`
      SELECT t2.min_duration, t2.max_duration, t2.amount, s.admin_id 
      FROM type2_amount t2 
      INNER JOIN settings s ON t2.setting_id = s.id 
      ORDER BY s.admin_id, t2.min_duration ASC`);

    const settingsMap = {};
    const adminMap = adminResult.rows.reduce((acc, row) => {
      acc[row.admin_id] = row.full_name;
      return acc;
    }, {});

    // Map printer data
    printerResult.rows.forEach((p) => {
      settingsMap[p.admin_id] = { printer: p };
    });

    // Map settings data
    settingsResult.rows.forEach((s) => {
      if (!settingsMap[s.admin_id]) {
        settingsMap[s.admin_id] = {};
      }
      settingsMap[s.admin_id].setting = s;
    });

    // Map type2 breakdown data
    const type2Map = type2Result.rows.reduce((acc, row) => {
      if (!acc[row.admin_id]) acc[row.admin_id] = {};
      acc[row.admin_id][`${row.min_duration}-${row.max_duration}`] = row.amount;
      return acc;
    }, {});

    // Format all settings
    const allSettings = Object.keys(settingsMap).map((admin_id) =>
      formatSettingsResponse(
        settingsMap[admin_id].printer || {},
        settingsMap[admin_id].setting || {},
        type2Map[admin_id] || null,
        admin_id,
        adminMap[admin_id] || ""
      )
    );

    return res.status(200).json({
      success: true,
      message: "All settings retrieved successfully",
      count: allSettings.length,
      data: allSettings,
    });
  } catch (error) {
    console.error("Error fetching all settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all settings",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ==================== UPDATE SETTINGS ====================
const updateSettings = async (req, res) => {
  const { admin_id } = req.params;
  const {
    hall_name,
    heading1,
    heading2,
    info1,
    info2,
    note,
    logo_url,
    type1,
    type1_amount,
    grace_amount,
    type1_grace_time,
    type2,
    type2_amount,
    grace_amount_type2,
    type2_grace_time,
    type2_breakdown,
    advance_payment_enabled,
    default_advance_percentage,
  } = req.body;

  if (!admin_id) {
    return res
      .status(400)
      .json({ success: false, message: "Admin ID is required" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const [printerExists, settingsExists] = await Promise.all([
      client.query(`SELECT id FROM printer WHERE admin_id = $1`, [admin_id]),
      client.query(`SELECT id FROM settings WHERE admin_id = $1`, [admin_id]),
    ]);

    if (printerExists.rows.length === 0 && settingsExists.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Settings not found for this admin. Use create instead.",
      });
    }

    // Update printer if exists
    if (printerExists.rows.length > 0) {
      await client.query(
        `UPDATE printer SET 
          heading1 = COALESCE($1, heading1), 
          heading2 = COALESCE($2, heading2), 
          info1 = COALESCE($3, info1), 
          info2 = COALESCE($4, info2), 
          note = COALESCE($5, note), 
          hall_name = COALESCE($6, hall_name),
          logo_url = COALESCE($7, logo_url)
         WHERE admin_id = $8`,
        [heading1, heading2, info1, info2, note, hall_name, logo_url, admin_id]
      );
    }

    // Update settings if exists
    if (settingsExists.rows.length > 0) {
      const settingId = settingsExists.rows[0].id;

      const parsedType1Amount = parseNumericValue(type1_amount);
      const type1GraceInput = type1_grace_time ?? grace_amount;
      const parsedGraceAmount = parseNumericValue(type1GraceInput, 0);
      const parsedType2Amount = parseNumericValue(type2_amount);
      const type2GraceInput = type2_grace_time ?? grace_amount_type2;
      const parsedGraceAmountType2 = parseNumericValue(type2GraceInput, 0);
      const parsedAdvancePayment = parseNumericValue(
        default_advance_percentage
      );
      const normalizedType2Breakdown = normalizeType2BreakdownPayload(
        type2_breakdown,
        type2_amount
      );
      const shouldUpdateBreakdown =
        type2_breakdown !== undefined || type2_amount !== undefined;

      await client.query(
        `UPDATE settings SET 
          type_1 = COALESCE($1, type_1), 
          type_1_amount = COALESCE($2, type_1_amount), 
          type_2 = COALESCE($3, type_2), 
          grace_amount = COALESCE($4, grace_amount), 
          advance_payment_enabled = COALESCE($5, advance_payment_enabled), 
          advanced_payment = COALESCE($6, advanced_payment), 
          grace_amount_type2 = COALESCE($7, grace_amount_type2) 
         WHERE admin_id = $8`,
        [
          type1,
          parsedType1Amount,
          type2,
          parsedGraceAmount,
          advance_payment_enabled,
          parsedAdvancePayment,
          parsedGraceAmountType2,
          admin_id,
        ]
      );

      // Update type2 breakdown if provided
      if (shouldUpdateBreakdown) {
        await client.query(`DELETE FROM type2_amount WHERE setting_id = $1`, [
          settingId,
        ]);
        if (normalizedType2Breakdown) {
          await insertType2Breakdown(
            client,
            settingId,
            normalizedType2Breakdown
          );
        }
      }
    }

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: { admin_id },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ==================== UPSERT SETTINGS (CREATE OR UPDATE) ====================
const upsertSettings = async (req, res) => {
  const { admin_id } = req.params;
  const {
    hall_name,
    heading1,
    heading2,
    info1,
    info2,
    note,
    logo_url,
    type1,
    type1_amount,
    grace_amount,
    type1_grace_time,
    type2,
    type2_amount,
    grace_amount_type2,
    type2_grace_time,
    type2_breakdown,
    advance_payment_enabled,
    default_advance_percentage,
  } = req.body;

  console.log("=== UPSERT SETTINGS DEBUG ===");
  console.log(
    "logo_url received:",
    logo_url ? `${logo_url.substring(0, 50)}...` : "NULL"
  );
  console.log("type1_grace_time:", type1_grace_time);
  console.log("type2_grace_time:", type2_grace_time);
  console.log("grace_amount:", grace_amount);
  console.log("grace_amount_type2:", grace_amount_type2);

  if (!admin_id) {
    return res
      .status(400)
      .json({ success: false, message: "Admin ID is required" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Upsert printer data
    const printerExists = await client.query(
      `SELECT id FROM printer WHERE admin_id = $1`,
      [admin_id]
    );

    console.log("Printer exists:", printerExists.rows.length > 0);
    console.log(
      "Values for UPDATE - logo_url:",
      logo_url || "",
      "length:",
      (logo_url || "").length
    );

    if (printerExists.rows.length > 0) {
      await client.query(
        `UPDATE printer SET 
          heading1 = $1, heading2 = $2, info1 = $3, info2 = $4, note = $5, hall_name = $6, logo_url = $7
         WHERE admin_id = $8`,
        [
          heading1 || "",
          heading2 || "",
          info1 || "",
          info2 || "",
          note || "",
          hall_name || "",
          logo_url || "",
          admin_id,
        ]
      );
      console.log("Printer UPDATE completed");
    } else {
      await client.query(
        `INSERT INTO printer (id, admin_id, heading1, heading2, info1, info2, note, hall_name, logo_url) 
         VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM printer), $1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          admin_id,
          heading1 || "",
          heading2 || "",
          info1 || "",
          info2 || "",
          note || "",
          hall_name || "",
          logo_url || "",
        ]
      );
    }

    // Upsert settings data
    const settingsExists = await client.query(
      `SELECT id FROM settings WHERE admin_id = $1`,
      [admin_id]
    );

    const parsedType1Amount = parseNumericValue(type1_amount);
    const type1GraceInput = type1_grace_time ?? grace_amount;
    const parsedGraceAmount = parseNumericValue(type1GraceInput, 0);
    const parsedType2Amount = parseNumericValue(type2_amount);
    const type2GraceInput = type2_grace_time ?? grace_amount_type2;
    const parsedGraceAmountType2 = parseNumericValue(type2GraceInput, 0);
    const parsedAdvancePayment = parseNumericValue(
      default_advance_percentage,
      20
    );
    const normalizedType2Breakdown = normalizeType2BreakdownPayload(
      type2_breakdown,
      type2_amount
    );
    const shouldRewriteBreakdown =
      normalizedType2Breakdown !== null ||
      type2_breakdown !== undefined ||
      type2_amount !== undefined;

    console.log(
      "Parsed grace amounts - Type1:",
      parsedGraceAmount,
      "Type2:",
      parsedGraceAmountType2
    );

    let settingId;

    if (settingsExists.rows.length > 0) {
      settingId = settingsExists.rows[0].id;
      console.log(
        "Updating settings with grace_amount:",
        parsedGraceAmount,
        "grace_amount_type2:",
        parsedGraceAmountType2
      );
      await client.query(
        `UPDATE settings SET 
          type_1 = $1, type_1_amount = $2, type_2 = $3, 
          grace_amount = $4, advance_payment_enabled = $5, advanced_payment = $6, grace_amount_type2 = $7 
         WHERE admin_id = $8`,
        [
          type1 || "Sitting",
          parsedType1Amount,
          type2 || "Sleeping",
          parsedGraceAmount,
          advance_payment_enabled !== undefined
            ? advance_payment_enabled
            : false,
          parsedAdvancePayment,
          parsedGraceAmountType2,
          admin_id,
        ]
      );
      console.log("Settings UPDATE completed");
    } else {
      const result = await client.query(
        `INSERT INTO settings (admin_id, type_1, type_1_amount, type_2, grace_amount, advance_payment_enabled, advanced_payment, grace_amount_type2) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          admin_id,
          type1 || "Sitting",
          parsedType1Amount,
          type2 || "Sleeping",
          parsedGraceAmount,
          advance_payment_enabled !== undefined
            ? advance_payment_enabled
            : false,
          parsedAdvancePayment,
          parsedGraceAmountType2,
        ]
      );
      settingId = result.rows[0].id;
    }

    // Handle type2 breakdown
    if (shouldRewriteBreakdown) {
      await client.query(`DELETE FROM type2_amount WHERE setting_id = $1`, [
        settingId,
      ]);
      if (normalizedType2Breakdown) {
        await insertType2Breakdown(client, settingId, normalizedType2Breakdown);
      }
    }

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      data: { admin_id, setting_id: settingId },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error upserting settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save settings",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ==================== DELETE SETTINGS ====================
const deleteSettings = async (req, res) => {
  const { admin_id } = req.params;
  if (!admin_id) {
    return res
      .status(400)
      .json({ success: false, message: "Admin ID is required" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Delete type2_amount records first (due to foreign key constraint)
    const settingResult = await client.query(
      `SELECT id FROM settings WHERE admin_id = $1`,
      [admin_id]
    );
    if (settingResult.rows.length > 0) {
      await client.query(`DELETE FROM type2_amount WHERE setting_id = $1`, [
        settingResult.rows[0].id,
      ]);
    }

    // Delete settings and printer records
    await Promise.all([
      client.query(`DELETE FROM settings WHERE admin_id = $1`, [admin_id]),
      client.query(`DELETE FROM printer WHERE admin_id = $1`, [admin_id]),
    ]);

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      message: "Settings deleted successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete settings",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ==================== PARTIAL UPDATE SETTINGS ====================
const partialUpdateSettings = async (req, res) => {
  const { admin_id } = req.params;
  const updates = req.body;

  if (!admin_id) {
    return res
      .status(400)
      .json({ success: false, message: "Admin ID is required" });
  }
  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No update data provided" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const [printerExists, settingsExists] = await Promise.all([
      client.query(`SELECT id FROM printer WHERE admin_id = $1`, [admin_id]),
      client.query(`SELECT id FROM settings WHERE admin_id = $1`, [admin_id]),
    ]);

    if (printerExists.rows.length === 0 && settingsExists.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Settings not found for this admin" });
    }

    // Update printer fields if they exist in updates
    const printerFields = [
      "heading1",
      "heading2",
      "info1",
      "info2",
      "note",
      "hall_name",
      "logo_url",
    ];
    const printerUpdates = {};

    printerFields.forEach((field) => {
      if (updates[field] !== undefined) {
        printerUpdates[field] = updates[field];
      }
    });

    if (
      Object.keys(printerUpdates).length > 0 &&
      printerExists.rows.length > 0
    ) {
      const setClause = Object.keys(printerUpdates)
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");
      const values = Object.values(printerUpdates);
      values.push(admin_id);

      await client.query(
        `UPDATE printer SET ${setClause} WHERE admin_id = $${values.length}`,
        values
      );
    }

    // Update settings fields if they exist in updates
    const settingFieldMap = {
      type1: "type_1",
      type1_amount: "type_1_amount",
      grace_amount: "grace_amount",
      type1_grace_time: "grace_amount",
      type2: "type_2",
      grace_amount_type2: "grace_amount_type2",
      type2_grace_time: "grace_amount_type2",
      advance_payment_enabled: "advance_payment_enabled",
      default_advance_percentage: "advanced_payment",
    };

    const settingUpdates = {};
    Object.keys(settingFieldMap).forEach((key) => {
      if (updates[key] !== undefined) {
        settingUpdates[settingFieldMap[key]] = updates[key];
      }
    });

    if (
      Object.keys(settingUpdates).length > 0 &&
      settingsExists.rows.length > 0
    ) {
      const setClause = Object.keys(settingUpdates)
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");
      const values = Object.values(settingUpdates);
      values.push(admin_id);

      await client.query(
        `UPDATE settings SET ${setClause} WHERE admin_id = $${values.length}`,
        values
      );
    }

    // Update type2 breakdown if provided
    const normalizedType2Breakdown = normalizeType2BreakdownPayload(
      updates.type2_breakdown,
      updates.type2_amount
    );
    const shouldUpdateBreakdown =
      (updates.type2_breakdown !== undefined ||
        updates.type2_amount !== undefined) &&
      settingsExists.rows.length > 0;

    if (shouldUpdateBreakdown) {
      const settingId = settingsExists.rows[0].id;
      await client.query(`DELETE FROM type2_amount WHERE setting_id = $1`, [
        settingId,
      ]);
      if (normalizedType2Breakdown) {
        await insertType2Breakdown(client, settingId, normalizedType2Breakdown);
      }
    }

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      message: "Settings partially updated successfully",
      data: { admin_id },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error partially updating settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to partially update settings",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ==================== GET SETTING BY ID ====================
const getSettingById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Setting ID is required" });
  }

  const client = await db.connect();
  try {
    const settingResult = await client.query(
      `SELECT id, admin_id, type_1, type_1_amount, type_2, grace_amount, advance_payment_enabled, advanced_payment, grace_amount_type2 
       FROM settings WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (settingResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Setting not found" });
    }

    const setting = settingResult.rows[0];
    const admin_id = setting.admin_id;

    const [printerResult, type2Breakdown, adminResult] = await Promise.all([
      client.query(
        `SELECT id, admin_id, heading1, heading2, info1, info2, note, hall_name, logo_url FROM printer WHERE admin_id = $1 LIMIT 1`,
        [admin_id]
      ),
      getType2Breakdown(client, id),
      client.query(
        `SELECT full_name FROM admin_accounts WHERE admin_id = $1 LIMIT 1`,
        [admin_id]
      ),
    ]);

    const responseData = {
      ...formatSettingsResponse(
        printerResult.rows[0] || {},
        setting,
        type2Breakdown,
        admin_id,
        adminResult.rows[0]?.full_name || ""
      ),
      id: setting.id,
    };

    return res.status(200).json({
      success: true,
      message: "Setting retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching setting by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch setting",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ==================== UPLOAD LOGO IMAGE ====================
const uploadLogo = async (req, res) => {
  const { admin_id } = req.params;

  console.log("=== UPLOAD LOGO DEBUG ===");
  console.log("admin_id from params:", admin_id);
  console.log("File received:", req.file ? req.file.filename : "NO FILE");

  if (!admin_id) {
    return res
      .status(400)
      .json({ success: false, message: "Admin ID is required" });
  }

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Get admin email for constructing the URL path
    const adminResult = await client.query(
      "SELECT email FROM admin_accounts WHERE admin_id = $1",
      [admin_id]
    );

    if (adminResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Admin not found in database" });
    }

    const adminEmail = adminResult.rows[0].email;
    const sanitizedEmail = adminEmail.replace(/@/g, "_").replace(/\./g, "_");

    // Construct the URL path for the uploaded file
    const logoUrl = `/uploads/${sanitizedEmail}/${req.file.filename}`;

    console.log("Logo URL to save:", logoUrl);

    // Check if printer record exists
    const printerExists = await client.query(
      `SELECT id FROM printer WHERE admin_id = $1`,
      [admin_id]
    );

    if (printerExists.rows.length > 0) {
      // Update existing printer record
      await client.query(
        `UPDATE printer SET logo_url = $1 WHERE admin_id = $2`,
        [logoUrl, admin_id]
      );
      console.log("Updated existing printer record");
    } else {
      // Create new printer record with logo
      await client.query(
        `INSERT INTO printer (id, admin_id, logo_url, heading1, heading2, info1, info2, note, hall_name) 
         VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM printer), $1, $2, '', '', '', '', '', '')`,
        [admin_id, logoUrl]
      );
      console.log("Created new printer record");
    }

    await client.query("COMMIT");
    console.log("Transaction committed successfully");

    return res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      data: {
        logo_url: logoUrl,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error uploading logo:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload logo",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createSettings,
  getSettings,
  getAllSettings,
  updateSettings,
  partialUpdateSettings,
  upsertSettings,
  deleteSettings,
  getSettingById,
  uploadLogo,
};
