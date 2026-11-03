import React from 'react';
import { Gauge, Shield, Clock, Flag, Volume2, VolumeX, Pause, Play, Trophy, AlertTriangle } from 'lucide-react';

interface GameHUDProps {
  timeLeftSec: number;
  totalTimeSec: number;
  distanceRemainingM: number;
  totalDistanceM: number;
  speedKmh: number;
  score: number;
  obstaclesDodged: number;
  health: number; // 0 to 100
  position: number;
  totalRacers: number;
  hasSkyWarning: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  employeeName: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  timeLeftSec,
  distanceRemainingM,
  totalDistanceM,
  speedKmh,
  score,
  obstaclesDodged,
  health,
  position,
  totalRacers,
  hasSkyWarning,
  isMuted,
  onToggleMute,
  isPaused,
  onTogglePause,
  employeeName,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, ((totalDistanceM - distanceRemainingM) / totalDistanceM) * 100));

  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 pointer-events-none select-none">
      {/* Top Bar Status Cards */}
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
        {/* Left: Driver & Timer */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 shrink-0 ${timeLeftSec <= 10 ? 'text-rose-400 animate-pulse' : timeLeftSec <= 25 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 block leading-tight">Time Limit: 1 Min</span>
                  {timeLeftSec <= 10 && (
                    <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider animate-pulse">
                      Final!
                    </span>
                  )}
                </div>
                <span className={`font-mono text-base sm:text-lg font-bold tabular-nums ${
                  timeLeftSec <= 10 ? 'text-rose-400 animate-pulse' : timeLeftSec <= 25 ? 'text-amber-300' : 'text-white'
                }`}>
                  {formatTime(timeLeftSec)}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-700/80" />

            {/* Race Standing Position */}
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Position</span>
                <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 tabular-nums">
                  #{position} <span className="text-[10px] text-slate-400 font-normal">of {totalRacers}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Distance Progress Bar to Headquarters & Sky Hazard Alert */}
        <div className="flex-1 max-w-xs hidden md:flex flex-col gap-1 items-center">
          <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Flag className="w-3 h-3 text-amber-400" />
                <span>Distance to HQ</span>
              </span>
              <span className="font-mono text-amber-300 font-semibold tabular-nums">
                {Math.round(distanceRemainingM)} m
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {hasSkyWarning && (
            <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-bold animate-pulse shadow-md border border-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>DANGER: FALLING SKY HAZARDS!</span>
            </div>
          )}
        </div>

        {/* Right: Telemetry & Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Speed & Integrity */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Speed</span>
                <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums">
                  {Math.round(speedKmh)} <span className="text-[10px] font-normal text-slate-400">km/h</span>
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-700/80 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-1.5">
              <Shield className={`w-4 h-4 ${health > 40 ? 'text-sky-400' : 'text-rose-400'}`} />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Integrity</span>
                <span className="font-mono text-sm font-bold text-white tabular-nums">{Math.round(health)}%</span>
              </div>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl">
            <button
              onClick={onTogglePause}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleMute}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sky warning */}
      {hasSkyWarning && (
        <div className="md:hidden mt-2 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/90 text-white text-[10px] font-bold animate-pulse shadow-md border border-rose-400">
            <AlertTriangle className="w-3 h-3" />
            <span>Watch out: Object Falling!</span>
          </div>
        </div>
      )}
    </div>
  );
};
