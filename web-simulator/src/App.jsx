import React, { useState, useEffect } from "react";
import challengesData from "./data/challenges.json";
import { SimulatorEngine } from "./core/SimulatorEngine";
import { PRESET_PROFILES, applyNetworkConfigToChallenge } from "./core/NetworkConfigManager";
import { TerminalUI } from "./components/TerminalUI";
import { ExpertPanel } from "./components/ExpertPanel";
import { SandboxUI } from "./components/SandboxUI";
import { NetworkTopology } from "./components/NetworkTopology";
import { ExamConfigModal } from "./components/ExamConfigModal";

const MODULE_KEYS = [
  { key: "cisco", label: "Cisco IOS", model: "860VAE" },
  { key: "teldat", label: "Teldat CIT", model: "RS123" },
  { key: "datacom", label: "Datacom DmOS", model: "SW1/SW2" },
  { key: "integrado", label: "Integración L2/L3", model: "Punta a Punta" }
];

export function App() {
  const [appMode, setAppMode] = useState("guided"); // 'guided' | 'sandbox'
  const [showTopology, setShowTopology] = useState(true);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // Dynamic Exam / Network Configuration State
  const [networkConfig, setNetworkConfig] = useState(PRESET_PROFILES[0].config);

  // Guided Mode State
  const [currentModuleKey, setCurrentModuleKey] = useState("cisco");
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [engine, setEngine] = useState(null);
  const [updateTick, setUpdateTick] = useState(0);

  const currentChallengesList = challengesData[currentModuleKey] || [];
  const rawChallenge = currentChallengesList[currentChallengeIndex] || challengesData.cisco[0];

  useEffect(() => {
    if (rawChallenge) {
      const dynamicChallenge = applyNetworkConfigToChallenge(rawChallenge, networkConfig);
      setEngine(new SimulatorEngine(dynamicChallenge));
    }
  }, [currentModuleKey, currentChallengeIndex, networkConfig]);

  const handleCommandExecuted = () => {
    setUpdateTick(tick => tick + 1);
  };

  const handleSelectModule = (modKey) => {
    setCurrentModuleKey(modKey);
    setCurrentChallengeIndex(0);
  };

  const handleSelectChallenge = (index) => {
    setCurrentChallengeIndex(index);
  };

  const handleRestartChallenge = () => {
    if (rawChallenge) {
      const dynamicChallenge = applyNetworkConfigToChallenge(rawChallenge, networkConfig);
      setEngine(new SimulatorEngine(dynamicChallenge));
      setUpdateTick(tick => tick + 1);
    }
  };

  const handleNextChallenge = () => {
    if (currentChallengeIndex < currentChallengesList.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
    } else {
      const currentModIdx = MODULE_KEYS.findIndex(m => m.key === currentModuleKey);
      if (currentModIdx < MODULE_KEYS.length - 1) {
        const nextMod = MODULE_KEYS[currentModIdx + 1];
        setCurrentModuleKey(nextMod.key);
        setCurrentChallengeIndex(0);
      } else {
        setCurrentModuleKey("cisco");
        setCurrentChallengeIndex(0);
      }
    }
  };

  const handleDeviceSelectedFromTopology = (deviceKey) => {
    if (MODULE_KEYS.some(m => m.key === deviceKey)) {
      setCurrentModuleKey(deviceKey);
      setCurrentChallengeIndex(0);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#070b14] text-slate-100 overflow-hidden font-sans select-none">
      {/* Enterprise Header Bar */}
      <header className="bg-[#0b101d] border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 shadow-sm z-10">
        {/* Brand & Lab Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-mono font-bold text-xs shadow-inner">
            NET
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-100 tracking-wider uppercase font-mono flex items-center gap-2">
              Laboratorio CLI de Redes Multimarca
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                Edición Evaluación
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-sans">
              Cisco IOS (ISR) · Teldat CIT · Datacom DmOS (Carrier L2)
            </p>
          </div>
        </div>

        {/* Mode Selector Segmented Control */}
        <div className="flex items-center bg-[#070b14] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setAppMode("guided")}
            className={`px-3.5 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              appMode === "guided"
                ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Retos de Evaluación
          </button>
          <button
            onClick={() => setAppMode("sandbox")}
            className={`px-3.5 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
              appMode === "sandbox"
                ? "bg-slate-800 text-sky-400 shadow-sm border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Consola Libre & Auditoría
          </button>
        </div>

        {/* Actions & Exam Parameters */}
        <div className="flex items-center gap-2.5">
          {/* IP Parameters / Exam Settings Button */}
          <button
            onClick={() => setIsExamModalOpen(true)}
            className="px-3 py-1.5 rounded bg-[#070b14] hover:bg-slate-800 text-slate-300 border border-slate-700/90 text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-sm"
            title="Ajustar esquema de VLANs, segmentación y direccionamiento IP"
          >
            <span className={`w-2 h-2 rounded-full ${networkConfig.ciscoVlan === 1 ? "bg-amber-400" : "bg-sky-400"}`}></span>
            <span>Parámetros de Red</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              networkConfig.ciscoVlan === 1
                ? "bg-amber-950/60 text-amber-300 border border-amber-800/80"
                : "bg-slate-800 text-slate-300"
            }`}>
              {networkConfig.ciscoVlan === 1 ? "VLAN 1 (Plana)" : `VLAN ${networkConfig.ciscoVlan} (802.1Q)`}
            </span>
          </button>

          {/* Topology Toggle */}
          <button
            onClick={() => setShowTopology(!showTopology)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition cursor-pointer ${
              showTopology
                ? "bg-slate-800 text-sky-400 border-slate-700"
                : "bg-[#070b14] text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
            title="Alternar visibilidad del mapa de topología"
          >
            {showTopology ? "Ocultar Topología" : "Ver Topología"}
          </button>

          {/* Module Selector in Guided Mode */}
          {appMode === "guided" && (
            <div className="flex items-center gap-1 bg-[#070b14] p-1 rounded-lg border border-slate-800">
              {MODULE_KEYS.map((mod) => {
                const isActive = currentModuleKey === mod.key;
                return (
                  <button
                    key={mod.key}
                    onClick={() => handleSelectModule(mod.key)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer font-mono ${
                      isActive
                        ? "bg-slate-800 text-slate-100 border border-slate-700 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{mod.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Workspace */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        {/* Interactive Network Topology Diagram */}
        {showTopology && (
          <NetworkTopology
            activeDevice={appMode === "guided" ? currentModuleKey : null}
            onSelectDevice={handleDeviceSelectedFromTopology}
            networkConfig={networkConfig}
          />
        )}

        {/* Workspace according to active mode */}
        {appMode === "sandbox" ? (
          <SandboxUI />
        ) : (
          <div className="flex flex-1 gap-4 overflow-hidden">
            {/* Guided Terminal Workspace */}
            <main className="flex-1 flex flex-col min-w-0">
              {/* Level selector pills bar */}
              <div className="mb-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium mr-1 font-mono text-[11px]">Desafíos del Módulo:</span>
                  {currentChallengesList.map((ch, idx) => {
                    const isCurrent = idx === currentChallengeIndex;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => handleSelectChallenge(idx)}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition cursor-pointer ${
                          isCurrent
                            ? "bg-sky-600 text-white shadow-sm"
                            : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        }`}
                        title={ch.title}
                      >
                        {ch.id}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-[11px] text-slate-400 font-mono hidden md:block">
                    LAN 1: <span className="text-slate-200 font-semibold">{networkConfig.ciscoLanGw}</span> | WAN: <span className="text-slate-200 font-semibold">{networkConfig.wanTeldatIp}</span>
                  </div>
                  <button
                    onClick={handleNextChallenge}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Siguiente Nivel</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>

              {engine && (
                <TerminalUI
                  engine={engine}
                  onCommand={handleCommandExecuted}
                  onNextChallenge={handleNextChallenge}
                  onRestartChallenge={handleRestartChallenge}
                />
              )}
            </main>

            {/* Technical Specification & Evaluation Sidebar */}
            {engine && (
              <ExpertPanel
                engine={engine}
                onNextChallenge={handleNextChallenge}
                onRestartChallenge={handleRestartChallenge}
              />
            )}
          </div>
        )}
      </div>

      {/* Network & Exam Configuration Dialog */}
      <ExamConfigModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        activeConfig={networkConfig}
        onApplyConfig={(newCfg) => setNetworkConfig(newCfg)}
      />
    </div>
  );
}

export default App;
