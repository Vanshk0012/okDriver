let io = null;

function initWebSocket(socketIoInstance) {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.emit('connection_status', {
      connected: true,
      timestamp: new Date().toISOString(),
      message: 'Connected to okDriver Video Analytics Real-Time Hub'
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });
}

function broadcastAiEvent(event) {
  if (io) {
    io.emit('ai_event', event);
  }
}

function broadcastAlert(alert) {
  if (io) {
    io.emit('watchlist_alert', alert);
  }
}

function broadcastCameraStatus(camera) {
  if (io) {
    io.emit('camera_status_change', camera);
  }
}

function broadcastSystemStats(stats) {
  if (io) {
    io.emit('system_stats_update', stats);
  }
}

module.exports = {
  initWebSocket,
  broadcastAiEvent,
  broadcastAlert,
  broadcastCameraStatus,
  broadcastSystemStats
};
