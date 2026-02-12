import { useEffect, useCallback, useRef } from 'react';
import { GameMode, GAME_WIDTH, GAME_HEIGHT } from '@/types/game';

interface UseGameControlsProps {
  mode: GameMode;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  movePaddle: (playerIndex: number, y: number) => void;
  togglePause: () => void;
  isPaused: boolean;
}

/**
 * Convert screen-space Y coordinate to game-space Y coordinate.
 * The canvas internal resolution is fixed (GAME_WIDTH x GAME_HEIGHT),
 * but it's CSS-scaled to fit the viewport. This converts mouse/touch
 * positions from screen pixels to the internal coordinate system.
 */
const screenToGameY = (screenY: number, canvas: HTMLCanvasElement): number => {
  const rect = canvas.getBoundingClientRect();
  const ratioY = GAME_HEIGHT / rect.height;
  return (screenY - rect.top) * ratioY;
};

const screenToGameX = (screenX: number, canvas: HTMLCanvasElement): number => {
  const rect = canvas.getBoundingClientRect();
  const ratioX = GAME_WIDTH / rect.width;
  return (screenX - rect.left) * ratioX;
};

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

  // Continuous keyboard movement - works even when paused to position paddle
  useEffect(() => {
    let animationId: number;
    let lastPaddle1Y: number | null = null;
    let lastPaddle2Y: number | null = null;

    const updatePaddles = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationId = requestAnimationFrame(updatePaddles);
        return;
      }

      // Player 1 controls (W/S) - uses GAME_HEIGHT for bounds
      if (keysPressed.current.has('w')) {
        lastPaddle1Y = (lastPaddle1Y ?? GAME_HEIGHT / 2) - paddleSpeed;
        movePaddle(0, Math.max(50, lastPaddle1Y));
      }
      if (keysPressed.current.has('s')) {
        lastPaddle1Y = (lastPaddle1Y ?? GAME_HEIGHT / 2) + paddleSpeed;
        movePaddle(0, Math.min(GAME_HEIGHT - 50, lastPaddle1Y));
      }

      // Player 2 controls (Arrow keys) - only for local multiplayer
      if (mode === 'local') {
        if (keysPressed.current.has('arrowup')) {
          lastPaddle2Y = (lastPaddle2Y ?? GAME_HEIGHT / 2) - paddleSpeed;
          movePaddle(1, Math.max(50, lastPaddle2Y));
        }
        if (keysPressed.current.has('arrowdown')) {
          lastPaddle2Y = (lastPaddle2Y ?? GAME_HEIGHT / 2) + paddleSpeed;
          movePaddle(1, Math.min(GAME_HEIGHT - 50, lastPaddle2Y));
        }
      }

      animationId = requestAnimationFrame(updatePaddles);
    };

    animationId = requestAnimationFrame(updatePaddles);

    return () => cancelAnimationFrame(animationId);
  }, [mode, canvasRef, movePaddle]);

  // Mouse controls for player 1 - converts screen coords to game coords
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const gameY = screenToGameY(e.clientY, canvas);
    movePaddle(0, gameY);
  }, [movePaddle]);

  // Touch controls - converts screen coords to game coords
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = e.currentTarget;

    Array.from(e.touches).forEach((touch) => {
      const gameX = screenToGameX(touch.clientX, canvas);
      const gameY = screenToGameY(touch.clientY, canvas);

      // Left side = Player 1, Right side = Player 2 (for local multiplayer)
      if (gameX < GAME_WIDTH / 2) {
        movePaddle(0, gameY);
      } else if (mode === 'local') {
        movePaddle(1, gameY);
      }
    });
  }, [movePaddle, mode]);

  return {
    handleMouseMove,
    handleTouchMove,
  };
};
