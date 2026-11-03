import React, { useState, useEffect, useMemo } from 'react';
import {
  Employee,
  AttendanceRecord,
  ActiveTab,
  TimeSimulationConfig,
} from './types';
import {
  loadEmployees,
  saveEmployees,
  loadRecords,
  saveRecords,
  getSavedSelectedEmployeeId,
  setSavedSelectedEmployeeId,
  calculatePunctuality,
} from './services/storage';
import { sounds } from './services/sound';
import { Header } from './components/layout/Header';
import { TimeSimulatorBar } from './components/common/TimeSimulatorBar';
import { EmployeeSelector } from './components/employee/EmployeeSelector';
import { NewEmployeeModal } from './components/employee/NewEmployeeModal';
import { CarRacingGame } from './components/game/CarRacingGame';
import { ArrivalResultModal } from './components/game/ArrivalResultModal';
import { AttendanceDashboard } from './components/dashboard/AttendanceDashboard';
import { EmployeeList } from './components/employee/EmployeeList';
import { ShieldCheck, Flag } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('PLAY_RACE');

  // Audio mute
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());

  // Employees & Records
  const [employees, setEmployees] = useState<Employee[]>(() => loadEmployees());
  const [records, setRecords] = useState<AttendanceRecord[]>(() => loadRecords(employees));

  // Active Employee selection
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    const saved = getSavedSelectedEmployeeId();
    if (saved && employees.some((e) => e.id === saved)) return saved;
    return employees[0]?.id || 'emp-101';
  });

  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmployeeId) || employees[0];
  }, [employees, selectedEmployeeId]);

  // Modals
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [recentCompletedRecord, setRecentCompletedRecord] = useState<AttendanceRecord | null>(null);

  // Time simulation (Default to 07:56 AM so first game lands on-time)
  const [timeConfig, setTimeConfig] = useState<TimeSimulationConfig>({
    useRealTime: false,
    simulatedHour: 7,
    simulatedMinute: 56,
  });

  // Clock string display
  const [currentTimeString, setCurrentTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      if (timeConfig.useRealTime) {
        const now = new Date();
        const p = calculatePunctuality(now.getHours(), now.getMinutes());
        setCurrentTimeString(p.timeString);
      } else {
        const p = calculatePunctuality(timeConfig.simulatedHour, timeConfig.simulatedMinute);
        setCurrentTimeString(p.timeString);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeConfig]);

  // Handlers
  const handleToggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setSavedSelectedEmployeeId(emp.id);
  };

  const handleCarColorChange = (newColor: string) => {
    const updated = employees.map((emp) =>
      emp.id === selectedEmployee.id ? { ...emp, carColor: newColor } : emp
    );
    setEmployees(updated);
    saveEmployees(updated);
  };

  const handleCarModelChange = (newModel: string) => {
    const updated = employees.map((emp) =>
      emp.id === selectedEmployee.id ? { ...emp, carModel: newModel } : emp
    );
    setEmployees(updated);
    saveEmployees(updated);
  };

  const handleSaveNewEmployee = (newEmp: Employee) => {
    const updated = [newEmp, ...employees];
    setEmployees(updated);
    saveEmployees(updated);
    setSelectedEmployeeId(newEmp.id);
    setSavedSelectedEmployeeId(newEmp.id);
  };

  const handleFinishRace = (newRecord: AttendanceRecord) => {
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    saveRecords(updatedRecords);
    setRecentCompletedRecord(newRecord);
  };

  const handleSelectEmployeeToRace = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setSavedSelectedEmployeeId(emp.id);
    setActiveTab('PLAY_RACE');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        currentTimeString={currentTimeString}
        onQuickStartGame={() => setActiveTab('PLAY_RACE')}
      />

      {/* Time & Punctuality Simulation Bar */}
      <TimeSimulatorBar
        config={timeConfig}
        onChangeConfig={setTimeConfig}
        currentTimeString={currentTimeString}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'PLAY_RACE' && (
          <div className="space-y-6">
            {/* Top Instructional Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Gamified Attendance Check-In</h2>
                  <p className="text-slate-400 text-[11px]">
                    Race to corporate headquarters in 1 minute while competing against coworkers and dodging sky hazards. Checking in at or before 8:00 AM counts as <span className="text-emerald-400 font-semibold">On Time</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="text-slate-400">Official Cutoff:</span>
                <span className="font-mono font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-xs">
                  08:00 AM
                </span>
              </div>
            </div>

            {/* Split Grid: Left = Employee/Vehicle Selection, Right = Game Viewport */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Employee & Car Customization Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <EmployeeSelector
                  employees={employees}
                  selectedEmployee={selectedEmployee}
                  onSelectEmployee={handleSelectEmployee}
                  onOpenNewEmployeeModal={() => setIsNewEmployeeModalOpen(true)}
                  onColorChange={handleCarColorChange}
                  onModelChange={handleCarModelChange}
                />

                {/* Instructions & Game Rules card */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-3">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Race Rules & Attendance Policy</span>
                  </h4>

                  <ul className="space-y-2 text-slate-400 text-[11px] list-disc list-inside">
                    <li>
                      <strong className="text-slate-200">Time Limit:</strong> Exactly 1 minute (60s) to navigate highway traffic and reach corporate offices.
                    </li>
                    <li>
                      <strong className="text-slate-200">Competition:</strong> 7 coworkers are on the track; overtake them for bonus score and a higher final standing.
                    </li>
                    <li>
                      <strong className="text-slate-200">Sky Hazards:</strong> Watch for ground warning circles when meteorites and heavy cargo fall from above.
                    </li>
                    <li>
                      <strong className="text-slate-200">08:00 AM Cutoff:</strong> Passing the finish gate logs the exact timestamp and computes your punctuality record.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Game Arena (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <CarRacingGame
                  key={`${selectedEmployee.id}-${selectedEmployee.carColor}-${selectedEmployee.carModel}`}
                  employee={selectedEmployee}
                  simulatedTime={{
                    hour: timeConfig.simulatedHour,
                    minute: timeConfig.simulatedMinute,
                    useRealTime: timeConfig.useRealTime,
                  }}
                  onFinishRace={handleFinishRace}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ATTENDANCE_REPORTS' && (
          <AttendanceDashboard
            records={records}
            employees={employees}
            onStartRaceClick={() => setActiveTab('PLAY_RACE')}
          />
        )}

        {activeTab === 'EMPLOYEES' && (
          <EmployeeList
            employees={employees}
            records={records}
            onOpenNewModal={() => setIsNewEmployeeModalOpen(true)}
            onSelectToRace={handleSelectEmployeeToRace}
          />
        )}
      </main>

      {/* New Employee Modal */}
      <NewEmployeeModal
        isOpen={isNewEmployeeModalOpen}
        onClose={() => setIsNewEmployeeModalOpen(false)}
        onSave={handleSaveNewEmployee}
      />

      {/* Arrival Result Modal */}
      {recentCompletedRecord && (
        <ArrivalResultModal
          record={recentCompletedRecord}
          onPlayAgain={() => {
            setRecentCompletedRecord(null);
            setActiveTab('PLAY_RACE');
          }}
          onGoToReports={() => {
            setRecentCompletedRecord(null);
            setActiveTab('ATTENDANCE_REPORTS');
          }}
        />
      )}
    </div>
  );
}
