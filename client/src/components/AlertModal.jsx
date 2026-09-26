import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, MapPin, Camera, Clock, UserCheck } from 'lucide-react';
import { api } from '../services/api';

export default function AlertModal({ alertItem, onClose, onAlertUpdated, onViewHistory }) {
  const [status, setStatus] = useState(alertItem?.status || 'Acknowledged');
  const [operatorNotes, setOperatorNotes] = useState(alertItem?.operator_notes || '');
  const [acknowledgedBy, setAcknowledgedBy] = useState('Inspector V. Patel');
  const [loading, setLoading] = useState(false);

  if (!alertItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.updateAlertStatus(alertItem.id, {
        status,
        operator_notes: operatorNotes,
        acknowledged_by: acknowledgedBy
      });

      if (res.data.success) {
        onAlertUpdated(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header Banner */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          alertItem.severity === 'Critical' ? 'bg-red-950/80 border-red-500/40 text-red-200' :
          alertItem.severity === 'High' ? 'bg-amber-950/80 border-amber-500/40 text-amber-200' :
          'bg-blue-950/80 border-blue-500/40 text-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/20">
              <ShieldAlert className="w-6 h-6 animate-pulse text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/50 border border-white/20">
                  {alertItem.id}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/30 text-red-200">
                  {alertItem.severity} ALERT
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {alertItem.matched_category}: {alertItem.matched_identifier}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-black/40 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-[#0B0F19] p-4 rounded-xl border border-gray-800">
            <div className="flex items-center gap-2 text-gray-300">
              <Camera className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-gray-500 block text-[10px]">Camera Source</span>
                <span className="font-semibold text-gray-200">{alertItem.camera_name || alertItem.camera_id}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-gray-500 block text-[10px]">Camera Zone</span>
                <span className="font-semibold text-gray-200">{alertItem.camera_zone || 'Ahmedabad'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-gray-500 block text-[10px]">Detection Timestamp</span>
                <span className="font-mono text-gray-200">{new Date(alertItem.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-gray-500 block text-[10px]">Current Status</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  alertItem.status === 'Active' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  alertItem.status === 'Acknowledged' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {alertItem.status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Route History Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onViewHistory) onViewHistory(alertItem.matched_identifier);
            }}
            className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Plot Vehicle Movement & Chronological Route on GIS Map
          </button>

          {/* Operator Action Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-dark-border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Active">Active (Unresolved)</option>
                  <option value="Acknowledged">Acknowledged (Dispatching Squad)</option>
                  <option value="Resolved">Resolved (Cleared)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Duty Operator ID</label>
                <input
                  type="text"
                  value={acknowledgedBy}
                  onChange={(e) => setAcknowledgedBy(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Operator Log & Action Notes</label>
              <textarea
                rows="3"
                placeholder="Enter dispatch notes, patrol unit ID, or resolution report..."
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save & Update Alert'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
