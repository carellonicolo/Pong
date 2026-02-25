import { useEffect, useCallback, useRef } from 'react';
import { GameMode, GAME_WIDTH, GAME_HEIGHT } from '@/types/game';

interface UseGameControlsProps {
  mode: GameMode;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  movePaddle: (playerIndex: number, y: number) => void;
  togglePause: () => void;
  isPaused: boolean;
  sensitivity: number; // 0.1 to 1.0
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
  sensitivity,
}: UseGameControlsProps) => {
  const keysPressed = useRef<Set<string>>(new Set());
  const paddleSpeed = 12;
  // Track target and current positions for interpolation
  const mouseTargetY = useRef<number | null>(null);
  const currentMouseY = useRef<number | null>(null);
  const touchTargetY = useRef<Map<number, number>>(new Map()); // playerIndex -> targetY
  const currentTouchY = useRef<Map<number, number>>(new Map());

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

  // Interpolation loop for smooth paddle movement
  useEffect(() => {
    let animId: number;
    const lerp = () => {
      // Mouse (player 1)
      if (mouseTargetY.current !== null) {
        if (currentMouseY.current === null) currentMouseY.current = mouseTargetY.current;
        currentMouseY.current += (mouseTargetY.current - currentMouseY.current) * sensitivity;
        movePaddle(0, currentMouseY.current);
      }
      // Touch
      touchTargetY.current.forEach((target, playerIndex) => {
        const current = currentTouchY.current.get(playerIndex) ?? target;
        const next = current + (target - current) * sensitivity;
        currentTouchY.current.set(playerIndex, next);
        movePaddle(playerIndex, next);
      });
      animId = requestAnimationFrame(lerp);
    };
    animId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(animId);
  }, [movePaddle, sensitivity]);

  // Mouse controls for player 1 - stores target, lerp loop moves paddle
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    mouseTargetY.current = screenToGameY(e.clientY, canvas);
  }, []);

  // Touch controls - stores targets, lerp loop moves paddles
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = e.currentTarget;

    Array.from(e.touches).forEach((touch) => {
      const gameX = screenToGameX(touch.clientX, canvas);
      const gameY = screenToGameY(touch.clientY, canvas);

      if (gameX < GAME_WIDTH / 2) {
        touchTargetY.current.set(0, gameY);
      } else if (mode === 'local') {
        touchTargetY.current.set(1, gameY);
      }
    });
  }, [mode]);

  return {
    handleMouseMove,
    handleTouchMove,
  };
};
