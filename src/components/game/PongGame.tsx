import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { GameCanvas } from './GameCanvas';
import { GameConfig, THEME_PRESETS, GAME_WIDTH, GAME_HEIGHT } from '@/types/game';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useGameControls } from '@/hooks/useGameControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameSounds } from '@/hooks/useGameSounds';
import { Pause, Play, RotateCcw, Home, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PongGameProps {
  config: GameConfig;
  onBackToMenu: () => void;
  onGameOver?: (winner: number, player1Score: number, player2Score: number) => void;
}

export const PongGame: React.FC<PongGameProps> = ({ config, onBackToMenu, onGameOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [displaySize, setDisplaySize] = useState({ width: 800, height: 500 });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { playPaddleHit, playWallHit, playScore, playPowerUp, playVictory } = useGameSounds(soundEnabled);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Sync state when user exits fullscreen via Esc
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Calculate the CSS display size for the canvas (visual only, not physics)
  useEffect(() => {
    const updateDisplaySize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const fullscreen = !!document.fullscreenElement;
      const padding = fullscreen ? 16 : 32;
      const headerSpace = fullscreen ? 60 : 200;
      
      const availableWidth = container.clientWidth - padding;
      const availableHeight = container.clientHeight - headerSpace;
      
      // Maintain the game's aspect ratio (GAME_WIDTH / GAME_HEIGHT)
      const gameAspect = GAME_WIDTH / GAME_HEIGHT;
      
      let width: number;
      let height: number;
      
      if (availableWidth / availableHeight > gameAspect) {
        // Height-constrained
        height = availableHeight;
        width = height * gameAspect;
      } else {
        // Width-constrained
        width = availableWidth;
        height = width / gameAspect;
      }
      
      // Cap at reasonable max in non-fullscreen
      if (!fullscreen) {
        width = Math.min(width, 1000);
        height = Math.min(height, 1000 / gameAspect);
      }
      
      setDisplaySize({
        width: Math.floor(Math.max(width, 300)),
        height: Math.floor(Math.max(height, 300 / gameAspect)),
      });
    };

    updateDisplaySize();
    window.addEventListener('resize', updateDisplaySize);
    document.addEventListener('fullscreenchange', () => {
      // Small delay to let fullscreen dimensions settle
      requestAnimationFrame(updateDisplaySize);
    });
    return () => {
      window.removeEventListener('resize', updateDisplaySize);
    };
  }, []);

  const {
    gameState,
    startGame,
    pauseGame,
    togglePause,
    restartGame,
    movePaddle,
  } = useGameEngine({
    config,
    onGameOver: useCallback((winner: number) => {
      if (onGameOver) {
        onGameOver(winner, 0, 0);
      }
    }, [onGameOver]),
    sounds: {
      onPaddleHit: playPaddleHit,
      onWallHit: playWallHit,
      onScore: playScore,
      onPowerUp: playPowerUp,
      onVictory: playVictory,
    },
  });

  const { handleMouseMove, handleTouchMove } = useGameControls({
    mode: config.mode,
    canvasRef,
    movePaddle,
    togglePause,
    isPaused: gameState.isPaused,
    sensitivity: config.paddleSensitivity,
  });

  // Handle keyboard restart after game over
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.isGameOver && (e.key === ' ' || e.key === 'Enter')) {
        restartGame();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [gameState.isGameOver, restartGame]);

  const theme = THEME_PRESETS[config.theme];

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{ backgroundColor: `hsl(${theme.background})` }}
    >
      {/* Game Header */}
      <div className="flex items-center justify-between w-full mb-4 px-2" style={{ maxWidth: displaySize.width }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!gameState.isGameOver && (gameState.players[0].paddle.score > 0 || gameState.players[1].paddle.score > 0)) {
              setShowExitConfirm(true);
            } else {
              onBackToMenu();
            }
          }}
          style={{ color: `hsl(${theme.foreground})` }}
        >
          <Home className="w-4 h-4 mr-2" />
          Menu
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{ color: `hsl(${theme.foreground})` }}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            style={{ color: `hsl(${theme.foreground})` }}
            title={isFullscreen ? 'Esci dal fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          {!gameState.isGameOver && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePause}
                style={{ color: `hsl(${theme.foreground})` }}
              >
                {gameState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={restartGame}
                style={{ color: `hsl(${theme.foreground})` }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <GameCanvas
          ref={canvasRef}
          gameState={gameState}
          displayWidth={displaySize.width}
          displayHeight={displaySize.height}
          onMouseMove={!isMobile ? handleMouseMove : undefined}
          onTouchMove={handleTouchMove}
        />

        {/* Touch zones indicator for mobile */}
        {isMobile && config.mode === 'local' && gameState.isPaused && (
          <div className="absolute inset-0 flex pointer-events-none">
            <div className="flex-1 border-r border-dashed border-white/20 flex items-center justify-center">
              <span className="text-white/50 text-sm">P1 Zone</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-white/50 text-sm">P2 Zone</span>
            </div>
          </div>
        )}
      </div>

      {/* Power-ups Legend */}
      {config.powerUpsEnabled && (
        <div 
          className="flex flex-wrap justify-center gap-4 mt-4 text-sm"
          style={{ color: `hsl(${theme.foreground} / 0.7)` }}
        >
          <span>🔵 Allarga Racchetta</span>
          <span>🔴 Rimpicciolisci</span>
          <span>🟢 Rallenta</span>
          <span>🟡 Velocizza</span>
          <span>🟣 Multi-palla</span>
        </div>
      )}

      {/* Game Over Actions */}
      {gameState.isGameOver && (
        <div className="flex gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4">
          <Button
            variant="outline"
            size="lg"
            onClick={restartGame}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Gioca ancora
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={onBackToMenu}
          >
            <Home className="w-4 h-4 mr-2" />
            Menu principale
          </Button>
        </div>
      )}

      {/* Controls hint */}
      {!isMobile && gameState.isPaused && !gameState.isGameOver && (
        <div 
          className="mt-4 text-sm"
          style={{ color: `hsl(${theme.foreground} / 0.5)` }}
        >
          ESC o SPAZIO per mettere in pausa
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uscire dalla partita?</AlertDialogTitle>
            <AlertDialogDescription>
              La partita è in corso ({gameState.players[0].paddle.score} - {gameState.players[1].paddle.score}). Se esci perderai i progressi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continua a giocare</AlertDialogCancel>
            <AlertDialogAction onClick={onBackToMenu}>Esci</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
