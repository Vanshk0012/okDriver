import React, { useState } from 'react';
import { X, Camera, MapPin, Server, Database, Key } from 'lucide-react';
import { api } from '../services/api';

export default function AddCameraModal({ isOpen, onClose, onCameraAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    department: 'Traffic Police',
    latitude: '23.0276',
    longitude: '72.5074',
    camera_type: 'Dome PTZ 4K',
    source_protocol: 'RTSP',
    stream_url: 'rtsp://admin:pass@10.0.4.199:554/live',
    status: 'Online',
    zone: 'Ahmedabad West',
    storage_retention_days: '45',
    resolution: '1080p',
    fps: '30'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiToken, setApiToken] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.createCamera({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        storage_retention_days: parseInt(formData.storage_retention_days),
        fps: parseInt(formData.fps)
      });

      if (res.data.success) {
        onCameraAdded(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateApiToken = () => {
    const token = `okd_cam_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    setApiToken(token);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-dark-base/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Onboard New Camera Source</h2>
              <p className="text-xs text-gray-400">Add RTSP, ONVIF, HLS, WebRTC, or Simulator feeds to okDriver CCTV Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-300 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Camera Name / Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. CG Road Junction - Swastik Cross Road"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Managing Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Traffic Police">Traffic Police</option>
                <option value="Transport Dept">Transport Dept (RTO)</option>
                <option value="Smart City Command">Smart City Command (VMS)</option>
                <option value="National Highway Patrol">National Highway Patrol</option>
                <option value="Railway Security Force">Railway Security Force</option>
                <option value="Municipal Security">Municipal Security</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Source Protocol *</label>
              <select
                value={formData.source_protocol}
                onChange={(e) => setFormData({ ...formData, source_protocol: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option value="RTSP">RTSP Stream</option>
                <option value="ONVIF">ONVIF Device</option>
                <option value="HLS">HLS Relay (.m3u8)</option>
                <option value="WebRTC">WebRTC Gateway</option>
                <option value="Simulator">Synthetic Edge Simulator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Zone / Sector *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ahmedabad Central"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Latitude *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Longitude *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Stream Endpoint URI *</label>
              <input
                type="text"
                required
                value={formData.stream_url}
                onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Camera Hardware Model</label>
              <input
                type="text"
                value={formData.camera_type}
                onChange={(e) => setFormData({ ...formData, camera_type: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Storage Retention (Days)</label>
              <input
                type="number"
                value={formData.storage_retention_days}
                onChange={(e) => setFormData({ ...formData, storage_retention_days: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* API Token Onboarding Section */}
          <div className="p-3 bg-[#0B0F19] border border-gray-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
                <Key className="w-4 h-4" />
                <span>Automated API-Based Onboarding Key</span>
              </div>
              <button
                type="button"
                onClick={generateApiToken}
                className="text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded hover:bg-purple-600/30 transition-colors"
              >
                Generate API Credentials
              </button>
            </div>
            {apiToken && (
              <div className="p-2 bg-gray-900 border border-purple-500/30 rounded font-mono text-xs text-purple-300 break-all select-all">
                Token: {apiToken}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-dark-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              {loading ? 'Onboarding...' : 'Onboard Camera Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
