import React, { useEffect, useState } from 'react';

export const ColorAura: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.3 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {/* Creativeans Aurora Orb 1: Violet/Purple */}
      <div
        className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full opacity-20 blur-[130px] transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, #8739D5 0%, transparent 70%)',
          transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)`,
        }}
      />

      {/* Creativeans Aurora Orb 2: Royal Blue */}
      <div
        className="absolute top-1/3 -right-20 h-[600px] w-[600px] rounded-full opacity-25 blur-[140px] transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, #3064D0 0%, transparent 70%)',
          transform: `translate(${-mousePos.x * 50}px, ${mousePos.y * 50}px)`,
        }}
      />

      {/* Creativeans Aurora Orb 3: Neon Cyan / Tide */}
      <div
        className="absolute bottom-1/4 -left-20 h-[450px] w-[450px] rounded-full opacity-20 blur-[120px] transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, #27FCF2 0%, transparent 70%)',
          transform: `translate(${mousePos.x * 60}px, ${-mousePos.y * 60}px)`,
        }}
      />

      {/* Subtle cursor follower glow */}
      <div
        className="absolute h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-[80px] pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: `${mousePos.x * 100}%`,
          top: `${mousePos.y * 100}%`,
          background: 'radial-gradient(circle, #27FCF2 0%, #3064D0 40%, transparent 80%)',
        }}
      />

      {/* Grain texture overlay */}
      <div className="grain absolute inset-0 opacity-25" />
    </div>
  );
};
