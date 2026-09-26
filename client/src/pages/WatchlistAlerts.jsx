import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Plus, Search, CheckCircle2, AlertTriangle, Clock, MapPin, Eye, Trash2, Filter
} from 'lucide-react';
import { api } from '../services/api';
import AddWatchlistModal from '../components/AddWatchlistModal';

export default function WatchlistAlerts({ onSelectAlert, onViewVehicleHistory }) {
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'watchlist'
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wRes, aRes] = await Promise.all([
        api.getWatchlist({ search: searchQuery }),
        api.getAlerts({ severity: severityFilter, status: statusFilter })
      ]);

      if (wRes.data.success) setWatchlist(wRes.data.data);
      if (aRes.data.success) setAlerts(aRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, severityFilter, statusFilter]);

  const handleDeleteWatchlist = async (id) => {
    if (!window.confirm('Delete this watchlist record?')) return;
    try {
      await api.deleteWatchlist(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header & Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            Watchlist Correlation & Real-Time Alert Desk
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Automated ANPR & Target Matching Engine for Law Enforcement & Security Operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tab Toggle */}
          <div className="bg-dark-card border border-dark-border p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'alerts'
                  ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Real-Time Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'watchlist'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Target Watchlist ({watchlist.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Target Record
          </button>
        </div>
      </div>

      {/* Real-Time Alerts View */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-dark-card border border-dark-border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-red-500"
              >
                <option value="">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-red-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active (Unresolved)</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-dark-card border border-dark-border rounded-xl text-gray-500 text-sm">
                No alerts matching selected filter criteria
              </div>
            ) : (
              alerts.map((alt) => (
                <div
                  key={alt.id}
                  className="bg-dark-card border border-dark-border rounded-xl p-4 shadow-xl space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                        {alt.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        alt.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {alt.severity}
                      </span>
                    </div>

                    <div>
                      <div className="text-base font-bold text-white font-mono">{alt.matched_identifier}</div>
                      <div className="text-xs text-gray-300 font-semibold">{alt.matched_category}</div>
                    </div>

                    <div className="text-xs text-gray-400 space-y-1 bg-[#0B0F19] p-2.5 rounded-lg border border-gray-800">
                      <div>Cam: <span className="text-gray-200 font-medium">{alt.camera_name}</span></div>
                      <div>Zone: <span className="text-gray-200 font-medium">{alt.camera_zone}</span></div>
                      <div className="font-mono text-[10px]">{new Date(alt.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dark-border flex items-center gap-2">
                    <button
                      onClick={() => onSelectAlert(alt)}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details & Ack
                    </button>
                    <button
                      onClick={() => onViewVehicleHistory(alt.matched_identifier)}
                      className="bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Plot Route on GIS Map"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Route
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Target Watchlist Table View */}
      {activeTab === 'watchlist' && (
        <div className="bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0B0F19] text-xs font-semibold uppercase text-gray-400 border-b border-dark-border">
                <tr>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Identifier</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Severity</th>
                  <th className="px-4 py-3.5">Target Details</th>
                  <th className="px-4 py-3.5">Owner / Contact</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs">
                {watchlist.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-border/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-gray-400">{item.id}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-red-400">{item.identifier}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-200">{item.category}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-300">{item.name_or_model || 'N/A'}</td>
                    <td className="px-4 py-3.5 text-gray-400">{item.owner_or_target || 'N/A'}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteWatchlist(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Watchlist Modal */}
      <AddWatchlistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={() => fetchData()}
      />
    </div>
  );
}
