import React from 'react';
import { ArrowLeft, ArrowRight, Zap, ShieldAlert } from 'lucide-react';

interface GameControlsOverlayProps {
  onSteerLeftStart: () => void;
  onSteerLeftEnd: () => void;
  onSteerRightStart: () => void;
  onSteerRightEnd: () => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  onBrakeStart: () => void;
  onBrakeEnd: () => void;
}

export const GameControlsOverlay: React.FC<GameControlsOverlayProps> = ({
  onSteerLeftStart,
  onSteerLeftEnd,
  onSteerRightStart,
  onSteerRightEnd,
  onBoostStart,
  onBoostEnd,
  onBrakeStart,
  onBrakeEnd,
}) => {
  return (
    <div className="absolute bottom-3 left-0 right-0 z-20 px-4 pointer-events-none select-none">
      <div className="max-w-3xl mx-auto flex items-end justify-between gap-4">
        {/* Left: Direction Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onPointerDown={onSteerLeftStart}
            onPointerUp={onSteerLeftEnd}
            onPointerLeave={onSteerLeftEnd}
            aria-label="Steer left"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-amber-500/80 backdrop-blur-md border border-slate-700/80 active:border-amber-400 text-white flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">&larr; A</span>
          </button>

          <button
            type="button"
            onPointerDown={onSteerRightStart}
            onPointerUp={onSteerRightEnd}
            onPointerLeave={onSteerRightEnd}
            aria-label="Steer right"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-amber-500/80 backdrop-blur-md border border-slate-700/80 active:border-amber-400 text-white flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            <ArrowRight className="w-6 h-6" />
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">D &rarr;</span>
          </button>
        </div>

        {/* Center: Keyboard Hint for Desktop */}
        <div className="hidden md:flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 pointer-events-auto">
          <span>Keys: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">A / &larr;</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">D / &rarr;</kbd> steer</span>
          <span aria-hidden="true">·</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">W / &uarr;</kbd> Nitro</span>
          <span aria-hidden="true">·</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">S / &darr;</kbd> Brake</span>
        </div>

        {/* Right: Nitro Boost & Brake Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onPointerDown={onBrakeStart}
            onPointerUp={onBrakeEnd}
            onPointerLeave={onBrakeEnd}
            aria-label="Brake"
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/85 active:bg-rose-900/80 backdrop-blur-md border border-slate-700/80 active:border-rose-400 text-slate-300 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">Brake</span>
          </button>

          <button
            type="button"
            onPointerDown={onBoostStart}
            onPointerUp={onBoostEnd}
            onPointerLeave={onBoostEnd}
            aria-label="Nitro Boost"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 active:from-amber-400 active:to-orange-500 text-slate-950 font-bold flex flex-col items-center justify-center shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
          >
            <Zap className="w-6 h-6 fill-slate-950" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">NITRO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
