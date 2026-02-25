import { useCallback, useRef, useEffect } from 'react';

/**
 * Generates a looping retro-style background music track using Web Audio API.
 * The music is a simple chord progression with arpeggiated synth patterns.
 */
export const useGameMusic = (enabled: boolean) => {
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

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.08, ctx.currentTime);
    master.connect(ctx.destination);
    gainRef.current = master;
    isPlayingRef.current = true;

    // Chord progression (i - VI - III - VII in minor)
    const chords = [
      [130.81, 155.56, 196.00], // Cm
      [174.61, 220.00, 261.63], // Ab
      [155.56, 196.00, 233.08], // Eb
      [164.81, 196.00, 246.94], // Bb
    ];

    let chordIndex = 0;
    let noteIndex = 0;

    // Arpeggiator
    const playNote = () => {
      if (!isPlayingRef.current) return;
      const chord = chords[chordIndex];
      const freq = chord[noteIndex % chord.length] * (noteIndex >= 3 ? 2 : 1);

      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      env.gain.setValueAtTime(0.3, ctx.currentTime);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(env);
      env.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);

      noteIndex++;
      if (noteIndex >= 6) {
        noteIndex = 0;
        chordIndex = (chordIndex + 1) % chords.length;
      }
    };

    // Bass line
    const playBass = () => {
      if (!isPlayingRef.current) return;
      const chord = chords[chordIndex];
      const bassFreq = chord[0] / 2;

      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(bassFreq, ctx.currentTime);
      env.gain.setValueAtTime(0.4, ctx.currentTime);
      env.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(env);
      env.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    };

    // Schedule loops
    const arpInterval = setInterval(playNote, 200) as unknown as number;
    const bassInterval = setInterval(playBass, 1200) as unknown as number;
    intervalsRef.current = [arpInterval, bassInterval];

    // Play first notes immediately
    playNote();
    playBass();
  }, []);

  // React to enabled changes
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
