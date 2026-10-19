import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';
import { preloadWelcome } from '../lib/preloadWelcome.js';

export default function OpeningEnvelope({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState('loading');
  const reducedMotion = useReducedMotion();
  const startedAt = useRef(performance.now());

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
    const timer = setTimeout(() => setPhase('opening'), reducedMotion ? 0 : Math.max(0, 1200 - elapsed));
    return () => clearTimeout(timer);
  }, [ready, phase, reducedMotion]);

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
        <p aria-live="polite" role="status">{phase === 'opening' ? 'Selamat ulang tahun, sayang.' : ready ? 'Surat kecilmu sudah siap.' : 'Sebentar ya, ada sesuatu untukmu…'}</p>
        <div className="opening-progress" role="progressbar" aria-label="Menyiapkan ucapan" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ready ? 100 : progress}>
          <span style={{ transform: `scaleX(${(ready ? 100 : progress) / 100})` }} />
        </div>
        <span className="opening-progress-label" aria-hidden="true">{ready ? 'DIBUAT DENGAN SAYANG' : `${String(progress).padStart(2, '0')} / 100`}</span>
      </div>
      <span className="opening-footer">CENAT · CENUT · CINUT</span>
    </div>
  );
}
