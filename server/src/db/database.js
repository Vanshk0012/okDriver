const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, '../../data.json');

// Memory Data Store
let store = {
  cameras: [],
  watchlist: [],
  ai_events: [],
  alerts: [],
  audit_logs: []
};

function loadStore() {
  if (fs.existsSync(dbFilePath)) {
    try {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      store = JSON.parse(data);
    } catch (e) {
      console.error('[DB] Error reading data.json, initializing fresh store', e.message);
    }
  }
}

function saveStore() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('[DB] Error saving data.json', e.message);
  }
}

loadStore();

// Initial Seed Data if empty
if (store.cameras.length === 0) {
  console.log('[Database] Seeding initial Gujarat CCTV cameras, watchlist, events, and audit logs...');

  store.cameras = [
    { id: 'C001', name: 'SG Highway - Iskcon Cross Road Junction', department: 'Traffic Police', latitude: 23.0276, longitude: 72.5074, camera_type: 'Dome PTZ 4K', source_protocol: 'RTSP', stream_url: 'rtsp://admin:pass@10.0.4.101:554/live/ch1', status: 'Online', last_heartbeat: new Date().toISOString(), zone: 'Ahmedabad West', storage_retention_days: 45, fps: 30, resolution: '4K UltraHD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'C002', name: 'RTO Checkpoint - Subhash Bridge', department: 'Transport Dept', latitude: 23.0617, longitude: 72.5802, camera_type: 'ANPR Fixed Bullet', source_protocol: 'ONVIF', stream_url: 'onvif://10.0.4.102:8000/onvif/device_service', status: 'Online', last_heartbeat: new Date().toISOString(), zone: 'Ahmedabad North', storage_retention_days: 60, fps: 60, resolution: '1080p 60fps', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'C003', name: 'Ring Road Junction - Majura Gate', department: 'Smart City Command', latitude: 21.1824, longitude: 72.8180, camera_type: 'Multi-Sensor Panoramic', source_protocol: 'HLS', stream_url: 'https://demo-streams.okdriver.in/hls/c003/index.m3u8', status: 'Online', last_heartbeat: new Date().toISOString(), zone: 'Surat Central', storage_retention_days: 30, fps: 30, resolution: '1080p', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'C004', name: 'Express Highway Toll Plaza', department: 'National Highway Patrol', latitude: 22.3511, longitude: 73.1812, camera_type: 'High-Speed ANPR Barrier', source_protocol: 'WebRTC', stream_url: 'webrtc://10.0.8.201:8080/stream/c004', status: 'Online', last_heartbeat: new Date().toISOString(), zone: 'Vadodara North', storage_retention_days: 90, fps: 60, resolution: '4K 60fps', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'C005', name: 'Kalupur Central Railway Station Gate 1', department: 'Railway Security Force', latitude: 23.0205, longitude: 72.6015, camera_type: 'Thermal Facial Cam', source_protocol: 'RTSP', stream_url: 'rtsp://admin:pass@10.0.4.105:554/live/ch1', status: 'Degraded', last_heartbeat: new Date().toISOString(), zone: 'Ahmedabad East', storage_retention_days: 30, fps: 15, resolution: '720p', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'C006', name: 'Sector 28 Industrial Zone Entrance', department: 'Municipal Security', latitude: 23.2425, longitude: 72.6468, camera_type: 'Fixed Box Cam', source_protocol: 'Simulator', stream_url: 'sim://okdriver-sim/c006', status: 'Offline', last_heartbeat: new Date().toISOString(), zone: 'Gandhinagar', storage_retention_days: 30, fps: 30, resolution: '1080p', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'C007', name: 'Kalawad Road Traffic Circle', department: 'Rajkot Police Control', latitude: 22.2905, longitude: 70.7785, camera_type: 'Dome PTZ 360', source_protocol: 'RTSP', stream_url: 'rtsp://admin:pass@10.0.9.107:554/live/ch1', status: 'Online', last_heartbeat: new Date().toISOString(), zone: 'Rajkot Central', storage_retention_days: 45, fps: 30, resolution: '1080p', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'C008', name: 'GIFT City Main Highway Entrance', department: 'GIFT City Security', latitude: 23.1611, longitude: 72.6845, camera_type: 'AI Smart Bullet 4K', source_protocol: 'HLS', stream_url: 'https://demo-streams.okdriver.in/hls/c008/index.m3u8', status: 'Online', last_heartbeat: new Date().toISOString(), zone: 'Gandhinagar South', storage_retention_days: 60, fps: 60, resolution: '4K UltraHD', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];

  store.watchlist = [
    { id: 'W001', identifier: 'GJ01XX0001', entity_type: 'Vehicle', category: 'Stolen Vehicle', severity: 'Critical', name_or_model: 'White Maruti Swift Dzire', color: 'White', owner_or_target: 'Ramesh Patel', notes: 'Stolen from Navrangpura parking slot on 2026-09-20. FIR #4029/2026', status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'W002', identifier: 'GJ06AB1234', entity_type: 'Vehicle', category: 'Blacklisted Vehicle', severity: 'High', name_or_model: 'Red Hyundai Creta', color: 'Red', owner_or_target: 'Suresh Shah', notes: 'Involved in hit-and-run on SP Ring Road. Impound warrant active.', status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'W003', identifier: 'GJ18XY9988', entity_type: 'Vehicle', category: 'Stolen Commercial Truck', severity: 'Critical', name_or_model: 'Tata Prima 3530.K', color: 'Yellow/Blue', owner_or_target: 'Gujarat Logistics Pvt Ltd', notes: 'High-value consignment theft near Chhani toll plaza.', status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'W004', identifier: 'P-884920', entity_type: 'Person', category: 'Wanted Person', severity: 'Critical', name_or_model: 'Rajesh Kumar (Raju)', color: 'N/A', owner_or_target: 'State CID Target', notes: 'Warrant #902/2025 under Arms Act. Known to travel via interstate buses.', status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'W005', identifier: 'P-552109', entity_type: 'Person', category: 'Missing Person', severity: 'Medium', name_or_model: 'Ananya Sharma (Age 14)', color: 'N/A', owner_or_target: 'Family Contact: 9876543210', notes: 'Missing report filed at Satellite Police Station on 2026-09-24.', status: 'Active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];

  store.ai_events = [
    { id: 'EVT-1001', camera_id: 'C001', event_type: 'ANPR', vehicle_number: 'GJ01XX0001', confidence: 0.98, vehicle_type: 'Car', color: 'White', speed_kmh: 48, bounding_box: JSON.stringify({x: 120, y: 180, w: 240, h: 140}), snapshot_url: '/snapshots/evt1001.jpg', timestamp: '2026-09-26T10:02:15.000Z' },
    { id: 'EVT-1002', camera_id: 'C002', event_type: 'ANPR', vehicle_number: 'GJ01XX0001', confidence: 0.95, vehicle_type: 'Car', color: 'White', speed_kmh: 62, bounding_box: JSON.stringify({x: 150, y: 200, w: 220, h: 130}), snapshot_url: '/snapshots/evt1002.jpg', timestamp: '2026-09-26T10:18:40.000Z' },
    { id: 'EVT-1003', camera_id: 'C004', event_type: 'ANPR', vehicle_number: 'GJ01XX0001', confidence: 0.99, vehicle_type: 'Car', color: 'White', speed_kmh: 78, bounding_box: JSON.stringify({x: 200, y: 220, w: 260, h: 150}), snapshot_url: '/snapshots/evt1003.jpg', timestamp: '2026-09-26T10:41:05.000Z' },
    { id: 'EVT-1004', camera_id: 'C008', event_type: 'ANPR', vehicle_number: 'GJ01XX0001', confidence: 0.96, vehicle_type: 'Car', color: 'White', speed_kmh: 54, bounding_box: JSON.stringify({x: 180, y: 190, w: 230, h: 135}), snapshot_url: '/snapshots/evt1004.jpg', timestamp: '2026-09-26T11:15:30.000Z' },
    { id: 'EVT-1005', camera_id: 'C003', event_type: 'ANPR', vehicle_number: 'GJ06AB1234', confidence: 0.97, vehicle_type: 'SUV', color: 'Red', speed_kmh: 35, bounding_box: JSON.stringify({x: 300, y: 150, w: 210, h: 125}), snapshot_url: '/snapshots/evt1005.jpg', timestamp: '2026-09-26T12:30:10.000Z' }
  ];

  store.alerts = [
    { id: 'ALT-1001', event_id: 'EVT-1001', watchlist_id: 'W001', camera_id: 'C001', severity: 'Critical', status: 'Active', matched_identifier: 'GJ01XX0001', matched_category: 'Stolen Vehicle', operator_notes: 'Auto-matched at SG Highway C001.', timestamp: '2026-09-26T10:02:16.000Z' },
    { id: 'ALT-1002', event_id: 'EVT-1002', watchlist_id: 'W001', camera_id: 'C002', severity: 'Critical', status: 'Active', matched_identifier: 'GJ01XX0001', matched_category: 'Stolen Vehicle', operator_notes: 'Auto-matched at RTO Checkpoint C002.', timestamp: '2026-09-26T10:18:41.000Z' },
    { id: 'ALT-1003', event_id: 'EVT-1005', watchlist_id: 'W002', camera_id: 'C003', severity: 'High', status: 'Acknowledged', matched_identifier: 'GJ06AB1234', matched_category: 'Blacklisted Vehicle', operator_notes: 'Dispatched patrol squad to Majura Gate.', timestamp: '2026-09-26T12:30:11.000Z' }
  ];

  store.audit_logs = [
    { id: 'AUD-001', action: 'SYSTEM_INIT', module: 'System', details: 'Platform database initialized with 8 Gujarat CCTV cameras', performed_by: 'System Bootstrapper', timestamp: new Date().toISOString() },
    { id: 'AUD-002', action: 'WATCHLIST_ADD', module: 'Watchlist', details: 'Added stolen vehicle GJ01XX0001 to Critical Watchlist', performed_by: 'Inspector V. Patel', timestamp: new Date().toISOString() }
  ];

  saveStore();
}

// Emulate SQLite query builder API
class Statement {
  constructor(sql) {
    this.sql = sql.trim();
  }

  all(...params) {
    const s = this.sql.toUpperCase();
    if (s.includes('FROM CAMERAS')) {
      let res = [...store.cameras];
      let pIdx = 0;
      if (this.sql.includes('WHERE 1=1 AND (id LIKE ? OR name LIKE ? OR zone LIKE ?)')) {
        const term = params[pIdx].replace(/%/g, '').toUpperCase();
        pIdx += 3;
        res = res.filter(c => c.id.toUpperCase().includes(term) || c.name.toUpperCase().includes(term) || c.zone.toUpperCase().includes(term));
      }
      if (this.sql.includes('AND zone = ?')) {
        const z = params[pIdx++];
        res = res.filter(c => c.zone === z);
      }
      if (this.sql.includes('AND status = ?')) {
        const st = params[pIdx++];
        res = res.filter(c => c.status === st);
      }
      if (this.sql.includes('AND department = ?')) {
        const d = params[pIdx++];
        res = res.filter(c => c.department === d);
      }
      if (this.sql.includes('AND source_protocol = ?')) {
        const pr = params[pIdx++];
        res = res.filter(c => c.source_protocol === pr);
      }
      if (this.sql.includes('GROUP BY DEPARTMENT')) {
        const counts = {};
        store.cameras.forEach(c => counts[c.department] = (counts[c.department] || 0) + 1);
        return Object.keys(counts).map(d => ({ department: d, count: counts[d] }));
      }
      if (this.sql.includes('GROUP BY ZONE')) {
        const counts = {};
        store.cameras.forEach(c => counts[c.zone] = (counts[c.zone] || 0) + 1);
        return Object.keys(counts).map(z => ({ zone: z, count: counts[z] }));
      }
      return res;
    }

    if (s.includes('FROM WATCHLIST')) {
      let res = [...store.watchlist];
      let pIdx = 0;
      if (this.sql.includes('WHERE 1=1 AND (identifier LIKE ? OR name_or_model LIKE ? OR owner_or_target LIKE ?)')) {
        const term = params[pIdx].replace(/%/g, '').toUpperCase();
        pIdx += 3;
        res = res.filter(w => (w.identifier && w.identifier.toUpperCase().includes(term)) || (w.name_or_model && w.name_or_model.toUpperCase().includes(term)) || (w.owner_or_target && w.owner_or_target.toUpperCase().includes(term)));
      }
      if (this.sql.includes('AND category = ?')) {
        const cat = params[pIdx++];
        res = res.filter(w => w.category === cat);
      }
      if (this.sql.includes('AND severity = ?')) {
        const sev = params[pIdx++];
        res = res.filter(w => w.severity === sev);
      }
      if (this.sql.includes('AND status = ?')) {
        const st = params[pIdx++];
        res = res.filter(w => w.status === st);
      }
      return res.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (s.includes('FROM AI_EVENTS')) {
      let res = store.ai_events.map(e => {
        const cam = store.cameras.find(c => c.id === e.camera_id) || {};
        return {
          ...e,
          camera_name: cam.name || e.camera_id,
          camera_zone: cam.zone || '',
          department: cam.department || '',
          latitude: cam.latitude || 23.0,
          longitude: cam.longitude || 72.5
        };
      });

      let pIdx = 0;
      if (this.sql.includes('WHERE UPPER(e.vehicle_number) = ?')) {
        const plate = params[pIdx++];
        res = res.filter(e => e.vehicle_number && e.vehicle_number.toUpperCase() === plate);
        if (this.sql.includes('ORDER BY e.timestamp ASC')) {
          return res.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
      }
      if (this.sql.includes('AND e.camera_id = ?')) {
        const cid = params[pIdx++];
        res = res.filter(e => e.camera_id === cid);
      }
      if (this.sql.includes('AND UPPER(e.vehicle_number) LIKE ?')) {
        const p = params[pIdx++].replace(/%/g, '').toUpperCase();
        res = res.filter(e => e.vehicle_number && e.vehicle_number.toUpperCase().includes(p));
      }

      res.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      if (this.sql.includes('LIMIT ?')) {
        const lim = params[params.length - 1];
        res = res.slice(0, Number(lim));
      }
      return res;
    }

    if (s.includes('FROM ALERTS')) {
      let res = store.alerts.map(a => {
        const cam = store.cameras.find(c => c.id === a.camera_id) || {};
        const w = store.watchlist.find(item => item.id === a.watchlist_id) || {};
        const evt = store.ai_events.find(e => e.id === a.event_id) || {};
        return {
          ...a,
          camera_name: cam.name || a.camera_id,
          camera_zone: cam.zone || '',
          watchlist_category: w.category || a.matched_category,
          name_or_model: w.name_or_model || '',
          owner_or_target: w.owner_or_target || '',
          snapshot_url: evt.snapshot_url || '/snapshots/sample.jpg'
        };
      });

      let pIdx = 0;
      if (this.sql.includes('AND a.severity = ?')) {
        const sev = params[pIdx++];
        res = res.filter(a => a.severity === sev);
      }
      if (this.sql.includes('AND a.status = ?')) {
        const st = params[pIdx++];
        res = res.filter(a => a.status === st);
      }
      res.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      if (this.sql.includes('LIMIT ?')) {
        const lim = params[params.length - 1];
        res = res.slice(0, Number(lim));
      }
      return res;
    }

    if (s.includes('FROM AUDIT_LOGS')) {
      let res = [...store.audit_logs];
      if (this.sql.includes('AND module = ?')) {
        res = res.filter(l => l.module === params[0]);
      }
      res.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      return res;
    }

    return [];
  }

  get(...params) {
    const s = this.sql.toUpperCase();
    if (s.includes('COUNT(*) AS COUNT') || s.includes('COUNT(*) AS C')) {
      if (s.includes('FROM CAMERAS WHERE STATUS = \'ONLINE\'')) {
        return { count: store.cameras.filter(c => c.status === 'Online').length, c: store.cameras.filter(c => c.status === 'Online').length };
      }
      if (s.includes('FROM CAMERAS WHERE STATUS = \'OFFLINE\'')) {
        return { count: store.cameras.filter(c => c.status === 'Offline').length, c: store.cameras.filter(c => c.status === 'Offline').length };
      }
      if (s.includes('FROM CAMERAS WHERE STATUS = \'DEGRADED\'')) {
        return { count: store.cameras.filter(c => c.status === 'Degraded').length, c: store.cameras.filter(c => c.status === 'Degraded').length };
      }
      if (s.includes('FROM CAMERAS')) {
        return { count: store.cameras.length, c: store.cameras.length };
      }
      if (s.includes('FROM WATCHLIST WHERE STATUS = \'ACTIVE\'')) {
        return { count: store.watchlist.filter(w => w.status === 'Active').length, c: store.watchlist.filter(w => w.status === 'Active').length };
      }
      if (s.includes('FROM WATCHLIST')) {
        return { count: store.watchlist.length, c: store.watchlist.length };
      }
      if (s.includes('FROM AI_EVENTS')) {
        return { count: store.ai_events.length, c: store.ai_events.length };
      }
      if (s.includes('FROM ALERTS WHERE SEVERITY = \'CRITICAL\'')) {
        return { count: store.alerts.filter(a => a.severity === 'Critical').length, c: store.alerts.filter(a => a.severity === 'Critical').length };
      }
      if (s.includes('FROM ALERTS WHERE STATUS = \'ACTIVE\'')) {
        return { count: store.alerts.filter(a => a.status === 'Active').length, c: store.alerts.filter(a => a.status === 'Active').length };
      }
      if (s.includes('FROM ALERTS')) {
        return { count: store.alerts.length, c: store.alerts.length };
      }
      if (s.includes('FROM AUDIT_LOGS')) {
        return { count: store.audit_logs.length, c: store.audit_logs.length };
      }
    }

    if (s.includes('FROM CAMERAS WHERE ID = ?')) {
      return store.cameras.find(c => c.id === params[0]) || null;
    }
    if (s.includes('FROM WATCHLIST WHERE UPPER(IDENTIFIER) = ? AND STATUS = \'ACTIVE\'')) {
      return store.watchlist.find(w => w.identifier && w.identifier.toUpperCase() === params[0].toUpperCase() && w.status === 'Active') || null;
    }
    if (s.includes('FROM WATCHLIST WHERE ID = ?')) {
      return store.watchlist.find(w => w.id === params[0]) || null;
    }
    if (s.includes('FROM ALERTS WHERE ID = ?')) {
      return store.alerts.find(a => a.id === params[0]) || null;
    }

    const allRes = this.all(...params);
    return allRes.length > 0 ? allRes[0] : null;
  }

  run(...params) {
    const s = this.sql.toUpperCase();

    if (s.startsWith('INSERT INTO CAMERAS')) {
      const [id, name, department, latitude, longitude, camera_type, source_protocol, stream_url, status, zone, storage_retention_days, resolution, fps] = params;
      const newCam = { id, name, department, latitude, longitude, camera_type, source_protocol, stream_url, status, zone, storage_retention_days, resolution, fps, last_heartbeat: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      store.cameras.push(newCam);
      saveStore();
      return { changes: 1 };
    }

    if (s.startsWith('UPDATE CAMERAS SET LAST_HEARTBEAT')) {
      const now = params[0];
      store.cameras.forEach(c => { if (c.status === 'Online') c.last_heartbeat = now; });
      saveStore();
      return { changes: store.cameras.length };
    }

    if (s.startsWith('UPDATE CAMERAS SET STATUS')) {
      const [st, id] = params;
      const c = store.cameras.find(x => x.id === id);
      if (c) { c.status = st; c.updated_at = new Date().toISOString(); }
      saveStore();
      return { changes: 1 };
    }

    if (s.startsWith('UPDATE CAMERAS')) {
      const [name, department, latitude, longitude, camera_type, source_protocol, stream_url, status, zone, id] = params;
      const c = store.cameras.find(x => x.id === id);
      if (c) {
        Object.assign(c, { name, department, latitude, longitude, camera_type, source_protocol, stream_url, status, zone, updated_at: new Date().toISOString() });
      }
      saveStore();
      return { changes: 1 };
    }

    if (s.startsWith('DELETE FROM CAMERAS')) {
      store.cameras = store.cameras.filter(c => c.id !== params[0]);
      saveStore();
      return { changes: 1 };
    }

    if (s.startsWith('INSERT INTO WATCHLIST')) {
      const [id, identifier, entity_type, category, severity, name_or_model, color, owner_or_target, notes, status] = params;
      store.watchlist.push({ id, identifier, entity_type, category, severity, name_or_model, color, owner_or_target, notes, status, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      saveStore();
      return { changes: 1 };
    }

    if (s.startsWith('UPDATE WATCHLIST')) {
      const [identifier, category, severity, name_or_model, color, owner_or_target, notes, status, id] = params;
      const w = store.watchlist.find(x => x.id === id);
      if (w) {
        Object.assign(w, { identifier, category, severity, name_or_model, color, owner_or_target, notes, status, updated_at: new Date().toISOString() });
      }
      saveStore();
      return { changes: 1 };
    }

    if (s.startsWith('DELETE FROM WATCHLIST')) {
      store.watchlist = store.watchlist.filter(w => w.id !== params[0]);
      saveStore();
      return { changes: 1 };
    }

    if (s.startsWith('INSERT INTO AI_EVENTS')) {
      const [id, camera_id, event_type, vehicle_number, person_identifier, confidence, vehicle_type, color, speed_kmh, bounding_box, snapshot_url, timestamp] = params;
      store.ai_events.unshift({ id, camera_id, event_type, vehicle_number, person_identifier, confidence, vehicle_type, color, speed_kmh, bounding_box, snapshot_url, timestamp });
      if (store.ai_events.length > 500) store.ai_events.pop(); // Keep last 500
      saveStore();
      return { changes: 1 };
    }

    if (s.startsWith('INSERT INTO ALERTS')) {
      const [id, event_id, watchlist_id, camera_id, severity, status, matched_identifier, matched_category, operator_notes, timestamp] = params;
      store.alerts.unshift({ id, event_id, watchlist_id, camera_id, severity, status, matched_identifier, matched_category, operator_notes, timestamp });
      saveStore();
      return { changes: 1 };
    }

    if (s.startsWith('UPDATE ALERTS')) {
      const [status, operator_notes, ackBy, ackAt, resAt, id] = params;
      const a = store.alerts.find(x => x.id === id);
      if (a) {
        Object.assign(a, { status, operator_notes, acknowledged_by: ackBy, acknowledged_at: ackAt, resolved_at: resAt });
      }
      saveStore();
      return { changes: 1 };
    }

    if (s.startsWith('INSERT INTO AUDIT_LOGS')) {
      const [id, action, module, details, performed_by, timestamp] = params;
      store.audit_logs.unshift({ id, action, module, details, performed_by, timestamp: timestamp || new Date().toISOString() });
      saveStore();
      return { changes: 1 };
    }

    return { changes: 0 };
  }
}

const db = {
  prepare: (sql) => new Statement(sql),
  pragma: () => {},
  exec: () => {}
};

module.exports = db;
