import React, { useState, useRef, useEffect } from "react";

export function TerminalUI({ engine, onCommand, onNextChallenge, onRestartChallenge }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Reset local state when challenge changes
  useEffect(() => {
    setHistory([]);
    setCommandHistory([]);
    setHistoryIndex(-1);
    setInput("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [engine?.challenge?.id]);

  const handleKeyDown = (e) => {
    // Arrow Up / Down command history traversal (Real CLI behavior)
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(commandHistory[nextIdx]);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIdx);
        setInput(commandHistory[nextIdx]);
      }
      return;
    }

    if (e.key === "Enter" && input.trim() !== "") {
      const currentPrompt = engine.getCurrentPrompt();
      const result = engine.processCommand(input);

      setHistory((prev) => [
        ...prev,
        { prompt: currentPrompt, cmd: input, ...result }
      ]);
      setCommandHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);
      setInput("");
      onCommand();
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, engine?.isCompleted]);

  const challenge = engine?.challenge;

  const handleClearTerminal = (e) => {
    e.stopPropagation();
    setHistory([]);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div 
      className="flex-1 bg-[#050811] text-slate-100 rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden cursor-text font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Professional Terminal Window Header */}
      <div className="bg-[#0b0f19] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-3">
          {/* Mac / Terminal Window Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
          </div>

          <div className="flex items-center gap-2 font-mono text-slate-400">
            <span className="text-sky-400 font-semibold">{challenge?.module || "Consola Serial"}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">ttyS0 · 115200 8-N-1 · VT100</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
            Nivel: {challenge?.id}
          </span>
          <button
            onClick={handleClearTerminal}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800 transition cursor-pointer"
            title="Limpiar buffer de la terminal"
          >
            Limpiar pantalla
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1 text-[13px] leading-relaxed select-text">
        {/* Connection banner */}
        <div className="mb-4 pb-3 border-b border-slate-800/60 text-xs text-slate-400 select-none">
          <p className="text-slate-200 font-semibold font-sans mb-1 text-sm">
            {challenge?.title}
          </p>
          <p className="text-slate-400 font-sans text-xs mb-2">
            {challenge?.description}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            Soporta atajos de consola de red estándar (ej. <span className="text-slate-300 font-semibold">conf t</span>, <span className="text-slate-300 font-semibold">int fa0</span>, <span className="text-slate-300 font-semibold">wr</span>, <span className="text-slate-300 font-semibold">p 4</span>). Usa <span className="text-slate-300 font-semibold">↑ / ↓</span> para historial.
          </p>
        </div>

        {/* Command stream */}
        {history.map((h, i) => (
          <div key={i} className="leading-snug">
            <div className="flex gap-2 items-center">
              <span className="text-sky-400 font-semibold select-none">{h.prompt}</span>
              <span className="text-slate-100">{h.cmd}</span>
              {h.success && (
                <span className="text-emerald-500 text-[11px] font-mono select-none font-semibold ml-1">✓</span>
              )}
            </div>
            {h.output && (
              <div className="text-rose-400 text-xs ml-4 my-1 font-mono">
                {h.output}
              </div>
            )}
          </div>
        ))}

        {/* Input prompt */}
        {!engine.isCompleted && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sky-400 font-semibold select-none whitespace-nowrap">
              {engine.getCurrentPrompt()}
            </span>
            <input
              ref={inputRef}
              autoFocus
              className="flex-1 bg-transparent outline-none text-slate-100 font-mono caret-sky-400"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              autoComplete="off"
            />
          </div>
        )}

        {/* Formal Lab Completion Card */}
        {engine.isCompleted && (
          <div className="mt-5 p-4 rounded-lg bg-[#0b1322] border border-slate-700/80 shadow-lg select-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <h4 className="text-sm font-semibold text-slate-100 font-sans tracking-wide">
                    Desafío Completado Correctamente
                  </h4>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Se validaron todos los parámetros y estados de configuración requeridos para este nivel.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestartChallenge();
                  }}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer border border-slate-700"
                >
                  Reiniciar Desafío
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNextChallenge();
                  }}
                  className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Siguiente Nivel</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
