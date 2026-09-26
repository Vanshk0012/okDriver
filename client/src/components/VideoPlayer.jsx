import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, Eye, EyeOff, Camera, Video, ShieldAlert } from 'lucide-react';

export default function VideoPlayer({ camera, latestEvent, isCompact = false }) {
  const canvasRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Canvas CCTV Feed Simulator with AI Bounding Box Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Traffic simulation objects
    let vehicles = [
      { x: 50, y: 120, speed: 2.2, plate: 'GJ01XX0001', type: 'Car', color: 'white', label: 'ANPR: GJ01XX0001', isWatchlist: true },
      { x: 300, y: 180, speed: 1.8, plate: 'GJ06AB1234', type: 'SUV', color: '#ef4444', label: 'ANPR: GJ06AB1234', isWatchlist: true },
      { x: 180, y: 220, speed: 2.5, plate: 'GJ01AB9876', type: 'Sedan', color: '#3b82f6', label: 'ANPR: GJ01AB9876', isWatchlist: false }
    ];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background - Dark CCTV camera feed view with perspective lines
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road geometry
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Lane 1
      ctx.moveTo(0, 80); ctx.lineTo(canvas.width, 80);
      ctx.moveTo(0, 160); ctx.lineTo(canvas.width, 160);
      ctx.moveTo(0, 240); ctx.lineTo(canvas.width, 240);
      ctx.stroke();

      // Dashed lane dividers
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(0, 120); ctx.lineTo(canvas.width, 120);
      ctx.moveTo(0, 200); ctx.lineTo(canvas.width, 200);
      ctx.stroke();
      ctx.setLineDash([]);

      // Timestamp watermark on feed
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, 10, 240, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`CAM: ${camera.id} | ${camera.resolution || '1080p'} | ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`, 16, 26);

      // Render camera offline screen
      if (camera.status === 'Offline') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CAMERA SIGNAL LOST (OFFLINE)', canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Check network connection or ONVIF RTSP stream endpoint', canvas.width / 2, canvas.height / 2 + 25);
        ctx.textAlign = 'left';
        return;
      }

      // Animate Vehicles
      vehicles.forEach(v => {
        v.x += v.speed;
        if (v.x > canvas.width + 60) {
          v.x = -100;
        }

        const width = 110;
        const height = 55;

        // Vehicle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(v.x + 5, v.y + 5, width, height);

        // Vehicle Body
        ctx.fillStyle = v.color === 'white' ? '#e2e8f0' : v.color;
        ctx.beginPath();
        ctx.roundRect(v.x, v.y, width, height, 8);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Windshield
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(v.x + 20, v.y + 8, 30, height - 16);

        // Draw AI Bounding Box Overlay if enabled
        if (showOverlay) {
          const boxPadding = 8;
          const boxX = v.x - boxPadding;
          const boxY = v.y - boxPadding;
          const boxW = width + (boxPadding * 2);
          const boxH = height + (boxPadding * 2);

          // Bounding Box stroke color (Red for Watchlist alert, Emerald for regular detection)
          ctx.strokeStyle = v.isWatchlist ? '#ef4444' : '#10b981';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(boxX, boxY, boxW, boxH);
          ctx.setLineDash([]);

          // AI Label Tag header
          const tagHeight = 22;
          ctx.fillStyle = v.isWatchlist ? '#ef4444' : '#10b981';
          ctx.fillRect(boxX, boxY - tagHeight, boxW, tagHeight);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText(`${v.label} (98%)`, boxX + 6, boxY - 7);
        }
      });

      // Render overlay from real-time Socket event if matches current camera
      if (showOverlay && latestEvent && latestEvent.camera_id === camera.id) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(100, 80, 180, 120);

        ctx.fillStyle = '#2563eb';
        ctx.fillRect(100, 58, 180, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`LIVE DET: ${latestEvent.vehicle_number || 'VEHICLE'} (${latestEvent.speed_kmh || 55} km/h)`, 106, 74);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [camera, showOverlay, latestEvent]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col group relative">
      {/* Feed Header Bar */}
      <div className="bg-dark-base/80 backdrop-blur-md border-b border-dark-border px-3 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            camera.status === 'Online' ? 'bg-emerald-500 animate-pulse' :
            camera.status === 'Degraded' ? 'bg-amber-500' : 'bg-red-500'
          }`} />
          <h3 className="text-xs font-semibold text-gray-200 truncate" title={camera.name}>
            {camera.id} • {camera.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {camera.source_protocol}
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            {camera.zone}
          </span>
        </div>
      </div>

      {/* Video Canvas Container */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={480}
          height={270}
          className="w-full h-full object-cover"
        />

        {/* Hover Action Controls */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-dark-base/80 backdrop-blur border border-gray-700/60 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            title={showOverlay ? 'Hide AI Bounding Boxes' : 'Show AI Bounding Boxes'}
            className={`p-1.5 rounded transition-colors ${showOverlay ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-gray-400 hover:bg-gray-700'}`}
          >
            {showOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stream Endpoint Metadata Footer */}
      {!isCompact && (
        <div className="px-3 py-1.5 bg-[#0D121F] border-t border-dark-border text-[11px] font-mono text-gray-400 flex items-center justify-between">
          <div className="truncate max-w-[70%]" title={camera.stream_url}>
            URI: <span className="text-gray-300">{camera.stream_url}</span>
          </div>
          <div>
            Retention: <span className="text-blue-400 font-semibold">{camera.storage_retention_days || 30} days</span>
          </div>
        </div>
      )}
    </div>
  );
}
