const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/v1/watchlist
router.get('/', (req, res) => {
  try {
    const { search, category, severity, status } = req.query;
    let query = 'SELECT * FROM watchlist WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (identifier LIKE ? OR name_or_model LIKE ? OR owner_or_target LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const items = db.prepare(query).all(...params);

    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/watchlist - Add Record
router.post('/', (req, res) => {
  try {
    const {
      id, identifier, entity_type, category, severity,
      name_or_model, color, owner_or_target, notes, status
    } = req.body;

    if (!identifier || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (identifier, category)'
      });
    }

    const itemObjId = id || `W${Math.floor(100 + Math.random() * 900)}`;
    const cleanIdentifier = identifier.toUpperCase().trim();

    db.prepare(`
      INSERT INTO watchlist (id, identifier, entity_type, category, severity, name_or_model, color, owner_or_target, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      itemObjId, cleanIdentifier, entity_type || 'Vehicle', category, severity || 'High',
      name_or_model || '', color || '', owner_or_target || '', notes || '', status || 'Active'
    );

    // Audit Log
    const auditId = `AUD-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO audit_logs (id, action, module, details, performed_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(auditId, 'WATCHLIST_ADD', 'Watchlist', `Added ${category} record ${cleanIdentifier} (${severity})`, 'Admin Operator');

    const created = db.prepare('SELECT * FROM watchlist WHERE id = ?').get(itemObjId);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/watchlist/:id
router.put('/:id', (req, res) => {
  try {
    const { identifier, category, severity, name_or_model, color, owner_or_target, notes, status } = req.body;
    const existing = db.prepare('SELECT * FROM watchlist WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Watchlist record not found' });
    }

    db.prepare(`
      UPDATE watchlist
      SET identifier = ?, category = ?, severity = ?, name_or_model = ?, color = ?, owner_or_target = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      identifier ? identifier.toUpperCase().trim() : existing.identifier,
      category || existing.category,
      severity || existing.severity,
      name_or_model || existing.name_or_model,
      color || existing.color,
      owner_or_target || existing.owner_or_target,
      notes || existing.notes,
      status || existing.status,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM watchlist WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/watchlist/:id
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM watchlist WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: `Watchlist record ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
