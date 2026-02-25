import { useEffect, useCallback, useRef } from 'react';
import { GameConfig, GAME_WIDTH, GAME_HEIGHT } from '@/types/game';

interface UseGameControlsProps {
  config: GameConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  movePaddle: (playerIndex: number, y: number) => void;
  togglePause: () => void;
  isPaused: boolean;
  sensitivity: number;
}

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
  config,
  canvasRef,
  movePaddle,
  togglePause,
  isPaused,
  sensitivity,
}: UseGameControlsProps) => {
  const keysPressed = useRef<Set<string>>(new Set());
  const paddleSpeed = 12;
  const mouseTargetY = useRef<number | null>(null);
  const currentMouseY = useRef<number | null>(null);
  const touchTargetY = useRef<Map<number, number>>(new Map());
  const currentTouchY = useRef<Map<number, number>>(new Map());

  const { player1Keys, player2Keys, mode, mouseEnabled } = config;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());

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

  // Continuous keyboard movement using configured keys
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

      // Player 1 controls
      if (keysPressed.current.has(player1Keys.up)) {
        lastPaddle1Y = (lastPaddle1Y ?? GAME_HEIGHT / 2) - paddleSpeed;
        movePaddle(0, Math.max(50, lastPaddle1Y));
      }
      if (keysPressed.current.has(player1Keys.down)) {
        lastPaddle1Y = (lastPaddle1Y ?? GAME_HEIGHT / 2) + paddleSpeed;
        movePaddle(0, Math.min(GAME_HEIGHT - 50, lastPaddle1Y));
      }

      // Player 2 controls - only for local multiplayer
      if (mode === 'local') {
        if (keysPressed.current.has(player2Keys.up)) {
          lastPaddle2Y = (lastPaddle2Y ?? GAME_HEIGHT / 2) - paddleSpeed;
          movePaddle(1, Math.max(50, lastPaddle2Y));
        }
        if (keysPressed.current.has(player2Keys.down)) {
          lastPaddle2Y = (lastPaddle2Y ?? GAME_HEIGHT / 2) + paddleSpeed;
          movePaddle(1, Math.min(GAME_HEIGHT - 50, lastPaddle2Y));
        }
      }

      animationId = requestAnimationFrame(updatePaddles);
    };

    animationId = requestAnimationFrame(updatePaddles);
    return () => cancelAnimationFrame(animationId);
  }, [mode, canvasRef, movePaddle, player1Keys, player2Keys]);

  // Interpolation loop for smooth mouse/touch movement
  useEffect(() => {
    let animId: number;
    const lerp = () => {
      // Mouse (player 1) - only if enabled
      if (mouseEnabled && mouseTargetY.current !== null) {
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
  }, [movePaddle, sensitivity, mouseEnabled]);

  // Mouse controls - only stores target if mouse is enabled
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mouseEnabled) return;
    const canvas = e.currentTarget;
    mouseTargetY.current = screenToGameY(e.clientY, canvas);
  }, [mouseEnabled]);

  // Touch controls
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
