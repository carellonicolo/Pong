import React, { useEffect, useRef } from 'react';
import { ThemeColors } from '@/types/game';

interface VictoryScreenProps {
  winnerName: string;
  score1: number;
  score2: number;
  theme: ThemeColors;
  displayWidth: number;
  displayHeight: number;
  survivalStats?: {
    time: number;
    ballsAdded: number;
    rallies: number;
  };
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ 
  winnerName, score1, score2, theme, displayWidth, displayHeight, survivalStats
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    color: string; size: number; life: number; maxLife: number; rotation: number; rotSpeed: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = displayWidth * (window.devicePixelRatio || 1);
    canvas.height = displayHeight * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const colors = [
      '0 80% 60%', '45 100% 55%', '120 70% 50%', 
      '200 90% 55%', '280 80% 60%', '330 90% 60%',
      theme.paddle1, theme.paddle2, theme.ball,
    ];

    // Burst confetti
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      const life = 120 + Math.random() * 80;
      particlesRef.current.push({
        x: displayWidth / 2,
        y: displayHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        life,
        maxLife: life,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    // Side cannons
    [0, displayWidth].forEach(sx => {
      for (let i = 0; i < 30; i++) {
        const angle = sx === 0 ? -Math.PI / 4 + Math.random() * Math.PI / 2 : Math.PI / 2 + Math.random() * Math.PI / 2;
        const speed = Math.random() * 6 + 2;
        const life = 100 + Math.random() * 60;
        particlesRef.current.push({
          x: sx,
          y: displayHeight * 0.3 + Math.random() * displayHeight * 0.4,
          vx: Math.cos(angle) * speed * (sx === 0 ? 1 : -1),
          vy: Math.sin(angle) * speed - 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 3 + Math.random() * 5,
          life,
          maxLife: life,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.15,
        });
      }
    });

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.12,
          vx: p.vx * 0.99,
          life: p.life - 1,
          rotation: p.rotation + p.rotSpeed,
        }))
        .filter(p => p.life > 0);

      particlesRef.current.forEach(p => {
        const alpha = Math.min(1, p.life / (p.maxLife * 0.3));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${p.color})`;
        // Draw rectangles for confetti look
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [displayWidth, displayHeight, theme]);

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none rounded-lg overflow-hidden"
      style={{ width: displayWidth, height: displayHeight }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: displayWidth, height: displayHeight }}
      />
      <div className="relative z-10 text-center animate-in zoom-in-75 fade-in duration-500">
        <div className="text-lg mb-2" style={{ color: `hsl(${theme.foreground} / 0.7)` }}>
          🏆 Vincitore
        </div>
        <div 
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ 
            color: `hsl(${theme.foreground})`,
            textShadow: theme.glow ? `0 0 30px hsl(${theme.glow})` : undefined,
          }}
        >
          {winnerName}
        </div>
        {survivalStats ? (
          <div className="space-y-2" style={{ color: `hsl(${theme.foreground} / 0.8)` }}>
            <div className="text-2xl font-mono">
              ⏱ {Math.floor(survivalStats.time / 60000)}:{String(Math.floor((survivalStats.time % 60000) / 1000)).padStart(2, '0')}
            </div>
            <div className="text-sm">
              Scambi: {survivalStats.rallies} · Palle extra: {survivalStats.ballsAdded}
            </div>
            <div className="text-sm">Vite perse: {score2}</div>
          </div>
        ) : (
          <div 
            className="text-2xl font-mono"
            style={{ color: `hsl(${theme.foreground} / 0.8)` }}
          >
            {score1} — {score2}
          </div>
        )}
        <div className="mt-6 text-sm" style={{ color: `hsl(${theme.foreground} / 0.5)` }}>
          SPAZIO per rigiocare
        </div>
      </div>
    </div>
  );
};
