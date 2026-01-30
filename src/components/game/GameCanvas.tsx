import React, { useRef, useEffect } from 'react';
import { GameState, THEME_PRESETS, PowerUpType } from '@/types/game';

interface GameCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
  onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
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

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  width,
  height,
  onMouseMove,
  onTouchMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = THEME_PRESETS[gameState.config.theme];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = `hsl(${theme.background})`;
    ctx.fillRect(0, 0, width, height);

    // Draw center line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = `hsl(${theme.foreground} / 0.3)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw glow effect for retro/futuristic themes
    const hasGlow = gameState.config.theme === 'retro' || gameState.config.theme === 'futuristic';

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
      
      // Pulsing animation
      const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
      const radius = 18 * pulse;
      
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      
      // Draw outer circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw icon
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
    ctx.fillText(
      gameState.players[0].paddle.score.toString(),
      width / 4,
      30
    );
    ctx.fillText(
      gameState.players[1].paddle.score.toString(),
      (width * 3) / 4,
      30
    );

    // Draw player names
    ctx.font = '14px sans-serif';
    ctx.fillStyle = `hsl(${theme.foreground} / 0.5)`;
    ctx.fillText(gameState.players[0].nickname, width / 4, 85);
    ctx.fillText(gameState.players[1].nickname, (width * 3) / 4, 85);

    // Draw pause/game over overlay
    if (gameState.isPaused || gameState.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = `hsl(${theme.foreground})`;
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (gameState.isGameOver && gameState.winner !== null) {
        ctx.fillText(
          `${gameState.players[gameState.winner].nickname} Wins!`,
          width / 2,
          height / 2 - 20
        );
        ctx.font = '20px sans-serif';
        ctx.fillText('Press SPACE to play again', width / 2, height / 2 + 30);
      } else if (gameState.isPaused) {
        ctx.fillText('PAUSED', width / 2, height / 2 - 20);
        ctx.font = '18px sans-serif';
        ctx.fillText('Press SPACE to start', width / 2, height / 2 + 30);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = `hsl(${theme.foreground} / 0.7)`;
        ctx.fillText('W/S or Mouse - Player 1', width / 2, height / 2 + 70);
        if (gameState.config.mode === 'local') {
          ctx.fillText('↑/↓ or Touch Right - Player 2', width / 2, height / 2 + 90);
        }
      }
    }
  }, [gameState, width, height, theme]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onTouchStart={(e) => e.preventDefault()}
      className="rounded-lg border border-border touch-none cursor-none"
      style={{
        boxShadow: gameState.config.theme !== 'minimal' 
          ? `0 0 30px hsl(${theme.glow || theme.accent} / 0.3)` 
          : undefined,
      }}
    />
  );
};
