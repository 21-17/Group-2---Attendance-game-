import React, { useState, useMemo } from 'react';
import { AttendanceRecord, Department } from '../../types';
import { DEPARTMENTS, exportAttendanceToCSV } from '../../services/storage';
import {
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  ShieldAlert,
  Gauge,
  Printer,
} from 'lucide-react';

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');

  // Extract distinct dates
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.date));
    return Array.from(set).sort().reverse();
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || r.department === selectedDept;

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ON_TIME' && r.status === 'ON_TIME') ||
        (selectedStatus === 'LATE' && r.status === 'LATE');

      const matchesDate = selectedDate === 'ALL' || r.date === selectedDate;

      return matchesSearch && matchesDept && matchesStatus && matchesDate;
    });
  }, [records, searchTerm, selectedDept, selectedStatus, selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-4 sm:p-5">
      {/* Table Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Detailed Attendance Log</h3>
          <p className="text-xs text-slate-400">
            Displaying {filteredRecords.length} of {records.length} official company entries
          </p>
        </div>

        {/* Action Buttons: Export CSV & Print */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => exportAttendanceToCSV(filteredRecords)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors hover:text-white"
            title="Export to CSV spreadsheet for Excel or Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors hover:text-white"
            title="Print attendance report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by employee or title..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Dept Filter */}
        <div className="relative">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="ON_TIME">Only On Time (&le; 08:00 AM)</option>
            <option value="LATE">Only Late (&gt; 08:00 AM)</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Dates</option>
            {availableDates.map((d) => (
              <option key={d} value={d}>
                Date: {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800 uppercase tracking-wider">
              <th className="py-3 px-3.5">Employee</th>
              <th className="py-3 px-3.5">Department</th>
              <th className="py-3 px-3.5">Arrival Time</th>
              <th className="py-3 px-3.5">Status (8:00 AM Rule)</th>
              <th className="py-3 px-3.5">Race Performance</th>
              <th className="py-3 px-3.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r) => {
                const isOnTime = r.status === 'ON_TIME';

                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Employee */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.avatarUrl}
                          alt={r.employeeName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-white block truncate">
                            {r.employeeName}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {r.employeeRole}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3.5 text-slate-300">
                      <span>{r.department}</span>
                    </td>

                    {/* Arrival Time */}
                    <td className="py-3 px-3.5 font-mono">
                      <span className="font-bold text-white tabular-nums text-sm">
                        {r.timeString}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-sans">
                        Scheduled: {r.scheduledTime}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3.5">
                      {isOnTime ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>On Time</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>
                            Late <span className="font-mono font-bold">(+{r.minutesLate}m)</span>
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Game Stats */}
                    <td className="py-3 px-3.5 font-mono text-[11px]">
                      <div className="flex items-center gap-3 text-slate-300">
                        <span className="flex items-center gap-1" title="Race Score">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>{r.gameStats?.score || 0}</span>
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-1" title="Obstacles Dodged">
                          <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                          <span>{r.gameStats?.obstaclesDodged || 0}</span>
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-1" title="Max Speed">
                          <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{r.gameStats?.maxSpeedKmh || 0} km/h</span>
                        </span>
                        {r.gameStats?.finalPosition && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="text-amber-300 font-bold" title="Final Race Standing">
                              #{r.gameStats.finalPosition}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3.5 font-mono text-slate-400 tabular-nums">
                      {r.date}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <p className="text-sm font-medium">No attendance records found matching current filters.</p>
                  <p className="text-xs text-slate-600 mt-1">Try resetting search keywords or date range.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
