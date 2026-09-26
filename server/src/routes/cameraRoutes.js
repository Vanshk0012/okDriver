const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { broadcastCameraStatus } = require('../services/websocketService');

// GET /api/v1/cameras - List & Filter cameras
router.get('/', (req, res) => {
  try {
    const { search, zone, status, department, protocol } = req.query;
    let query = 'SELECT * FROM cameras WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (id LIKE ? OR name LIKE ? OR zone LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (zone) {
      query += ' AND zone = ?';
      params.push(zone);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (protocol) {
      query += ' AND source_protocol = ?';
      params.push(protocol);
    }

    query += ' ORDER BY id ASC';
    const cameras = db.prepare(query).all(...params);

    // Summary stats
    const stats = {
      total: cameras.length,
      online: cameras.filter(c => c.status === 'Online').length,
      offline: cameras.filter(c => c.status === 'Offline').length,
      degraded: cameras.filter(c => c.status === 'Degraded').length
    };

    res.json({ success: true, stats, data: cameras });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/cameras/:id
router.get('/:id', (req, res) => {
  try {
    const camera = db.prepare('SELECT * FROM cameras WHERE id = ?').get(req.params.id);
    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }
    res.json({ success: true, data: camera });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/cameras - Onboard Camera
router.post('/', (req, res) => {
  try {
    const {
      id, name, department, latitude, longitude, camera_type,
      source_protocol, stream_url, status, zone, storage_retention_days, resolution, fps
    } = req.body;

    if (!name || !department || !latitude || !longitude || !zone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required camera fields (name, department, latitude, longitude, zone)'
      });
    }

    const camId = id || `C${Math.floor(100 + Math.random() * 900)}`;
    const camStatus = status || 'Online';
    const protocol = source_protocol || 'RTSP';
    const stream = stream_url || `rtsp://admin:pass@10.0.10.${Math.floor(Math.random()*200)}:554/live`;

    db.prepare(`
      INSERT INTO cameras (id, name, department, latitude, longitude, camera_type, source_protocol, stream_url, status, zone, storage_retention_days, resolution, fps)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      camId, name, department, parseFloat(latitude), parseFloat(longitude),
      camera_type || 'Fixed PTZ', protocol, stream, camStatus, zone,
      storage_retention_days || 30, resolution || '1080p', fps || 30
    );

    // Audit Log
    const auditId = `AUD-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO audit_logs (id, action, module, details, performed_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(auditId, 'CAMERA_ONBOARD', 'Camera', `Onboarded camera ${camId} (${name}) in zone ${zone}`, req.body.performed_by || 'Admin Operator');

    const createdCam = db.prepare('SELECT * FROM cameras WHERE id = ?').get(camId);
    broadcastCameraStatus(createdCam);

    res.status(201).json({ success: true, data: createdCam });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/cameras/:id - Edit Camera
router.put('/:id', (req, res) => {
  try {
    const { name, department, latitude, longitude, camera_type, source_protocol, stream_url, status, zone } = req.body;

    const existing = db.prepare('SELECT * FROM cameras WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }

    db.prepare(`
      UPDATE cameras
      SET name = ?, department = ?, latitude = ?, longitude = ?, camera_type = ?, source_protocol = ?, stream_url = ?, status = ?, zone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || existing.name,
      department || existing.department,
      latitude ? parseFloat(latitude) : existing.latitude,
      longitude ? parseFloat(longitude) : existing.longitude,
      camera_type || existing.camera_type,
      source_protocol || existing.source_protocol,
      stream_url || existing.stream_url,
      status || existing.status,
      zone || existing.zone,
      req.params.id
    );

    // Audit Log
    const auditId = `AUD-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO audit_logs (id, action, module, details, performed_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(auditId, 'CAMERA_UPDATE', 'Camera', `Updated metadata for camera ${req.params.id}`, 'Admin Operator');

    const updated = db.prepare('SELECT * FROM cameras WHERE id = ?').get(req.params.id);
    broadcastCameraStatus(updated);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/cameras/:id/status - Toggle Status
router.post('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['Online', 'Offline', 'Degraded'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    db.prepare('UPDATE cameras SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    const updated = db.prepare('SELECT * FROM cameras WHERE id = ?').get(req.params.id);
    broadcastCameraStatus(updated);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/cameras/:id
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM cameras WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: `Camera ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
