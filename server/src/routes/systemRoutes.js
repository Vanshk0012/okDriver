const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/v1/system/stats
router.get('/stats', (req, res) => {
  try {
    const totalCameras = db.prepare('SELECT COUNT(*) as c FROM cameras').get().c;
    const onlineCameras = db.prepare("SELECT COUNT(*) as c FROM cameras WHERE status = 'Online'").get().c;
    const offlineCameras = db.prepare("SELECT COUNT(*) as c FROM cameras WHERE status = 'Offline'").get().c;
    const degradedCameras = db.prepare("SELECT COUNT(*) as c FROM cameras WHERE status = 'Degraded'").get().c;

    const totalWatchlist = db.prepare('SELECT COUNT(*) as c FROM watchlist').get().c;
    const activeWatchlist = db.prepare("SELECT COUNT(*) as c FROM watchlist WHERE status = 'Active'").get().c;

    const totalEvents = db.prepare('SELECT COUNT(*) as c FROM ai_events').get().c;
    const totalAlerts = db.prepare('SELECT COUNT(*) as c FROM alerts').get().c;
    const activeAlerts = db.prepare("SELECT COUNT(*) as c FROM alerts WHERE status = 'Active'").get().c;
    const criticalAlerts = db.prepare("SELECT COUNT(*) as c FROM alerts WHERE severity = 'Critical'").get().c;

    const departmentBreakdown = db.prepare('SELECT department, COUNT(*) as count FROM cameras GROUP BY department').all();
    const zoneBreakdown = db.prepare('SELECT zone, COUNT(*) as count FROM cameras GROUP BY zone').all();

    res.json({
      success: true,
      data: {
        cameras: {
          total: totalCameras,
          online: onlineCameras,
          offline: offlineCameras,
          degraded: degradedCameras
        },
        watchlist: {
          total: totalWatchlist,
          active: activeWatchlist
        },
        events: {
          total: totalEvents
        },
        alerts: {
          total: totalAlerts,
          active: activeAlerts,
          critical: criticalAlerts
        },
        breakdown: {
          departments: departmentBreakdown,
          zones: zoneBreakdown
        },
        system_status: {
          api: 'Healthy',
          websocket: 'Connected',
          database: 'SQLite WAL Mode',
          ai_simulator: 'Running',
          uptime_seconds: process.uptime()
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
