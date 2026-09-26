import axios from 'axios';

const API_BASE = '/api/v1';

export const api = {
  // Cameras
  getCameras: (params) => axios.get(`${API_BASE}/cameras`, { params }),
  getCameraById: (id) => axios.get(`${API_BASE}/cameras/${id}`),
  createCamera: (data) => axios.post(`${API_BASE}/cameras`, data),
  updateCamera: (id, data) => axios.put(`${API_BASE}/cameras/${id}`, data),
  updateCameraStatus: (id, status) => axios.post(`${API_BASE}/cameras/${id}/status`, { status }),
  deleteCamera: (id) => axios.delete(`${API_BASE}/cameras/${id}`),

  // Watchlist
  getWatchlist: (params) => axios.get(`${API_BASE}/watchlist`, { params }),
  createWatchlist: (data) => axios.post(`${API_BASE}/watchlist`, data),
  updateWatchlist: (id, data) => axios.put(`${API_BASE}/watchlist/${id}`, data),
  deleteWatchlist: (id) => axios.delete(`${API_BASE}/watchlist/${id}`),

  // AI Events & GIS Movement History
  ingestAiEvent: (data) => axios.post(`${API_BASE}/events/ai-inference`, data),
  getEvents: (params) => axios.get(`${API_BASE}/events`, { params }),
  getVehicleHistory: (plate) => axios.get(`${API_BASE}/events/vehicle/${encodeURIComponent(plate)}/history`),

  // Alerts
  getAlerts: (params) => axios.get(`${API_BASE}/alerts`, { params }),
  updateAlertStatus: (id, data) => axios.patch(`${API_BASE}/alerts/${id}`, data),

  // Audit Logs & System
  getAuditLogs: (params) => axios.get(`${API_BASE}/audit-logs`, { params }),
  getSystemStats: () => axios.get(`${API_BASE}/system/stats`),
};
