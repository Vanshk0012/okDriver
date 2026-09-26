import React, { useState, useEffect } from 'react';
import { FileText, Filter, RefreshCw, User, Clock, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs({ module: selectedModule });
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedModule]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-gray-400" />
            System Audit Trail & Security Logs
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Immutable audit records of camera onboarding, watchlist modifications, and operator actions
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-dark-card border border-dark-border p-4 rounded-xl flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="bg-[#0B0F19] border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Audit Modules</option>
            <option value="Camera">Camera Registry</option>
            <option value="Watchlist">Target Watchlist</option>
            <option value="Alert">Alert Desk</option>
            <option value="System">System Infrastructure</option>
          </select>
        </div>

        <span className="text-xs text-gray-400">Total Log Entries: <strong className="text-white">{logs.length}</strong></span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#0B0F19] text-xs font-semibold uppercase text-gray-400 border-b border-dark-border">
              <tr>
                <th className="px-4 py-3.5">Log ID</th>
                <th className="px-4 py-3.5">Action Code</th>
                <th className="px-4 py-3.5">Module</th>
                <th className="px-4 py-3.5">Activity Details</th>
                <th className="px-4 py-3.5">Performed By</th>
                <th className="px-4 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-dark-border/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-gray-500">{log.id}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-400">{log.action}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-semibold text-[10px]">
                      {log.module}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-200">{log.details}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-300">{log.performed_by}</td>
                  <td className="px-4 py-3.5 font-mono text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
