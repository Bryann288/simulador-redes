import React, { useState } from "react";
import { PRESET_PROFILES, generateRandomProfile } from "../core/NetworkConfigManager";

export function ExamConfigModal({ isOpen, onClose, activeConfig, onApplyConfig }) {
  const [selectedPresetId, setSelectedPresetId] = useState("default");
  const [formConfig, setFormConfig] = useState(activeConfig);
  const [activeTab, setActiveTab] = useState("presets"); // 'presets' | 'custom'

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setFormConfig(preset.config);
  };

  const handleRandomize = () => {
    const randomProf = generateRandomProfile();
    setSelectedPresetId(randomProf.id);
    setFormConfig(randomProf.config);
  };

  const handleChange = (key, val) => {
    setFormConfig((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    onApplyConfig(formConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn font-sans">
      <div className="bg-[#0b1220] border border-slate-700/80 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#070b14] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase font-mono">
              Plan de Direccionamiento IP & Segmentación de Red
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Parámetros de subredes, gateways y enlaces WAN para evaluación técnica.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded hover:bg-slate-800 transition cursor-pointer text-base"
          >
            ✕
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-3 flex items-center justify-between border-b border-slate-800 bg-[#090e1a]">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("presets")}
              className={`pb-2.5 text-xs font-semibold transition border-b-2 cursor-pointer ${
                activeTab === "presets"
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Escenarios Estandarizados
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`pb-2.5 text-xs font-semibold transition border-b-2 cursor-pointer ${
                activeTab === "custom"
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Asignación Manual (Parámetros del Docente)
            </button>
          </div>

          <button
            onClick={handleRandomize}
            className="mb-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
            title="Generar nuevas subredes aleatorias para practicar"
          >
            <span>⚅</span>
            <span>Generar Aleatorio</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === "presets" ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Selecciona una plantilla de direccionamiento según el tipo de ejercicio:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_PROFILES.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? "bg-sky-950/40 border-sky-500/80 shadow-md ring-1 ring-sky-500/40"
                          : "bg-[#070b14] border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-100">{preset.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Active Overview */}
              <div className="mt-4 p-3.5 rounded-lg bg-[#070b14] border border-slate-800 text-xs font-mono text-slate-300">
                <div className="text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                  Resumen del Esquema Activo:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>• LAN Cisco: <span className="text-slate-100 font-semibold">{formConfig.ciscoLanNet}</span> (GW: {formConfig.ciscoLanGw}, VLAN {formConfig.ciscoVlan})</div>
                  <div>• LAN Teldat: <span className="text-slate-100 font-semibold">{formConfig.teldatLanNet}</span> (GW: {formConfig.teldatLanGw}, VLAN {formConfig.teldatVlan})</div>
                  <div className="col-span-2">• Enlace WAN: <span className="text-slate-100 font-semibold">{formConfig.wanNet}/30</span> ({formConfig.wanCiscoIp} ⮂ {formConfig.wanTeldatIp})</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Introduce los parámetros asignados por el docente para esta sesión de evaluación:
              </div>

              {/* Cisco Block */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-sky-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span>Segmento LAN 1 (Cisco 860VAE & Workstation PC1)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">Subred IP de Red</label>
                    <input
                      type="text"
                      value={formConfig.ciscoLanNet}
                      onChange={(e) => handleChange("ciscoLanNet", e.target.value)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">Máscara Subred</label>
                    <input
                      type="text"
                      value={formConfig.ciscoLanMask}
                      onChange={(e) => handleChange("ciscoLanMask", e.target.value)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">Gateway (IP SVI Router)</label>
                    <input
                      type="text"
                      value={formConfig.ciscoLanGw}
                      onChange={(e) => handleChange("ciscoLanGw", e.target.value)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">IP Host PC1</label>
                    <input
                      type="text"
                      value={formConfig.ciscoPcIp}
                      onChange={(e) => handleChange("ciscoPcIp", e.target.value)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">VLAN ID Asignada</label>
                    <input
                      type="number"
                      value={formConfig.ciscoVlan}
                      onChange={(e) => handleChange("ciscoVlan", parseInt(e.target.value, 10) || 100)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Teldat Block */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-amber-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Segmento LAN 2 (Teldat RS123 & Workstation PC2)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">Subred IP de Red</label>
                    <input
                      type="text"
                      value={formConfig.teldatLanNet}
                      onChange={(e) => handleChange("teldatLanNet", e.target.value)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">Máscara Subred</label>
                    <input
                      type="text"
                      value={formConfig.teldatLanMask}
                      onChange={(e) => handleChange("teldatLanMask", e.target.value)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">Gateway (Subinterfaz dot1q)</label>
                    <input
                      type="text"
                      value={formConfig.teldatLanGw}
                      onChange={(e) => handleChange("teldatLanGw", e.target.value)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">IP Host PC2</label>
                    <input
                      type="text"
                      value={formConfig.teldatPcIp}
                      onChange={(e) => handleChange("teldatPcIp", e.target.value)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">VLAN ID (802.1Q)</label>
                    <input
                      type="number"
                      value={formConfig.teldatVlan}
                      onChange={(e) => handleChange("teldatVlan", parseInt(e.target.value, 10) || 200)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* WAN Block */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-rose-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Enlace WAN Inter-Router (/30 Punto a Punto)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">IP WAN Cisco (Local)</label>
                    <input
                      type="text"
                      value={formConfig.wanCiscoIp}
                      onChange={(e) => handleChange("wanCiscoIp", e.target.value)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-sans">IP WAN Teldat (Siguiente Salto)</label>
                    <input
                      type="text"
                      value={formConfig.wanTeldatIp}
                      onChange={(e) => handleChange("wanTeldatIp", e.target.value)}
                      className="w-full bg-[#0d1527] border border-slate-700 rounded p-1.5 text-slate-100 text-xs focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#070b14] border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Los comandos y la topología se actualizarán dinámicamente.
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded transition cursor-pointer shadow-sm"
            >
              Aplicar Parámetros de Red
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
