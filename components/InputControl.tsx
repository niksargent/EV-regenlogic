import React from 'react';

interface InputControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
  description?: string;
}

export const InputControl: React.FC<InputControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  description
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-mono text-cyan-400">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-colors"
      />
      {description && (
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      )}
    </div>
  );
};

export const ToggleControl: React.FC<{
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  description?: string;
}> = ({ label, checked, onChange, description }) => {
  return (
    <div className="mb-4 flex flex-row items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors">
      <div className="flex flex-col pr-4">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        {description && <span className="text-xs text-slate-400 mt-1">{description}</span>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${checked ? 'bg-cyan-500' : 'bg-slate-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
};