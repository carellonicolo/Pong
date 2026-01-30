import { useEffect, useCallback, useRef } from 'react';
import { GameMode } from '@/types/game';

interface UseGameControlsProps {
  mode: GameMode;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  movePaddle: (playerIndex: number, y: number) => void;
  togglePause: () => void;
  isPaused: boolean;
}

export const useGameControls = ({
  mode,
  canvasRef,
  movePaddle,
  togglePause,
  isPaused,
}: UseGameControlsProps) => {
  const keysPressed = useRef<Set<string>>(new Set());
  const paddleSpeed = 12;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());

      // Pause toggle
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [togglePause]);

  // Continuous keyboard movement
  useEffect(() => {
    if (isPaused) return;

    let animationId: number;
    let lastPaddle1Y: number | null = null;
    let lastPaddle2Y: number | null = null;

    const updatePaddles = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Player 1 controls (W/S)
      if (keysPressed.current.has('w')) {
        lastPaddle1Y = (lastPaddle1Y ?? canvas.height / 2) - paddleSpeed;
        movePaddle(0, Math.max(50, lastPaddle1Y));
      }
      if (keysPressed.current.has('s')) {
        lastPaddle1Y = (lastPaddle1Y ?? canvas.height / 2) + paddleSpeed;
        movePaddle(0, Math.min(canvas.height - 50, lastPaddle1Y));
      }

      // Player 2 controls (Arrow keys) - only for local multiplayer
      if (mode === 'local') {
        if (keysPressed.current.has('arrowup')) {
          lastPaddle2Y = (lastPaddle2Y ?? canvas.height / 2) - paddleSpeed;
          movePaddle(1, Math.max(50, lastPaddle2Y));
        }
        if (keysPressed.current.has('arrowdown')) {
          lastPaddle2Y = (lastPaddle2Y ?? canvas.height / 2) + paddleSpeed;
          movePaddle(1, Math.min(canvas.height - 50, lastPaddle2Y));
        }
      }

      animationId = requestAnimationFrame(updatePaddles);
    };

    animationId = requestAnimationFrame(updatePaddles);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, mode, canvasRef, movePaddle]);

  // Mouse controls for player 1
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isPaused) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    movePaddle(0, y);
  }, [canvasRef, movePaddle, isPaused]);

  // Touch controls
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isPaused) return;

    e.preventDefault();
    const rect = canvas.getBoundingClientRect();

    Array.from(e.touches).forEach((touch) => {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Left side = Player 1, Right side = Player 2 (for local multiplayer)
      if (x < canvas.width / 2) {
        movePaddle(0, y);
      } else if (mode === 'local') {
        movePaddle(1, y);
      }
    });
  }, [canvasRef, movePaddle, isPaused, mode]);

  return {
    handleMouseMove,
    handleTouchMove,
  };
};
