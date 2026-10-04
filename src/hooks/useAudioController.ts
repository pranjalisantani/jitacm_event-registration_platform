import { useState, useEffect, useCallback, useRef } from 'react';

export const useAudioController = () => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('acm_muted') === 'true';
  });
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('acm_muted', String(isMuted));
  }, [isMuted]);

  const initAudioCtx = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Futuristic synthesizer chime
  const playChime = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = initAudioCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const frequencies = [220, 277.18, 329.63, 440, 659.25]; // Atmospheric A minor chord

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.6);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08 / (idx + 1), now + idx * 0.08 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 2.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + 2.6);
      });
    } catch {
      // AudioContext fallback
    }
  }, [isMuted, initAudioCtx]);

  // Web Speech API: "Welcome to ACM."
  const playWelcomeVoice = useCallback(() => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Welcome to ACM.');
      utterance.rate = 0.88; // Controlled, deliberate
      utterance.pitch = 0.82; // Deeper, futuristic timbre
      utterance.volume = 0.9;

      const voices = window.speechSynthesis.getVoices();
      // Look for a high-quality natural or cinematic voice if available
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Daniel') ||
            v.name.includes('David') ||
            v.name.includes('Oliver') ||
            v.name.includes('Serena'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback if speech synthesis is blocked
    }
  }, [isMuted]);

  // Subtle UI click tone
  const playUiClick = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = initAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }, [isMuted, initAudioCtx]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  }, []);

  return {
    isMuted,
    toggleMute,
    playChime,
    playWelcomeVoice,
    playUiClick,
  };
};
