# okDriver Smart CCTV Monitoring, Video Analytics & Real-Time Alert Platform

> **Full Stack Developer Hiring Challenge Submission**  
> *Aligned with the Gujarat Police Innovation Hackathon 2026 Problem Statement*

[![Platform](https://img.shields.io/badge/Platform-okDriver%20CCTV%20VMS-blue)](https://okdriver.in)
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20React%20%7C%20Leaflet-emerald)](#)
[![Docker](https://img.shields.io/badge/Docker-Ready-purple)](#)

---

## 📸 Platform Overview & Key Features

The **okDriver CCTV Platform** is a working full-stack prototype designed to connect heterogeneous CCTV camera feeds, AI inference engines, target watchlists, real-time alert dispatching, and GIS movement tracking into one unified operational dashboard.

### 🌟 Core Capabilities
1. **Camera Registry & Onboarding**:
   - Onboard manual or API-based cameras supporting RTSP, ONVIF, HLS, WebRTC, and Edge Simulators.
   - Real-time health monitoring (`Online`, `Degraded`, `Offline`) with 15s heartbeat service.
   - Comprehensive search, zone filtering, and audit history log.

2. **Unified Operational Dashboard**:
   - Near-live CCTV camera grid with interactive AI bounding box overlays.
   - Real-time KPI stats (Cameras, Active Watchlist Alerts, AI FPS throughput).
   - Live AI inference detection stream with instant audio chime notifications.

3. **GIS Interactive Map & Vehicle Movement Tracing**:
   - Leaflet interactive map with custom status markers and pulsing alert halos.
   - **Chronological Route Reconstruction**: Trace any vehicle (e.g., `GJ01XX0001`) across cameras with timestamped checkpoints, Haversine distance calculation, speed estimation, and animated route playback!

4. **Watchlist Correlation & Real-Time Alerting**:
   - Manage target records (Stolen Vehicles, Blacklisted Vehicles, Wanted Persons, Missing Persons).
   - Instant matching engine on incoming AI events with 30-second temporal deduplication.
   - Operator Acknowledge & Resolve workflows with audit notes.

5. **Interactive OpenAPI / Swagger Documentation**:
   - Served live at `/api-docs`.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x, v20.x, or v22.x+
- **npm**: v9.x+
- **Docker & Docker Compose** (Optional, for single-command containerized run)

---

### Option 1: Local Development Run (Recommended)

1. **Clone & Install Dependencies**:
   ```bash
   cd okdriver-platform
   npm run install:all
   ```

2. **Start Backend Server & Frontend Client**:
   ```bash
   npm run dev
   ```
   - **Frontend Dashboard**: `http://localhost:3000`
   - **Backend REST API**: `http://localhost:5050/api/v1`
   - **OpenAPI / Swagger UI**: `http://localhost:5050/api-docs`

---

### Option 2: Docker Compose Run

Run the entire application (Backend, Frontend, Databases) in containers:
```bash
docker-compose up --build
```
- Frontend UI available at: `http://localhost:3000`
- Backend API available at: `http://localhost:5050`

---

## 📑 API Endpoints Reference

Interactive OpenAPI documentation is hosted at `http://localhost:5050/api-docs`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/cameras` | List & filter cameras (search, zone, status, protocol) |
| `POST` | `/api/v1/cameras` | Onboard new camera source |
| `POST` | `/api/v1/cameras/:id/status` | Toggle camera health (Online/Offline/Degraded) |
| `GET` | `/api/v1/watchlist` | List & filter target watchlist records |
| `POST` | `/api/v1/watchlist` | Add new entity to watchlist |
| `POST` | `/api/v1/events/ai-inference` | Ingest AI inference event from camera or edge node |
| `GET` | `/api/v1/events/vehicle/:plate/history` | **Fetch GIS chronological movement history & route trace** |
| `GET` | `/api/v1/alerts` | Query real-time watchlist alerts |
| `PATCH` | `/api/v1/alerts/:id` | Acknowledge or Resolve alert with operator notes |
| `GET` | `/api/v1/system/stats` | System health summary & metrics |
| `GET` | `/api/v1/audit-logs` | Audit trail history |

---

## 🏛️ Project Architecture & Deliverables

- [`ARCHITECTURE.md`](./ARCHITECTURE.md): Detailed 80,000-camera scalability blueprint, GPU sizing, storage tiering, bandwidth reduction, and cybersecurity spec.
- [`docker-compose.yml`](./docker-compose.yml): Multi-container orchestration.
- `server/`: Express REST API, Socket.io WebSocket engine, Watchlist matcher, AI event simulator, database persistence.
- `client/`: React + Vite + Tailwind CSS + Leaflet frontend interface.

---

## 🛠️ Known Limitations & Future Enhancements
- **Production Media Gateway**: For real RTSP/ONVIF hardware in production deployment, integration with MediaMTX / Janus WebRTC gateway is recommended to transcode raw RTSP H.264 streams to WebRTC/HLS.
- **Multi-Tenant RBAC**: Adding Keycloak OAuth2 / OIDC SSO for multi-department authorization (Traffic vs Highway vs CID).
