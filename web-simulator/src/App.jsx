import React, { useState, useEffect } from "react";
import challengesData from "./data/challenges.json";
import { SimulatorEngine } from "./core/SimulatorEngine";
import { TerminalUI } from "./components/TerminalUI";
import { ExpertPanel } from "./components/ExpertPanel";

const MODULE_KEYS = [
  { key: "cisco", label: "Cisco 860VAE", icon: "🌐" },
  { key: "teldat", label: "Teldat RS123", icon: "📟" },
  { key: "datacom", label: "Datacom SW1/SW2", icon: "🔀" },
  { key: "integrado", label: "Reto Integrado", icon: "⚡" }
];

export function App() {
  const [currentModuleKey, setCurrentModuleKey] = useState("cisco");
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [engine, setEngine] = useState(null);
  const [updateTick, setUpdateTick] = useState(0);

  // Flattened array to easily navigate to next challenge
  const allChallenges = [
    ...(challengesData.cisco || []),
    ...(challengesData.teldat || []),
    ...(challengesData.datacom || []),
    ...(challengesData.integrado || [])
  ];

  const currentChallengesList = challengesData[currentModuleKey] || [];
  const activeChallenge = currentChallengesList[currentChallengeIndex] || challengesData.cisco[0];

  useEffect(() => {
    if (activeChallenge) {
      setEngine(new SimulatorEngine(activeChallenge));
    }
  }, [currentModuleKey, currentChallengeIndex]);

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
    if (activeChallenge) {
      setEngine(new SimulatorEngine(activeChallenge));
      setUpdateTick(tick => tick + 1);
    }
  };

  const handleNextChallenge = () => {
    // Check if there is a next challenge in the current module
    if (currentChallengeIndex < currentChallengesList.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
    } else {
      // Advance to the next module
      const currentModIdx = MODULE_KEYS.findIndex(m => m.key === currentModuleKey);
      if (currentModIdx < MODULE_KEYS.length - 1) {
        const nextMod = MODULE_KEYS[currentModIdx + 1];
        setCurrentModuleKey(nextMod.key);
        setCurrentChallengeIndex(0);
      } else {
        // Loop back to start or keep at last
        setCurrentModuleKey("cisco");
        setCurrentChallengeIndex(0);
      }
    }
  };

  if (!engine) return <div className="p-8 text-white">Cargando simulador...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-gray-100 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-[#161b22] border-b border-gray-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 select-none shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg shadow-inner">
            CLI
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              Simulador CLI de Redes Multimarca
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                v5.0 Web
              </span>
            </h1>
            <p className="text-xs text-gray-400">Cisco IOS · Teldat CIT · Datacom DmOS</p>
          </div>
        </div>

        {/* Module Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-gray-800">
          {MODULE_KEYS.map((mod) => {
            const isActive = currentModuleKey === mod.key;
            return (
              <button
                key={mod.key}
                onClick={() => handleSelectModule(mod.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
                }`}
              >
                <span>{mod.icon}</span>
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>

        {/* Level / Challenge Quick Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Nivel:</span>
          <div className="flex gap-1.5">
            {currentChallengesList.map((ch, idx) => {
              const isCurrent = idx === currentChallengeIndex;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChallenge(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400/50"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                  }`}
                  title={ch.title}
                >
                  {ch.id}
                </button>
              );
            })}
          </div>

          {/* Next Level Quick Button */}
          <button
            onClick={handleNextChallenge}
            className="ml-2 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Avanzar al siguiente reto"
          >
            <span>Siguiente</span>
            <span>➔</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Terminal Area */}
        <main className="flex-1 p-5 flex flex-col min-w-0">
          <TerminalUI
            engine={engine}
            onCommand={handleCommandExecuted}
            onNextChallenge={handleNextChallenge}
            onRestartChallenge={handleRestartChallenge}
          />
        </main>

        {/* Expert Sidebar */}
        <ExpertPanel
          engine={engine}
          onNextChallenge={handleNextChallenge}
          onRestartChallenge={handleRestartChallenge}
        />
      </div>
    </div>
  );
}

export default App;
