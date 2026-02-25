import { useCallback, useRef, useEffect } from 'react';
import { GameState } from '@/types/game';

const COMMENTS = {
  matchPoint: ['Match point!', 'Punto decisivo!', 'È il momento della verità!'],
  longRally: ['Che scambio incredibile!', 'Non si fermano più!', 'Rally lunghissimo!'],
  score: ['Gol!', 'Punto!', 'A segno!'],
  comeback: ['Rimonta in corso!', 'Si riapre la partita!', 'Non è ancora finita!'],
  domination: ['Dominio totale!', 'Nessuna chance!', 'Partita a senso unico!'],
  powerUp: ['Power-up raccolto!', 'Bonus attivato!', 'Vantaggio acquisito!'],
  shield: ['Scudo attivato!', 'Protezione totale!'],
  multiBall: ['Multi-palla! Caos totale!', 'Attenzione, palle ovunque!'],
  gameStart: ['Si comincia!', 'Via alla partita!', 'Pronti? Via!'],
  victory: ['Partita conclusa!', 'Vittoria schiacciante!', 'È finita!'],
  survivalNewBall: ['Nuova palla in arrivo!', 'Aumenta la difficoltà!', 'Un\'altra palla!'],
  survivalLong: ['Impressionante resistenza!', 'Quanto può durare?', 'Incredibile!'],
  fastBall: ['Che velocità!', 'Impossibile da seguire!', 'Fulmine!'],
  tie: ['Parità!', 'Siamo in equilibrio!', 'Tutto da decidere!'],
};

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const useCommentator = (enabled: boolean) => {
  const lastCommentTimeRef = useRef(0);
  const cooldown = 3000; // minimum ms between comments
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!enabled || !synthRef.current) return;
    const now = Date.now();
    if (now - lastCommentTimeRef.current < cooldown) return;
    lastCommentTimeRef.current = now;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Try to pick an Italian voice
    const voices = synthRef.current.getVoices();
    const italianVoice = voices.find(v => v.lang.startsWith('it'));
    if (italianVoice) utterance.voice = italianVoice;

    synthRef.current.speak(utterance);
  }, [enabled]);

  const commentOnScore = useCallback((scorerIndex: number, state: GameState) => {
    const s0 = state.players[0].paddle.score;
    const s1 = state.players[1].paddle.score;
    const winScore = state.config.winScore;

    if (Math.max(s0, s1) === winScore - 1) {
      speak(pick(COMMENTS.matchPoint));
    } else if (s0 === s1 && s0 > 0) {
      speak(pick(COMMENTS.tie));
    } else if (Math.abs(s0 - s1) >= 3) {
      speak(pick(COMMENTS.domination));
    } else {
      const trailing = s0 < s1 ? 0 : 1;
      if (scorerIndex === trailing && Math.abs(s0 - s1) <= 1) {
        speak(pick(COMMENTS.comeback));
      } else {
        speak(pick(COMMENTS.score));
      }
    }
  }, [speak]);

  const commentOnRally = useCallback((rallyCount: number) => {
    if (rallyCount > 0 && rallyCount % 8 === 0) {
      speak(pick(COMMENTS.longRally));
    }
  }, [speak]);

  const commentOnPowerUp = useCallback((type: string) => {
    if (type === 'shield') speak(pick(COMMENTS.shield));
    else if (type === 'multiBall') speak(pick(COMMENTS.multiBall));
    else speak(pick(COMMENTS.powerUp));
  }, [speak]);

  const commentOnGameStart = useCallback(() => {
    speak(pick(COMMENTS.gameStart));
  }, [speak]);

  const commentOnVictory = useCallback((winnerName: string) => {
    speak(`${winnerName} vince! ${pick(COMMENTS.victory)}`);
  }, [speak]);

  const commentOnSurvivalBall = useCallback(() => {
    speak(pick(COMMENTS.survivalNewBall));
  }, [speak]);

  const commentOnFastBall = useCallback((speed: number) => {
    if (speed > 15) speak(pick(COMMENTS.fastBall));
  }, [speak]);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
  }, []);

  return {
    commentOnScore,
    commentOnRally,
    commentOnPowerUp,
    commentOnGameStart,
    commentOnVictory,
    commentOnSurvivalBall,
    commentOnFastBall,
    stop,
  };
};
