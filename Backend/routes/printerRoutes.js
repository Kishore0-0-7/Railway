const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/printer/get-printer/:admin_id
router.get('/get-printer/:admin_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM printer WHERE admin_id = $1', [req.params.admin_id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
