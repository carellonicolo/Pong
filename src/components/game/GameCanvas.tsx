import React, { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { GameState, THEME_PRESETS, PowerUpType, GAME_WIDTH, GAME_HEIGHT } from '@/types/game';
import { useParticles } from '@/hooks/useParticles';

interface GameCanvasProps {
  gameState: GameState;
  displayWidth: number;
  displayHeight: number;
  onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onPaddleHit?: (x: number, y: number, color: string) => void;
  onWallHit?: (x: number, y: number) => void;
  onScore?: (x: number, y: number) => void;
}

const POWER_UP_COLORS: Record<PowerUpType, string> = {
  enlargePaddle: 'hsl(210, 100%, 50%)',
  shrinkOpponent: 'hsl(0, 80%, 50%)',
  slowBall: 'hsl(120, 70%, 45%)',
  speedBall: 'hsl(45, 100%, 50%)',
  multiBall: 'hsl(280, 80%, 55%)',
};

const POWER_UP_ICONS: Record<PowerUpType, string> = {
  enlargePaddle: '↕',
  shrinkOpponent: '↔',
  slowBall: '◐',
  speedBall: '⚡',
  multiBall: '◉',
};

export const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(({
  gameState,
  displayWidth,
  displayHeight,
  onMouseMove,
  onTouchMove,
}, ref) => {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const theme = THEME_PRESETS[gameState.config.theme];
  const { emitTrail, update: updateParticles, draw: drawParticles, particlesRef } = useParticles();
  const prevBallsRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);

  useImperativeHandle(ref, () => internalRef.current!);

  useEffect(() => {
    const canvas = internalRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const bufferWidth = Math.round(displayWidth * dpr);
    const bufferHeight = Math.round(displayHeight * dpr);

    if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
    }

    ctx.setTransform(bufferWidth / GAME_WIDTH, 0, 0, bufferHeight / GAME_HEIGHT, 0, 0);

    // Clear
    ctx.fillStyle = `hsl(${theme.background})`;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Center line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = `hsl(${theme.foreground} / 0.3)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(GAME_WIDTH / 2, 0);
    ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    const hasGlow = !!theme.glow;

    // Draw paddles
    gameState.players.forEach((player) => {
      const { paddle } = player;
      if (hasGlow) {
        ctx.shadowColor = `hsl(${paddle.color})`;
        ctx.shadowBlur = 15;
      }
      ctx.fillStyle = `hsl(${paddle.color})`;
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      ctx.shadowBlur = 0;
    });

    // Ball trail + particles
    if (!gameState.isPaused && !gameState.isGameOver) {
      gameState.balls.forEach((ball) => {
        emitTrail(ball.x, ball.y, theme.ball);
      });
    }

    // Update & draw particles
    updateParticles();
    drawParticles(ctx);

    // Draw balls
    gameState.balls.forEach((ball) => {
      if (hasGlow) {
        ctx.shadowColor = `hsl(${theme.ball})`;
        ctx.shadowBlur = 20;
      }
      ctx.fillStyle = `hsl(${theme.ball})`;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw power-ups
    gameState.powerUps.forEach((powerUp) => {
      if (!powerUp.active) return;
      const color = POWER_UP_COLORS[powerUp.type];
      const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
      const radius = 18 * pulse;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(POWER_UP_ICONS[powerUp.type], powerUp.x, powerUp.y);
    });

    // Draw scores
    ctx.font = 'bold 48px monospace';
    ctx.fillStyle = `hsl(${theme.foreground} / 0.3)`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(gameState.players[0].paddle.score.toString(), GAME_WIDTH / 4, 30);
    ctx.fillText(gameState.players[1].paddle.score.toString(), (GAME_WIDTH * 3) / 4, 30);

    // Draw player names
    ctx.font = '14px sans-serif';
    ctx.fillStyle = `hsl(${theme.foreground} / 0.5)`;
    ctx.fillText(gameState.players[0].nickname, GAME_WIDTH / 4, 85);
    ctx.fillText(gameState.players[1].nickname, (GAME_WIDTH * 3) / 4, 85);

    // Pause overlay (no game over overlay here — VictoryScreen handles it)
    if (gameState.isPaused && !gameState.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.fillStyle = `hsl(${theme.foreground})`;
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSA', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
      ctx.font = '18px sans-serif';
      ctx.fillText('SPAZIO per riprendere', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
    }

    prevBallsRef.current = gameState.balls.map(b => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy }));
  }, [gameState, theme, displayWidth, displayHeight, emitTrail, updateParticles, drawParticles]);

  return (
    <canvas
      ref={internalRef}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onTouchStart={(e) => e.preventDefault()}
      className="rounded-lg border border-border touch-none cursor-none"
      style={{
        width: displayWidth,
        height: displayHeight,
        boxShadow: theme.glow
          ? `0 0 30px hsl(${theme.glow} / 0.3)` 
          : undefined,
      }}
    />
  );
});

GameCanvas.displayName = 'GameCanvas';
