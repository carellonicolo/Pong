import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { GameCanvas } from './GameCanvas';
import { CountdownOverlay } from './CountdownOverlay';
import { VictoryScreen } from './VictoryScreen';
import { GameConfig, THEME_PRESETS, GAME_WIDTH, GAME_HEIGHT } from '@/types/game';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useGameControls } from '@/hooks/useGameControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameMusic } from '@/hooks/useGameMusic';
import { Pause, Play, RotateCcw, Home, Volume2, VolumeX, Maximize, Minimize, Music } from 'lucide-react';
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
  const [soundEnabled, setSoundEnabled] = useState(config.soundEnabled);
  const [musicEnabled, setMusicEnabled] = useState(config.musicEnabled);
  const [displaySize, setDisplaySize] = useState({ width: 800, height: 500 });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const { playPaddleHit, playWallHit, playScore, playPowerUp, playVictory } = useGameSounds(soundEnabled);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Responsive canvas sizing
  useEffect(() => {
    const updateDisplaySize = () => {
      if (!containerRef.current) return;
      const fullscreen = !!document.fullscreenElement;
      const containerWidth = fullscreen ? window.innerWidth : containerRef.current.clientWidth;
      const containerHeight = fullscreen ? window.innerHeight : containerRef.current.clientHeight;
      const padding = 32;
      const reservedVertical = fullscreen ? 80 : (isMobile ? 140 : 180);
      const availableWidth = containerWidth - padding;
      const availableHeight = containerHeight - reservedVertical;
      const gameAspect = GAME_WIDTH / GAME_HEIGHT;

      let width: number;
      let height: number;

      if (availableWidth / availableHeight > gameAspect) {
        height = availableHeight;
        width = height * gameAspect;
      } else {
        width = availableWidth;
        height = width / gameAspect;
      }

      if (!fullscreen) {
        width = Math.min(width, 1000);
        height = Math.min(height, 1000 / gameAspect);
      }

      setDisplaySize({
        width: Math.floor(Math.max(width, 280)),
        height: Math.floor(Math.max(height, 280 / gameAspect)),
      });
    };

    updateDisplaySize();
    window.addEventListener('resize', updateDisplaySize);
    const onFsUpdate = () => requestAnimationFrame(updateDisplaySize);
    document.addEventListener('fullscreenchange', onFsUpdate);
    return () => {
      window.removeEventListener('resize', updateDisplaySize);
      document.removeEventListener('fullscreenchange', onFsUpdate);
    };
  }, [isMobile]);

  const {
    gameState,
    startGame,
    pauseGame,
    togglePause,
    restartGame: rawRestart,
    movePaddle,
  } = useGameEngine({
    config,
    onGameOver: useCallback((winner: number) => {
      if (onGameOver) onGameOver(winner, 0, 0);
    }, [onGameOver]),
    sounds: {
      onPaddleHit: playPaddleHit,
      onWallHit: playWallHit,
      onScore: playScore,
      onPowerUp: playPowerUp,
      onVictory: playVictory,
    },
  });

  // Wrap restart to show countdown again
  const restartGame = useCallback(() => {
    rawRestart();
    setShowCountdown(true);
  }, [rawRestart]);

  // Start game after countdown
  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    startGame();
  }, [startGame]);

  useGameMusic(musicEnabled && !gameState.isPaused && !gameState.isGameOver && !showCountdown, config.theme);

  const { handleMouseMove, handleTouchMove } = useGameControls({
    config,
    canvasRef,
    movePaddle,
    togglePause,
    isPaused: gameState.isPaused,
    sensitivity: config.paddleSensitivity,
  });

  // Keyboard restart after game over
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
      className={`flex flex-col items-center justify-center p-2 md:p-4 ${isFullscreen ? 'h-screen overflow-hidden' : 'min-h-screen'}`}
      style={{ backgroundColor: `hsl(${theme.background})` }}
    >
      {/* Game Header */}
      <div className="flex items-center justify-between w-full mb-2 md:mb-4 px-1 md:px-2" style={{ maxWidth: displaySize.width }}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs md:text-sm"
          onClick={() => {
            if (!gameState.isGameOver && (gameState.players[0].paddle.score > 0 || gameState.players[1].paddle.score > 0)) {
              setShowExitConfirm(true);
            } else {
              onBackToMenu();
            }
          }}
          style={{ color: `hsl(${theme.foreground})` }}
        >
          <Home className="w-4 h-4 mr-1 md:mr-2" />
          <span className="hidden md:inline">Menu</span>
        </Button>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setSoundEnabled(!soundEnabled)} style={{ color: `hsl(${theme.foreground})` }}>
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setMusicEnabled(!musicEnabled)} style={{ color: `hsl(${theme.foreground})` }}>
            <div className="relative">
              <Music className="w-4 h-4" />
              {!musicEnabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[120%] h-[2px] -rotate-45" style={{ backgroundColor: `hsl(${theme.foreground})` }} />
                </div>
              )}
            </div>
          </Button>

          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleFullscreen} style={{ color: `hsl(${theme.foreground})` }}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          {!gameState.isGameOver && (
            <>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={togglePause} style={{ color: `hsl(${theme.foreground})` }}>
                {gameState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={restartGame} style={{ color: `hsl(${theme.foreground})` }}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Game Canvas with overlays */}
      <div className="relative">
        <GameCanvas
          ref={canvasRef}
          gameState={gameState}
          displayWidth={displaySize.width}
          displayHeight={displaySize.height}
          onMouseMove={!isMobile ? handleMouseMove : undefined}
          onTouchMove={handleTouchMove}
        />

        {/* Countdown */}
        {showCountdown && (
          <CountdownOverlay
            theme={theme}
            onComplete={handleCountdownComplete}
            displayWidth={displaySize.width}
            displayHeight={displaySize.height}
          />
        )}

        {/* Victory screen */}
        {gameState.isGameOver && gameState.winner !== null && (
          <VictoryScreen
            winnerName={gameState.players[gameState.winner].nickname}
            score1={gameState.players[0].paddle.score}
            score2={gameState.players[1].paddle.score}
            theme={theme}
            displayWidth={displaySize.width}
            displayHeight={displaySize.height}
          />
        )}

        {/* Touch zones indicator */}
        {isMobile && config.mode === 'local' && gameState.isPaused && !showCountdown && (
          <div className="absolute inset-0 flex pointer-events-none rounded-lg overflow-hidden">
            <div className="flex-1 border-r border-dashed flex items-center justify-center" style={{ borderColor: `hsl(${theme.foreground} / 0.2)` }}>
              <span className="text-sm" style={{ color: `hsl(${theme.foreground} / 0.5)` }}>P1</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-sm" style={{ color: `hsl(${theme.foreground} / 0.5)` }}>P2</span>
            </div>
          </div>
        )}

        {/* Single-player touch zone for mobile */}
        {isMobile && config.mode === 'single' && gameState.isPaused && !showCountdown && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-lg">
            <span className="text-sm" style={{ color: `hsl(${theme.foreground} / 0.4)` }}>
              Tocca e trascina per muovere
            </span>
          </div>
        )}
      </div>

      {/* Power-ups Legend */}
      {config.powerUpsEnabled && (
        <div 
          className="flex flex-wrap justify-center gap-2 md:gap-4 mt-2 md:mt-4 text-xs md:text-sm"
          style={{ color: `hsl(${theme.foreground} / 0.7)` }}
        >
          <span>🔵 Allarga</span>
          <span>🔴 Rimpicciolisci</span>
          <span>🟢 Rallenta</span>
          <span>🟡 Velocizza</span>
          <span>🟣 Multi-palla</span>
          <span>🛡️ Scudo</span>
          <span>👻 Invisibile</span>
          <span>🔄 Inverti</span>
        </div>
      )}

      {/* Game Over Actions */}
      {gameState.isGameOver && (
        <div className="flex gap-2 md:gap-4 mt-4 md:mt-6 animate-in fade-in slide-in-from-bottom-4">
          <Button variant="outline" size={isMobile ? "default" : "lg"} onClick={restartGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Gioca ancora
          </Button>
          <Button variant="default" size={isMobile ? "default" : "lg"} onClick={onBackToMenu}>
            <Home className="w-4 h-4 mr-2" />
            Menu
          </Button>
        </div>
      )}

      {/* Controls hint */}
      {!isMobile && gameState.isPaused && !gameState.isGameOver && !showCountdown && (
        <div className="mt-2 md:mt-4 text-xs md:text-sm" style={{ color: `hsl(${theme.foreground} / 0.5)` }}>
          ESC o SPAZIO per mettere in pausa
        </div>
      )}

      {/* Exit Confirmation */}
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
