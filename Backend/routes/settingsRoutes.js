const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/:admin_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings WHERE admin_id = $1 ORDER BY updated_at DESC LIMIT 1', [req.params.admin_id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:admin_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { admin_id } = req.params;
    const {
      full_name, type_1, type_1_amount, grace_amount,
      type_2, grace_amount_type2, advance_payment_enabled, advanced_payment,
      hall_name, heading1, heading2, info1, info2, note, logo_url, type2_breakdown
    } = req.body;
    
    await client.query('BEGIN');
    
    // Check existing
    const existing = await client.query('SELECT id FROM settings WHERE admin_id = $1', [admin_id]);
    let settingId;
    
    if (existing.rows.length > 0) {
      // UPDATE
      const result = await client.query(
        'UPDATE settings SET admin_name=$2, type_1=$3, type_1_amount=$4, grace_amount=$5, type_2=$6, grace_amount_type2=$7, advance_payment_enabled=$8, advanced_payment=$9, hall_name=$10, heading1=$11, heading2=$12, info1=$13, info2=$14, note=$15, logo_url=$16, updated_at=NOW() WHERE admin_id=$1 RETURNING id',
        [admin_id, full_name, type_1, type_1_amount, grace_amount, type_2, grace_amount_type2,
         advance_payment_enabled, advanced_payment, hall_name, heading1, heading2, info1, info2, note, logo_url]
      );
      settingId = result.rows[0].id;
    } else {
      // INSERT
      const result = await client.query(
        'INSERT INTO settings (admin_id, admin_name, type_1, type_1_amount, grace_amount, type_2, grace_amount_type2, advance_payment_enabled, advanced_payment, hall_name, heading1, heading2, info1, info2, note, logo_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()) RETURNING id',
        [admin_id, full_name || 'Admin', type_1, type_1_amount, grace_amount, type_2, grace_amount_type2,
         advance_payment_enabled, advanced_payment, hall_name, heading1, heading2, info1, info2, note, logo_url]
      );
      settingId = result.rows[0].id;
    }
    
    // Printer table
    const printerExists = await client.query('SELECT id FROM printer WHERE admin_id = $1', [admin_id]);
    if (printerExists.rows.length > 0) {
      await client.query(
        'UPDATE printer SET hall_name=$2, heading1=$3, heading2=$4, info1=$5, info2=$6, note=$7, logo_url=$8, updated_at=NOW() WHERE admin_id=$1',
        [admin_id, hall_name, heading1, heading2, info1, info2, note, logo_url]
      );
    } else {
      await client.query(
        'INSERT INTO printer (admin_id, hall_name, heading1, heading2, info1, info2, note, logo_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
        [admin_id, hall_name, heading1, heading2, info1, info2, note, logo_url]
      );
    }
    
    // Type2 breakdown
    if (type2_breakdown) {
      await client.query('DELETE FROM type2_amount WHERE setting_id = $1', [settingId]);
      for (const [key, amount] of Object.entries(type2_breakdown)) {
        const [min, max] = key.split('-').map(Number);
        await client.query(
          'INSERT INTO type2_amount (setting_id, min_duration, max_duration, amount) VALUES ($1, $2, $3, $4)',
          [settingId, min, max, amount]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ success: true, data: { id: settingId } });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
