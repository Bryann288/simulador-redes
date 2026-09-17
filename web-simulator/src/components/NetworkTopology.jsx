import React, { useState } from "react";

export function NetworkTopology({ activeDevice, onSelectDevice, networkConfig }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const cfg = networkConfig || {
    ciscoVlan: 100,
    teldatVlan: 200,
    ciscoLanGw: "192.168.100.1",
    ciscoPcIp: "192.168.100.10/24",
    teldatLanGw: "192.168.200.1",
    teldatPcIp: "192.168.200.10/24",
    wanNet: "10.0.12.0",
    wanCiscoIp: "10.0.12.1",
    wanTeldatIp: "10.0.12.2"
  };

  const nodes = [
    {
      id: "pc1",
      label: "PC 1 (LAN Cisco)",
      type: "host",
      ip: cfg.ciscoPcIp,
      x: 60,
      y: 90,
      icon: "💻"
    },
    {
      id: "sw1",
      deviceKey: "datacom",
      label: "Datacom SW1",
      type: "switch",
      vendor: "Datacom DmOS",
      ip: `VLAN ${cfg.ciscoVlan} / L2`,
      x: 210,
      y: 90,
      icon: "🔀"
    },
    {
      id: "cisco",
      deviceKey: "cisco",
      label: "Cisco 860VAE",
      type: "router",
      vendor: "Cisco IOS",
      ip: `LAN: ${cfg.ciscoLanGw} | WAN: ${cfg.wanCiscoIp}`,
      x: 390,
      y: 90,
      icon: "🌐"
    },
    {
      id: "teldat",
      deviceKey: "teldat",
      label: "Teldat RS123",
      type: "router",
      vendor: "Teldat CIT",
      ip: `WAN: ${cfg.wanTeldatIp} | LAN: ${cfg.teldatLanGw}`,
      x: 570,
      y: 90,
      icon: "📟"
    },
    {
      id: "sw2",
      deviceKey: "datacom",
      label: "Datacom SW2",
      type: "switch",
      vendor: "Datacom DmOS",
      ip: `VLAN ${cfg.teldatVlan} / L2`,
      x: 750,
      y: 90,
      icon: "🔀"
    },
    {
      id: "pc2",
      label: "PC 2 (LAN Teldat)",
      type: "host",
      ip: cfg.teldatPcIp,
      x: 900,
      y: 90,
      icon: "💻"
    }
  ];

  const links = [
    { from: 60, to: 210, label: `VLAN ${cfg.ciscoVlan} Acceso` },
    { from: 210, to: 390, label: `Troncal Tagged ${cfg.ciscoVlan}` },
    { from: 390, to: 570, label: `${cfg.wanNet}/30 (WAN)`, isWan: true },
    { from: 570, to: 750, label: `802.1Q Subif .${cfg.teldatVlan}` },
    { from: 750, to: 900, label: `VLAN ${cfg.teldatVlan} Acceso` }
  ];

  return (
    <div className="bg-[#111620] border border-gray-800 rounded-xl p-4 shadow-xl select-none mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            Topología Multimarca en Tiempo Real (Parámetros Dinámicos)
          </h3>
        </div>
        <span className="text-[11px] text-gray-400">
          Haz clic en un equipo para inspeccionar o cambiar de consola
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 960 170" className="w-full min-w-[700px] h-40">
          <defs>
            <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="wanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff0055" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffaa00" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Links */}
          {links.map((link, idx) => (
            <g key={idx}>
              <line
                x1={link.from}
                y1={75}
                x2={link.to}
                y2={75}
                stroke={link.isWan ? "url(#wanGrad)" : "url(#linkGrad)"}
                strokeWidth={link.isWan ? "3" : "2"}
                strokeDasharray={link.isWan ? "6 3" : "none"}
                className={link.isWan ? "animate-pulse" : ""}
              />
              <text
                x={(link.from + link.to) / 2}
                y={62}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
              >
                {link.label}
              </text>
            </g>
          ))}

          {/* Nodes */}
          {nodes.map((node) => {
            const isCurrentDevice = node.deviceKey && activeDevice === node.deviceKey;
            const isClickable = Boolean(node.deviceKey);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, 75)`}
                className={isClickable ? "cursor-pointer group" : ""}
                onClick={() => {
                  setSelectedNode(node);
                  if (node.deviceKey && onSelectDevice) {
                    onSelectDevice(node.deviceKey);
                  }
                }}
              >
                {/* Node Glow Circle */}
                <circle
                  r={isCurrentDevice ? "28" : "24"}
                  fill={isCurrentDevice ? "#0891b2" : "#1e293b"}
                  stroke={isCurrentDevice ? "#22d3ee" : "#475569"}
                  strokeWidth={isCurrentDevice ? "2.5" : "1.5"}
                  className="transition-all duration-200 group-hover:stroke-cyan-400"
                />

                {/* Icon */}
                <text
                  textAnchor="middle"
                  dy="6"
                  fontSize={isCurrentDevice ? "18" : "15"}
                  className="pointer-events-none select-none"
                >
                  {node.icon}
                </text>

                {/* Node Title */}
                <text
                  y={40}
                  textAnchor="middle"
                  fill={isCurrentDevice ? "#38bdf8" : "#e2e8f0"}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {node.label}
                </text>

                {/* IP Badge */}
                <text
                  y={53}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {node.ip}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedNode && (
        <div className="mt-2 text-xs bg-[#0d1117] p-2.5 rounded-lg border border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-400">{selectedNode.label}</span>
            <span className="text-gray-400">| {selectedNode.vendor || "Estación de trabajo"}</span>
            <span className="text-gray-500 font-mono">({selectedNode.ip})</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">
            {selectedNode.deviceKey ? `Consola de ${selectedNode.label} sincronizada` : "Dispositivo endpoint final"}
          </span>
        </div>
      )}
    </div>
  );
}
