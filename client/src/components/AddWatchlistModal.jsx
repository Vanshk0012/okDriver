import React, { useState } from 'react';
import { X, ShieldAlert, Car, User, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function AddWatchlistModal({ isOpen, onClose, onItemAdded }) {
  const [formData, setFormData] = useState({
    identifier: '',
    entity_type: 'Vehicle',
    category: 'Stolen Vehicle',
    severity: 'Critical',
    name_or_model: '',
    color: 'White',
    owner_or_target: '',
    notes: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.createWatchlist({
        ...formData,
        identifier: formData.identifier.toUpperCase().trim()
      });

      if (res.data.success) {
        onItemAdded(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-dark-base/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Watchlist / Target Record</h2>
              <p className="text-xs text-gray-400">Add stolen vehicles, wanted persons, or impound targets for instant AI matching</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-300 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Entity Identifier (License Plate or Person ID) *</label>
            <input
              type="text"
              required
              placeholder="e.g. GJ01XX0001 or P-884920"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm uppercase font-mono text-gray-200 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Entity Type *</label>
              <select
                value={formData.entity_type}
                onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500"
              >
                <option value="Vehicle">Vehicle</option>
                <option value="Person">Person</option>
                <option value="Object">Object / Container</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500"
              >
                <option value="Stolen Vehicle">Stolen Vehicle</option>
                <option value="Blacklisted Vehicle">Blacklisted Vehicle</option>
                <option value="Stolen Commercial Truck">Stolen Commercial Truck</option>
                <option value="Wanted Person">Wanted Person</option>
                <option value="Missing Person">Missing Person</option>
                <option value="Traffic Violator">Traffic Violator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Alert Severity *</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500"
              >
                <option value="Critical">Critical (Immediate Intercept)</option>
                <option value="High">High (Impound Warrant)</option>
                <option value="Medium">Medium (Information Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Vehicle Make / Model</label>
              <input
                type="text"
                placeholder="e.g. White Maruti Swift Dzire"
                value={formData.name_or_model}
                onChange={(e) => setFormData({ ...formData, name_or_model: e.target.value })}
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Registered Owner / Target Alias</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Patel or State CID Target"
              value={formData.owner_or_target}
              onChange={(e) => setFormData({ ...formData, owner_or_target: e.target.value })}
              className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Case Notes & FIR Details</label>
            <textarea
              rows="3"
              placeholder="Enter FIR number, police station reference, or warrant notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

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
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
            >
              {loading ? 'Saving...' : 'Add Watchlist Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
