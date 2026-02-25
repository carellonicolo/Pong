import { useRef, useCallback } from 'react';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const useParticles = () => {
  const particlesRef = useRef<Particle[]>([]);

  const emit = useCallback((x: number, y: number, color: string, count: number, spread = 4, sizeRange: [number, number] = [2, 5]) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * spread + 1;
      const life = 30 + Math.random() * 30;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        color,
        size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
      });
    }
  }, []);

  const emitTrail = useCallback((x: number, y: number, color: string) => {
    if (Math.random() > 0.4) return; // Emit sparingly
    particlesRef.current.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: 15 + Math.random() * 10,
      maxLife: 25,
      color,
      size: 1.5 + Math.random() * 2,
    });
  }, []);

  const emitConfetti = useCallback((x: number, y: number, count: number) => {
    const colors = ['0 80% 60%', '45 100% 55%', '120 70% 50%', '200 90% 55%', '280 80% 60%', '330 90% 60%'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      const life = 60 + Math.random() * 60;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life,
        maxLife: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
      });
    }
  }, []);

  const update = useCallback(() => {
    particlesRef.current = particlesRef.current
      .map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.05, // gravity
        vx: p.vx * 0.98, // friction
        life: p.life - 1,
      }))
      .filter(p => p.life > 0);
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `hsl(${p.color})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }, []);

  return { emit, emitTrail, emitConfetti, update, draw, particlesRef };
};
