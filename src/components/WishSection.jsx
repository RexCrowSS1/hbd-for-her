import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import useReducedMotion from '../hooks/useReducedMotion.js';

function createConfetti() {
  const colors = ['#9b5b68', '#c6aa80', '#d3b5a5', '#74806b', '#bdb2a0'];
  return Array.from({ length: 52 }, (_, index) => ({
    '--x': `${(Math.random() - .5) * Math.min(window.innerWidth, 950)}px`,
    '--y': `${140 + Math.random() * 350}px`,
    '--r': `${Math.random() * 720 - 360}deg`,
    '--delay': `${Math.random() * .4}s`,
    '--confetti-color': colors[index % colors.length],
    borderRadius: index % 3 === 0 ? '50%' : undefined,
  }));
}

export default function WishSection() {
  const [status, setStatus] = useState('lit');
  const [confetti, setConfetti] = useState([]);
  const blowRef = useRef(null);
  const relightRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (status !== 'blowing') return;
    const timer = setTimeout(() => setStatus('blown'), reducedMotion ? 0 : 700);
    return () => clearTimeout(timer);
  }, [status, reducedMotion]);
  useEffect(() => {
    if (!confetti.length) return;
    const timer = setTimeout(() => setConfetti([]), 4500);
    return () => clearTimeout(timer);
  }, [confetti]);
  useEffect(() => {
    if (status === 'blown') relightRef.current.focus({ preventScroll: true });
  }, [status]);

  function blow() {
    if (status !== 'lit') return;
    setConfetti(reducedMotion ? [] : createConfetti());
    setStatus('blowing');
  }
  function relight() {
    setStatus('lit');
    setConfetti([]);
  }
  // Restore focus after React has removed the hidden attribute from the button.
  const relighting = useRef(false);
  useEffect(() => {
    if (status === 'lit' && relighting.current) {
      blowRef.current.focus({ preventScroll: true });
      relighting.current = false;
    }
  }, [status]);

  return (
    <section className={`wish-section section-wrap${status !== 'lit' ? ' is-blown' : ''}`} id="harapan" aria-labelledby="wish-title">
      <Reveal as="p" className="eyebrow"><span className="section-index">03 /</span> SEBELUM HALAMAN INI SELESAI</Reveal>
      <Reveal as="h2" id="wish-title">Satu lilin.<br />Berjuta <em>harapan baik.</em></Reveal>
      <Reveal as="p" className="wish-description">Pejamkan mata sebentar, Cinut.<br />Pikirkan satu hal yang paling kamu inginkan.</Reveal>
      <Reveal className="candle-scene" aria-hidden="true">
        <span className="candle-star candle-star-one">✧</span><span className="candle-star candle-star-two">✧</span>
        <div className="candle-glow" /><div className="candle-smoke"><i /><i /><i /></div>
        <div className="flame"><div /></div><div className="wick" />
        <div className="candle"><span /></div><div className="candle-holder" />
        <span className="handwritten candle-note">make a wish ♡</span>
      </Reveal>
      <Reveal className="wish-actions" hidden={status === 'blown'}>
        <button ref={blowRef} className="button button-burgundy blow-button" type="button" onClick={blow} disabled={status !== 'lit'}>
          <span className="blow-label">{status === 'lit' ? 'Sudah? Tiup lilinnya' : 'Fuuuh…'}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 8H15C19 8 19 3 16 3C14 3 13 5 14 6M3 12H20M3 16H13C18 16 18 22 14 21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
        </button>
        <p className="wish-hint">semoga satu per satu jadi nyata.</p>
      </Reveal>
      <div className="wish-result" role="status" aria-live="polite" hidden={status !== 'blown'}>
        <span className="handwritten">Semoga semesta mengaminkan.</span>
        <p>Selamat ulang tahun, Cinut.<br />Semoga kamu selalu merasa dicintai. Karena kamu memang dicintai.</p>
        <button ref={relightRef} className="relight-button" type="button" onClick={() => { relighting.current = true; relight(); }}>Nyalakan sekali lagi <span aria-hidden="true">↻</span></button>
      </div>
      <div className="confetti-container" aria-hidden="true">
        {!reducedMotion && confetti.map((style, index) => <i key={index} className="confetti" style={style} />)}
      </div>
    </section>
  );
}
