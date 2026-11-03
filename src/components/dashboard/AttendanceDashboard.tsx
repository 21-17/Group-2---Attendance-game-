import React from 'react';
import { AttendanceRecord, Employee } from '../../types';
import { AttendanceMetrics } from './AttendanceMetrics';
import { ArrivalChart } from './ArrivalChart';
import { AttendanceTable } from './AttendanceTable';
import { Play, Sparkles } from 'lucide-react';

interface AttendanceDashboardProps {
  records: AttendanceRecord[];
  employees: Employee[];
  onStartRaceClick: () => void;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({
  records,
  onStartRaceClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Summary */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="relative h-44 sm:h-52 w-full overflow-hidden">
          <img
            src="/src/assets/images/corporate_car_race_banner_1793668128012.jpg"
            alt="Corporate morning race toward headquarters"
            className="w-full h-full object-cover object-center brightness-60"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          
          <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Attendance & Punctuality Analytics Center</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Morning Arrival & Punctuality Reports
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Attendance entries are automatically recorded when employees complete the 1-minute car obstacle race toward corporate headquarters (Official entry cutoff: 8:00 AM).
              </p>
            </div>

            <button
              onClick={onStartRaceClick}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/20 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto shrink-0"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Log New Check-In</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <AttendanceMetrics records={records} />

      {/* Arrival Distribution & Department Analytics */}
      <ArrivalChart records={records} />

      {/* Detailed Attendance Records Table */}
      <AttendanceTable records={records} />
    </div>
  );
};
