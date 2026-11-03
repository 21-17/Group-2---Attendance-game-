import React from 'react';
import { AttendanceRecord, Department } from '../../types';
import { DEPARTMENTS } from '../../services/storage';
import { BarChart3, PieChart } from 'lucide-react';

interface ArrivalChartProps {
  records: AttendanceRecord[];
}

export const ArrivalChart: React.FC<ArrivalChartProps> = ({ records }) => {
  // Group by arrival time bracket without the 'Early' category
  const timeBuckets = {
    onTime: { label: 'On time (≤ 08:00 AM)', count: 0, color: 'bg-emerald-400' },
    slightLate: { label: '08:01 - 08:15 AM (Minor delay)', count: 0, color: 'bg-amber-400' },
    veryLate: { label: '> 08:15 AM (Major delay)', count: 0, color: 'bg-rose-500' },
  };

  records.forEach((r) => {
    const match = r.timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;

      const totalMins = h * 60 + m;
      if (totalMins <= 8 * 60) {
        timeBuckets.onTime.count += 1;
      } else if (totalMins <= 8 * 60 + 15) {
        timeBuckets.slightLate.count += 1;
      } else {
        timeBuckets.veryLate.count += 1;
      }
    } else {
      if (r.status === 'ON_TIME') {
        timeBuckets.onTime.count += 1;
      } else {
        timeBuckets.slightLate.count += 1;
      }
    }
  });

  const maxBucketCount = Math.max(
    1,
    timeBuckets.onTime.count,
    timeBuckets.slightLate.count,
    timeBuckets.veryLate.count
  );

  // Department punctuality breakdown
  const deptStats: Record<Department, { total: number; onTime: number }> = {
    Engineering: { total: 0, onTime: 0 },
    Operations: { total: 0, onTime: 0 },
    Sales: { total: 0, onTime: 0 },
    'Human Resources': { total: 0, onTime: 0 },
    Finance: { total: 0, onTime: 0 },
    Design: { total: 0, onTime: 0 },
  };

  records.forEach((r) => {
    if (deptStats[r.department]) {
      deptStats[r.department].total += 1;
      if (r.status === 'ON_TIME') {
        deptStats[r.department].onTime += 1;
      }
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Chart 1: Arrival Time Distribution */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Arrival Time Distribution</h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Cutoff: 08:00 AM</span>
        </div>

        <div className="space-y-3 pt-1">
          {Object.entries(timeBuckets).map(([key, bucket]) => {
            const percent = Math.round((bucket.count / maxBucketCount) * 100);
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{bucket.label}</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {bucket.count} <span className="text-[11px] font-normal text-slate-400">employees</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${bucket.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Punctuality by Department */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-bold text-white">Compliance by Department</h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">% on time</span>
        </div>

        <div className="space-y-3 pt-1">
          {DEPARTMENTS.map((dept) => {
            const stat = deptStats[dept];
            const rate = stat.total > 0 ? Math.round((stat.onTime / stat.total) * 100) : 100;
            const barColor =
              rate >= 80 ? 'bg-emerald-400' : rate >= 50 ? 'bg-amber-400' : 'bg-rose-400';

            return (
              <div key={dept} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{dept}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 text-[11px] tabular-nums">
                      ({stat.onTime}/{stat.total})
                    </span>
                    <span className="font-bold text-white tabular-nums">{rate}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${barColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
