import { useCallback, useRef } from 'react';

const createOscillatorSound = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.3
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const useGameSounds = (enabled: boolean) => {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playPaddleHit = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx();
    createOscillatorSound(ctx, 440, 0.08, 'square', 0.2);
  }, [enabled, getCtx]);

  const playWallHit = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx();
    createOscillatorSound(ctx, 300, 0.06, 'triangle', 0.15);
  }, [enabled, getCtx]);

  const playScore = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx();
    createOscillatorSound(ctx, 220, 0.3, 'sawtooth', 0.2);
    setTimeout(() => createOscillatorSound(ctx, 330, 0.3, 'sawtooth', 0.15), 150);
  }, [enabled, getCtx]);

  const playPowerUp = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx();
    createOscillatorSound(ctx, 600, 0.1, 'sine', 0.25);
    setTimeout(() => createOscillatorSound(ctx, 800, 0.1, 'sine', 0.2), 80);
    setTimeout(() => createOscillatorSound(ctx, 1000, 0.15, 'sine', 0.15), 160);
  }, [enabled, getCtx]);

  const playVictory = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => createOscillatorSound(ctx, freq, 0.25, 'square', 0.2), i * 200);
    });
  }, [enabled, getCtx]);

  return { playPaddleHit, playWallHit, playScore, playPowerUp, playVictory };
};
