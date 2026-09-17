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
  { key: "cisco", label: "Cisco 860VAE", icon: "🌐" },
  { key: "teldat", label: "Teldat RS123", icon: "📟" },
  { key: "datacom", label: "Datacom SW1/SW2", icon: "🔀" },
  { key: "integrado", label: "Reto Integrado", icon: "⚡" }
];

export function App() {
  const [appMode, setAppMode] = useState("guided"); // 'guided' | 'sandbox'
  const [showTopology, setShowTopology] = useState(true);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // Dynamic Exam / IP Configuration State
  const [networkConfig, setNetworkConfig] = useState(PRESET_PROFILES[0].config);

  // Guided Mode State
  const [currentModuleKey, setCurrentModuleKey] = useState("cisco");
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [engine, setEngine] = useState(null);
  const [updateTick, setUpdateTick] = useState(0);

  const currentChallengesList = challengesData[currentModuleKey] || [];
  const rawChallenge = currentChallengesList[currentChallengeIndex] || challengesData.cisco[0];

  // Re-calculate active challenge based on dynamic IPs
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
    <div className="flex flex-col h-screen bg-[#0d1117] text-gray-100 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="bg-[#161b22] border-b border-gray-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 select-none shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/40 flex items-center justify-center text-white font-bold text-sm shadow-inner">
            CLI
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Simulador CLI de Redes Multimarca
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                v5.8 Exam Ready
              </span>
            </h1>
            <p className="text-[11px] text-gray-400">Cisco IOS · Teldat CIT · Datacom DmOS</p>
          </div>
        </div>

        {/* Global Mode Switch: Guided vs Sandbox */}
        <div className="flex items-center bg-[#090d13] p-1 rounded-xl border border-gray-800 shadow-inner">
          <button
            onClick={() => setAppMode("guided")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              appMode === "guided"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>🎯</span>
            <span>Retos Guiados</span>
          </button>
          <button
            onClick={() => setAppMode("sandbox")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              appMode === "sandbox"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>⚡</span>
            <span>Modo Libre (Sandbox)</span>
          </button>
        </div>

        {/* Exam IP Config Button & Controls */}
        <div className="flex items-center gap-2.5">
          {/* IP Parameters / Exam Settings Button */}
          <button
            onClick={() => setIsExamModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Configurar direcciones IP y subredes para el examen"
          >
            <span>🎯</span>
            <span>IPs del Examen</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-mono">
              {networkConfig.ciscoLanNet}
            </span>
          </button>

          {/* Topology Toggle */}
          <button
            onClick={() => setShowTopology(!showTopology)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showTopology
                ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/40"
                : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
            }`}
            title="Alternar vista de topología de red"
          >
            <span>🗺️</span>
            <span>{showTopology ? "Ocultar Mapa" : "Ver Mapa"}</span>
          </button>

          {/* Module Selector (in Guided mode) */}
          {appMode === "guided" && (
            <div className="flex items-center gap-1 bg-[#090d13] p-1 rounded-xl border border-gray-800">
              {MODULE_KEYS.map((mod) => {
                const isActive = currentModuleKey === mod.key;
                return (
                  <button
                    key={mod.key}
                    onClick={() => handleSelectModule(mod.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? "bg-gray-800 text-cyan-400 border border-cyan-500/40 font-bold"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <span>{mod.icon}</span>
                    <span className="hidden sm:inline">{mod.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        {/* Collapsible Topology Diagram with Dynamic Network Config */}
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
          <div className="flex flex-1 gap-5 overflow-hidden">
            {/* Guided Terminal Area */}
            <main className="flex-1 flex flex-col min-w-0">
              {/* Level selector pills */}
              <div className="mb-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-semibold mr-1">Niveles disponibles:</span>
                  {currentChallengesList.map((ch, idx) => {
                    const isCurrent = idx === currentChallengeIndex;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => handleSelectChallenge(idx)}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                          isCurrent
                            ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                            : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                        }`}
                      >
                        {ch.id}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[11px] text-gray-400 font-mono">
                    LAN: <span className="text-cyan-300 font-bold">{networkConfig.ciscoLanGw}</span> | WAN: <span className="text-amber-300 font-bold">{networkConfig.wanTeldatIp}</span>
                  </div>
                  <button
                    onClick={handleNextChallenge}
                    className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded font-bold text-xs transition cursor-pointer flex items-center gap-1"
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

            {/* Expert Sidebar */}
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

      {/* Exam IP Configuration Modal */}
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
