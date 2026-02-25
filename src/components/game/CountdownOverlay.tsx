import React, { useEffect, useState } from 'react';
import { GAME_WIDTH, GAME_HEIGHT, ThemeColors } from '@/types/game';

interface CountdownOverlayProps {
  theme: ThemeColors;
  onComplete: () => void;
  displayWidth: number;
  displayHeight: number;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ theme, onComplete, displayWidth, displayHeight }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(c => c - 1), 800);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (count === 0) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
      style={{ width: displayWidth, height: displayHeight }}
    >
      <div className="absolute inset-0 bg-black/50 rounded-lg" />
      <div
        key={count}
        className="relative text-8xl md:text-9xl font-bold animate-in zoom-in-50 fade-in duration-300"
        style={{ 
          color: `hsl(${theme.foreground})`,
          textShadow: theme.glow ? `0 0 40px hsl(${theme.glow}), 0 0 80px hsl(${theme.glow} / 0.5)` : undefined,
        }}
      >
        {count}
      </div>
    </div>
  );
};
