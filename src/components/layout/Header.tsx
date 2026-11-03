import React from 'react';
import { ActiveTab } from '../../types';
import { Volume2, VolumeX, Car, FileSpreadsheet, Users } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentTimeString: string;
  onQuickStartGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isMuted,
  onToggleMute,
  currentTimeString,
  onQuickStartGame,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onTabChange('PLAY_RACE')} 
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap block">
                AutoCheck 8:00 AM
              </span>
              <span className="text-[11px] text-slate-400 block whitespace-nowrap">
                Corporate Attendance
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
          <button
            onClick={() => onTabChange('PLAY_RACE')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'PLAY_RACE'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Race Track</span>
          </button>

          <button
            onClick={() => onTabChange('ATTENDANCE_REPORTS')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'ATTENDANCE_REPORTS'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Reports & Metrics</span>
          </button>

          <button
            onClick={() => onTabChange('EMPLOYEES')}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'EMPLOYEES'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Roster</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
            <span className="text-slate-400">Time:</span>
            <span className="font-mono font-semibold text-amber-400 tabular-nums">{currentTimeString}</span>
          </div>

          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {activeTab !== 'PLAY_RACE' && (
            <button
              onClick={onQuickStartGame}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              Clock In Now
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
