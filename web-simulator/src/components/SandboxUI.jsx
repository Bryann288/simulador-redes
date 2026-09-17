import React, { useState, useRef, useEffect } from "react";
import { SandboxEngine } from "../core/SandboxEngine";

export function SandboxUI() {
  const [deviceType, setDeviceType] = useState("cisco");
  const [engine, setEngine] = useState(() => new SandboxEngine("cisco"));
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [auditReport, setAuditReport] = useState(null);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  const handleDeviceChange = (newDevice) => {
    setDeviceType(newDevice);
    const newEngine = new SandboxEngine(newDevice);
    setEngine(newEngine);
    setHistory([]);
    setCommandHistory([]);
    setHistoryIndex(-1);
    setInput("");
    setAuditReport(null);
  };

  const handleKeyDown = (e) => {
    // Arrow Up / Down command history traversal
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

      // Re-run real-time audit
      setAuditReport(engine.evaluateConfiguration());
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const runAudit = () => {
    setAuditReport(engine.evaluateConfiguration());
  };

  const handleClear = () => {
    const newEngine = new SandboxEngine(deviceType);
    setEngine(newEngine);
    setHistory([]);
    setCommandHistory([]);
    setHistoryIndex(-1);
    setAuditReport(null);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="flex-1 flex gap-4 overflow-hidden font-sans">
      {/* Console Window */}
      <div 
        className="flex-1 bg-[#050811] text-slate-100 rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden cursor-text font-mono"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Window Header */}
        <div className="bg-[#0b0f19] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
              <span className="text-sky-400 font-semibold">Consola Abierta (Sandbox Libre)</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300">Auditoría Sintáctica & Lógica</span>
            </div>
          </div>

          {/* Device Tabs inside Sandbox */}
          <div className="flex items-center gap-1 bg-[#080d19] p-1 rounded-lg border border-slate-700/80">
            {[
              { id: "cisco", label: "Cisco IOS", desc: "860VAE" },
              { id: "teldat", label: "Teldat CIT", desc: "RS123" },
              { id: "datacom", label: "Datacom DmOS", desc: "SW1" }
            ].map((d) => (
              <button
                key={d.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeviceChange(d.id);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold font-mono transition cursor-pointer ${
                  deviceType === d.id
                    ? "bg-slate-800 text-sky-400 border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-1 text-[13px] select-text">
          <div className="text-xs text-slate-500 mb-3 border-b border-slate-800/60 pb-2">
            Sesión de consola sin restricciones. Configura interfaces, VLANs, rutas y persistencia para auditar tu procedimiento.
          </div>

          {history.map((h, i) => (
            <div key={i} className="leading-snug">
              <div className="flex gap-2 items-center">
                <span className="text-sky-400 font-semibold select-none">{h.prompt}</span>
                <span className="text-slate-100">{h.cmd}</span>
                {h.success && (
                  <span className="text-emerald-500 text-[11px] select-none font-semibold ml-1">✓</span>
                )}
              </div>
              {h.output && (
                <pre className={`text-xs ml-4 my-1 p-2 rounded whitespace-pre-wrap font-mono ${
                  h.success 
                    ? "bg-[#0b1322] text-slate-300 border-l-2 border-sky-500" 
                    : "bg-[#1c0e14] text-rose-300 border-l-2 border-rose-500"
                }`}>
                  {h.output}
                </pre>
              )}
            </div>
          ))}

          {/* Active Input Line */}
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
              placeholder="Introduce comandos (ej. configure terminal, * p 4, conf)..."
            />
          </div>

          <div ref={endRef} />
        </div>

        {/* Console Action Bar */}
        <div className="px-4 py-2.5 bg-[#0b0f19] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Total comandos emitidos: <span className="text-slate-200 font-mono font-semibold">{history.length}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition cursor-pointer text-xs"
            >
              Reiniciar Sesión
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                runAudit();
              }}
              className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded transition cursor-pointer text-xs"
            >
              Auditar Configuración
            </button>
          </div>
        </div>
      </div>

      {/* Audit & Compliance Panel */}
      <aside className="w-96 bg-[#0c121e] border-l border-slate-800/80 p-5 text-slate-200 flex flex-col gap-4 select-none overflow-y-auto rounded-xl">
        <div className="pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Auditoría Técnica en Vivo
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Evaluación simultánea de validez sintáctica y coherencia del orden lógico de configuración.
          </p>
        </div>

        {/* Audit Metrics */}
        {auditReport ? (
          <div className="bg-[#070b14] p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Índice de Cumplimiento:</span>
              <span className={`text-lg font-bold font-mono ${
                auditReport.score >= 80 ? "text-emerald-400" : auditReport.score >= 50 ? "text-amber-400" : "text-rose-400"
              }`}>
                {auditReport.score} / 100
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  auditReport.score >= 80 ? "bg-emerald-500" : auditReport.score >= 50 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${auditReport.score}%` }}
              ></div>
            </div>

            <div className="text-[11px] font-mono px-2 py-1 rounded text-center bg-slate-800/60 border border-slate-700 text-slate-300">
              Dictamen: <span className="text-sky-400 font-bold">{auditReport.rating}</span>
            </div>

            {/* Inconsistencies */}
            {auditReport.errors.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Inconsistencias Lógicas:</span>
                </div>
                {auditReport.errors.map((err, idx) => (
                  <div key={idx} className="text-[11px] p-2 rounded bg-rose-950/20 border border-rose-800/40 text-rose-300 leading-relaxed font-mono">
                    {err}
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {auditReport.warnings.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Observaciones de Arquitectura:</span>
                </div>
                {auditReport.warnings.map((warn, idx) => (
                  <div key={idx} className="text-[11px] p-2 rounded bg-amber-950/20 border border-amber-800/40 text-amber-300 leading-relaxed font-mono">
                    {warn}
                  </div>
                ))}
              </div>
            )}

            {/* Achievements */}
            {auditReport.achievements.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Configuraciones Validadas:</span>
                </div>
                {auditReport.achievements.map((ach, idx) => (
                  <div key={idx} className="text-[11px] p-2 rounded bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 leading-relaxed font-mono">
                    {ach}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#070b14] p-4 rounded-lg border border-slate-800 text-center py-6">
            <p className="text-xs text-slate-400 mb-3 font-sans">
              La consola auditará en tiempo real cada comando que emitas.
            </p>
            <button
              onClick={runAudit}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 transition cursor-pointer"
            >
              Auditar Estado Actual
            </button>
          </div>
        )}

        {/* Technical Directives Footer */}
        <div className="mt-auto bg-[#070b14] p-3 rounded-lg border border-slate-800 text-xs text-slate-400">
          <div className="text-slate-300 font-semibold mb-1 font-mono text-[11px]">
            Criterios de Evaluación ({deviceType.toUpperCase()}):
          </div>
          {deviceType === "cisco" && (
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400 font-mono">
              <li>IP asignada exige <code>no shutdown</code>.</li>
              <li>Protección con <code>enable secret</code>.</li>
              <li>VLAN creada antes de asignación.</li>
              <li>Persistencia con <code>write memory</code>.</li>
            </ul>
          )}
          {deviceType === "teldat" && (
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400 font-mono">
              <li>Proceso 4 (<code>* p 4</code>) para edición.</li>
              <li>Guardado con <code>save</code>.</li>
              <li><strong>Obligatorio:</strong> <code>restart</code> para activar en RAM.</li>
              <li>Verificación en Proceso 3 (<code>* p 3</code>).</li>
            </ul>
          )}
          {deviceType === "datacom" && (
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400 font-mono">
              <li>Acceso global con <code>conf</code>.</li>
              <li><strong>Obligatorio:</strong> <code>no set-member</code> en VLAN 1.</li>
              <li>Membresía tagged/untagged según el rol.</li>
              <li>Persistencia con <code>copy run start</code>.</li>
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
