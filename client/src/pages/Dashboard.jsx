import React, { useState, useEffect } from 'react';
import {
  Camera, ShieldAlert, Activity, Cpu, CheckCircle, AlertTriangle, XCircle, RefreshCw, Zap
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

export default function Dashboard({ onSelectAlert, onViewVehicleHistory }) {
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [latestEvent, setLatestEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gridLimit, setGridLimit] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [camRes, alertRes, eventRes, statRes] = await Promise.all([
        api.getCameras(),
        api.getAlerts({ limit: 10 }),
        api.getEvents({ limit: 15 }),
        api.getSystemStats()
      ]);

      if (camRes.data.success) setCameras(camRes.data.data);
      if (alertRes.data.success) setAlerts(alertRes.data.data);
      if (eventRes.data.success) setEvents(eventRes.data.data);
      if (statRes.data.success) setStats(statRes.data.data);
    } catch (err) {
      console.error('[Dashboard] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to WebSockets
    const socket = getSocket();

    const handleAiEvent = (evt) => {
      setLatestEvent(evt);
      setEvents((prev) => [evt, ...prev.slice(0, 14)]);
    };

    const handleAlert = (alt) => {
      setAlerts((prev) => [alt, ...prev.slice(0, 9)]);
    };

    const handleCameraStatus = (cam) => {
      setCameras((prev) => prev.map((c) => (c.id === cam.id ? { ...c, ...cam } : c)));
    };

    socket.on('ai_event', handleAiEvent);
    socket.on('watchlist_alert', handleAlert);
    socket.on('camera_status_change', handleCameraStatus);

    return () => {
      socket.off('ai_event', handleAiEvent);
      socket.off('watchlist_alert', handleAlert);
      socket.off('camera_status_change', handleCameraStatus);
    };
  }, []);

  const totalCameras = cameras.length;
  const onlineCameras = cameras.filter((c) => c.status === 'Online').length;
  const offlineCameras = cameras.filter((c) => c.status === 'Offline').length;
  const degradedCameras = cameras.filter((c) => c.status === 'Degraded').length;

  const filteredCameras = cameras.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    return true;
  });

  const displayedCameras = gridLimit === 'all'
    ? filteredCameras
    : filteredCameras.slice(0, parseInt(gridLimit, 10));

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Top System Health KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Cameras Card */}
        <div className="bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#111827] border-t-2 border-t-blue-500/80 border-x border-b border-gray-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl shadow-black/20 hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
                Total Onboarded Cameras
              </span>
              <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                {totalCameras} <span className="text-xs text-gray-400 font-normal">active sources</span>
              </div>
            </div>
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-xl shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
              <Camera className="w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-800/80 text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {onlineCameras} Online
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {offlineCameras} Offline
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {degradedCameras} Degraded
            </span>
          </div>
        </div>

        {/* Active Alerts Card */}
        <div className="bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#111827] border-t-2 border-t-red-500/80 border-x border-b border-gray-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl shadow-black/20 hover:border-red-500/30 transition-all duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
                Active Watchlist Matches
              </span>
              <div className="text-3xl font-extrabold text-red-400 tracking-tight flex items-baseline gap-2">
                {alerts.filter((a) => a.status === 'Active').length}{' '}
                <span className="text-xs text-red-400/80 font-normal">unresolved</span>
              </div>
            </div>
            <div className="p-2.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400 flex items-center justify-between">
            <span className="font-medium text-gray-400">ANPR & Target Engine</span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-semibold">
              High Priority
            </span>
          </div>
        </div>

        {/* AI Processing FPS */}
        <div className="bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#111827] border-t-2 border-t-emerald-500/80 border-x border-b border-gray-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl shadow-black/20 hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
                AI Analytics Throughput
              </span>
              <div className="text-3xl font-extrabold text-emerald-400 tracking-tight flex items-baseline gap-1.5">
                30 <span className="text-xs text-gray-400 font-normal">FPS avg</span>
              </div>
            </div>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400 flex items-center justify-between">
            <span className="font-medium text-gray-400">Real-time Ingestion</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
              0ms Latency
            </span>
          </div>
        </div>

        {/* System Load */}
        <div className="bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#111827] border-t-2 border-t-purple-500/80 border-x border-b border-gray-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl shadow-black/20 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
                VMS Connection Health
              </span>
              <div className="text-3xl font-extrabold text-purple-400 tracking-tight">
                99.8%
              </div>
            </div>
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/25 text-purple-400 rounded-xl shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400 flex items-center justify-between">
            <span className="font-medium text-gray-400">Edge Stream Relays</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Video Grid + Real-time Alert Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Camera Grid (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-card/60 p-3 rounded-xl border border-dark-border">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              Live CCTV Video Monitoring Grid ({displayedCameras.length}/{cameras.length})
            </h2>

            <div className="flex items-center flex-wrap gap-2">
              {/* Status Filter */}
              <div className="flex items-center bg-gray-900/90 border border-gray-800 rounded-lg p-0.5 text-xs">
                {['All', 'Online', 'Offline', 'Degraded'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-1 rounded-md transition-all text-[11px] font-medium ${
                      statusFilter === st
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Grid Layout Selector */}
              <div className="flex items-center bg-gray-900/90 border border-gray-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setGridLimit('all')}
                  className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
                    gridLimit === 'all'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="Show All Cameras"
                >
                  All ({cameras.length})
                </button>
                <button
                  onClick={() => setGridLimit('4')}
                  className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
                    gridLimit === '4'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="2x2 Grid (4 Cameras)"
                >
                  2x2 (4)
                </button>
                <button
                  onClick={() => setGridLimit('6')}
                  className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
                    gridLimit === '6'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="6 Grid"
                >
                  6 Grid
                </button>
              </div>

              <button
                onClick={fetchDashboardData}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-gray-800 px-2.5 py-1.5 rounded-lg border border-gray-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[820px] overflow-y-auto pr-1">
            {displayedCameras.map((cam) => (
              <VideoPlayer key={cam.id} camera={cam} latestEvent={latestEvent} />
            ))}
            {displayedCameras.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-gray-500 bg-dark-card border border-dark-border rounded-xl">
                No cameras match the selected filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Real-time Alerts & Recent Detections Panel */}
        <div className="space-y-6">
          {/* Active Alerts List */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                Live Watchlist Alerts
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                {alerts.length} Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No active watchlist alerts
                </div>
              ) : (
                alerts.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => onSelectAlert(alt)}
                    className="p-3 bg-[#0B0F19] hover:bg-dark-border/60 border border-gray-800 hover:border-red-500/50 rounded-xl transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-red-400">{alt.matched_identifier}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        alt.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {alt.severity}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-gray-200">
                      {alt.matched_category}
                    </div>

                    <div className="text-[11px] text-gray-400 flex items-center justify-between">
                      <span>{alt.camera_name}</span>
                      <span className="font-mono text-[10px]">{new Date(alt.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real-time AI Detections Feed */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Live AI Inference Stream
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Real-time
              </span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {events.map((evt) => (
                <div key={evt.id} className="p-2.5 bg-[#0B0F19] border border-gray-800/80 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-400">{evt.vehicle_number || 'VEHICLE'}</span>
                    <span className="text-[10px] font-mono text-gray-400">{evt.speed_kmh} km/h</span>
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center justify-between">
                    <span>{evt.camera_name}</span>
                    <span className="text-emerald-400 font-semibold">{Math.round(evt.confidence * 100)}% conf</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
