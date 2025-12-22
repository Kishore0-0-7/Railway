const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/type2-amount/get-amounts/:admin_id
router.get('/get-amounts/:admin_id', async (req, res) => {
  try {
    console.log('📊 Fetching type2 amounts for admin:', req.params.admin_id);
    
    const result = await pool.query(
      `SELECT t.id, t.setting_id, t.min_duration, t.max_duration, t.amount
       FROM type2_amount t
       JOIN settings s ON t.setting_id = s.id
       WHERE s.admin_id = $1
       ORDER BY t.max_duration`,
      [req.params.admin_id]
    );
    
    console.log('✅ Found', result.rows.length, 'type2 amounts');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
