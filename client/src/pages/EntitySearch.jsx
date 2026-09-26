import React, { useState, useEffect } from 'react';
import { Search, Car, MapPin, ShieldAlert, Clock, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function EntitySearch({ searchPlate, onViewVehicleHistory }) {
  const [query, setQuery] = useState(searchPlate || 'GJ01XX0001');
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchPlate) {
      setQuery(searchPlate);
      executeSearch(searchPlate);
    } else {
      executeSearch('GJ01XX0001');
    }
  }, [searchPlate]);

  const executeSearch = async (plateToSearch) => {
    const q = plateToSearch || query;
    if (!q.trim()) return;
    setLoading(true);

    try {
      const res = await api.getVehicleHistory(q.trim());
      if (res.data.success) {
        setHistoryData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-purple-400" />
          Entity Search & Intelligence History
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Search license plate numbers or entity IDs to inspect cross-camera detection history and AI bounding box logs
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleFormSubmit} className="bg-dark-card border border-dark-border p-4 rounded-xl flex items-center gap-3 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Enter license plate or entity ID (e.g. GJ01XX0001, GJ06AB1234)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg pl-9 pr-4 py-2.5 text-sm uppercase font-mono text-gray-200 focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
        >
          {loading ? 'Searching...' : 'Search Entity Logs'}
        </button>
      </form>

      {/* Search Results Summary */}
      {historyData && (
        <div className="space-y-6">
          {/* Target Profile Card */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dark-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-mono text-white">{historyData.vehicle_number}</h2>
                    {historyData.watchlist_match && (
                      <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> WATCHLIST TARGET: {historyData.watchlist_match.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    First Seen: {historyData.first_seen ? new Date(historyData.first_seen).toLocaleString() : 'N/A'} • Last Seen: {historyData.last_seen ? new Date(historyData.last_seen).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onViewVehicleHistory(historyData.vehicle_number)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
              >
                <MapPin className="w-4 h-4" /> Plot GIS Movement Route
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#0B0F19] p-3 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] uppercase">Total Detections</span>
                <div className="text-lg font-bold text-white mt-0.5">{historyData.detections_count}</div>
              </div>
              <div className="bg-[#0B0F19] p-3 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] uppercase">Distance Covered</span>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{historyData.total_distance_km} km</div>
              </div>
              <div className="bg-[#0B0F19] p-3 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] uppercase">Watchlist Match</span>
                <div className="text-sm font-bold text-red-400 mt-1">{historyData.watchlist_match ? 'POSITIVE MATCH' : 'Clean'}</div>
              </div>
              <div className="bg-[#0B0F19] p-3 rounded-lg border border-gray-800">
                <span className="text-gray-500 text-[10px] uppercase">System Confidence</span>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">98.2% avg</div>
              </div>
            </div>
          </div>

          {/* Timeline Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Chronological Detection Timeline ({historyData.timeline.length})</h3>
            <div className="space-y-3">
              {historyData.timeline.map((item) => (
                <div key={item.event_id} className="bg-dark-card border border-dark-border p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                      #{item.step}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{item.camera_name} ({item.camera_id})</div>
                      <div className="text-xs text-gray-400">Zone: {item.zone} • {item.department}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Speed</span>
                      <span className="text-emerald-400 font-semibold">{item.speed_kmh} km/h</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Confidence</span>
                      <span className="text-blue-400">{Math.round(item.confidence * 100)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Timestamp</span>
                      <span className="text-gray-300">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
