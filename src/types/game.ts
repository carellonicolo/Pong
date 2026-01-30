// Game Types for Pong Multiplayer

export type GameTheme = 'retro' | 'minimal' | 'futuristic' | 'custom';

export type GameMode = 'single' | 'local' | 'online';

export type BallSpeed = 'slow' | 'normal' | 'fast';

export type PowerUpType = 
  | 'enlargePaddle'    // 🔵 Makes your paddle bigger
  | 'shrinkOpponent'   // 🔴 Shrinks opponent's paddle
  | 'slowBall'         // 🟢 Slows down the ball
  | 'speedBall'        // 🟡 Speeds up the ball
  | 'multiBall';       // 🟣 Spawns extra balls

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  active: boolean;
  duration: number; // in milliseconds
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  baseHeight: number;
  color: string;
  score: number;
}

export interface Player {
  id: string;
  nickname: string;
  paddle: Paddle;
  isAI?: boolean;
  connected?: boolean;
}

export interface GameConfig {
  theme: GameTheme;
  mode: GameMode;
  winScore: number;
  ballSpeed: BallSpeed;
  powerUpsEnabled: boolean;
  player1Color: string;
  player2Color: string;
  player1Nickname: string;
  player2Nickname: string;
}

export interface GameState {
  balls: Ball[];
  players: [Player, Player];
  powerUps: PowerUp[];
  isPaused: boolean;
  isGameOver: boolean;
  winner: number | null;
  config: GameConfig;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  paddle1: string;
  paddle2: string;
  ball: string;
  accent: string;
  glow?: string;
}

export const THEME_PRESETS: Record<GameTheme, ThemeColors> = {
  retro: {
    background: '0 0% 5%',
    foreground: '120 100% 50%',
    paddle1: '120 100% 50%',
    paddle2: '280 100% 60%',
    ball: '60 100% 50%',
    accent: '300 100% 50%',
    glow: '120 100% 50%',
  },
  minimal: {
    background: '0 0% 98%',
    foreground: '0 0% 10%',
    paddle1: '0 0% 10%',
    paddle2: '0 0% 30%',
    ball: '0 0% 10%',
    accent: '0 0% 50%',
  },
  futuristic: {
    background: '230 30% 8%',
    foreground: '200 100% 60%',
    paddle1: '180 100% 50%',
    paddle2: '320 100% 60%',
    ball: '45 100% 60%',
    accent: '260 100% 70%',
    glow: '200 100% 50%',
  },
  custom: {
    background: '220 20% 10%',
    foreground: '0 0% 95%',
    paddle1: '210 100% 50%',
    paddle2: '0 80% 60%',
    ball: '0 0% 100%',
    accent: '45 100% 50%',
  },
};

export const BALL_SPEEDS: Record<BallSpeed, number> = {
  slow: 4,
  normal: 6,
  fast: 9,
};

export const POWER_UP_DURATION = 8000; // 8 seconds
export const POWER_UP_SPAWN_INTERVAL = 10000; // 10 seconds
