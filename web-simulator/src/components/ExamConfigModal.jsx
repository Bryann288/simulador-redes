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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#111620] border border-cyan-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-gray-900 via-cyan-950/50 to-gray-900 p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-xl shadow-inner">
              🎯
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Parámetros del Examen & Direccionamiento IP
              </h2>
              <p className="text-xs text-gray-400">
                Ajusta las subredes según lo que pida tu profesor o practica con IPs aleatorias.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="px-6 pt-4 flex items-center justify-between gap-3 border-b border-gray-800/80 bg-[#0d1117]">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("presets")}
              className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                activeTab === "presets"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Escenarios y Aleatorios
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                activeTab === "custom"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Personalizar IPs (Lo que pida el Profesor)
            </button>
          </div>

          <button
            onClick={handleRandomize}
            className="mb-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🎲</span>
            <span>Generar Aleatorio</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "presets" ? (
            <div className="space-y-3">
              <div className="text-xs text-gray-400">
                Selecciona uno de los escenarios típicos de evaluación:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_PROFILES.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50"
                          : "bg-[#0d1117] border-gray-800 hover:border-gray-700 hover:bg-gray-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{preset.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Current Active Summary Box */}
              <div className="mt-4 p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs font-mono">
                <div className="text-cyan-400 font-bold mb-2 font-sans flex items-center gap-1.5">
                  <span>📋</span>
                  <span>Esquema Seleccionado Actualmente:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-300 text-[11px]">
                  <div>• LAN Cisco: <span className="text-white font-bold">{formConfig.ciscoLanNet}</span> (GW: {formConfig.ciscoLanGw}, VLAN {formConfig.ciscoVlan})</div>
                  <div>• LAN Teldat: <span className="text-white font-bold">{formConfig.teldatLanNet}</span> (GW: {formConfig.teldatLanGw}, VLAN {formConfig.teldatVlan})</div>
                  <div className="col-span-2">• Enlace WAN: <span className="text-white font-bold">{formConfig.wanNet}</span> (Cisco: {formConfig.wanCiscoIp} ⮂ Teldat: {formConfig.wanTeldatIp})</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-gray-400">
                Escribe exactamente las direcciones IP y máscaras que tu profesor asignó para el examen:
              </div>

              {/* Cisco LAN Section */}
              <div className="p-4 rounded-xl bg-[#0d1117] border border-gray-800 space-y-3">
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                  <span>🌐</span>
                  <span>Segmento LAN Cisco (Cisco 860VAE + PC1)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">Subred LAN</label>
                    <input
                      type="text"
                      value={formConfig.ciscoLanNet}
                      onChange={(e) => handleChange("ciscoLanNet", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">Máscara de Red</label>
                    <input
                      type="text"
                      value={formConfig.ciscoLanMask}
                      onChange={(e) => handleChange("ciscoLanMask", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">Gateway (IP Router SVI)</label>
                    <input
                      type="text"
                      value={formConfig.ciscoLanGw}
                      onChange={(e) => handleChange("ciscoLanGw", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">IP Host PC1</label>
                    <input
                      type="text"
                      value={formConfig.ciscoPcIp}
                      onChange={(e) => handleChange("ciscoPcIp", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">VLAN ID</label>
                    <input
                      type="number"
                      value={formConfig.ciscoVlan}
                      onChange={(e) => handleChange("ciscoVlan", parseInt(e.target.value, 10) || 100)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Teldat LAN Section */}
              <div className="p-4 rounded-xl bg-[#0d1117] border border-gray-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <span>📟</span>
                  <span>Segmento LAN Teldat (Teldat RS123 + PC2)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">Subred LAN</label>
                    <input
                      type="text"
                      value={formConfig.teldatLanNet}
                      onChange={(e) => handleChange("teldatLanNet", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">Máscara de Red</label>
                    <input
                      type="text"
                      value={formConfig.teldatLanMask}
                      onChange={(e) => handleChange("teldatLanMask", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">Gateway (IP Subif)</label>
                    <input
                      type="text"
                      value={formConfig.teldatLanGw}
                      onChange={(e) => handleChange("teldatLanGw", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">IP Host PC2</label>
                    <input
                      type="text"
                      value={formConfig.teldatPcIp}
                      onChange={(e) => handleChange("teldatPcIp", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">VLAN ID (802.1Q)</label>
                    <input
                      type="number"
                      value={formConfig.teldatVlan}
                      onChange={(e) => handleChange("teldatVlan", parseInt(e.target.value, 10) || 200)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* WAN Link Section */}
              <div className="p-4 rounded-xl bg-[#0d1117] border border-gray-800 space-y-3">
                <div className="text-xs font-bold text-rose-400 flex items-center gap-2">
                  <span>⚡</span>
                  <span>Enlace WAN Inter-Router (Cisco ⮂ Teldat)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">IP WAN Cisco (Local)</label>
                    <input
                      type="text"
                      value={formConfig.wanCiscoIp}
                      onChange={(e) => handleChange("wanCiscoIp", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">IP WAN Teldat (Siguiente Salto)</label>
                    <input
                      type="text"
                      value={formConfig.wanTeldatIp}
                      onChange={(e) => handleChange("wanTeldatIp", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Los retos, pistas y topología se recalcularán automáticamente con estos valores.
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Aplicar Parámetros</span>
              <span>✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
