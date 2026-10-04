import React from 'react';
import type { UserRole } from '../../types';
import { sound } from '../../utils/audio';
import { 
  Calendar, 
  Ticket, 
  ShieldCheck, 
  RotateCcw, 
  UserCheck, 
  Sliders 
} from 'lucide-react';

interface NavbarProps {
  currentView: 'events' | 'wallet' | 'admin';
  onChangeView: (view: 'events' | 'wallet' | 'admin') => void;
  userRole: UserRole;
  onToggleRole: () => void;
  activeUSN: string;
  ticketCount: number;
  onResetDemoData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onChangeView,
  userRole,
  onToggleRole,
  activeUSN,
  ticketCount,
  onResetDemoData,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#060709]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* JIT ACM Brand Logo */}
        <div
          onClick={() => {
            sound.playClick();
            onChangeView('events');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#8739D5] to-[#27FCF2] p-[1.5px] shadow-lg shadow-[#27FCF2]/10 transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#07090e]">
              <span className="font-mono text-sm font-black tracking-wider text-[#27FCF2]">
                ACM
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-tight text-white group-hover:text-[#27FCF2] transition">
                JITACM
              </span>
              <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-[#27FCF2]/10 text-[#27FCF2] border border-[#27FCF2]/30 font-bold">
                PORTAL
              </span>
            </div>
            <p className="font-mono text-[10px] text-mist/70 tracking-widest uppercase">
              EVENTS & TICKETING ENGINE
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface/50 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              sound.playClick();
              onChangeView('events');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition ${
              currentView === 'events'
                ? 'bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] shadow-md shadow-[#27FCF2]/20'
                : 'text-mist hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>DISCOVER EVENTS</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onChangeView('wallet');
            }}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition ${
              currentView === 'wallet'
                ? 'bg-gradient-to-r from-[#3064D0] to-[#27FCF2] text-[#060709] shadow-md shadow-[#27FCF2]/20'
                : 'text-mist hover:text-white hover:bg-white/5'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>MY PASSES</span>
            {ticketCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full font-mono text-[10px] font-black ${
                  currentView === 'wallet'
                    ? 'bg-black text-[#27FCF2]'
                    : 'bg-[#27FCF2] text-black'
                }`}
              >
                {ticketCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onChangeView('admin');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition ${
              currentView === 'admin'
                ? 'bg-gradient-to-r from-[#8739D5] to-[#3064D0] text-white shadow-md shadow-[#8739D5]/30'
                : 'text-mist hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>ORGANIZER PORTAL</span>
          </button>
        </nav>

        {/* Right Controls: Role Switcher & Persona */}
        <div className="flex items-center gap-3">
          {/* Active Attendee USN Pill (Only on student views) */}
          {currentView !== 'admin' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface/70 border border-white/10 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-[#27FCF2]" />
              <span className="font-mono text-mist text-[11px]">USN:</span>
              <span className="font-mono font-bold text-bone text-[11px]">{activeUSN}</span>
            </div>
          )}

          {/* Quick Role Toggle Button */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleRole();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-mono text-xs font-bold transition shadow-sm ${
              userRole === 'admin'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                : 'bg-surface border-white/15 text-bone hover:border-[#27FCF2]/50 hover:text-[#27FCF2]'
            }`}
            title="Toggle between Student Attendee and Chapter Organizer view"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {userRole === 'admin' ? 'ORGANIZER MODE' : 'STUDENT MODE'}
            </span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              sound.playClick();
              onResetDemoData();
            }}
            className="p-2 text-mist hover:text-white rounded-xl bg-surface hover:bg-surface-hover border border-white/10 transition"
            title="Reset platform to demo state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 py-2 px-4 bg-[#0a0c12]">
        <button
          onClick={() => onChangeView('events')}
          className={`flex items-center gap-1.5 font-mono text-xs py-1 px-2.5 rounded-lg ${
            currentView === 'events' ? 'text-[#27FCF2] font-bold bg-[#27FCF2]/10' : 'text-mist'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Events</span>
        </button>

        <button
          onClick={() => onChangeView('wallet')}
          className={`flex items-center gap-1.5 font-mono text-xs py-1 px-2.5 rounded-lg ${
            currentView === 'wallet' ? 'text-[#27FCF2] font-bold bg-[#27FCF2]/10' : 'text-mist'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Passes ({ticketCount})</span>
        </button>

        <button
          onClick={() => onChangeView('admin')}
          className={`flex items-center gap-1.5 font-mono text-xs py-1 px-2.5 rounded-lg ${
            currentView === 'admin' ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-mist'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};
