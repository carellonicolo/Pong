import { useCallback, useRef, useState, useEffect } from 'react';
import {
  Ball,
  GameConfig,
  GameState,
  Player,
  PowerUp,
  PowerUpType,
  getBallSpeed,
  POWER_UP_DURATION,
  POWER_UP_SPAWN_INTERVAL,
  GAME_WIDTH,
  GAME_HEIGHT,
} from '@/types/game';

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const CANVAS_PADDING = 20;

interface SoundCallbacks {
  onPaddleHit?: () => void;
  onWallHit?: () => void;
  onScore?: () => void;
  onPowerUp?: () => void;
  onVictory?: () => void;
}

interface UseGameEngineProps {
  config: GameConfig;
  onScoreUpdate?: (player1Score: number, player2Score: number) => void;
  onGameOver?: (winner: number) => void;
  sounds?: SoundCallbacks;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const createBall = (speed: number): Ball => {
  const angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
  const direction = Math.random() > 0.5 ? 1 : -1;
  
  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    vx: Math.cos(angle) * speed * direction,
    vy: Math.sin(angle) * speed,
    radius: BALL_RADIUS,
    speed,
  };
};

const createPlayer = (
  id: string,
  nickname: string,
  color: string,
  side: 'left' | 'right',
  isAI = false
): Player => ({
  id,
  nickname,
  isAI,
  paddle: {
    x: side === 'left' ? CANVAS_PADDING : GAME_WIDTH - CANVAS_PADDING - PADDLE_WIDTH,
    y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    baseHeight: PADDLE_HEIGHT,
    color,
    score: 0,
  },
});

export const useGameEngine = ({
  config,
  onScoreUpdate,
  onGameOver,
  sounds,
}: UseGameEngineProps) => {
  const speed = getBallSpeed(config.ballSpeed);
  
  const [gameState, setGameState] = useState<GameState>(() => ({
    balls: [createBall(speed)],
    players: [
      createPlayer('p1', config.player1Nickname, config.player1Color, 'left'),
      createPlayer('p2', config.player2Nickname, config.player2Color, 'right', config.mode === 'single'),
    ],
    powerUps: [],
    isPaused: true,
    isGameOver: false,
    winner: null,
    config,
    stats: { rallies: 0, maxBallSpeed: speed, powerUpsCollected: 0 },
  }));

  const animationFrameRef = useRef<number>();
  const lastPowerUpSpawnRef = useRef<number>(0);
  const activePowerUpsRef = useRef<Map<string, { type: PowerUpType; player: number; expiresAt: number }>>(new Map());

  // Keep sounds in ref so game loop always has latest
  const soundsRef = useRef<SoundCallbacks>({});
  useEffect(() => { soundsRef.current = sounds || {}; }, [sounds]);

  const resetBall = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      balls: [createBall(speed)],
    }));
  }, [speed]);

  const spawnPowerUp = useCallback(() => {
    if (!config.powerUpsEnabled) return;
    
    const types: PowerUpType[] = ['enlargePaddle', 'shrinkOpponent', 'slowBall', 'speedBall', 'multiBall', 'shield', 'invisiblePaddle', 'reverseControls'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerUp: PowerUp = {
      id: generateId(),
      type,
      x: GAME_WIDTH / 4 + Math.random() * (GAME_WIDTH / 2),
      y: 50 + Math.random() * (GAME_HEIGHT - 100),
      active: true,
      duration: POWER_UP_DURATION,
    };

    setGameState(prev => ({
      ...prev,
      powerUps: [...prev.powerUps, powerUp],
    }));
  }, [config.powerUpsEnabled]);

  const applyPowerUp = useCallback((type: PowerUpType, playerIndex: number) => {
    const id = generateId();
    const expiresAt = Date.now() + POWER_UP_DURATION;
    activePowerUpsRef.current.set(id, { type, player: playerIndex, expiresAt });

    setGameState(prev => {
      const newPlayers = [...prev.players] as [Player, Player];
      const opponentIndex = playerIndex === 0 ? 1 : 0;

      switch (type) {
        case 'enlargePaddle':
          newPlayers[playerIndex] = {
            ...newPlayers[playerIndex],
            paddle: { ...newPlayers[playerIndex].paddle, height: newPlayers[playerIndex].paddle.baseHeight * 1.5 },
          };
          break;
        case 'shrinkOpponent':
          newPlayers[opponentIndex] = {
            ...newPlayers[opponentIndex],
            paddle: { ...newPlayers[opponentIndex].paddle, height: newPlayers[opponentIndex].paddle.baseHeight * 0.6 },
          };
          break;
        case 'shield':
          newPlayers[playerIndex] = {
            ...newPlayers[playerIndex],
            paddle: { ...newPlayers[playerIndex].paddle, hasShield: true },
          };
          break;
        case 'invisiblePaddle':
          newPlayers[opponentIndex] = {
            ...newPlayers[opponentIndex],
            paddle: { ...newPlayers[opponentIndex].paddle, isInvisible: true },
          };
          break;
        case 'reverseControls':
          newPlayers[opponentIndex] = {
            ...newPlayers[opponentIndex],
            paddle: { ...newPlayers[opponentIndex].paddle, controlsReversed: true },
          };
          break;
        case 'slowBall':
          return {
            ...prev,
            balls: prev.balls.map(b => ({ ...b, vx: b.vx * 0.6, vy: b.vy * 0.6 })),
            players: newPlayers,
            stats: { ...prev.stats, powerUpsCollected: prev.stats.powerUpsCollected + 1 },
          };
        case 'speedBall':
          return {
            ...prev,
            balls: prev.balls.map(b => ({ ...b, vx: b.vx * 1.5, vy: b.vy * 1.5 })),
            players: newPlayers,
            stats: { ...prev.stats, powerUpsCollected: prev.stats.powerUpsCollected + 1 },
          };
        case 'multiBall':
          const extraBalls = [1, 2].map(() => createBall(speed));
          return { ...prev, balls: [...prev.balls, ...extraBalls], players: newPlayers, stats: { ...prev.stats, powerUpsCollected: prev.stats.powerUpsCollected + 1 } };
      }

      return { ...prev, players: newPlayers, stats: { ...prev.stats, powerUpsCollected: prev.stats.powerUpsCollected + 1 } };
    });

    // Schedule power-up expiration
    setTimeout(() => {
      activePowerUpsRef.current.delete(id);
      setGameState(prev => {
        const newPlayers = [...prev.players] as [Player, Player];
        newPlayers[0] = { ...newPlayers[0], paddle: { ...newPlayers[0].paddle, height: newPlayers[0].paddle.baseHeight, hasShield: false, isInvisible: false, controlsReversed: false } };
        newPlayers[1] = { ...newPlayers[1], paddle: { ...newPlayers[1].paddle, height: newPlayers[1].paddle.baseHeight, hasShield: false, isInvisible: false, controlsReversed: false } };
        return { ...prev, players: newPlayers };
      });
    }, POWER_UP_DURATION);
  }, [speed]);

  const checkCollisions = useCallback((ball: Ball, players: [Player, Player]) => {
    let newBall = { ...ball };
    let scored = -1;

    // Wall collisions (top/bottom)
    if (newBall.y - newBall.radius <= 0 || newBall.y + newBall.radius >= GAME_HEIGHT) {
      newBall.vy = -newBall.vy;
      newBall.y = Math.max(newBall.radius, Math.min(GAME_HEIGHT - newBall.radius, newBall.y));
      soundsRef.current.onWallHit?.();
    }

    // Paddle collisions
    players.forEach((player, index) => {
      const paddle = player.paddle;
      const paddleLeft = paddle.x;
      const paddleRight = paddle.x + paddle.width;
      const paddleTop = paddle.y;
      const paddleBottom = paddle.y + paddle.height;

      if (
        newBall.x - newBall.radius <= paddleRight &&
        newBall.x + newBall.radius >= paddleLeft &&
        newBall.y >= paddleTop &&
        newBall.y <= paddleBottom
      ) {
        const hitPos = (newBall.y - paddleTop) / paddle.height - 0.5;
        const angle = hitPos * (Math.PI / 3);
        const speed = Math.sqrt(newBall.vx ** 2 + newBall.vy ** 2) * 1.02;

        newBall.vx = Math.cos(angle) * speed * (index === 0 ? 1 : -1);
        newBall.vy = Math.sin(angle) * speed;
        newBall.x = index === 0 ? paddleRight + newBall.radius : paddleLeft - newBall.radius;
        soundsRef.current.onPaddleHit?.();
      }
    });

    // Score detection
    if (newBall.x - newBall.radius <= 0) {
      scored = 1;
    } else if (newBall.x + newBall.radius >= GAME_WIDTH) {
      scored = 0;
    }

    return { ball: newBall, scored };
  }, []);

  const updateAI = useCallback((player: Player, balls: Ball[]): number => {
    if (!player.isAI || balls.length === 0) return player.paddle.y;

    const difficulty = config.aiDifficulty; // 0.1 to 1.0
    const aiSpeed = 2 + difficulty * 6; // 2.6 (easy) to 8 (hard)
    const reactionThreshold = 40 - difficulty * 35; // 35.5 (easy, lazy) to 5 (hard, precise)
    const errorMargin = (1 - difficulty) * 60; // 54 (easy, inaccurate) to 0 (hard, perfect)

    const relevantBall = balls.reduce((closest, ball) => {
      if (ball.vx > 0 && (!closest || ball.x > closest.x)) return ball;
      return closest;
    }, null as Ball | null);

    if (!relevantBall) return player.paddle.y;

    // Add random error to target position based on difficulty
    const error = (Math.sin(Date.now() / 500) * errorMargin);
    const targetY = relevantBall.y - player.paddle.height / 2 + error;
    const diff = targetY - player.paddle.y;

    // Don't react to small movements (lower difficulty = lazier)
    if (Math.abs(diff) < reactionThreshold) return player.paddle.y;

    if (Math.abs(diff) < aiSpeed) return targetY;
    return player.paddle.y + (diff > 0 ? aiSpeed : -aiSpeed);
  }, [config.aiDifficulty]);

  const gameLoop = useCallback(() => {
    setGameState(prev => {
      if (prev.isPaused || prev.isGameOver) return prev;

      let newBalls = [...prev.balls];
      let newPlayers = [...prev.players] as [Player, Player];
      let newPowerUps = [...prev.powerUps];
      const newStats = { ...prev.stats };

      // Update AI paddle
      if (newPlayers[1].isAI) {
        newPlayers[1] = {
          ...newPlayers[1],
          paddle: {
            ...newPlayers[1].paddle,
            y: Math.max(0, Math.min(GAME_HEIGHT - newPlayers[1].paddle.height, updateAI(newPlayers[1], newBalls))),
          },
        };
      }

      // Update balls
      const ballsToRemove: number[] = [];
      newBalls = newBalls.map((ball, index) => {
        const newBall = { ...ball, x: ball.x + ball.vx, y: ball.y + ball.vy };
        const { ball: updatedBall, scored } = checkCollisions(newBall, newPlayers);

        // Track rallies and max speed on paddle hit
        const currentSpeed = Math.sqrt(updatedBall.vx ** 2 + updatedBall.vy ** 2);
        if (currentSpeed > newStats.maxBallSpeed) newStats.maxBallSpeed = currentSpeed;
        // Detect paddle hit: vx direction changed
        const prevBall = prev.balls[index];
        if (prevBall && Math.sign(prevBall.vx) !== Math.sign(updatedBall.vx) && prevBall.vx !== 0) {
          newStats.rallies++;
        }

        if (scored >= 0) {
          // Check shield
          const scoredAgainst = scored === 0 ? 1 : 0;
          if (newPlayers[scoredAgainst].paddle.hasShield) {
            newPlayers[scoredAgainst] = {
              ...newPlayers[scoredAgainst],
              paddle: { ...newPlayers[scoredAgainst].paddle, hasShield: false },
            };
            // Bounce ball back instead of scoring
            return { ...updatedBall, vx: -updatedBall.vx, x: scored === 0 ? updatedBall.radius + 5 : GAME_WIDTH - updatedBall.radius - 5 };
          }

          newPlayers[scored] = {
            ...newPlayers[scored],
            paddle: { ...newPlayers[scored].paddle, score: newPlayers[scored].paddle.score + 1 },
          };
          soundsRef.current.onScore?.();
          
          if (prev.balls.length > 1) {
            ballsToRemove.push(index);
            return updatedBall;
          }
          
          return createBall(speed);
        }

        // Check power-up collisions
        newPowerUps = newPowerUps.filter(powerUp => {
          if (!powerUp.active) return false;
          
          const dist = Math.sqrt((updatedBall.x - powerUp.x) ** 2 + (updatedBall.y - powerUp.y) ** 2);
          if (dist < updatedBall.radius + 15) {
            const playerIndex = updatedBall.vx > 0 ? 0 : 1;
            applyPowerUp(powerUp.type, playerIndex);
            soundsRef.current.onPowerUp?.();
            return false;
          }
          return true;
        });

        return updatedBall;
      });

      // Remove scored extra balls
      newBalls = newBalls.filter((_, i) => !ballsToRemove.includes(i));
      if (newBalls.length === 0) {
        newBalls = [createBall(speed)];
      }

      // Power-up spawning
      const now = Date.now();
      if (config.powerUpsEnabled && now - lastPowerUpSpawnRef.current > POWER_UP_SPAWN_INTERVAL) {
        lastPowerUpSpawnRef.current = now;
        setTimeout(spawnPowerUp, 0);
      }

      // Check for winner
      const winner = newPlayers.findIndex(p => p.paddle.score >= config.winScore);
      if (winner >= 0) {
        soundsRef.current.onVictory?.();
        return { ...prev, balls: newBalls, players: newPlayers, powerUps: newPowerUps, isGameOver: true, winner, stats: newStats };
      }

      return { ...prev, balls: newBalls, players: newPlayers, powerUps: newPowerUps, stats: newStats };
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [speed, config, checkCollisions, updateAI, applyPowerUp, spawnPowerUp]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
    lastPowerUpSpawnRef.current = Date.now();
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const restartGame = useCallback(() => {
    activePowerUpsRef.current.clear();
    setGameState({
      balls: [createBall(speed)],
      players: [
        createPlayer('p1', config.player1Nickname, config.player1Color, 'left'),
        createPlayer('p2', config.player2Nickname, config.player2Color, 'right', config.mode === 'single'),
      ],
      powerUps: [],
      isPaused: true,
      isGameOver: false,
      winner: null,
      config,
      stats: { rallies: 0, maxBallSpeed: speed, powerUpsCollected: 0 },
    });
  }, [speed, config]);

  const movePaddle = useCallback((playerIndex: number, y: number) => {
    setGameState(prev => {
      const newPlayers = [...prev.players] as [Player, Player];
      const paddle = newPlayers[playerIndex].paddle;
      // Reverse controls: invert Y position around center
      const effectiveY = paddle.controlsReversed ? (GAME_HEIGHT - y) : y;
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        paddle: {
          ...paddle,
          y: Math.max(0, Math.min(GAME_HEIGHT - paddle.height, effectiveY - paddle.height / 2)),
        },
      };
      return { ...prev, players: newPlayers };
    });
  }, []);

  // Start game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // Score update callback
  useEffect(() => {
    if (onScoreUpdate) {
      onScoreUpdate(gameState.players[0].paddle.score, gameState.players[1].paddle.score);
    }
  }, [gameState.players[0].paddle.score, gameState.players[1].paddle.score, onScoreUpdate]);

  // Game over callback
  useEffect(() => {
    if (gameState.isGameOver && gameState.winner !== null && onGameOver) {
      onGameOver(gameState.winner);
    }
  }, [gameState.isGameOver, gameState.winner, onGameOver]);

  return {
    gameState,
    startGame,
    pauseGame,
    togglePause,
    restartGame,
    movePaddle,
    resetBall,
  };
};
