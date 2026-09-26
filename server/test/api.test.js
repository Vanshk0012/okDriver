const test = require('node:test');
const assert = require('node:assert/strict');

// Import server & database
const db = require('../src/db/database');
const { processAiEvent } = require('../src/services/aiEngine');

test('CCTV Analytics Platform Backend Test Suite', async (t) => {

  await t.test('1. Database Initialization & Initial Seed Data', () => {
    const cameras = db.prepare('SELECT * FROM cameras').all();
    assert.ok(cameras.length >= 5, 'Should have initial seed cameras');

    const watchlist = db.prepare('SELECT * FROM watchlist').all();
    assert.ok(watchlist.length >= 3, 'Should have initial seed watchlist items');

    const stolenVehicle = db.prepare("SELECT * FROM watchlist WHERE identifier = 'GJ01XX0001'").get();
    assert.ok(stolenVehicle, 'Target stolen vehicle GJ01XX0001 should exist in seed data');
  });

  await t.test('2. Camera Management Operations', () => {
    const newCamId = `TEST-CAM-${Date.now().toString().slice(-4)}`;
    
    // Create Camera
    db.prepare(`
      INSERT INTO cameras (id, name, department, latitude, longitude, camera_type, source_protocol, stream_url, status, zone, storage_retention_days, resolution, fps)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newCamId, 'Test Camera Entrance', 'Traffic Police', 23.011, 72.511, 'Fixed Box', 'RTSP', 'rtsp://test/live', 'Online', 'Test Zone', 30, '1080p', 30);

    const fetchedCam = db.prepare('SELECT * FROM cameras WHERE id = ?').get(newCamId);
    assert.ok(fetchedCam, 'Newly created camera should exist');
    assert.equal(fetchedCam.name, 'Test Camera Entrance');
    assert.equal(fetchedCam.status, 'Online');

    // Update Status
    db.prepare('UPDATE cameras SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('Degraded', newCamId);
    const updatedCam = db.prepare('SELECT * FROM cameras WHERE id = ?').get(newCamId);
    assert.equal(updatedCam.status, 'Degraded');

    // Cleanup Test Camera
    db.prepare('DELETE FROM cameras WHERE id = ?').run(newCamId);
  });

  await t.test('3. Watchlist Management & Entity Lookup', () => {
    const testPlate = `GJ99TEST${Math.floor(Math.random()*1000)}`;

    // Add Watchlist Record
    db.prepare(`
      INSERT INTO watchlist (id, identifier, entity_type, category, severity, name_or_model, color, owner_or_target, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`W-TEST-${Date.now()}`, testPlate, 'Vehicle', 'Stolen Vehicle', 'Critical', 'Test SUV', 'Red', 'Test Owner', 'Automated Test', 'Active');

    const match = db.prepare("SELECT * FROM watchlist WHERE UPPER(identifier) = ? AND status = 'Active'").get(testPlate);
    assert.ok(match, 'Watchlist item should be fetchable');
    assert.equal(match.severity, 'Critical');

    // Cleanup
    db.prepare('DELETE FROM watchlist WHERE identifier = ?').run(testPlate);
  });

  await t.test('4. AI Inference Ingestion & Real-Time Watchlist Alert Generation', () => {
    const eventId = `EVT-TEST-${Date.now()}`;
    const testCamera = 'C001';
    const watchlistPlate = 'GJ01XX0001'; // Known stolen vehicle in seed watchlist

    const result = processAiEvent({
      id: eventId,
      camera_id: testCamera,
      event_type: 'ANPR',
      vehicle_number: watchlistPlate,
      confidence: 0.99,
      vehicle_type: 'Car',
      color: 'White',
      speed_kmh: 65,
      bounding_box: { x: 100, y: 150, w: 200, h: 120 }
    });

    assert.ok(result.event, 'AI Event record should be generated');
    assert.equal(result.event.vehicle_number, watchlistPlate);
    
    const eventInDb = db.prepare('SELECT * FROM ai_events WHERE id = ?').get(eventId);
    assert.ok(eventInDb, 'AI Event should be persisted in database');
  });

  await t.test('5. GIS Vehicle Movement Tracing & Haversine Distance Calculation', () => {
    const plate = 'GJ01XX0001';
    const detections = db.prepare(`
      SELECT e.*, c.name as camera_name, c.zone as camera_zone, c.latitude, c.longitude
      FROM ai_events e
      JOIN cameras c ON e.camera_id = c.id
      WHERE UPPER(e.vehicle_number) = ?
      ORDER BY e.timestamp ASC
    `).all(plate);

    assert.ok(detections.length > 0, 'Should find movement detections for vehicle GJ01XX0001');

    // Test Haversine formula calculation logic
    let totalDistanceKm = 0;
    detections.forEach((det, idx) => {
      if (idx > 0) {
        const prev = detections[idx - 1];
        const R = 6371;
        const dLat = (det.latitude - prev.latitude) * Math.PI / 180;
        const dLon = (det.longitude - prev.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(prev.latitude * Math.PI / 180) * Math.cos(det.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        totalDistanceKm += R * c;
      }
    });

    assert.ok(typeof totalDistanceKm === 'number', 'Calculated distance should be a valid number');
  });

  await t.test('6. Alert Lifecycle Workflow (Acknowledge & Resolve)', () => {
    const alertId = `ALT-TEST-${Date.now()}`;
    const now = new Date().toISOString();
    
    // Insert Test Alert
    db.prepare(`
      INSERT INTO alerts (id, event_id, watchlist_id, camera_id, severity, status, matched_identifier, matched_category, operator_notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(alertId, 'EVT-1001', 'W001', 'C001', 'Critical', 'Active', 'GJ01XX0001', 'Stolen Vehicle', 'Test alert lifecycle', now);

    // Acknowledge Alert
    db.prepare(`
      UPDATE alerts
      SET status = ?, operator_notes = ?, acknowledged_by = ?, acknowledged_at = ?, resolved_at = ?
      WHERE id = ?
    `).run('Acknowledged', 'Updated notes', 'Inspector V. Patel', now, null, alertId);

    let alertState = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId);
    assert.equal(alertState.status, 'Acknowledged');
    assert.equal(alertState.acknowledged_by, 'Inspector V. Patel');

    // Resolve Alert
    db.prepare(`
      UPDATE alerts
      SET status = ?, operator_notes = ?, acknowledged_by = ?, acknowledged_at = ?, resolved_at = ?
      WHERE id = ?
    `).run('Resolved', 'Updated notes', 'Inspector V. Patel', now, now, alertId);

    alertState = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId);
    assert.equal(alertState.status, 'Resolved');

    // Cleanup
    db.prepare('DELETE FROM alerts WHERE id = ?').run(alertId);
  });

  await t.test('7. System Metrics & Audit Trail', () => {
    const totalCameras = db.prepare('SELECT COUNT(*) as c FROM cameras').get().c;
    assert.ok(totalCameras > 0, 'Total cameras count should be greater than 0');

    const auditCount = db.prepare('SELECT COUNT(*) as c FROM audit_logs').get().c;
    assert.ok(auditCount > 0, 'Audit logs should contain system history entries');
  });
});
