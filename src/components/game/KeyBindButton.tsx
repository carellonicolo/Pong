import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

const KEY_DISPLAY_NAMES: Record<string, string> = {
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  ' ': 'Spazio',
  escape: 'Esc',
  enter: 'Invio',
  tab: 'Tab',
  shift: 'Shift',
  control: 'Ctrl',
  alt: 'Alt',
  backspace: '←Delete',
};

interface KeyBindButtonProps {
  currentKey: string;
  onKeyChange: (key: string) => void;
}

export const KeyBindButton: React.FC<KeyBindButtonProps> = ({ currentKey, onKeyChange }) => {
  const [listening, setListening] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!listening) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Ignore modifier-only presses and pause keys
      if (['escape', ' '].includes(e.key.toLowerCase())) {
        setListening(false);
        return;
      }
      onKeyChange(e.key.toLowerCase());
      setListening(false);
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [listening, onKeyChange]);

  // Close on click outside
  useEffect(() => {
    if (!listening) return;
    const handler = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setListening(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [listening]);

  const displayName = KEY_DISPLAY_NAMES[currentKey] || currentKey.toUpperCase();

  return (
    <Button
      ref={buttonRef}
      variant={listening ? 'default' : 'outline'}
      size="sm"
      className="min-w-[60px] font-mono text-xs"
      onClick={() => setListening(true)}
    >
      {listening ? '...' : displayName}
    </Button>
  );
};
