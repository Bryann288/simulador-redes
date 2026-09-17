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
      label: "HOST-PC1",
      sublabel: "Estación LAN 1",
      type: "host",
      role: "Endpoint de Red",
      ip: cfg.ciscoPcIp,
      x: 75,
      y: 75
    },
    {
      id: "sw1",
      deviceKey: "datacom",
      label: "DATACOM-SW1",
      sublabel: "DmOS Switch L2",
      type: "switch",
      vendor: "Datacom DmOS",
      role: "Conmutación de Acceso",
      ip: `VLAN ${cfg.ciscoVlan} (Untagged: 1/5, Tagged: 1/1)`,
      x: 235,
      y: 75
    },
    {
      id: "cisco",
      deviceKey: "cisco",
      label: "CISCO-860VAE",
      sublabel: "Cisco IOS Router",
      type: "router",
      vendor: "Cisco Systems (IOS 15.x)",
      role: "Gateway LAN 1 & Borde WAN",
      ip: `LAN: ${cfg.ciscoLanGw} | WAN: ${cfg.wanCiscoIp}`,
      x: 415,
      y: 75
    },
    {
      id: "teldat",
      deviceKey: "teldat",
      label: "TELDAT-RS123",
      sublabel: "Teldat CIT Router",
      type: "router",
      vendor: "Teldat (CIT Kernel)",
      role: "Borde WAN & Gateway LAN 2",
      ip: `WAN: ${cfg.wanTeldatIp} | LAN: ${cfg.teldatLanGw}`,
      x: 595,
      y: 75
    },
    {
      id: "sw2",
      deviceKey: "datacom",
      label: "DATACOM-SW2",
      sublabel: "DmOS Switch L2",
      type: "switch",
      vendor: "Datacom DmOS",
      role: "Conmutación de Acceso",
      ip: `VLAN ${cfg.teldatVlan} (Untagged: 1/5, Tagged: 1/1)`,
      x: 775,
      y: 75
    },
    {
      id: "pc2",
      label: "HOST-PC2",
      sublabel: "Estación LAN 2",
      type: "host",
      role: "Endpoint de Red",
      ip: cfg.teldatPcIp,
      x: 935,
      y: 75
    }
  ];

  const links = [
    { from: 75, to: 235, label: `Eth 1/5 · Acceso VLAN ${cfg.ciscoVlan}`, sub: "1 Gbps Cat6" },
    { from: 235, to: 415, label: `Troncal 802.1Q (Eth 1/1 ⮂ Fa0)`, sub: `Tagged VLAN ${cfg.ciscoVlan}` },
    { from: 415, to: 595, label: `WAN Inter-Router (${cfg.wanNet}/30)`, sub: `${cfg.wanCiscoIp} ⮂ ${cfg.wanTeldatIp}`, isWan: true },
    { from: 595, to: 775, label: `Subinterfaz 802.1Q (.${cfg.teldatVlan})`, sub: `Eth0/0.${cfg.teldatVlan} ⮂ Eth 1/1` },
    { from: 775, to: 935, label: `Eth 1/5 · Acceso VLAN ${cfg.teldatVlan}`, sub: "1 Gbps Cat6" }
  ];

  return (
    <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4 shadow-xl select-none mb-4 font-sans">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-sky-500"></div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Diagrama de Topología L1-L3 (Interconexión de Infraestructura)
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            RFC 1918 / 802.1Q
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-500 inline-block"></span> Ethernet L2/L3
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 border-b border-dashed inline-block"></span> Enlace WAN /30
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Clic en un nodo para sincronizar consola</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto py-1">
        <svg viewBox="0 0 1010 160" className="w-full min-w-[760px] h-38">
          <defs>
            {/* Professional Gradients */}
            <linearGradient id="linkGradEth" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="linkGradWan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Links */}
          {links.map((link, idx) => (
            <g key={idx}>
              <line
                x1={link.from}
                y1={60}
                x2={link.to}
                y2={60}
                stroke={link.isWan ? "url(#linkGradWan)" : "url(#linkGradEth)"}
                strokeWidth={link.isWan ? "2.5" : "2"}
                strokeDasharray={link.isWan ? "5 4" : "none"}
              />
              <text
                x={(link.from + link.to) / 2}
                y={46}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="9.5"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="500"
              >
                {link.label}
              </text>
              <text
                x={(link.from + link.to) / 2}
                y={74}
                textAnchor="middle"
                fill="#64748b"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                {link.sub}
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
                transform={`translate(${node.x}, 60)`}
                className={isClickable ? "cursor-pointer group" : ""}
                onClick={() => {
                  setSelectedNode(node);
                  if (node.deviceKey && onSelectDevice) {
                    onSelectDevice(node.deviceKey);
                  }
                }}
              >
                {/* Node Outer Ring & Fill */}
                <circle
                  r={isCurrentDevice ? "26" : "22"}
                  fill={isCurrentDevice ? "#172554" : "#0f172a"}
                  stroke={isCurrentDevice ? "#38bdf8" : "#334155"}
                  strokeWidth={isCurrentDevice ? "2" : "1.2"}
                  className="transition-all duration-150 group-hover:stroke-sky-400"
                />

                {/* Technical Vector Network Symbols */}
                {node.type === "router" && (
                  <g stroke={isCurrentDevice ? "#60a5fa" : "#94a3b8"} strokeWidth="1.5" fill="none">
                    {/* Circle base */}
                    <circle r="12" />
                    {/* Routing Arrows (inward and outward) */}
                    <path d="M -7 -4 L 0 -4 L -2 -7" />
                    <path d="M 7 4 L 0 4 L 2 7" />
                    <path d="M -4 7 L -4 0 L -7 2" />
                    <path d="M 4 -7 L 4 0 L 7 -2" />
                  </g>
                )}

                {node.type === "switch" && (
                  <g stroke={isCurrentDevice ? "#60a5fa" : "#94a3b8"} strokeWidth="1.4" fill="none">
                    {/* Rect chassis */}
                    <rect x="-12" y="-9" width="24" height="18" rx="2" />
                    {/* Opposing horizontal switching arrows */}
                    <path d="M -7 -3 L 6 -3 M 3 -6 L 7 -3 L 3 0" />
                    <path d="M 7 3 L -6 3 M -3 0 L -7 3 L -3 6" />
                  </g>
                )}

                {node.type === "host" && (
                  <g stroke="#94a3b8" strokeWidth="1.3" fill="none">
                    {/* Monitor frame */}
                    <rect x="-11" y="-9" width="22" height="14" rx="1.5" />
                    {/* Stand base */}
                    <path d="M 0 5 L 0 9 M -6 9 L 6 9" />
                  </g>
                )}

                {/* Node Identifier */}
                <text
                  y={38}
                  textAnchor="middle"
                  fill={isCurrentDevice ? "#38bdf8" : "#f1f5f9"}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {node.label}
                </text>

                {/* Subtitle / Model */}
                <text
                  y={49}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.sublabel}
                </text>

                {/* IP / Segment Callout */}
                <text
                  y={61}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.ip.length > 24 ? node.ip.substring(0, 24) + "..." : node.ip}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedNode && (
        <div className="mt-2.5 text-xs bg-[#090d16] p-3 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono text-[11px] font-semibold border border-sky-800/60">
              {selectedNode.label}
            </span>
            <span className="text-slate-300 font-medium">{selectedNode.role}</span>
            <span className="text-slate-500 font-mono text-[11px]">• {selectedNode.vendor || "Host IP"} ({selectedNode.ip})</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {selectedNode.deviceKey ? "Sincronizado con consola de pruebas" : "Host de prueba final"}
          </span>
        </div>
      )}
    </div>
  );
}
