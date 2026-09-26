const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { checkAndTriggerAlert } = require('./watchlistMatcher');
const { broadcastAiEvent, broadcastSystemStats } = require('./websocketService');

// Synthetic plate pools
const randomPlates = [
  'GJ01XX0001', // Watchlist Stolen
  'GJ06AB1234', // Watchlist Blacklisted
  'GJ01AB9876',
  'GJ05CD4321',
  'GJ18XY9988', // Watchlist Truck
  'GJ03EF5566',
  'GJ27GH1122',
  'GJ01KL3344',
  'GJ05MN7788'
];

const vehicleTypes = ['Car', 'SUV', 'Truck', 'Motorcycle', 'Bus'];
const colors = ['White', 'Black', 'Red', 'Blue', 'Silver', 'Grey', 'Yellow'];
const eventTypes = ['ANPR', 'Vehicle Detection', 'Speeding Violation', 'Illegal Parking'];

function processAiEvent(eventData) {
  // Input validation
  if (!eventData.camera_id) {
    throw new Error('camera_id is required');
  }

  const cameraExists = db.prepare('SELECT id FROM cameras WHERE id = ?').get(eventData.camera_id);
  if (!cameraExists) {
    throw new Error(`Camera with ID ${eventData.camera_id} does not exist`);
  }

  const id = eventData.id || `EVT-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  const confidence = eventData.confidence || (0.85 + Math.random() * 0.14);
  const bbox = typeof eventData.bounding_box === 'string'
    ? eventData.bounding_box
    : JSON.stringify(eventData.bounding_box || { x: 100, y: 120, w: 200, h: 150 });

  const eventRecord = {
    id,
    camera_id: eventData.camera_id,
    event_type: eventData.event_type || 'ANPR',
    vehicle_number: eventData.vehicle_number ? eventData.vehicle_number.toUpperCase() : null,
    person_identifier: eventData.person_identifier || null,
    confidence: Number(confidence.toFixed(2)),
    vehicle_type: eventData.vehicle_type || 'Car',
    color: eventData.color || 'White',
    speed_kmh: eventData.speed_kmh || Math.floor(40 + Math.random() * 45),
    bounding_box: bbox,
    snapshot_url: eventData.snapshot_url || '/snapshots/sample.jpg',
    timestamp: eventData.timestamp || new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO ai_events (id, camera_id, event_type, vehicle_number, person_identifier, confidence, vehicle_type, color, speed_kmh, bounding_box, snapshot_url, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    eventRecord.id,
    eventRecord.camera_id,
    eventRecord.event_type,
    eventRecord.vehicle_number,
    eventRecord.person_identifier,
    eventRecord.confidence,
    eventRecord.vehicle_type,
    eventRecord.color,
    eventRecord.speed_kmh,
    eventRecord.bounding_box,
    eventRecord.snapshot_url,
    eventRecord.timestamp
  );

  // Broadcast live AI event via WebSocket
  const camera = db.prepare('SELECT name, zone FROM cameras WHERE id = ?').get(eventRecord.camera_id);
  const enrichedEvent = {
    ...eventRecord,
    camera_name: camera ? camera.name : eventRecord.camera_id,
    camera_zone: camera ? camera.zone : ''
  };

  broadcastAiEvent(enrichedEvent);

  // Check Watchlist Matcher
  const alert = checkAndTriggerAlert(enrichedEvent);

  return { event: enrichedEvent, alert };
}

// Background Synthetic Event Generator
let simulatorInterval = null;

function startAiSimulator() {
  if (simulatorInterval) return;
  console.log('[AISimulator] Starting real-time synthetic CCTV AI detection generator...');

  simulatorInterval = setInterval(() => {
    try {
      // Pick random online camera
      const onlineCameras = db.prepare("SELECT id FROM cameras WHERE status = 'Online'").all();
      if (!onlineCameras || onlineCameras.length === 0) return;

      const randomCam = onlineCameras[Math.floor(Math.random() * onlineCameras.length)];
      const plate = randomPlates[Math.floor(Math.random() * randomPlates.length)];
      const vType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const col = colors[Math.floor(Math.random() * colors.length)];
      const eType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      const x = Math.floor(50 + Math.random() * 400);
      const y = Math.floor(50 + Math.random() * 250);
      const w = Math.floor(180 + Math.random() * 100);
      const h = Math.floor(100 + Math.random() * 80);

      processAiEvent({
        camera_id: randomCam.id,
        event_type: eType,
        vehicle_number: plate,
        confidence: 0.88 + Math.random() * 0.11,
        vehicle_type: vType,
        color: col,
        speed_kmh: Math.floor(35 + Math.random() * 50),
        bounding_box: { x, y, w, h }
      });

      // Also publish system metrics
      const totalEvents = db.prepare('SELECT COUNT(*) as count FROM ai_events').get().count;
      const totalAlerts = db.prepare('SELECT COUNT(*) as count FROM alerts').get().count;
      const onlineCamCount = db.prepare("SELECT COUNT(*) as count FROM cameras WHERE status = 'Online'").get().count;
      const totalCamCount = db.prepare('SELECT COUNT(*) as count FROM cameras').get().count;

      broadcastSystemStats({
        fps_average: Math.floor(28 + Math.random() * 4),
        total_detections: totalEvents,
        total_alerts: totalAlerts,
        active_cameras: `${onlineCamCount}/${totalCamCount}`,
        system_load_cpu: `${(15 + Math.random() * 10).toFixed(1)}%`,
        network_bandwidth_mbps: `${(42 + Math.random() * 15).toFixed(1)} Mbps`,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error('[AISimulator] Error in simulation cycle:', err.message);
    }
  }, 6000); // Trigger every 6 seconds
}

function stopAiSimulator() {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
    console.log('[AISimulator] Stopped AI simulation engine');
  }
}

module.exports = {
  processAiEvent,
  startAiSimulator,
  stopAiSimulator
};
