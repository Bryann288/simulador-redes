import React, { useState, useRef, useEffect } from "react";
import { SandboxEngine } from "../core/SandboxEngine";

export function SandboxUI() {
  const [deviceType, setDeviceType] = useState("cisco");
  const [engine, setEngine] = useState(() => new SandboxEngine("cisco"));
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [auditReport, setAuditReport] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Switch active sandbox device
  const handleDeviceChange = (newDevice) => {
    setDeviceType(newDevice);
    const newEngine = new SandboxEngine(newDevice);
    setEngine(newEngine);
    setHistory([]);
    setInput("");
    setAuditReport(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      const currentPrompt = engine.getCurrentPrompt();
      const result = engine.processCommand(input);

      setHistory((prev) => [
        ...prev,
        { prompt: currentPrompt, cmd: input, ...result }
      ]);
      setInput("");

      // Live audit on command entry
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
    setAuditReport(null);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="flex-1 flex gap-5 overflow-hidden">
      {/* Terminal Sandbox */}
      <div 
        className="flex-1 bg-[#090d13] text-[#00ff88] p-5 font-mono overflow-y-auto rounded-xl border border-gray-800 shadow-2xl flex flex-col cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Sandbox Header */}
        <div className="mb-4 pb-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <h3 className="text-white text-xs font-bold uppercase tracking-wider">
                Modo Libre (Sandbox) - Consola Abierta
              </h3>
              <p className="text-gray-400 text-[11px]">
                Sin guión predeterminado. Prueba comandos libremente y audita tu configuración.
              </p>
            </div>
          </div>

          {/* Device Tabs inside Sandbox */}
          <div className="flex items-center gap-1.5 bg-[#111620] p-1 rounded-lg border border-gray-700">
            {[
              { id: "cisco", label: "Cisco IOS", icon: "🌐" },
              { id: "teldat", label: "Teldat CIT", icon: "📟" },
              { id: "datacom", label: "Datacom DmOS", icon: "🔀" }
            ].map((d) => (
              <button
                key={d.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeviceChange(d.id);
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  deviceType === d.id
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="mr-1">{d.icon}</span>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* History Stream */}
        <div className="flex-1 space-y-1">
          <div className="text-xs text-gray-500 mb-3">
            Simulador de consola interactivo. Ingresa comandos según el fabricante seleccionado ({deviceType.toUpperCase()}).
          </div>

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
                <pre className={`text-xs ml-4 my-1 p-2 rounded whitespace-pre-wrap font-mono ${
                  h.success 
                    ? "bg-gray-900/70 text-gray-300 border-l-2 border-cyan-500" 
                    : "bg-rose-950/30 text-rose-400 border-l-2 border-rose-500"
                }`}>
                  {h.output}
                </pre>
              )}
            </div>
          ))}

          {/* Active Input Line */}
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
              placeholder="escribe un comando libremente..."
            />
          </div>

          <div ref={endRef} />
        </div>

        {/* Action Bar */}
        <div className="pt-3 mt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
          <div className="text-gray-500">
            {history.length} comandos emitidos en esta sesión
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition cursor-pointer"
            >
              Reiniciar Consola ⟲
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                runAudit();
              }}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-md shadow-cyan-500/20 transition cursor-pointer"
            >
              Auditar Configuración ⚡
            </button>
          </div>
        </div>
      </div>

      {/* Dual Evaluation Sidebar */}
      <aside className="w-96 bg-[#161b22] border-l border-gray-800 p-5 text-gray-200 flex flex-col gap-4 select-none overflow-y-auto rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Evaluación Doble
            </h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Audita simultáneamente la <strong>sintaxis CLI</strong> y el <strong>orden lógico / buenas prácticas</strong> de tu configuración.
          </p>
        </div>

        {/* Score Card */}
        {auditReport ? (
          <div className="bg-[#0d1117] p-4 rounded-xl border border-gray-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Puntaje Metodológico:</span>
              <span className={`text-xl font-bold font-mono ${
                auditReport.score >= 80 ? "text-emerald-400" : auditReport.score >= 50 ? "text-amber-400" : "text-rose-400"
              }`}>
                {auditReport.score} / 100
              </span>
            </div>

            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-500 ${
                  auditReport.score >= 80 ? "bg-emerald-400" : auditReport.score >= 50 ? "bg-amber-400" : "bg-rose-500"
                }`}
                style={{ width: `${auditReport.score}%` }}
              ></div>
            </div>

            <div className="text-xs font-bold px-2.5 py-1 rounded text-center mb-3 bg-gray-800/80 border border-gray-700">
              ESTADO: <span className="text-cyan-400">{auditReport.rating}</span>
            </div>

            {/* Error List */}
            {auditReport.errors.length > 0 && (
              <div className="mb-3 space-y-1.5">
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <span>❌</span>
                  <span>Fallos de Orden Lógico:</span>
                </div>
                {auditReport.errors.map((err, idx) => (
                  <div key={idx} className="text-[11px] p-2 rounded bg-rose-950/30 border border-rose-500/30 text-rose-300 leading-relaxed">
                    {err}
                  </div>
                ))}
              </div>
            )}

            {/* Warning List */}
            {auditReport.warnings.length > 0 && (
              <div className="mb-3 space-y-1.5">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Observaciones y Buenas Prácticas:</span>
                </div>
                {auditReport.warnings.map((warn, idx) => (
                  <div key={idx} className="text-[11px] p-2 rounded bg-amber-950/30 border border-amber-500/30 text-amber-300 leading-relaxed">
                    {warn}
                  </div>
                ))}
              </div>
            )}

            {/* Achievements List */}
            {auditReport.achievements.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span>✅</span>
                  <span>Aciertos Reconocidos:</span>
                </div>
                {auditReport.achievements.map((ach, idx) => (
                  <div key={idx} className="text-[11px] p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 leading-relaxed">
                    {ach}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0d1117] p-4 rounded-xl border border-gray-800 text-center py-8">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-xs text-gray-400 mb-3">
              Ingresa comandos en la consola o presiona el botón para auditar tu configuración actual.
            </p>
            <button
              onClick={runAudit}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs rounded-lg shadow-md hover:from-cyan-500 hover:to-blue-500 transition cursor-pointer"
            >
              Auditar Ahora
            </button>
          </div>
        )}

        {/* Quick Cheatsheet by Device */}
        <div className="mt-auto bg-[#0d1117] p-3.5 rounded-xl border border-gray-800 text-xs text-gray-400">
          <div className="text-cyan-400 font-bold mb-1">
            💡 Reglas Críticas para {deviceType.toUpperCase()}:
          </div>
          {deviceType === "cisco" && (
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Siempre ejecuta <code>no shutdown</code> tras configurar la IP.</li>
              <li>Protege el modo privilegiado con <code>enable secret</code>.</li>
              <li>Crea la VLAN antes de asociarla al puerto de acceso.</li>
              <li>Guarda en NVRAM con <code>write memory</code> o <code>wr</code>.</li>
            </ul>
          )}
          {deviceType === "teldat" && (
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Navega al Proceso 4 con <code>* p 4</code> para configurar.</li>
              <li>Usa <code>save</code> para persistir en flash.</li>
              <li><strong>¡OBLIGATORIO!</strong> Ejecuta <code>restart</code> para cargar en la RAM activa.</li>
              <li>Audita en vivo en el Proceso 3 con <code>* p 3</code>.</li>
            </ul>
          )}
          {deviceType === "datacom" && (
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Entra a configuración con <code>conf</code>.</li>
              <li><strong>¡CRÍTICO!</strong> Remueve el puerto de VLAN 1 con <code>no set-member ethernet X/Y</code>.</li>
              <li>Asigna membresía untagged o tagged en la VLAN de destino.</li>
              <li>Guarda con <code>copy running-config startup-config</code>.</li>
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
