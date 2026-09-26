import React, { useState, useEffect } from 'react';
import {
  Camera, Plus, Search, Filter, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Trash2, Edit, Radio, Shield, Database
} from 'lucide-react';
import { api } from '../services/api';
import AddCameraModal from '../components/AddCameraModal';

export default function CameraRegistry() {
  const [cameras, setCameras] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, degraded: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const res = await api.getCameras({
        search: searchTerm,
        zone: selectedZone,
        status: selectedStatus,
        protocol: selectedProtocol
      });

      if (res.data.success) {
        setCameras(res.data.data);
        setStats(res.data.stats || { total: 0, online: 0, offline: 0, degraded: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [searchTerm, selectedZone, selectedStatus, selectedProtocol]);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Online' ? 'Offline' : currentStatus === 'Offline' ? 'Degraded' : 'Online';
    try {
      const res = await api.updateCameraStatus(id, nextStatus);
      if (res.data.success) {
        fetchCameras();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCamera = async (id) => {
    if (!window.confirm(`Are you sure you want to remove camera ${id}?`)) return;
    try {
      await api.deleteCamera(id);
      fetchCameras();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header & Onboard Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-400" />
            Camera Registry & Onboarding Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Centralized CCTV stream management for Gujarat Police & Municipal Traffic Infrastructure
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Onboard New Camera
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-dark-card border border-dark-border p-4 rounded-xl">
          <span className="text-xs font-semibold text-gray-400 uppercase">Total Cameras</span>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
        </div>
        <div className="bg-dark-card border border-dark-border p-4 rounded-xl">
          <span className="text-xs font-semibold text-emerald-400 uppercase">Online Health</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.online}</div>
        </div>
        <div className="bg-dark-card border border-dark-border p-4 rounded-xl">
          <span className="text-xs font-semibold text-red-400 uppercase">Offline / Down</span>
          <div className="text-2xl font-bold text-red-400 mt-1">{stats.offline}</div>
        </div>
        <div className="bg-dark-card border border-dark-border p-4 rounded-xl">
          <span className="text-xs font-semibold text-amber-400 uppercase">Degraded Signal</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{stats.degraded}</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-dark-card border border-dark-border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Camera ID, location name, zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Health Statuses</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Degraded">Degraded</option>
          </select>

          <select
            value={selectedProtocol}
            onChange={(e) => setSelectedProtocol(e.target.value)}
            className="bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Protocols</option>
            <option value="RTSP">RTSP</option>
            <option value="ONVIF">ONVIF</option>
            <option value="HLS">HLS</option>
            <option value="WebRTC">WebRTC</option>
            <option value="Simulator">Simulator</option>
          </select>
        </div>
      </div>

      {/* Camera Registry Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#0B0F19] text-xs font-semibold uppercase text-gray-400 border-b border-dark-border">
              <tr>
                <th className="px-4 py-3.5">Camera ID</th>
                <th className="px-4 py-3.5">Name & Location</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Zone</th>
                <th className="px-4 py-3.5">Protocol</th>
                <th className="px-4 py-3.5">Health Status</th>
                <th className="px-4 py-3.5">Coordinates</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs">
              {cameras.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No cameras matching query
                  </td>
                </tr>
              ) : (
                cameras.map((cam) => (
                  <tr key={cam.id} className="hover:bg-dark-border/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-400">{cam.id}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-100">{cam.name}</td>
                    <td className="px-4 py-3.5 text-gray-300">{cam.department}</td>
                    <td className="px-4 py-3.5 text-gray-400">{cam.zone}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {cam.source_protocol}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(cam.id, cam.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-transform active:scale-95 ${
                          cam.status === 'Online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          cam.status === 'Degraded' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cam.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {cam.status}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-gray-400">
                      {cam.latitude.toFixed(4)}, {cam.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleDeleteCamera(cam.id)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
                        title="Delete Camera"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AddCameraModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCameraAdded={() => fetchCameras()}
      />
    </div>
  );
}
