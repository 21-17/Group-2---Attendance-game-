import React from 'react';
import { Employee, AttendanceRecord } from '../../types';
import { Users, UserPlus, Car, Play, Mail } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  records: AttendanceRecord[];
  onOpenNewModal: () => void;
  onSelectToRace: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  records,
  onOpenNewModal,
  onSelectToRace,
}) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Company Employee Directory</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {employees.length} registered members on the official company roster. Each has an assigned corporate vehicle.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-transform active:scale-95 shadow-md shadow-amber-400/20 whitespace-nowrap self-start sm:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Grid of Employees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const empRecords = records.filter((r) => r.employeeId === emp.id);
          const onTimeCount = empRecords.filter((r) => r.status === 'ON_TIME').length;
          const punctualityPercent =
            empRecords.length > 0 ? Math.round((onTimeCount / empRecords.length) * 100) : 100;

          return (
            <div
              key={emp.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4"
            >
              {/* Profile Card Top */}
              <div className="flex items-start gap-3">
                <img
                  src={emp.avatarUrl}
                  alt={emp.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-slate-700 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white truncate">{emp.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {emp.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{emp.role}</p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 truncate">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle & Stats summary */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-amber-400" />
                    <span>Vehicle:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full border border-white/40"
                      style={{ backgroundColor: emp.carColor }}
                    />
                    <span className="font-medium text-slate-200">{emp.carModel}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Punctuality Record:</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    {punctualityPercent}% ({onTimeCount}/{empRecords.length})
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onSelectToRace(emp)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-700 hover:border-amber-400"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Race with {emp.name.split(' ')[0]}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
