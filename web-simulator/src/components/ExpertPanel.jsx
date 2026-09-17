import React from "react";

export function ExpertPanel({ engine, onNextChallenge, onRestartChallenge }) {
  if (!engine) return <div className="p-6 text-gray-400">Selecciona un reto para comenzar.</div>;

  const challenge = engine.challenge;
  const currentStep = engine.currentStep;
  const totalSteps = challenge.steps.length;
  const isDone = engine.isCompleted;

  const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <aside className="w-96 bg-[#161b22] border-l border-gray-800 p-6 text-gray-200 flex flex-col gap-5 select-none overflow-y-auto">
      {/* Challenge Title & Badge */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
            {challenge.id}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {challenge.module}
          </span>
        </div>
        <h2 className="text-lg font-bold text-white leading-snug">
          {challenge.title}
        </h2>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          {challenge.description}
        </p>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-[#0d1117] p-4 rounded-xl border border-gray-800/90 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-cyan-400 font-semibold uppercase tracking-wider">Progreso del Reto</span>
          <span className="text-gray-400 font-mono font-medium">
            {isDone ? totalSteps : currentStep} / {totalSteps} ({percent}%)
          </span>
        </div>
        <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              isDone ? "bg-emerald-400 shadow-md shadow-emerald-500/50" : "bg-gradient-to-r from-cyan-500 to-blue-500"
            }`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      {/* Expert Hint */}
      <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-2">
          <span>📌</span>
          <span>Pista y Recomendación</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed font-mono">
          {engine.getHint()}
        </p>
      </div>

      {/* Theoretical Foundation */}
      <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-xl flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-2">
          <span>💡</span>
          <span>Fundamento Técnico (OSI / CLI)</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed flex-1 whitespace-pre-line">
          {engine.getExplanation()}
        </p>
      </div>

      {/* Actions footer when finished */}
      {isDone && (
        <div className="pt-2 border-t border-gray-800 flex flex-col gap-2">
          <button
            onClick={onNextChallenge}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Pasar al Siguiente Nivel</span>
            <span>➔</span>
          </button>
          <button
            onClick={onRestartChallenge}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-xs rounded-lg border border-gray-700 transition-all cursor-pointer"
          >
            Reintentar este Reto ⟲
          </button>
        </div>
      )}
    </aside>
  );
}
