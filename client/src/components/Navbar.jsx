import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Volume2, VolumeX, Search, Bell, Cpu, Clock } from 'lucide-react';

export default function Navbar({ activeAlertCount = 0, soundEnabled, setSoundEnabled, onSearchSubmit }) {
  const [timeStr, setTimeStr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="bg-dark-card border-b border-dark-border px-4 py-3 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 shadow-xl">
      {/* Brand & Badge */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              okDriver <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded border border-blue-500/30">CCTV VMS & AI Analytics</span>
            </h1>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Gujarat Police Innovation Hackathon 2026 • Command Center
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vehicle plate (e.g. GJ01XX0001) or person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F19] border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Real-time Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>Real-Time WebSockets</span>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{timeStr}</span>
        </div>

        {/* Audio Alert Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
          className={`p-2 rounded-lg border transition-all ${
            soundEnabled
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Active Alerts Pill */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Bell className="w-4 h-4 text-red-400 animate-bounce" />
            <span>{activeAlertCount} Active Alerts</span>
          </div>
        </div>
      </div>
    </header>
  );
}
