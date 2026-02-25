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
  shield: 'hsl(180, 80%, 50%)',
  invisiblePaddle: 'hsl(260, 60%, 65%)',
  reverseControls: 'hsl(30, 90%, 55%)',
};

// Draw power-up icon using canvas primitives
const drawPowerUpIcon = (ctx: CanvasRenderingContext2D, type: PowerUpType, x: number, y: number, size: number, time: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  const s = size * 0.45;

  switch (type) {
    case 'enlargePaddle': {
      // Expand arrows icon ↕
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(0, s);
      ctx.stroke();
      // Top arrow
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, -s * 0.5);
      ctx.lineTo(0, -s);
      ctx.lineTo(s * 0.5, -s * 0.5);
      ctx.stroke();
      // Bottom arrow
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, s * 0.5);
      ctx.lineTo(0, s);
      ctx.lineTo(s * 0.5, s * 0.5);
      ctx.stroke();
      break;
    }
    case 'shrinkOpponent': {
      // Compress arrows ↔ pointing inward
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(s, 0);
      ctx.stroke();
      // Left inward arrow
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, -s * 0.5);
      ctx.lineTo(-s, 0);
      ctx.lineTo(-s * 0.4, s * 0.5);
      ctx.stroke();
      // Right inward arrow
      ctx.beginPath();
      ctx.moveTo(s * 0.4, -s * 0.5);
      ctx.lineTo(s, 0);
      ctx.lineTo(s * 0.4, s * 0.5);
      ctx.stroke();
      break;
    }
    case 'slowBall': {
      // Turtle/slow: two horizontal lines (pause-like)
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.2);
      ctx.lineTo(s * 0.3, -s * 0.2);
      ctx.moveTo(-s * 0.3, s * 0.2);
      ctx.lineTo(s * 0.3, s * 0.2);
      ctx.stroke();
      break;
    }
    case 'speedBall': {
      // Lightning bolt ⚡
      ctx.beginPath();
      ctx.moveTo(s * 0.15, -s);
      ctx.lineTo(-s * 0.35, s * 0.05);
      ctx.lineTo(s * 0.05, s * 0.05);
      ctx.lineTo(-s * 0.15, s);
      ctx.lineTo(s * 0.35, -s * 0.05);
      ctx.lineTo(-s * 0.05, -s * 0.05);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'multiBall': {
      // Three small circles
      const r = s * 0.3;
      const offset = s * 0.45;
      ctx.beginPath();
      ctx.arc(0, -offset, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-offset * 0.8, offset * 0.5, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(offset * 0.8, offset * 0.5, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'shield': {
      // Shield icon
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s, -s * 0.6, s, 0);
      ctx.quadraticCurveTo(s, s * 0.6, 0, s);
      ctx.quadraticCurveTo(-s, s * 0.6, -s, 0);
      ctx.quadraticCurveTo(-s, -s * 0.6, 0, -s);
      ctx.closePath();
      ctx.stroke();
      // Checkmark inside
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, 0);
      ctx.lineTo(-s * 0.05, s * 0.3);
      ctx.lineTo(s * 0.35, -s * 0.25);
      ctx.stroke();
      break;
    }
    case 'invisiblePaddle': {
      // Ghost/eye with slash
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Slash
      ctx.beginPath();
      ctx.moveTo(-s * 0.7, s * 0.7);
      ctx.lineTo(s * 0.7, -s * 0.7);
      ctx.stroke();
      break;
    }
    case 'reverseControls': {
      // Reverse arrows ↕ crossed
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, -s * 0.3);
      ctx.lineTo(s * 0.5, s * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, s * 0.3);
      ctx.lineTo(s * 0.5, -s * 0.3);
      ctx.stroke();
      // Arrow heads
      ctx.beginPath();
      ctx.moveTo(s * 0.2, s * 0.6);
      ctx.lineTo(s * 0.5, s * 0.3);
      ctx.lineTo(s * 0.2, s * 0.0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, -s * 0.6);
      ctx.lineTo(-s * 0.5, -s * 0.3);
      ctx.lineTo(-s * 0.2, 0);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
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
  const { emit, emitTrail, update: updateParticles, draw: drawParticles, particlesRef } = useParticles();
  const prevBallsRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);
  const prevPowerUpIdsRef = useRef<Map<string, { x: number; y: number; type: PowerUpType }>>(new Map());

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
      if (paddle.isInvisible) {
        // Draw very faint outline for invisible paddle
        ctx.strokeStyle = `hsl(${paddle.color} / 0.15)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.setLineDash([]);
      } else {
        if (hasGlow) {
          ctx.shadowColor = `hsl(${paddle.color})`;
          ctx.shadowBlur = 15;
        }
        ctx.fillStyle = `hsl(${paddle.color})`;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.shadowBlur = 0;
      }
      // Shield indicator
      if (paddle.hasShield) {
        ctx.strokeStyle = 'hsl(180, 80%, 50%)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'hsl(180, 80%, 50%)';
        ctx.shadowBlur = 10;
        const shieldX = paddle.x < GAME_WIDTH / 2 ? paddle.x - 6 : paddle.x + paddle.width + 6;
        ctx.beginPath();
        ctx.moveTo(shieldX, paddle.y - 5);
        ctx.lineTo(shieldX, paddle.y + paddle.height + 5);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // Detect collected power-ups and emit burst particles at their position
    const currentActiveIds = new Set(gameState.powerUps.filter(p => p.active).map(p => p.id));
    prevPowerUpIdsRef.current.forEach((info, id) => {
      if (!currentActiveIds.has(id)) {
        // Power-up was collected — burst at its position
        const hslMatch = POWER_UP_COLORS[info.type].match(/hsl\((.+)\)/);
        const color = hslMatch ? hslMatch[1] : theme.accent;
        emit(info.x, info.y, color, 30, 7, [3, 8]);
      }
    });
    const newMap = new Map<string, { x: number; y: number; type: PowerUpType }>();
    gameState.powerUps.forEach(p => { if (p.active) newMap.set(p.id, { x: p.x, y: p.y, type: p.type }); });
    prevPowerUpIdsRef.current = newMap;

    // Ball trail + particles
    if (!gameState.isPaused && !gameState.isGameOver && gameState.config.particlesEnabled) {
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
    const now = Date.now();
    gameState.powerUps.forEach((powerUp) => {
      if (!powerUp.active) return;
      const color = POWER_UP_COLORS[powerUp.type];
      const pulse = Math.sin(now / 200) * 0.15 + 1;
      const radius = 18 * pulse;
      const rotation = now / 800;

      // Outer glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;

      // Background circle
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Rotating ring
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, radius + 4, rotation, rotation + Math.PI * 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, radius + 4, rotation + Math.PI, rotation + Math.PI * 2.2);
      ctx.stroke();

      // Icon
      drawPowerUpIcon(ctx, powerUp.type, powerUp.x, powerUp.y, radius * 1.1, now);
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

    // In-game stats (bottom area)
    if (!gameState.isPaused && !gameState.isGameOver && gameState.stats) {
      ctx.font = '11px sans-serif';
      ctx.fillStyle = `hsl(${theme.foreground} / 0.3)`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      const speeds = gameState.balls.map(b => Math.sqrt(b.vx ** 2 + b.vy ** 2));
      const currentMaxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
      ctx.fillText(`Scambi: ${gameState.stats.rallies}`, GAME_WIDTH * 0.25, GAME_HEIGHT - 12);
      ctx.textAlign = 'center';
      ctx.fillText(`Velocità: ${currentMaxSpeed.toFixed(1)}`, GAME_WIDTH / 2, GAME_HEIGHT - 12);
      ctx.textAlign = 'right';
      ctx.fillText(`Power-up: ${gameState.stats.powerUpsCollected}`, GAME_WIDTH * 0.75, GAME_HEIGHT - 12);
    }

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
  }, [gameState, theme, displayWidth, displayHeight, emit, emitTrail, updateParticles, drawParticles]);

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
