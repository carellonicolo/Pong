import React, { useState } from 'react';
import { MainMenu } from '@/components/game/MainMenu';
import { PongGame } from '@/components/game/PongGame';
import { GameConfig } from '@/types/game';

type Screen = 'menu' | 'game' | 'leaderboard';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
    setCurrentScreen('game');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setGameConfig(null);
  };

  const handleGameOver = (winner: number, player1Score: number, player2Score: number) => {
    console.log(`Game Over! Winner: Player ${winner + 1}, Score: ${player1Score} - ${player2Score}`);
    // TODO: Save to leaderboard when online mode is implemented
  };

  if (currentScreen === 'game' && gameConfig) {
    return (
      <PongGame
        config={gameConfig}
        onBackToMenu={handleBackToMenu}
        onGameOver={handleGameOver}
      />
    );
  }

  return (
    <MainMenu
      onStartGame={handleStartGame}
      onViewLeaderboard={() => setCurrentScreen('leaderboard')}
    />
  );
};

export default Index;
