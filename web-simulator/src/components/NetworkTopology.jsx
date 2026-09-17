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

  const isFlat = cfg.ciscoVlan === 1 && cfg.teldatVlan === 1;

  const nodes = [
    {
      id: "pc1",
      label: "HOST-PC1",
      sublabel: "Estación LAN 1",
      type: "host",
      role: "Endpoint de Red",
      ip: cfg.ciscoPcIp,
      x: 75
    },
    {
      id: "sw1",
      deviceKey: "datacom",
      label: "DATACOM-SW1",
      sublabel: "DmOS Switch L2",
      type: "switch",
      vendor: "Datacom DmOS",
      role: "Conmutación Acceso L2",
      ip: isFlat ? "VLAN 1 Nativa (PVID: 1/5)" : `VLAN ${cfg.ciscoVlan} (PVID: 1/5)`,
      x: 275
    },
    {
      id: "cisco",
      deviceKey: "cisco",
      label: "CISCO-860VAE",
      sublabel: "Router Cisco IOS",
      type: "router",
      vendor: "Cisco Systems (IOS 15.x)",
      role: "Gateway LAN 1 & Borde WAN",
      ip: isFlat ? `SVI Vlan1: ${cfg.ciscoLanGw}` : `SVI Vlan${cfg.ciscoVlan}: ${cfg.ciscoLanGw}`,
      x: 500
    },
    {
      id: "teldat",
      deviceKey: "teldat",
      label: "TELDAT-RS123",
      sublabel: "Router Teldat CIT",
      type: "router",
      vendor: "Teldat (CIT Kernel)",
      role: "Borde WAN & Gateway LAN 2",
      ip: isFlat ? `Eth0/0: ${cfg.teldatLanGw}` : `Subif 802.1Q: ${cfg.teldatLanGw}`,
      x: 725
    },
    {
      id: "sw2",
      deviceKey: "datacom",
      label: "DATACOM-SW2",
      sublabel: "DmOS Switch L2",
      type: "switch",
      vendor: "Datacom DmOS",
      role: "Conmutación Acceso L2",
      ip: isFlat ? "VLAN 1 Nativa (PVID: 1/5)" : `VLAN ${cfg.teldatVlan} (PVID: 1/5)`,
      x: 935
    },
    {
      id: "pc2",
      label: "HOST-PC2",
      sublabel: "Estación LAN 2",
      type: "host",
      role: "Endpoint de Red",
      ip: cfg.teldatPcIp,
      x: 1105
    }
  ];

  const links = [
    {
      from: 75,
      to: 275,
      title: `Eth 1/5 (Acceso)`,
      subtitle: isFlat ? "VLAN 1 Nativa (Untagged)" : `VLAN ${cfg.ciscoVlan} Untagged`,
      isWan: false
    },
    {
      from: 275,
      to: 500,
      title: isFlat ? "Acceso VLAN 1 Nativa" : "Troncal 802.1Q",
      subtitle: isFlat ? "Eth 1/1 ⮂ Fa0 (Sin etiquetar)" : `Eth 1/1 ⮂ Fa0 (VLAN ${cfg.ciscoVlan})`,
      isWan: false
    },
    {
      from: 500,
      to: 725,
      title: `Enlace WAN (${cfg.wanNet}/30)`,
      subtitle: `${cfg.wanCiscoIp} ⮂ ${cfg.wanTeldatIp}`,
      isWan: true
    },
    {
      from: 725,
      to: 935,
      title: isFlat ? "Acceso VLAN 1 Nativa" : "Subinterfaz 802.1Q",
      subtitle: isFlat ? "Eth0/0 ⮂ Eth 1/1 (Sin etiquetar)" : `Eth0/0.${cfg.teldatVlan} ⮂ Eth 1/1`,
      isWan: false
    },
    {
      from: 935,
      to: 1105,
      title: `Eth 1/5 (Acceso)`,
      subtitle: isFlat ? "VLAN 1 Nativa (Untagged)" : `VLAN ${cfg.teldatVlan} Untagged`,
      isWan: false
    }
  ];

  return (
    <div className="bg-[#0b1120] border border-slate-800/90 rounded-xl p-3.5 shadow-xl select-none mb-3 font-sans">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-1 pb-2 border-b border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${isFlat ? "bg-amber-400" : "bg-sky-500"}`}></div>
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Topología L1-L3 de Infraestructura de Red
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
            isFlat
              ? "bg-amber-950/60 text-amber-300 border border-amber-800/80"
              : "bg-sky-950/60 text-sky-300 border border-sky-800/80"
          }`}>
            {isFlat ? "⚠️ Red Plana (VLAN 1 Nativa)" : "🛡️ Segmentación IEEE 802.1Q"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span> Ethernet
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400 border-b border-dashed inline-block"></span> WAN Punto a Punto
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[10px]">Haz clic en un equipo para abrir su consola</span>
        </div>
      </div>

      {/* Diagram SVG Container with clean non-overlapping layers */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 1180 155" className="w-full min-w-[900px] h-36">
          <defs>
            <linearGradient id="linkGradEth" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="linkGradWan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* LAYER 1: Link Lines (Y = 62) */}
          {links.map((link, idx) => (
            <g key={`line-${idx}`}>
              <line
                x1={link.from}
                y1={62}
                x2={link.to}
                y2={62}
                stroke={link.isWan ? "url(#linkGradWan)" : "url(#linkGradEth)"}
                strokeWidth={link.isWan ? "2.5" : "1.8"}
                strokeDasharray={link.isWan ? "5 3" : "none"}
              />
            </g>
          ))}

          {/* LAYER 2: Link Labels (STRICTLY ABOVE THE LINE: Y = 18 to 44) */}
          {links.map((link, idx) => {
            const midX = (link.from + link.to) / 2;
            return (
              <g key={`label-${idx}`}>
                {/* Background pill to prevent any line interference */}
                <rect
                  x={midX - 70}
                  y={18}
                  width={140}
                  height={27}
                  rx={4}
                  fill="#080e1a"
                  stroke={link.isWan ? "#78350f" : "#1e293b"}
                  strokeWidth="0.8"
                />
                <text
                  x={midX}
                  y={30}
                  textAnchor="middle"
                  fill={link.isWan ? "#fbbf24" : "#e2e8f0"}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {link.title}
                </text>
                <text
                  x={midX}
                  y={41}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {link.subtitle}
                </text>
              </g>
            );
          })}

          {/* LAYER 3: Device Nodes & Labels (CENTER Y = 62, LABELS STRICTLY BELOW Y = 94 to 142) */}
          {nodes.map((node) => {
            const isCurrentDevice = node.deviceKey && activeDevice === node.deviceKey;
            const isClickable = Boolean(node.deviceKey);

            return (
              <g
                key={node.id}
                className={isClickable ? "cursor-pointer group" : ""}
                onClick={() => {
                  setSelectedNode(node);
                  if (node.deviceKey && onSelectDevice) {
                    onSelectDevice(node.deviceKey);
                  }
                }}
              >
                {/* Node Circle at (node.x, 62) */}
                <circle
                  cx={node.x}
                  cy={62}
                  r={isCurrentDevice ? "24" : "20"}
                  fill={isCurrentDevice ? "#172554" : "#0f172a"}
                  stroke={isCurrentDevice ? "#38bdf8" : "#334155"}
                  strokeWidth={isCurrentDevice ? "2" : "1.2"}
                  className="transition-all duration-150 group-hover:stroke-sky-400"
                />

                {/* Technical Vector Symbol inside Node */}
                {node.type === "router" && (
                  <g transform={`translate(${node.x}, 62)`} stroke={isCurrentDevice ? "#38bdf8" : "#94a3b8"} strokeWidth="1.4" fill="none">
                    <circle r="11" />
                    <path d="M -6 -3.5 L 0 -3.5 L -1.5 -6" />
                    <path d="M 6 3.5 L 0 3.5 L 1.5 6" />
                    <path d="M -3.5 6 L -3.5 0 L -6 1.5" />
                    <path d="M 3.5 -6 L 3.5 0 L 6 -1.5" />
                  </g>
                )}

                {node.type === "switch" && (
                  <g transform={`translate(${node.x}, 62)`} stroke={isCurrentDevice ? "#38bdf8" : "#94a3b8"} strokeWidth="1.3" fill="none">
                    <rect x="-11" y="-8" width="22" height="16" rx="2" />
                    <path d="M -6 -2.5 L 5 -2.5 M 2 -5 L 5 -2.5 L 2 0" />
                    <path d="M 6 2.5 L -5 2.5 M -2 0 L -5 2.5 L -2 5" />
                  </g>
                )}

                {node.type === "host" && (
                  <g transform={`translate(${node.x}, 62)`} stroke="#94a3b8" strokeWidth="1.3" fill="none">
                    <rect x="-10" y="-8" width="20" height="13" rx="1.5" />
                    <path d="M 0 5 L 0 8 M -5 8 L 5 8" />
                  </g>
                )}

                {/* Node Labels (STRICTLY BELOW: Y = 96, 110, 124) */}
                <text
                  x={node.x}
                  y={96}
                  textAnchor="middle"
                  fill={isCurrentDevice ? "#38bdf8" : "#f8fafc"}
                  fontSize="10.5"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {node.label}
                </text>

                <text
                  x={node.x}
                  y={110}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.sublabel}
                </text>

                <text
                  x={node.x}
                  y={124}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.ip}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Details Bar */}
      {selectedNode && (
        <div className="mt-2 text-xs bg-[#070b14] px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono text-[11px] font-semibold border border-sky-800/60">
              {selectedNode.label}
            </span>
            <span className="text-slate-200 font-medium">{selectedNode.role}</span>
            <span className="text-slate-500 font-mono text-[11px]">| {selectedNode.vendor || "Estación de trabajo"} ({selectedNode.ip})</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {selectedNode.deviceKey ? "Consola vinculada activamente" : "Host de prueba final"}
          </span>
        </div>
      )}
    </div>
  );
}
