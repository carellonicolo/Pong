import React, { useEffect, useRef } from 'react';

export const BouncingBall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const ball = { x: 100, y: 80, vx: 1.5, vy: 1, radius: 6 };
    const trail: { x: number; y: number; age: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off walls
      if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= w) {
        ball.vx *= -1;
        ball.x = Math.max(ball.radius, Math.min(w - ball.radius, ball.x));
      }
      if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= h) {
        ball.vy *= -1;
        ball.y = Math.max(ball.radius, Math.min(h - ball.radius, ball.y));
      }

      // Add to trail
      trail.push({ x: ball.x, y: ball.y, age: 0 });
      if (trail.length > 25) trail.shift();

      // Get foreground color from CSS
      const style = getComputedStyle(canvas);
      const fg = style.getPropertyValue('--foreground').trim();

      // Draw trail
      trail.forEach((point, i) => {
        point.age++;
        const opacity = ((i + 1) / trail.length) * 0.06;
        const size = ball.radius * ((i + 1) / trail.length);
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${fg} / ${opacity})`;
        ctx.fill();
      });

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${fg} / 0.08)`;
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};
