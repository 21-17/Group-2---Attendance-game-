import React from 'react';
import { AttendanceRecord } from '../../types';
import { CheckCircle2, Clock, Users, Flame, AlertTriangle } from 'lucide-react';

interface AttendanceMetricsProps {
  records: AttendanceRecord[];
}

export const AttendanceMetrics: React.FC<AttendanceMetricsProps> = ({ records }) => {
  const total = records.length;
  const onTimeCount = records.filter((r) => r.status === 'ON_TIME').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const punctualityRate = total > 0 ? Math.round((onTimeCount / total) * 100) : 100;

  const lateRecords = records.filter((r) => r.minutesLate > 0);
  const avgLateMinutes =
    lateRecords.length > 0
      ? Math.round(lateRecords.reduce((acc, r) => acc + r.minutesLate, 0) / lateRecords.length)
      : 0;

  const bestScore = records.reduce((max, r) => Math.max(max, r.gameStats?.score || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Metric 1: Punctuality Rate */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Punctuality Rate</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
            {punctualityRate}%
          </span>
          <span className="text-xs text-emerald-400 font-medium">
            (&le; 08:00 AM)
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${punctualityRate}%` }}
          />
        </div>
      </div>

      {/* Metric 2: Registrations Total */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Total Check-Ins</span>
          <Users className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
            {total}
          </span>
          <span className="text-xs text-slate-400">
            {onTimeCount} on time · {lateCount} late
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2.5">
          <span className="text-emerald-400 font-medium">{onTimeCount} punctual</span>
          <span aria-hidden="true">/</span>
          <span className="text-rose-400 font-medium">{lateCount} with delay</span>
        </div>
      </div>

      {/* Metric 3: Average Late Delay */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Average Late Delay</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
            {avgLateMinutes} <span className="text-sm font-sans text-slate-400">min</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2.5">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Among {lateCount} delayed employees</span>
        </div>
      </div>

      {/* Metric 4: Gamification Top Score */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Track Record</span>
          <Flame className="w-4 h-4 text-orange-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 tabular-nums">
            {bestScore} <span className="text-sm font-sans text-slate-400">pts</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2.5">
          <span>Race & Competition (1 min)</span>
        </div>
      </div>
    </div>
  );
};
