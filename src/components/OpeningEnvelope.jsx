import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';
import { preloadWelcome } from '../lib/preloadWelcome.js';

export default function OpeningEnvelope({ onComplete, onOpen }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState('loading');
  const reducedMotion = useReducedMotion();
  const startedAt = useRef(performance.now());
  const openButton = useRef(null);
  const opened = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    preloadWelcome({ signal: controller.signal, onProgress: setProgress }).then(() => {
      if (!controller.signal.aborted) setReady(true);
    });
    return () => {
      controller.abort();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!ready || phase !== 'loading') return;
    const elapsed = performance.now() - startedAt.current;
    // Let the final progress fill finish before fading into the opening button.
    const timer = setTimeout(() => setPhase('ready'), reducedMotion ? 0 : Math.max(950, 1200 - elapsed));
    return () => clearTimeout(timer);
  }, [ready, phase, reducedMotion]);

  useEffect(() => {
    if (phase === 'ready') openButton.current?.focus({ preventScroll: true });
  }, [phase]);

  function openLetter() {
    if (phase !== 'ready' || opened.current) return;
    opened.current = true;
    onOpen?.();
    setPhase('opening');
  }

  useEffect(() => {
    if (phase !== 'opening') return;
    const timer = setTimeout(onComplete, reducedMotion ? 0 : 1700);
    return () => clearTimeout(timer);
  }, [phase, reducedMotion, onComplete]);

  return (
    <div className={`opening-screen is-${phase}`} aria-label="Membuka ucapan untuk Cinut" aria-busy={!ready}>
      <p className="opening-kicker">SEBUAH SURAT UNTUK ORANG FAVORITKU</p>
      <div className="opening-composition" aria-hidden="true">
        <span className="opening-spark opening-spark-one">✧</span>
        <span className="opening-spark opening-spark-two">✦</span>
        <div className="opening-envelope">
          <div className="opening-envelope-back" />
          <div className="opening-letter">
            <span className="handwritten">Dear Cinut,</span>
            <span className="opening-letter-message">hari ini,<br />tentang <em>kamu.</em></span>
            <span className="opening-letter-heart">♡</span>
          </div>
          <div className="opening-envelope-front" />
          <div className="opening-envelope-flap" />
          <div className="opening-seal">♡</div>
          <span className="opening-address handwritten">untuk Cinut,<small>dengan sayang.</small></span>
        </div>
        <span className="opening-caption handwritten">a little surprise, just for you.</span>
      </div>
      <div className="opening-status">
        <p aria-live="polite" role="status"><span key={phase} className="opening-status-copy">{phase === 'opening' ? 'Selamat ulang tahun, sayang.' : phase === 'ready' ? 'Surat kecilmu sudah siap.' : 'Sebentar ya, ada sesuatu untukmu…'}</span></p>
        <div className="opening-action">
          {phase !== 'loading' && <button ref={openButton} className="opening-open-button" type="button" disabled={phase !== 'ready'} aria-hidden={phase !== 'ready'} tabIndex={phase === 'ready' ? 0 : -1} onClick={openLetter}>Buka suratnya <span aria-hidden="true">♡</span></button>}
          <div className="opening-progress" role="progressbar" aria-hidden={phase !== 'loading'} aria-label="Menyiapkan ucapan" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ready ? 100 : progress}>
            <span style={{ transform: `scaleX(${(ready ? 100 : progress) / 100})` }} />
          </div>
        </div>
        <span key={phase} className="opening-progress-label" aria-hidden="true">{phase === 'loading' ? 'SEDANG DISIAPKAN UNTUKMU' : 'DIBUAT DENGAN SAYANG'}</span>
      </div>
      <span className="opening-footer">CENAT · CENUT · CINUT</span>
    </div>
  );
}
