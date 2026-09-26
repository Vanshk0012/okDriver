import React from 'react';
import {
  LayoutDashboard,
  Camera,
  MapPin,
  ShieldAlert,
  Search,
  FileText,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Unified Monitoring', icon: LayoutDashboard, badge: 'Live' },
    { id: 'registry', label: 'Camera Registry', icon: Camera },
    { id: 'gis', label: 'GIS & Movement Map', icon: MapPin, badge: 'Route Trace' },
    { id: 'watchlist', label: 'Watchlist & Alerts', icon: ShieldAlert },
    { id: 'search', label: 'Entity Intelligence', icon: Search },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'architecture', label: '80k Scalability Spec', icon: Cpu, badge: 'Hackathon' }
  ];

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-3 space-y-1.5">
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Navigation Hub
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-900/20'
                  : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  item.badge === 'Live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  item.badge === 'Route Trace' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Operational Info Box */}
      <div className="p-3 m-3 bg-[#0B0F19] border border-gray-800 rounded-xl">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-400">
          <Sparkles className="w-4 h-4" />
          <span>okDriver AI Core v1.0</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Integrated VMS, ANPR, Watchlist Correlation & GIS Vehicle Path Reconstruction Engine.
        </p>
      </div>
    </aside>
  );
}
