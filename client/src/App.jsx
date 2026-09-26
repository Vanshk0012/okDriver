import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CameraRegistry from './pages/CameraRegistry';
import GISMap from './pages/GISMap';
import WatchlistAlerts from './pages/WatchlistAlerts';
import EntitySearch from './pages/EntitySearch';
import AuditLogs from './pages/AuditLogs';
import ArchitectureDoc from './pages/ArchitectureDoc';
import AlertModal from './components/AlertModal';
import { getSocket } from './services/socket';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [searchPlate, setSearchPlate] = useState('');

  // Fetch initial active alerts count
  const fetchAlertCount = async () => {
    try {
      const res = await api.getAlerts({ status: 'Active' });
      if (res.data.success) {
        setActiveAlertCount(res.data.data.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Play audio chime for real-time alerts
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // AudioContext blocked before interaction
    }
  };

  useEffect(() => {
    fetchAlertCount();

    const socket = getSocket();
    const handleWatchlistAlert = (alertData) => {
      setActiveAlertCount((prev) => prev + 1);
      playAlertChime();
    };

    socket.on('watchlist_alert', handleWatchlistAlert);
    return () => {
      socket.off('watchlist_alert', handleWatchlistAlert);
    };
  }, [soundEnabled]);

  const handleGlobalSearch = (query) => {
    setSearchPlate(query);
    setActiveTab('gis');
  };

  const handleViewVehicleHistory = (plate) => {
    setSearchPlate(plate);
    setActiveTab('gis');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        activeAlertCount={activeAlertCount}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onSearchSubmit={handleGlobalSearch}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#0B0F19]">
          {activeTab === 'dashboard' && (
            <Dashboard
              onSelectAlert={(alt) => setSelectedAlert(alt)}
              onViewVehicleHistory={handleViewVehicleHistory}
            />
          )}

          {activeTab === 'registry' && <CameraRegistry />}

          {activeTab === 'gis' && (
            <GISMap initialVehicleSearch={searchPlate} />
          )}

          {activeTab === 'watchlist' && (
            <WatchlistAlerts
              onSelectAlert={(alt) => setSelectedAlert(alt)}
              onViewVehicleHistory={handleViewVehicleHistory}
            />
          )}

          {activeTab === 'search' && (
            <EntitySearch
              searchPlate={searchPlate}
              onViewVehicleHistory={handleViewVehicleHistory}
            />
          )}

          {activeTab === 'audit' && <AuditLogs />}

          {activeTab === 'architecture' && <ArchitectureDoc />}
        </main>
      </div>

      {/* Alert Inspector Modal */}
      <AlertModal
        alertItem={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAlertUpdated={() => fetchAlertCount()}
        onViewHistory={handleViewVehicleHistory}
      />
    </div>
  );
}
