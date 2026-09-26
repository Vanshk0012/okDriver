const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

// Database initialization
require('./src/db/database');

// Services
const { initWebSocket } = require('./src/services/websocketService');
const { startAiSimulator } = require('./src/services/aiEngine');
const { startHeartbeatService } = require('./src/services/heartbeatService');

// Routes
const cameraRoutes = require('./src/routes/cameraRoutes');
const watchlistRoutes = require('./src/routes/watchlistRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const systemRoutes = require('./src/routes/systemRoutes');
const swaggerSpec = require('./src/swaggerSpec');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});
initWebSocket(io);

// Security & Rate Limiting Middleware
const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_MIN = 300;

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, startTime: now });
  } else {
    const record = requestCounts.get(ip);
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      record.count = 1;
      record.startTime = now;
    } else {
      record.count++;
      if (record.count > MAX_REQUESTS_PER_MIN) {
        return res.status(429).json({
          success: false,
          error: 'Too Many Requests - Rate Limit Exceeded (Max 300 requests/min)'
        });
      }
    }
  }
  next();
};

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Serve static snapshot samples
app.use('/snapshots', express.static(path.join(__dirname, 'public/snapshots')));

// OpenAPI / Swagger Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// REST API Endpoints
app.use('/api/v1/cameras', cameraRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/system', systemRoutes);

// Root Status
app.get('/', (req, res) => {
  res.json({
    name: 'okDriver CCTV Monitoring & Video Analytics API',
    version: '1.0.0',
    status: 'Operational',
    swagger_docs: '/api-docs',
    timestamp: new Date().toISOString()
  });
});

// Start Background Services
startAiSimulator();
startHeartbeatService();

const PORT = process.env.PORT || 5050;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Server] Port ${PORT} is currently in use. Retrying on port ${PORT + 1}...`);
    setTimeout(() => {
      server.listen(PORT + 1);
    }, 1000);
  } else {
    console.error('[Server] Fatal Error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 okDriver CCTV Analytics Backend Server Running`);
  console.log(`📡 REST API Endpoint: http://localhost:${PORT}/api/v1`);
  console.log(`📑 OpenAPI / Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`⚡ WebSocket Server Ready on port ${PORT}`);
  console.log(`=======================================================`);
});
