import React, { useEffect, useState, useCallback } from 'react';
import { Volume2, VolumeX, FastForward } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  playChime: () => void;
  playWelcomeVoice: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({
  onComplete,
  isMuted,
  onToggleMute,
  playChime,
  playWelcomeVoice,
}) => {
  const [phase, setPhase] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isExiting, setIsExiting] = useState(false);

  const completeBoot = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  }, [onComplete]);

  // Handle ESC key to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        completeBoot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [completeBoot]);

  // Boot orchestration
  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase(1);
      setLogs((prev) => [...prev, '> [SYS.INIT] BOOTING COMPUTATIONAL FIELD...']);
      playChime();
    }, 400);

    const t2 = setTimeout(() => {
      setPhase(2);
      setLogs((prev) => [...prev, '> [NET.CONNECT] JITACM NODE // ENCRYPTED LINK ESTABLISHED']);
    }, 1200);

    const t3 = setTimeout(() => {
      setPhase(3);
      setLogs((prev) => [...prev, '> [IDENTITY.RESOLVED] ASSOCIATION FOR COMPUTING MACHINERY']);
      playWelcomeVoice();
    }, 2100);

    const t4 = setTimeout(() => {
      setPhase(4);
      setLogs((prev) => [...prev, '> [STATUS] ACCESS GRANTED. WELCOME TO ACM FACE.']);
    }, 3100);

    const t5 = setTimeout(() => {
      completeBoot();
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [completeBoot, playChime, playWelcomeVoice]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050608] text-bone transition-opacity duration-700 select-none ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Controls: Audio & Skip */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 font-mono text-[11px] text-dim uppercase tracking-widest">
          <span className="h-2 w-2 rounded-full bg-[#27FCF2] animate-ping" />
          <span>BOOT_PROTOCOL: ACM.CORE.01</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-surface/50 px-3.5 py-1.5 text-xs text-mist backdrop-blur hover:border-white/30 hover:text-bone transition"
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-[#27FCF2]" />}
            <span className="font-mono">{isMuted ? 'MUTED' : 'VOICE ON'}</span>
          </button>

          <button
            onClick={completeBoot}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-surface/50 px-4 py-1.5 text-xs font-mono text-mist backdrop-blur hover:border-[#27FCF2]/50 hover:text-bone transition group"
          >
            <span>SKIP</span>
            <span className="text-[10px] text-dim group-hover:text-[#27FCF2]">[ESC]</span>
            <FastForward className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Computational Orbital Visualization */}
      <div className="relative flex items-center justify-center">
        {/* Orbital SVG rings */}
        <div className="relative h-72 w-72 sm:h-96 sm:w-96 flex items-center justify-center">
          {/* Outer ring */}
          <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 400 400">
            <circle
              cx="200"
              cy="200"
              r="180"
              fill="none"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <circle
              cx="200"
              cy="200"
              r="140"
              fill="none"
              stroke="rgba(39, 252, 242, 0.15)"
              strokeWidth="1"
              strokeDasharray="12 24"
            />
            <circle
              cx="200"
              cy="200"
              r="100"
              fill="none"
              stroke="rgba(135, 57, 213, 0.2)"
              strokeWidth="1"
              strokeDasharray="8 16"
            />
          </svg>

          {/* Central Monogram */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-[#0a0d14] shadow-2xl shadow-[#27FCF2]/20">
              <span className="font-mono text-xl font-black tracking-widest text-[#27FCF2]">
                ACM
              </span>
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-[#8739D5] to-[#27FCF2] opacity-30 blur-sm -z-10" />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-bone">
              ACM FACE
            </h1>
            <p className="font-mono text-[11px] text-mist tracking-widest uppercase mt-1">
              JIT CHAPTER // COMPUTATIONAL IDENTITY
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Terminal Logs */}
      <div className="mt-8 max-w-md w-full px-6 font-mono text-xs space-y-1.5 min-h-[90px]">
        <div className="flex items-center justify-between text-[10px] text-mist/60 mb-2 border-b border-white/5 pb-1">
          <span>SEQUENCE_STAGE</span>
          <span className="text-[#27FCF2]">STAGE 0{phase}/04</span>
        </div>
        {logs.map((log, idx) => (
          <div
            key={idx}
            className={`transition-opacity duration-300 ${
              idx === logs.length - 1 ? 'text-[#27FCF2]' : 'text-dim'
            }`}
          >
            {log}
          </div>
        ))}
      </div>

      {/* Bottom status */}
      <div className="absolute bottom-6 font-mono text-[10px] text-dim tracking-widest uppercase">
        ASSOCIATION FOR COMPUTING MACHINERY &bull; JIT STUDENT COMMUNITY
      </div>
    </div>
  );
};
