const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { processAiEvent } = require('../services/aiEngine');

// POST /api/v1/events/ai-inference - AI Inference Ingestion API
router.post('/ai-inference', (req, res) => {
  try {
    const result = processAiEvent(req.body);
    res.status(201).json({
      success: true,
      data: result.event,
      watchlist_alert_triggered: !!result.alert,
      alert: result.alert
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/v1/events - Query Event History
router.get('/', (req, res) => {
  try {
    const { camera_id, vehicle_number, event_type, limit = 50 } = req.query;
    let query = `
      SELECT e.*, c.name as camera_name, c.zone as camera_zone, c.latitude, c.longitude
      FROM ai_events e
      JOIN cameras c ON e.camera_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (camera_id) {
      query += ' AND e.camera_id = ?';
      params.push(camera_id);
    }
    if (vehicle_number) {
      query += ' AND UPPER(e.vehicle_number) LIKE ?';
      params.push(`%${vehicle_number.toUpperCase()}%`);
    }
    if (event_type) {
      query += ' AND e.event_type = ?';
      params.push(event_type);
    }

    query += ' ORDER BY e.timestamp DESC LIMIT ?';
    params.push(parseInt(limit));

    const events = db.prepare(query).all(...params);

    // Parse bounding box JSON
    const formatted = events.map(e => ({
      ...e,
      bounding_box: typeof e.bounding_box === 'string' ? JSON.parse(e.bounding_box) : e.bounding_box
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/events/vehicle/:plate/history - Chronological GIS Vehicle Movement Tracing
router.get('/vehicle/:plate/history', (req, res) => {
  try {
    const plate = req.params.plate.toUpperCase().trim();

    const query = `
      SELECT e.*, c.name as camera_name, c.zone as camera_zone, c.department, c.latitude, c.longitude
      FROM ai_events e
      JOIN cameras c ON e.camera_id = c.id
      WHERE UPPER(e.vehicle_number) = ?
      ORDER BY e.timestamp ASC
    `;

    const detections = db.prepare(query).all(plate);

    if (detections.length === 0) {
      return res.json({
        success: true,
        vehicle_number: plate,
        detections_count: 0,
        timeline: [],
        watchlist_match: null,
        total_distance_km: 0
      });
    }

    // Check if vehicle is on Watchlist
    const watchlistRecord = db.prepare(`
      SELECT * FROM watchlist WHERE UPPER(identifier) = ? AND status = 'Active'
    `).get(plate);

    // Calculate distance & route segments
    let totalDistanceKm = 0;
    const timeline = detections.map((det, idx) => {
      let segmentDistance = 0;
      let timeDiffMinutes = 0;
      let calculatedSpeed = det.speed_kmh || 0;

      if (idx > 0) {
        const prev = detections[idx - 1];
        // Haversine formula for distance
        const R = 6371; // Earth radius in km
        const dLat = (det.latitude - prev.latitude) * Math.PI / 180;
        const dLon = (det.longitude - prev.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(prev.latitude * Math.PI / 180) * Math.cos(det.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        segmentDistance = Number((R * c).toFixed(2));
        totalDistanceKm += segmentDistance;

        const t1 = new Date(prev.timestamp).getTime();
        const t2 = new Date(det.timestamp).getTime();
        timeDiffMinutes = Math.max(1, Math.round((t2 - t1) / 60000));
        if (segmentDistance > 0 && timeDiffMinutes > 0) {
          calculatedSpeed = Math.round((segmentDistance / (timeDiffMinutes / 60)));
        }
      }

      return {
        step: idx + 1,
        event_id: det.id,
        camera_id: det.camera_id,
        camera_name: det.camera_name,
        zone: det.camera_zone,
        department: det.department,
        coordinates: [det.latitude, det.longitude],
        timestamp: det.timestamp,
        confidence: det.confidence,
        speed_kmh: calculatedSpeed,
        color: det.color,
        vehicle_type: det.vehicle_type,
        segment_distance_km: segmentDistance,
        time_diff_minutes: timeDiffMinutes,
        bounding_box: typeof det.bounding_box === 'string' ? JSON.parse(det.bounding_box) : det.bounding_box
      };
    });

    res.json({
      success: true,
      vehicle_number: plate,
      detections_count: detections.length,
      watchlist_match: watchlistRecord || null,
      total_distance_km: Number(totalDistanceKm.toFixed(2)),
      first_seen: detections[0].timestamp,
      last_seen: detections[detections.length - 1].timestamp,
      timeline
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
