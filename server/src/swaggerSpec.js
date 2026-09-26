const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "okDriver CCTV Monitoring & AI Video Analytics Platform API",
    version: "1.0.0",
    description: "Production RESTful API connecting live video sources, camera registry, AI inference ingestion, watchlist correlation, real-time alerting, and GIS vehicle movement tracing.",
    contact: {
      name: "okDriver Engineering Team & Gujarat Police Hackathon 2026",
      email: "experts@okdriver.in"
    }
  },
  servers: [
    {
      url: "http://localhost:5000/api/v1",
      description: "Local Development Server"
    }
  ],
  tags: [
    { name: "Cameras", description: "Camera Registry & Health Monitoring" },
    { name: "Watchlist", description: "Target Watchlist & Blacklist Management" },
    { name: "AI Events", description: "AI Video Analytics Event Ingestion & GIS Route History" },
    { name: "Alerts", description: "Real-time Alert Dispatch & Workflow" },
    { name: "System", description: "Metrics, Audit Logs & Health" }
  ],
  paths: {
    "/cameras": {
      get: {
        tags: ["Cameras"],
        summary: "List all camera sources with filters",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "zone", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["Online", "Offline", "Degraded"] } }
        ],
        responses: { 200: { description: "Success" } }
      },
      post: {
        tags: ["Cameras"],
        summary: "Onboard new camera source",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "string", example: "C009" },
                  name: { type: "string", example: "CG Road Junction" },
                  department: { type: "string", example: "Traffic Police" },
                  latitude: { type: "number", example: 23.0310 },
                  longitude: { type: "number", example: 72.5601 },
                  camera_type: { type: "string", example: "Fixed PTZ" },
                  source_protocol: { type: "string", example: "RTSP" },
                  stream_url: { type: "string", example: "rtsp://admin:pass@10.0.4.109:554/live" },
                  zone: { type: "string", example: "Ahmedabad Central" }
                }
              }
            }
          }
        },
        responses: { 201: { description: "Camera Onboarded" } }
      }
    },
    "/watchlist": {
      get: {
        tags: ["Watchlist"],
        summary: "List watchlist records",
        responses: { 200: { description: "Success" } }
      },
      post: {
        tags: ["Watchlist"],
        summary: "Add new entity to watchlist",
        responses: { 201: { description: "Record Created" } }
      }
    },
    "/events/ai-inference": {
      post: {
        tags: ["AI Events"],
        summary: "Ingest AI inference detection result from camera or edge gateway",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  camera_id: { type: "string", example: "C001" },
                  event_type: { type: "string", example: "ANPR" },
                  vehicle_number: { type: "string", example: "GJ01XX0001" },
                  confidence: { type: "number", example: 0.98 },
                  vehicle_type: { type: "string", example: "Car" },
                  color: { type: "string", example: "White" },
                  speed_kmh: { type: "number", example: 55 },
                  bounding_box: {
                    type: "object",
                    properties: { x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" } }
                  }
                }
              }
            }
          }
        },
        responses: { 201: { description: "AI Event Processed & Correlated" } }
      }
    },
    "/events/vehicle/{plate}/history": {
      get: {
        tags: ["AI Events"],
        summary: "Fetch GIS chronological movement history and route tracing for a vehicle",
        parameters: [
          { name: "plate", in: "path", required: true, schema: { type: "string" }, example: "GJ01XX0001" }
        ],
        responses: { 200: { description: "Chronological route timeline with camera GPS coordinates" } }
      }
    },
    "/alerts": {
      get: {
        tags: ["Alerts"],
        summary: "Get real-time watchlist alerts",
        responses: { 200: { description: "Success" } }
      }
    },
    "/alerts/{id}": {
      patch: {
        tags: ["Alerts"],
        summary: "Acknowledge or resolve alert",
        responses: { 200: { description: "Updated Alert" } }
      }
    },
    "/system/stats": {
      get: {
        tags: ["System"],
        summary: "Get full platform health & statistics summary",
        responses: { 200: { description: "Success" } }
      }
    }
  }
};

module.exports = swaggerDocument;
