// Game Types for Pong Multiplayer

export type GameTheme = 'retro' | 'minimal' | 'minimal-dark' | 'futuristic' | 'ocean' | 'sunset' | 'candy' | 'sepia' | 'blood' | 'matrix' | 'frost' | 'vaporwave' | 'custom';

export type GameMode = 'single' | 'local' | 'online';

export type BallSpeed = number;

export type PowerUpType = 
  | 'enlargePaddle'    // 🔵 Makes your paddle bigger
  | 'shrinkOpponent'   // 🔴 Shrinks opponent's paddle
  | 'slowBall'         // 🟢 Slows down the ball
  | 'speedBall'        // 🟡 Speeds up the ball
  | 'multiBall'        // 🟣 Spawns extra balls
  | 'shield'           // 🛡️ Blocks one goal
  | 'invisiblePaddle'  // 👻 Makes opponent's paddle invisible
  | 'reverseControls'; // 🔄 Reverses opponent's controls

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
  hasShield?: boolean;
  isInvisible?: boolean;
  controlsReversed?: boolean;
}

export interface Player {
  id: string;
  nickname: string;
  paddle: Paddle;
  isAI?: boolean;
  connected?: boolean;
}

export interface KeyBindings {
  up: string;   // key name (lowercase)
  down: string;
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
  paddleSensitivity: number; // 0.1 (very smooth) to 1.0 (instant)
  soundEnabled: boolean;
  musicEnabled: boolean;
  player1Keys: KeyBindings;
  player2Keys: KeyBindings;
  mouseEnabled: boolean;
  particlesEnabled: boolean;
  aiDifficulty: number; // 0.1 (easy) to 1.0 (hard)
}

export interface GameStats {
  rallies: number;        // total paddle hits this game
  maxBallSpeed: number;   // max speed reached
  powerUpsCollected: number;
}

export interface GameState {
  balls: Ball[];
  players: [Player, Player];
  powerUps: PowerUp[];
  isPaused: boolean;
  isGameOver: boolean;
  winner: number | null;
  config: GameConfig;
  stats: GameStats;
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
  'minimal-dark': {
    background: '0 0% 6%',
    foreground: '0 0% 90%',
    paddle1: '0 0% 90%',
    paddle2: '0 0% 65%',
    ball: '0 0% 90%',
    accent: '0 0% 45%',
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
  ocean: {
    background: '210 60% 12%',
    foreground: '185 80% 65%',
    paddle1: '175 90% 55%',
    paddle2: '195 80% 70%',
    ball: '180 100% 80%',
    accent: '200 90% 50%',
    glow: '185 80% 50%',
  },
  sunset: {
    background: '270 30% 12%',
    foreground: '30 100% 65%',
    paddle1: '20 100% 60%',
    paddle2: '280 70% 65%',
    ball: '45 100% 70%',
    accent: '350 80% 60%',
    glow: '30 100% 50%',
  },
  candy: {
    background: '300 20% 95%',
    foreground: '330 80% 55%',
    paddle1: '330 90% 65%',
    paddle2: '190 80% 55%',
    ball: '280 70% 60%',
    accent: '50 90% 60%',
  },
  sepia: {
    background: '35 30% 15%',
    foreground: '35 40% 70%',
    paddle1: '35 50% 65%',
    paddle2: '25 35% 55%',
    ball: '40 50% 75%',
    accent: '30 40% 50%',
  },
  blood: {
    background: '0 0% 4%',
    foreground: '0 85% 50%',
    paddle1: '0 90% 55%',
    paddle2: '0 70% 40%',
    ball: '0 100% 60%',
    accent: '0 80% 45%',
    glow: '0 90% 40%',
  },
  matrix: {
    background: '0 0% 2%',
    foreground: '120 100% 45%',
    paddle1: '120 100% 50%',
    paddle2: '120 80% 35%',
    ball: '120 100% 60%',
    accent: '120 90% 40%',
    glow: '120 100% 45%',
  },
  frost: {
    background: '210 30% 95%',
    foreground: '200 50% 40%',
    paddle1: '200 60% 50%',
    paddle2: '210 40% 60%',
    ball: '195 70% 45%',
    accent: '200 50% 70%',
  },
  vaporwave: {
    background: '270 40% 10%',
    foreground: '310 100% 70%',
    paddle1: '180 100% 60%',
    paddle2: '310 100% 65%',
    ball: '50 100% 70%',
    accent: '280 80% 60%',
    glow: '310 100% 60%',
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

export const getBallSpeed = (value: number): number => {
  // Maps 1-10 to speed 3-12
  return 3 + (value - 1) * (9 / 9);
};

export const POWER_UP_DURATION = 8000; // 8 seconds
export const POWER_UP_SPAWN_INTERVAL = 10000; // 10 seconds

// Fixed internal game resolution - physics always run at this size
// The canvas is CSS-scaled to fit the viewport without affecting gameplay
export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 625;
