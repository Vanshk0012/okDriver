const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { broadcastAlert } = require('../services/websocketService');

// GET /api/v1/alerts - Query real-time alerts
router.get('/', (req, res) => {
  try {
    const { severity, status, limit = 50 } = req.query;
    let query = `
      SELECT a.*, c.name as camera_name, c.zone as camera_zone, w.category as watchlist_category, w.name_or_model, w.owner_or_target, e.snapshot_url
      FROM alerts a
      JOIN cameras c ON a.camera_id = c.id
      JOIN watchlist w ON a.watchlist_id = w.id
      LEFT JOIN ai_events e ON a.event_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (severity) {
      query += ' AND a.severity = ?';
      params.push(severity);
    }
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.timestamp DESC LIMIT ?';
    params.push(parseInt(limit));

    const alerts = db.prepare(query).all(...params);
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/alerts/:id - Acknowledge or Resolve Alert
router.patch('/:id', (req, res) => {
  try {
    const { status, operator_notes, acknowledged_by } = req.body;
    if (!['Acknowledged', 'Resolved', 'Active'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid alert status' });
    }

    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    const now = new Date().toISOString();
    let ackBy = alert.acknowledged_by;
    let ackAt = alert.acknowledged_at;
    let resAt = alert.resolved_at;

    if (status === 'Acknowledged') {
      ackBy = acknowledged_by || 'Duty Operator';
      ackAt = now;
    } else if (status === 'Resolved') {
      resAt = now;
    }

    db.prepare(`
      UPDATE alerts
      SET status = ?, operator_notes = ?, acknowledged_by = ?, acknowledged_at = ?, resolved_at = ?
      WHERE id = ?
    `).run(
      status,
      operator_notes || alert.operator_notes,
      ackBy,
      ackAt,
      resAt,
      req.params.id
    );

    // Record Audit Log
    const auditId = `AUD-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO audit_logs (id, action, module, details, performed_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(auditId, `ALERT_${status.toUpperCase()}`, 'Alert', `Alert ${req.params.id} marked as ${status} by ${ackBy || 'Operator'}`, ackBy || 'Operator');

    const updated = db.prepare(`
      SELECT a.*, c.name as camera_name, c.zone as camera_zone, w.category as watchlist_category, w.name_or_model
      FROM alerts a
      JOIN cameras c ON a.camera_id = c.id
      JOIN watchlist w ON a.watchlist_id = w.id
      WHERE a.id = ?
    `).get(req.params.id);

    broadcastAlert(updated);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
