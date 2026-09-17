import React, { useState, useRef, useEffect } from "react";

export function TerminalUI({ engine, onCommand, onNextChallenge, onRestartChallenge }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Reset local history whenever the active challenge changes
  useEffect(() => {
    setHistory([]);
    setInput("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [engine?.challenge?.id]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      const currentPrompt = engine.getCurrentPrompt();
      const result = engine.processCommand(input);

      setHistory((prev) => [
        ...prev,
        { prompt: currentPrompt, cmd: input, ...result }
      ]);
      setInput("");
      onCommand(); // notify parent
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, engine?.isCompleted]);

  const challenge = engine?.challenge;

  return (
    <div 
      className="flex-1 bg-[#090d13] text-[#00ff88] p-5 font-mono overflow-y-auto rounded-xl border border-gray-800/90 shadow-2xl flex flex-col cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Header Banner */}
      <div className="mb-4 pb-3 border-b border-gray-800/60 text-xs text-gray-400 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-300 font-semibold">CONEXIÓN SERIAL ESTABLECIDA</span>
          </div>
          <span className="text-cyan-400 font-mono">[{challenge?.id}] {challenge?.module}</span>
        </div>
        <div className="mt-1 text-gray-300 font-semibold text-sm">
          {challenge?.title}
        </div>
        <div className="mt-0.5 text-gray-400 text-xs">
          {challenge?.description}
        </div>
        <div className="mt-2 text-gray-500">
          Tip: Escribe los comandos en la consola o usa abreviaturas estándar como <code className="text-cyan-300 font-bold">conf t</code>, <code className="text-cyan-300 font-bold">int fa0</code>, <code className="text-cyan-300 font-bold">wr</code>, etc.
        </div>
      </div>

      {/* History Log */}
      <div className="flex-1 space-y-1">
        {history.map((h, i) => (
          <div key={i} className="text-sm leading-relaxed">
            <div className="flex gap-2 items-center">
              <span className="text-cyan-400 select-none font-bold">{h.prompt}</span>
              <span className="text-white font-medium">{h.cmd}</span>
              {h.success && (
                <span className="text-emerald-400 text-xs ml-2 select-none font-semibold">[OK]</span>
              )}
            </div>
            {h.output && (
              <div className="text-rose-400 text-xs ml-4 my-1 select-none font-sans font-medium bg-rose-950/30 border-l-2 border-rose-500 px-2 py-0.5 rounded">
                {h.output}
              </div>
            )}
          </div>
        ))}

        {/* Input Prompt (when active) */}
        {!engine.isCompleted && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-cyan-400 select-none font-bold whitespace-nowrap">
              {engine.getCurrentPrompt()}
            </span>
            <input
              ref={inputRef}
              autoFocus
              className="flex-1 bg-transparent outline-none text-[#00ff88] font-mono caret-cyan-400 font-medium"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              placeholder="escribe un comando..."
            />
          </div>
        )}

        {/* Completion Card */}
        {engine.isCompleted && (
          <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-gray-900 to-cyan-950/60 border border-emerald-500/40 shadow-xl select-none animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏆</div>
              <div>
                <h3 className="text-emerald-400 font-bold text-base tracking-wide">
                  ¡RETO COMPLETADO CON ÉXITO!
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Has completado todos los pasos requeridos para este nivel.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNextChallenge();
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-950 font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer flex items-center gap-2 transform active:scale-95"
              >
                <span>Pasar al Siguiente Nivel</span>
                <span className="text-base">➔</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestartChallenge();
                }}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs rounded-lg border border-gray-700 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>⟲</span>
                <span>Reintentar este Reto</span>
              </button>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
