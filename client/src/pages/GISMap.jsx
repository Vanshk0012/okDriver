import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Play, Pause, RotateCcw, ShieldAlert, Car, Clock, Zap } from 'lucide-react';
import { api } from '../services/api';

// Custom Leaflet Icons
const createCameraIcon = (status, hasAlert) => {
  const color = hasAlert ? '#ef4444' : status === 'Online' ? '#10b981' : status === 'Degraded' ? '#f59e0b' : '#6b7280';
  const pulseClass = hasAlert ? 'alert-pulse-marker' : '';

  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="${pulseClass}" style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid #0f172a;
        box-shadow: 0 0 10px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 10px;
      ">📹</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const routeStepIcon = (stepNumber, isCurrent) => {
  return L.divIcon({
    className: 'route-step-icon',
    html: `
      <div style="
        background-color: ${isCurrent ? '#ef4444' : '#3b82f6'};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 0 15px ${isCurrent ? '#ef4444' : '#3b82f6'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">${stepNumber}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

// Map controller helper to center map dynamically
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function GISMap({ initialVehicleSearch }) {
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [targetPlate, setTargetPlate] = useState(initialVehicleSearch || 'GJ01XX0001');
  const [routeData, setRouteData] = useState(null);
  const [playbackStep, setPlaybackStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.0276, 72.5074]); // Ahmedabad

  useEffect(() => {
    fetchMapData();
  }, []);

  useEffect(() => {
    if (initialVehicleSearch) {
      setTargetPlate(initialVehicleSearch);
      handleTraceVehicle(initialVehicleSearch);
    } else {
      handleTraceVehicle('GJ01XX0001');
    }
  }, [initialVehicleSearch]);

  const fetchMapData = async () => {
    try {
      const [camRes, alertRes] = await Promise.all([
        api.getCameras(),
        api.getAlerts({ status: 'Active' })
      ]);
      if (camRes.data.success) setCameras(camRes.data.data);
      if (alertRes.data.success) setAlerts(alertRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTraceVehicle = async (plateToSearch) => {
    const queryPlate = plateToSearch || targetPlate;
    if (!queryPlate.trim()) return;

    try {
      const res = await api.getVehicleHistory(queryPlate.trim());
      if (res.data.success) {
        setRouteData(res.data);
        setPlaybackStep(0);
        if (res.data.timeline && res.data.timeline.length > 0) {
          setMapCenter(res.data.timeline[0].coordinates);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Playback timer loop
  useEffect(() => {
    let timer = null;
    if (isPlaying && routeData && routeData.timeline.length > 0) {
      timer = setInterval(() => {
        setPlaybackStep((prev) => {
          if (prev >= routeData.timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, routeData]);

  const polylineCoords = routeData?.timeline?.map((step) => step.coordinates) || [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header & Route Control Bar */}
      <div className="bg-dark-card border border-dark-border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Navigation className="w-6 h-6 text-amber-400" />
            GIS Interactive Map & Vehicle Route Reconstruction
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Plot vehicle movement history chronologically across CCTV nodes in Gujarat
          </p>
        </div>

        {/* Vehicle Route Search Form */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter license plate (e.g. GJ01XX0001)"
            value={targetPlate}
            onChange={(e) => setTargetPlate(e.target.value)}
            className="bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm uppercase font-mono text-gray-200 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleTraceVehicle()}
            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all"
          >
            <Car className="w-4 h-4" /> Trace Vehicle
          </button>
        </div>
      </div>

      {/* Main Map + Route Playback Timeline Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive Map (3 Cols) */}
        <div className="lg:col-span-3 bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-2xl relative min-h-[520px]">
          <MapContainer
            center={mapCenter}
            zoom={11}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '520px' }}
          >
            {/* Dark Matter Map Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapRecenter center={mapCenter} />

            {/* Render Camera Markers */}
            {cameras.map((cam) => {
              const hasAlert = alerts.some((a) => a.camera_id === cam.id);
              return (
                <Marker
                  key={cam.id}
                  position={[cam.latitude, cam.longitude]}
                  icon={createCameraIcon(cam.status, hasAlert)}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span>{cam.id}</span> • <span>{cam.name}</span>
                      </div>
                      <div className="text-gray-400">Zone: {cam.zone} • {cam.department}</div>
                      <div className="text-blue-400 font-mono text-[11px]">Protocol: {cam.source_protocol}</div>
                      {hasAlert && (
                        <div className="text-red-400 font-semibold flex items-center gap-1 mt-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> ACTIVE WATCHLIST ALERT
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Render Vehicle Route Line */}
            {polylineCoords.length > 1 && (
              <Polyline
                positions={polylineCoords}
                color="#f59e0b"
                weight={4}
                dashArray="8, 8"
              />
            )}

            {/* Render Route Step Markers */}
            {routeData?.timeline?.map((step, idx) => (
              <Marker
                key={step.event_id}
                position={step.coordinates}
                icon={routeStepIcon(step.step, idx === playbackStep)}
              >
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <div className="font-bold text-amber-400">Checkpoint #{step.step}: {step.camera_name}</div>
                    <div>Timestamp: <span className="font-mono text-gray-300">{new Date(step.timestamp).toLocaleTimeString()}</span></div>
                    <div>Est. Speed: <span className="font-semibold text-emerald-400">{step.speed_kmh} km/h</span></div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Floating Legend */}
          <div className="absolute top-4 right-4 z-[1000] bg-dark-base/90 backdrop-blur border border-gray-800 p-3 rounded-xl shadow-xl text-xs space-y-2">
            <div className="font-bold text-white border-b border-gray-800 pb-1">Camera Map Legend</div>
            <div className="flex items-center gap-2 text-emerald-400"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Online Camera</div>
            <div className="flex items-center gap-2 text-amber-400"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Degraded Signal</div>
            <div className="flex items-center gap-2 text-red-400"><span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse" /> Watchlist Alert</div>
            <div className="flex items-center gap-2 text-blue-400"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Route Node</div>
          </div>
        </div>

        {/* Route History Timeline & Playback Controls (1 Col) */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                Route Timeline ({targetPlate})
              </h3>
              {routeData?.watchlist_match && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {routeData.watchlist_match.category}
                </span>
              )}
            </div>

            {/* Summary Stats */}
            {routeData && (
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#0B0F19] p-3 rounded-lg border border-gray-800">
                <div>
                  <span className="text-gray-500 text-[10px]">Total Detections</span>
                  <div className="font-bold text-white">{routeData.detections_count} cameras</div>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px]">Distance Covered</span>
                  <div className="font-bold text-amber-400">{routeData.total_distance_km} km</div>
                </div>
              </div>
            )}

            {/* Chronological Steps */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {routeData?.timeline?.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  No movement detections found for {targetPlate}
                </div>
              ) : (
                routeData?.timeline?.map((step, idx) => (
                  <div
                    key={step.event_id}
                    onClick={() => {
                      setPlaybackStep(idx);
                      setMapCenter(step.coordinates);
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      idx === playbackStep
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-900/20'
                        : 'bg-[#0B0F19] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-amber-400">Step #{step.step}: {step.camera_name}</span>
                      <span className="font-mono text-[10px] text-gray-400">{new Date(step.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="text-[11px] text-gray-300 mt-1 flex items-center justify-between">
                      <span>Zone: {step.zone}</span>
                      <span className="text-emerald-400 font-semibold">{step.speed_kmh} km/h</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Route Playback Control Buttons */}
          {routeData && routeData.timeline.length > 0 && (
            <div className="pt-3 border-t border-dark-border flex items-center justify-between gap-2">
              <button
                onClick={() => setPlaybackStep(0)}
                className="p-2 bg-gray-800 text-gray-300 hover:text-white rounded-lg transition-colors"
                title="Reset Route"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-600/30"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause Playback' : 'Play Animated Route'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
