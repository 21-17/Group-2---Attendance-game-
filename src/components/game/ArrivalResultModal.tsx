import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AttendanceRecord } from '../../types';
import { CheckCircle2, AlertTriangle, Trophy, Gauge, ShieldAlert, ArrowRight, RotateCcw, FileText } from 'lucide-react';

interface ArrivalResultModalProps {
  record: AttendanceRecord;
  onGoToReports: () => void;
  onPlayAgain: () => void;
}

export const ArrivalResultModal: React.FC<ArrivalResultModalProps> = ({
  record,
  onGoToReports,
  onPlayAgain,
}) => {
  const isOnTime = record.status === 'ON_TIME';

  useEffect(() => {
    if (isOnTime) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#ffffff']
        });
      } catch {
        // confetti fallback
      }
    }
  }, [isOnTime]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-slate-100 space-y-6">
        {/* Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700/80 mb-1 shadow-lg">
            {isOnTime ? (
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-9 h-9 text-rose-400" />
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Corporate Headquarters Reached!
          </h2>

          <p className="text-xs text-slate-400">
            1-minute race completed {record.gameStats.finalPosition ? `(Finished #${record.gameStats.finalPosition})` : ''}. Your attendance has been officially logged.
          </p>
        </div>

        {/* Punctuality Status Badge & Comparison */}
        <div
          className={`p-4 rounded-xl border text-center space-y-2 ${
            isOnTime
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold tracking-wide uppercase">
              {isOnTime ? 'Check-in Result: ON TIME' : 'Attendance Logged: LATE ARRIVAL'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm font-mono">
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Arrival Time:</span>
              <span className="text-xl font-bold text-white tabular-nums">{record.timeString}</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <span className="text-[11px] text-slate-400 block font-sans">Official Cutoff:</span>
              <span className="text-xl font-bold text-slate-300 tabular-nums">08:00 AM</span>
            </div>
          </div>

          <p className="text-xs font-sans text-slate-300">
            {isOnTime
              ? 'Great punctuality! You arrived on or before the official work start time.'
              : `You arrived ${record.minutesLate} minute${record.minutesLate === 1 ? '' : 's'} late past the 8:00 AM policy threshold.`}
          </p>
        </div>

        {/* Employee Summary */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <img
            src={record.avatarUrl}
            alt={record.employeeName}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full object-cover border border-amber-500/30"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white truncate">{record.employeeName}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {record.department}
              </span>
            </div>
            <span className="text-xs text-slate-400 truncate block">{record.employeeRole}</span>
          </div>
        </div>

        {/* Race Driving Stats */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Score</span>
            </div>
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {record.gameStats.score}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
              <span>Dodged</span>
            </div>
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {record.gameStats.obstaclesDodged}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Top Speed</span>
            </div>
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {record.gameStats.maxSpeedKmh} <span className="text-[10px] text-slate-400">km/h</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clock In Another Member</span>
          </button>

          <button
            onClick={onGoToReports}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-transform active:scale-95 shadow-md shadow-amber-400/20"
          >
            <FileText className="w-4 h-4" />
            <span>View Attendance Reports</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
