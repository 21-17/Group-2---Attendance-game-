import React from 'react';
import { TimeSimulationConfig } from '../../types';
import { Clock, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TimeSimulatorBarProps {
  config: TimeSimulationConfig;
  onChangeConfig: (newConfig: TimeSimulationConfig) => void;
  currentTimeString: string;
}

export const TimeSimulatorBar: React.FC<TimeSimulatorBarProps> = ({
  config,
  onChangeConfig,
  currentTimeString,
}) => {
  const isPunctual = config.useRealTime 
    ? false
    : (config.simulatedHour < 8 || (config.simulatedHour === 8 && config.simulatedMinute === 0));

  const presets = [
    { label: '07:45 AM (On time)', hour: 7, minute: 45, onTime: true },
    { label: '07:58 AM (On time)', hour: 7, minute: 58, onTime: true },
    { label: '08:00 AM (Cutoff)', hour: 8, minute: 0, onTime: true },
    { label: '08:08 AM (+8 min)', hour: 8, minute: 8, onTime: false },
    { label: '08:25 AM (+25 min)', hour: 8, minute: 25, onTime: false },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Clock status & Rule badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Policy: 08:00 AM Entry</span>
          </div>

          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Assigned Race Check-In Time:</span>
            <span className="font-mono font-bold text-amber-300 tabular-nums px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
              {currentTimeString}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-[11px]">
            {isPunctual ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                On time (&le; 8:00 AM)
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Will log as Late (&gt; 8:00 AM)
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Simulation Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 hidden lg:inline">Simulate check-in hour:</span>
          
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {presets.map((preset) => {
              const isSelected = !config.useRealTime && config.simulatedHour === preset.hour && config.simulatedMinute === preset.minute;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChangeConfig({
                    useRealTime: false,
                    simulatedHour: preset.hour,
                    simulatedMinute: preset.minute
                  })}
                  className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                    isSelected
                      ? preset.onTime 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold shadow-xs' 
                        : 'bg-rose-950 text-rose-300 border border-rose-700/60 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => onChangeConfig({ ...config, useRealTime: !config.useRealTime })}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
                config.useRealTime
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Use current real device clock"
            >
              <Sliders className="w-3 h-3" />
              <span>Real Time</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
