import React from "react";

export function ExpertPanel({ engine, onNextChallenge, onRestartChallenge }) {
  if (!engine) return <div className="p-6 text-slate-500 font-sans text-xs">Selecciona un desafío para inicializar la sesión.</div>;

  const challenge = engine.challenge;
  const currentStep = engine.currentStep;
  const totalSteps = challenge.steps.length;
  const isDone = engine.isCompleted;

  const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <aside className="w-96 bg-[#0c121e] border-l border-slate-800/80 p-5 text-slate-200 flex flex-col gap-4 select-none overflow-y-auto font-sans">
      {/* Header Info */}
      <div className="pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 font-mono text-[11px] font-semibold border border-sky-800/50">
            {challenge.id}
          </span>
          <span className="text-xs font-medium text-slate-400 font-mono">
            {challenge.module}
          </span>
        </div>
        <h2 className="text-sm font-bold text-slate-100 leading-snug">
          {challenge.title}
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {challenge.description}
        </p>
      </div>

      {/* Progress Rubric */}
      <div className="bg-[#070b14] p-3.5 rounded-lg border border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-semibold font-mono text-[11px] uppercase tracking-wider">
            Progreso de Evaluación
          </span>
          <span className="text-slate-400 font-mono text-xs">
            {isDone ? totalSteps : currentStep} / {totalSteps} pasos ({percent}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              isDone ? "bg-emerald-500" : "bg-sky-500"
            }`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      {/* Operational Hint / Directive */}
      <div className="bg-[#0b1322] border border-slate-800 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-2 font-mono uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          <span>Directiva de Configuración</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          {engine.getHint()}
        </p>
      </div>

      {/* Technical Rationale / Architecture Foundation */}
      <div className="bg-[#0a0f1d] border border-slate-800 p-4 rounded-lg flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs mb-2 font-mono uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          <span>Fundamento Técnico y Arquitectura</span>
        </div>
        <div className="text-xs text-slate-400 leading-relaxed flex-1 whitespace-pre-line font-sans">
          {engine.getExplanation()}
        </div>
      </div>

      {/* Action Footer */}
      {isDone && (
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          <button
            onClick={onNextChallenge}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg shadow transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Avanzar al Siguiente Nivel</span>
            <span>➔</span>
          </button>
          <button
            onClick={onRestartChallenge}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg border border-slate-700 transition cursor-pointer"
          >
            Reiniciar Desafío
          </button>
        </div>
      )}
    </aside>
  );
}
