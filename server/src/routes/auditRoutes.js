const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/v1/audit-logs
router.get('/', (req, res) => {
  try {
    const { module: mod, limit = 100 } = req.query;
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (mod) {
      query += ' AND module = ?';
      params.push(mod);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));

    const logs = db.prepare(query).all(...params);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
