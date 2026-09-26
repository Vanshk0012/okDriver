const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { broadcastAlert } = require('./websocketService');

// Map to track recent alerts for temporal deduplication: key = `${camera_id}:${identifier}`, val = timestamp
const recentAlertCache = new Map();
const DUP_SUPPRESSION_MS = 30000; // 30 seconds

function checkAndTriggerAlert(event) {
  const vehicleNumber = event.vehicle_number ? event.vehicle_number.toUpperCase().trim() : null;
  const personId = event.person_identifier ? event.person_identifier.trim() : null;

  if (!vehicleNumber && !personId) return null;

  // Search watchlist
  let matchedWatchlistItem = null;
  if (vehicleNumber) {
    matchedWatchlistItem = db.prepare(`
      SELECT * FROM watchlist WHERE UPPER(identifier) = ? AND status = 'Active'
    `).get(vehicleNumber);
  }

  if (!matchedWatchlistItem && personId) {
    matchedWatchlistItem = db.prepare(`
      SELECT * FROM watchlist WHERE UPPER(identifier) = ? AND status = 'Active'
    `).get(personId.toUpperCase());
  }

  if (!matchedWatchlistItem) {
    return null; // No match
  }

  // Deduplication check
  const dedupKey = `${event.camera_id}:${matchedWatchlistItem.identifier}`;
  const now = Date.now();
  if (recentAlertCache.has(dedupKey)) {
    const lastTime = recentAlertCache.get(dedupKey);
    if (now - lastTime < DUP_SUPPRESSION_MS) {
      console.log(`[WatchlistMatcher] Suppressing duplicate alert for ${matchedWatchlistItem.identifier} on ${event.camera_id}`);
      return null;
    }
  }
  recentAlertCache.set(dedupKey, now);

  // Fetch camera metadata
  const camera = db.prepare('SELECT name, zone FROM cameras WHERE id = ?').get(event.camera_id);
  const cameraName = camera ? camera.name : event.camera_id;

  const alertId = `ALT-${Date.now().toString().slice(-6)}`;
  const alertRecord = {
    id: alertId,
    event_id: event.id,
    watchlist_id: matchedWatchlistItem.id,
    camera_id: event.camera_id,
    severity: matchedWatchlistItem.severity || 'Critical',
    status: 'Active',
    matched_identifier: matchedWatchlistItem.identifier,
    matched_category: matchedWatchlistItem.category,
    operator_notes: `AUTOMATED MATCH: ${matchedWatchlistItem.category} (${matchedWatchlistItem.name_or_model || ''}) detected at ${cameraName}. Confidence: ${(event.confidence * 100).toFixed(1)}%`,
    timestamp: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO alerts (id, event_id, watchlist_id, camera_id, severity, status, matched_identifier, matched_category, operator_notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    alertRecord.id,
    alertRecord.event_id,
    alertRecord.watchlist_id,
    alertRecord.camera_id,
    alertRecord.severity,
    alertRecord.status,
    alertRecord.matched_identifier,
    alertRecord.matched_category,
    alertRecord.operator_notes,
    alertRecord.timestamp
  );

  // Record audit log
  const auditId = `AUD-${Date.now().toString().slice(-6)}`;
  db.prepare(`
    INSERT INTO audit_logs (id, action, module, details, performed_by, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    auditId,
    'WATCHLIST_ALERT_GENERATED',
    'Alert',
    `Alert ${alertId} generated for ${alertRecord.matched_category} ${alertRecord.matched_identifier} at ${cameraName}`,
    'AI Correlation Engine',
    new Date().toISOString()
  );

  // Attach full event & camera detail for real-time payload
  const fullAlertPayload = {
    ...alertRecord,
    camera_name: cameraName,
    camera_zone: camera ? camera.zone : '',
    watchlist_item: matchedWatchlistItem,
    ai_event: event
  };

  console.log(`[WatchlistMatcher] 🔥 ALERT TRIGGERED! ID: ${alertId} | Category: ${alertRecord.matched_category} | ID: ${alertRecord.matched_identifier}`);

  broadcastAlert(fullAlertPayload);
  return fullAlertPayload;
}

module.exports = {
  checkAndTriggerAlert
};
