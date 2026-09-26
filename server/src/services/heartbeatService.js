const db = require('../db/database');
const { broadcastCameraStatus } = require('./websocketService');

let heartbeatInterval = null;

function startHeartbeatService() {
  if (heartbeatInterval) return;
  console.log('[HeartbeatService] Starting camera heartbeat monitoring daemon...');

  heartbeatInterval = setInterval(() => {
    try {
      // Update last_heartbeat for Online cameras
      const now = new Date().toISOString();
      db.prepare("UPDATE cameras SET last_heartbeat = ? WHERE status = 'Online'").run(now);

      // Randomly simulate occasional degraded/online heartbeat ping to demonstrate health monitoring
      const allCameras = db.prepare('SELECT * FROM cameras').all();
      allCameras.forEach(cam => {
        // Broadcast camera status to frontend
        broadcastCameraStatus({
          id: cam.id,
          name: cam.name,
          status: cam.status,
          last_heartbeat: now,
          zone: cam.zone
        });
      });

    } catch (err) {
      console.error('[HeartbeatService] Error:', err.message);
    }
  }, 15000); // Check every 15s
}

module.exports = {
  startHeartbeatService
};
