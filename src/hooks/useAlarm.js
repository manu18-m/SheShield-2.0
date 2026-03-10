// src/hooks/useAlarm.js
// Plays a loud siren using Web Audio API — no sound files needed!

import { useRef, useCallback } from "react";

export function useAlarm() {
  const ctxRef      = useRef(null);
  const gainRef     = useRef(null);
  const intervalRef = useRef(null);
  const playingRef  = useRef(false);

  const startAlarm = useCallback(() => {
    if (playingRef.current) return;
    playingRef.current = true;

    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.connect(ctx.destination);
    ctxRef.current  = ctx;
    gainRef.current = gain;

    const playCycle = () => {
      if (!playingRef.current || !ctxRef.current) return;
      const now = ctx.currentTime;

      const hi = ctx.createOscillator();
      hi.type = "sawtooth";
      hi.frequency.setValueAtTime(960, now);
      hi.frequency.exponentialRampToValueAtTime(480, now + 0.45);
      hi.connect(gain);
      hi.start(now);
      hi.stop(now + 0.45);

      const lo = ctx.createOscillator();
      lo.type = "square";
      lo.frequency.setValueAtTime(440, now + 0.05);
      lo.frequency.exponentialRampToValueAtTime(220, now + 0.45);
      const loGain = ctx.createGain();
      loGain.gain.setValueAtTime(0.3, now);
      lo.connect(loGain);
      loGain.connect(gain);
      lo.start(now + 0.05);
      lo.stop(now + 0.45);
    };

    playCycle();
    intervalRef.current = setInterval(playCycle, 700);
  }, []);

  const stopAlarm = useCallback(() => {
    if (!playingRef.current) return;
    playingRef.current = false;
    clearInterval(intervalRef.current);

    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.exponentialRampToValueAtTime(
        0.001,
        ctxRef.current.currentTime + 0.3
      );
      setTimeout(() => {
        try { ctxRef.current.close(); } catch {}
        ctxRef.current  = null;
        gainRef.current = null;
      }, 400);
    }
  }, []);

  return { startAlarm, stopAlarm };
}