import React from 'react';
import { Employee } from '../../types';
import { CAR_MODELS } from '../../services/storage';
import { UserCheck, Shield, Sparkles, UserPlus } from 'lucide-react';

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmployee: Employee;
  onSelectEmployee: (emp: Employee) => void;
  onOpenNewEmployeeModal: () => void;
  onColorChange: (color: string) => void;
  onModelChange: (model: string) => void;
}

const CAR_COLOR_PALETTES = [
  { name: 'Electric Sky', hex: '#38bdf8' },
  { name: 'Flame Orange', hex: '#f97316' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Neon Purple', hex: '#a855f7' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Cyber Yellow', hex: '#eab308' },
  { name: 'Magenta Pink', hex: '#ec4899' },
  { name: 'Titanium White', hex: '#f8fafc' },
];

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onOpenNewEmployeeModal,
  onColorChange,
  onModelChange,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Employee Picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Select Employee to Clock In</span>
          </label>

          <button
            type="button"
            onClick={onOpenNewEmployeeModal}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors hover:underline"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Employee</span>
          </button>
        </div>

        <select
          value={selectedEmployee.id}
          onChange={(e) => {
            const found = employees.find((emp) => emp.id === e.target.value);
            if (found) onSelectEmployee(found);
          }}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        >
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
              {emp.name} — {emp.role} ({emp.department})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Employee Card */}
      <div className="flex items-center gap-3.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
        <img
          src={selectedEmployee.avatarUrl}
          alt={selectedEmployee.name}
          referrerPolicy="no-referrer"
          className="w-12 h-12 rounded-full object-cover border border-amber-500/30 shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white truncate">{selectedEmployee.name}</h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700 shrink-0">
              {selectedEmployee.department}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">{selectedEmployee.role}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
            <span>{selectedEmployee.email}</span>
            <span aria-hidden="true">·</span>
            <span>ID: {selectedEmployee.id}</span>
          </div>
        </div>
      </div>

      {/* Car Customization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-800/80">
        {/* Model */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Company Vehicle</span>
          </label>
          <select
            value={selectedEmployee.carModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            {CAR_MODELS.map((model) => (
              <option key={model.id} value={model.id} className="bg-slate-900 text-white">
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Body Paint Finish</span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {CAR_COLOR_PALETTES.map((palette) => (
              <button
                key={palette.hex}
                type="button"
                onClick={() => onColorChange(palette.hex)}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                  selectedEmployee.carColor === palette.hex
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: palette.hex }}
                title={palette.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
