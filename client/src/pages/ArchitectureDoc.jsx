import React from 'react';
import { Cpu, Server, HardDrive, ShieldCheck, Zap, Layers, DollarSign, Network, Cloud, Lock } from 'lucide-react';

export default function ArchitectureDoc() {
  return (
    <div className="p-4 md:p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-dark-card border border-blue-500/30 p-6 rounded-2xl shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 font-semibold px-3 py-1 rounded-full text-xs border border-blue-500/30">
          <Cpu className="w-3.5 h-3.5" /> Gujarat Police Innovation Hackathon 2026 Reference Architecture
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Scalability & Production Architecture Note (80,000 Camera Distributed Scale)
        </h1>
        <p className="text-sm text-gray-300 leading-relaxed max-w-4xl">
          Comprehensive blueprint detailing how the okDriver prototype scales from local testing to a state-wide distributed CCTV monitoring, AI video analytics, and real-time emergency intelligence ecosystem.
        </p>
      </div>

      {/* Visual System Architecture Diagram Box */}
      <div className="bg-dark-card border border-dark-border p-6 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
          <Layers className="w-5 h-5 text-blue-400" />
          High-Level Multi-Tier Architecture Diagram
        </h2>

        {/* Diagram Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: Edge */}
          <div className="bg-[#0B0F19] border border-emerald-500/30 p-5 rounded-xl space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-400">Tier 1: Edge Compute Nodes</span>
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Edge AI & Camera Gateways</h3>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
              <li>ONVIF / RTSP Ingestion (80,000 Streams)</li>
              <li>Jetson Orin / Edge AI Accelerators</li>
              <li>Local ANPR & Bounding Box extraction</li>
              <li>Bandwidth Reduction: Send metadata only (99% saved)</li>
            </ul>
          </div>

          {/* Tier 2: Regional */}
          <div className="bg-[#0B0F19] border border-amber-500/30 p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-400">Tier 2: Regional VMS Relay</span>
              <Server className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white">District Police Command Hubs</h3>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
              <li>Kafka Distributed Event Streaming Bus</li>
              <li>HLS / WebRTC Video Transcoding Relay</li>
              <li>Temporal Alert Deduplication Engine</li>
              <li>Local NVMe Hot Storage Cache (30 Days)</li>
            </ul>
          </div>

          {/* Tier 3: Central Cloud */}
          <div className="bg-[#0B0F19] border border-purple-500/30 p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-purple-400">Tier 3: Central HQ Cloud</span>
              <Cloud className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white">State Command Intelligence</h3>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
              <li>Watchlist Matching & Cross-Cam Tracing</li>
              <li>ClickHouse / PostgreSQL Sharded DB</li>
              <li>WebSocket Real-time Operator Push</li>
              <li>GIS Route Reconstruction & Analytics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Scalability Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Bandwidth Strategy */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
            <Network className="w-5 h-5" />
            <span>1. Video Bandwidth & Stream Relay Strategy</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Directly streaming 80,000 1080p camera feeds to a central cloud requires ~160 Gbps bandwidth.
            Our architecture uses <strong>Edge Metadata Extraction</strong>: video remains at local edge NVRs while JSON AI detection payloads (~2 KB per event) are sent over WAN. Live video is fetched only when an operator opens a feed.
          </p>
        </div>

        {/* 2. Database Indexing */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <HardDrive className="w-5 h-5" />
            <span>2. Database Indexing & Timeseries Storage</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            At 80,000 cameras generating 10 detections/minute = 48 million events/day.
            We utilize <strong>ClickHouse</strong> for column-oriented analytics and <strong>PostgreSQL with TimescaleDB hyper-tables</strong> indexed by <code className="text-emerald-300 font-mono">vehicle_number</code>, <code className="text-emerald-300 font-mono">camera_id</code>, and <code className="text-emerald-300 font-mono">timestamp BRIN indexes</code> for instant GIS route tracing queries.
          </p>
        </div>

        {/* 3. GPU Sizing */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
            <Zap className="w-5 h-5" />
            <span>3. GPU & AI Accelerator Requirements</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Using TensorRT-optimized YOLOv8 + DeepSORT + PaddleOCR models:
            Each NVIDIA L4 GPU handles 40 1080p 30fps streams. Supporting 80,000 streams requires <strong>2,000 NVIDIA L4 GPUs</strong> distributed across regional edge nodes.
          </p>
        </div>

        {/* 4. Cybersecurity */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-red-400">
            <Lock className="w-5 h-5" />
            <span>4. Cybersecurity & Network Segmentation</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            State CCTV networks use <strong>Air-Gapped IP-MPLS VLAN Segmentation</strong> with mTLS authentication between edge gateways and central servers. Stream URLs are signed using short-lived HMAC tokens.
          </p>
        </div>
      </div>

      {/* Operational Costs Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Estimated Monthly Infrastructure Cost Sizing (80,000 Cameras)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0B0F19] uppercase font-semibold text-gray-400 border-b border-dark-border">
              <tr>
                <th className="p-3">Infrastructure Tier</th>
                <th className="p-3">Specification / Appliance</th>
                <th className="p-3">Quantity</th>
                <th className="p-3 text-right">Est. Monthly Cost (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="p-3 font-semibold text-white">Edge AI Processing</td>
                <td className="p-3">NVIDIA Jetson Orin 64GB Industrial Nodes</td>
                <td className="p-3">10,000 Gateways</td>
                <td className="p-3 text-right font-mono">$45,000</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Central Kafka & Streaming Bus</td>
                <td className="p-3">AWS MSK (Managed Kafka Cluster)</td>
                <td className="p-3">3 Region Brokers</td>
                <td className="p-3 text-right font-mono">$12,500</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Hot & Warm Storage</td>
                <td className="p-3">AWS S3 Standard + Glacier Deep Archive (30 Petabytes)</td>
                <td className="p-3">80,000 Feeds</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-400">$68,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
