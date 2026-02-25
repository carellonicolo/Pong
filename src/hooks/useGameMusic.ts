import { useCallback, useRef, useEffect } from 'react';
import { GameTheme } from '@/types/game';

interface MusicStyle {
  chords: number[][];
  tempo: number; // ms per note
  waveform: OscillatorType;
  bassWaveform: OscillatorType;
  gain: number;
}

const MUSIC_STYLES: Record<string, MusicStyle> = {
  retro: {
    chords: [[130.81, 155.56, 196.00], [174.61, 220.00, 261.63], [155.56, 196.00, 233.08], [164.81, 196.00, 246.94]],
    tempo: 200, waveform: 'triangle', bassWaveform: 'sine', gain: 0.08,
  },
  minimal: {
    chords: [[261.63, 329.63, 392.00], [293.66, 349.23, 440.00], [329.63, 392.00, 493.88], [261.63, 329.63, 392.00]],
    tempo: 300, waveform: 'sine', bassWaveform: 'sine', gain: 0.05,
  },
  'minimal-dark': {
    chords: [[196.00, 233.08, 293.66], [220.00, 261.63, 329.63], [196.00, 246.94, 293.66], [174.61, 220.00, 261.63]],
    tempo: 280, waveform: 'sine', bassWaveform: 'sine', gain: 0.05,
  },
  futuristic: {
    chords: [[146.83, 174.61, 220.00], [164.81, 196.00, 246.94], [174.61, 220.00, 277.18], [196.00, 233.08, 293.66]],
    tempo: 160, waveform: 'sawtooth', bassWaveform: 'square', gain: 0.06,
  },
  ocean: {
    chords: [[196.00, 246.94, 293.66], [220.00, 277.18, 329.63], [246.94, 311.13, 369.99], [220.00, 277.18, 329.63]],
    tempo: 350, waveform: 'sine', bassWaveform: 'sine', gain: 0.06,
  },
  sunset: {
    chords: [[220.00, 277.18, 329.63], [246.94, 311.13, 369.99], [261.63, 329.63, 392.00], [233.08, 293.66, 349.23]],
    tempo: 260, waveform: 'triangle', bassWaveform: 'sine', gain: 0.07,
  },
  candy: {
    chords: [[329.63, 392.00, 493.88], [349.23, 440.00, 523.25], [392.00, 493.88, 587.33], [349.23, 440.00, 523.25]],
    tempo: 180, waveform: 'square', bassWaveform: 'triangle', gain: 0.05,
  },
  sepia: {
    chords: [[196.00, 233.08, 293.66], [174.61, 220.00, 261.63], [164.81, 196.00, 246.94], [174.61, 220.00, 261.63]],
    tempo: 320, waveform: 'triangle', bassWaveform: 'sine', gain: 0.06,
  },
  blood: {
    chords: [[130.81, 155.56, 196.00], [123.47, 146.83, 174.61], [116.54, 138.59, 164.81], [123.47, 146.83, 174.61]],
    tempo: 240, waveform: 'sawtooth', bassWaveform: 'square', gain: 0.07,
  },
  matrix: {
    chords: [[130.81, 164.81, 196.00], [146.83, 174.61, 220.00], [130.81, 164.81, 196.00], [155.56, 196.00, 233.08]],
    tempo: 150, waveform: 'square', bassWaveform: 'square', gain: 0.06,
  },
  frost: {
    chords: [[293.66, 369.99, 440.00], [329.63, 392.00, 493.88], [349.23, 440.00, 523.25], [329.63, 392.00, 493.88]],
    tempo: 340, waveform: 'sine', bassWaveform: 'sine', gain: 0.05,
  },
  vaporwave: {
    chords: [[220.00, 277.18, 329.63], [196.00, 246.94, 293.66], [233.08, 293.66, 349.23], [207.65, 261.63, 311.13]],
    tempo: 280, waveform: 'triangle', bassWaveform: 'triangle', gain: 0.07,
  },
  custom: {
    chords: [[130.81, 155.56, 196.00], [174.61, 220.00, 261.63], [155.56, 196.00, 233.08], [164.81, 196.00, 246.94]],
    tempo: 200, waveform: 'triangle', bassWaveform: 'sine', gain: 0.08,
  },
};

export const useGameMusic = (enabled: boolean, theme: GameTheme = 'retro') => {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const intervalsRef = useRef<number[]>([]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
    if (gainRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, (ctxRef.current?.currentTime ?? 0) + 0.3);
    }
  }, []);

  const start = useCallback(() => {
    if (isPlayingRef.current) return;

    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const style = MUSIC_STYLES[theme] || MUSIC_STYLES.retro;

    const master = ctx.createGain();
    master.gain.setValueAtTime(style.gain, ctx.currentTime);
    master.connect(ctx.destination);
    gainRef.current = master;
    isPlayingRef.current = true;

    let chordIndex = 0;
    let noteIndex = 0;

    const playNote = () => {
      if (!isPlayingRef.current) return;
      const chord = style.chords[chordIndex];
      const freq = chord[noteIndex % chord.length] * (noteIndex >= 3 ? 2 : 1);

      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = style.waveform;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      env.gain.setValueAtTime(0.3, ctx.currentTime);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + style.tempo / 1000 + 0.05);
      osc.connect(env);
      env.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + style.tempo / 1000 + 0.1);

      noteIndex++;
      if (noteIndex >= 6) {
        noteIndex = 0;
        chordIndex = (chordIndex + 1) % style.chords.length;
      }
    };

    const playBass = () => {
      if (!isPlayingRef.current) return;
      const chord = style.chords[chordIndex];
      const bassFreq = chord[0] / 2;

      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = style.bassWaveform;
      osc.frequency.setValueAtTime(bassFreq, ctx.currentTime);
      env.gain.setValueAtTime(0.4, ctx.currentTime);
      env.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(env);
      env.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    };

    const arpInterval = setInterval(playNote, style.tempo) as unknown as number;
    const bassInterval = setInterval(playBass, style.tempo * 6) as unknown as number;
    intervalsRef.current = [arpInterval, bassInterval];

    playNote();
    playBass();
  }, [theme]);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [enabled, start, stop]);

  return { startMusic: start, stopMusic: stop };
};
