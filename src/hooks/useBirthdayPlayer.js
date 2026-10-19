import { useCallback, useEffect, useRef, useState } from 'react';
import { birthdaySong } from '../data/music.js';

export default function useBirthdayPlayer({ audioRef, visible, introComplete }) {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('loading');
  const [volume, setVolumeState] = useState(birthdaySong.initialVolume);
  const [currentTime, setCurrentTime] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const volumeRef = useRef(birthdaySong.initialVolume);
  const lastAudible = useRef(birthdaySong.initialVolume || 40);
  const autoplayAttempted = useRef(false);
  const openingPlayback = useRef(false);
  const mounted = useRef(false);
  const request = useRef(0);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  useEffect(() => {
    const audio = audioRef.current;
    mounted.current = true;
    autoplayAttempted.current = false;
    setReady(false);
    setStatus('loading');
    setCurrentTime(0);
    audio.volume = volumeRef.current / 100;
    audio.muted = volumeRef.current === 0;

    const fail = () => {
      request.current += 1;
      setReady(false);
      setStatus('error');
    };
    const deadline = setTimeout(fail, 12000);
    const events = {
      canplay: () => {
        clearTimeout(deadline);
        setReady(true);
        setStatus(previous => ['loading', 'error'].includes(previous) ? 'ready' : previous);
      },
      playing: () => {
        if ((!visibleRef.current && !openingPlayback.current) || document.hidden) { audio.pause(); return; }
        setStatus('playing');
      },
      pause: () => setStatus(audio.ended ? 'ended' : 'paused'),
      waiting: () => setStatus('buffering'),
      ended: () => {
        request.current += 1;
        setCurrentTime(birthdaySong.durationSeconds);
        setStatus('ended');
      },
      timeupdate: () => setCurrentTime(Math.min(audio.currentTime, birthdaySong.durationSeconds)),
      volumechange: () => {
        const actual = audio.muted ? 0 : Math.round(audio.volume * 100);
        volumeRef.current = actual;
        if (actual > 0) lastAudible.current = actual;
        setVolumeState(actual);
      },
      error: () => { clearTimeout(deadline); fail(); },
    };
    Object.entries(events).forEach(([name, handler]) => audio.addEventListener(name, handler));
    if (attempt > 0) audio.load();
    if (audio.readyState >= 3) events.canplay();

    return () => {
      mounted.current = false;
      request.current += 1;
      clearTimeout(deadline);
      Object.entries(events).forEach(([name, handler]) => audio.removeEventListener(name, handler));
      audio.pause();
    };
  }, [audioRef, attempt]);

  const pause = useCallback(() => {
    openingPlayback.current = false;
    request.current += 1;
    audioRef.current?.pause();
  }, [audioRef]);

  const play = useCallback(async (fromBeginning = false, fromOpeningGesture = false) => {
    const audio = audioRef.current;
    if (!audio || document.hidden || (!fromOpeningGesture && (!ready || !visibleRef.current))) return;
    const currentRequest = ++request.current;
    setStatus('starting');
    try {
      if (fromBeginning || audio.ended || audio.currentTime >= birthdaySong.durationSeconds) {
        audio.currentTime = 0;
        setCurrentTime(0);
      }
      await audio.play();
      if (mounted.current && currentRequest === request.current && !audio.paused) setStatus('playing');
    } catch (error) {
      // A pause, retry, or unmount can interrupt an outstanding play request.
      if (!mounted.current || currentRequest !== request.current) return;
      if (error.name === 'NotAllowedError') setStatus('blocked');
      else if (error.name === 'AbortError') setStatus('paused');
      else { setReady(false); setStatus('error'); }
    }
  }, [audioRef, ready]);

  const openFromGesture = useCallback(() => {
    openingPlayback.current = true;
    autoplayAttempted.current = true;
    // Call play synchronously in the click handler, before animation timers or awaits.
    // Native play can wait for audio data without losing the user's activation.
    return play(true, true);
  }, [play]);

  useEffect(() => {
    if (!introComplete || !visible || !ready || autoplayAttempted.current || document.hidden) return;
    autoplayAttempted.current = true;
    play(true);
  }, [introComplete, visible, ready, play]);

  useEffect(() => {
    if (!visible) pause();
    else openingPlayback.current = false;
  }, [visible, pause]);
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pause]);

  const setVolume = useCallback(value => {
    const next = Math.max(0, Math.min(100, Math.round(Number(value))));
    if (!Number.isFinite(next)) return;
    volumeRef.current = next;
    if (next > 0) lastAudible.current = next;
    setVolumeState(next);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = next / 100;
      audio.muted = next === 0;
    }
  }, [audioRef]);

  return {
    ready, status, volume, currentTime, setVolume, play, pause, openFromGesture,
    toggleMute: () => setVolume(volumeRef.current === 0 ? lastAudible.current : 0),
    retry: () => setAttempt(value => value + 1),
  };
}
