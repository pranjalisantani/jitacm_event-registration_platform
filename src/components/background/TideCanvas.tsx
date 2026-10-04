import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;
}

export const TideCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Particle nodes
    let particles: Particle[] = [];
    const colors = ['#27FCF2', '#3064D0', '#8739D5', '#ffffff'];

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor((width * height) / 14000), 120);

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.6 + 0.8,
          baseX: x,
          baseY: y,
          density: Math.random() * 20 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initParticles();

    let step = 0;

    // Render loop
    const render = () => {
      step += 0.006;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle fluid tide sine waves (Scrolltide motif)
      ctx.lineWidth = 1;
      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const baseHeight = height * (0.35 + w * 0.18);
        const waveColor = w === 0 
          ? 'rgba(39, 252, 242, 0.035)' 
          : w === 1 
          ? 'rgba(48, 100, 208, 0.03)' 
          : 'rgba(135, 57, 213, 0.025)';
        ctx.strokeStyle = waveColor;

        for (let x = 0; x < width; x += 15) {
          const y =
            baseHeight +
            Math.sin(x * 0.003 + step + w) * 45 +
            Math.cos(x * 0.006 - step * 0.8) * 25;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 2. Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Wave oscillation + base velocity
        p.x += p.vx + Math.cos(step + i) * 0.15;
        p.y += p.vy + Math.sin(step + i) * 0.15;

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse displacement
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          const force = (maxDistance - distance) / maxDistance;
          const directionX = forceDirectionX * force * p.density * 0.3;
          const directionY = forceDirectionY * force * p.density * 0.3;
          p.x -= directionX;
          p.y -= directionY;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.55;
        ctx.fill();

        // Connect nearby nodes with hairline vectors
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distNodes = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distNodes < 115) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#27FCF2';
            ctx.globalAlpha = (1 - distNodes / 115) * 0.12;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Scrolltide Ambient Glow */}
      <div className="tide-glow absolute inset-0" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(6,7,9,0.3),#060709_85%)]" />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#060709] to-transparent" />
    </div>
  );
};
