import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import LoveLetter from './LoveLetter.jsx';
import useReducedMotion from '../hooks/useReducedMotion.js';

export default function LetterSection() {
  const [status, setStatus] = useState('closed');
  const envelopeRef = useRef(null);
  const letterRef = useRef(null);
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const behavior = reducedMotion ? 'instant' : 'smooth';

  useEffect(() => {
    if (status !== 'opening') return;
    const timer = setTimeout(() => setStatus('open'), reducedMotion ? 0 : 650);
    return () => clearTimeout(timer);
  }, [status, reducedMotion]);
  useEffect(() => {
    if (status === 'open') {
      letterRef.current.focus({ preventScroll: true });
      letterRef.current.scrollIntoView({ behavior, block: 'start' });
    }
  }, [status, behavior]);

  function openLetter() {
    if (status === 'closed') setStatus('opening');
    if (status === 'open') {
      letterRef.current.focus({ preventScroll: true });
      letterRef.current.scrollIntoView({ behavior, block: 'start' });
    }
  }
  function closeLetter() {
    setStatus('closed');
    envelopeRef.current.focus({ preventScroll: true });
    sectionRef.current.scrollIntoView({ behavior, block: 'start' });
  }

  return (
    <section ref={sectionRef} className="letter-section" id="surat" aria-labelledby="letter-title">
      <div className="letter-layout section-wrap">
        <Reveal className="letter-intro">
          <p className="eyebrow"><span className="section-index">02 /</span> DARI AKU, UNTUK KAMU</p>
          <h2 id="letter-title">Ada yang mau<br />aku <em>bilang.</em></h2>
          <p>Aku mungkin nggak selalu pandai<br />merangkai kata. Tapi yang ini,<br />aku tulis pakai hati.</p>
          <span className="handwritten">a little letter, a lot of love.</span>
          <svg className="letter-flower" viewBox="0 0 180 140" fill="none" aria-hidden="true">
            <g stroke="currentColor" strokeWidth="1.2">
              <path d="M67 134C80 106 104 72 117 38M80 109C55 108 37 90 37 90C59 84 76 94 80 109ZM94 84C113 87 131 77 138 63C116 62 101 71 94 84Z" />
              <path d="M116 41C90 40 89 23 101 20C94 3 112 0 121 16C130-2 146 9 139 24C159 22 159 41 140 44C153 60 134 71 124 52C116 69 97 55 116 41Z" />
              <ellipse cx="127" cy="33" rx="8" ry="9" />
            </g>
          </svg>
        </Reveal>
        <Reveal className="envelope-area">
          <button ref={envelopeRef} className={`envelope${status !== 'closed' ? ' is-open' : ''}`} type="button" disabled={status === 'opening'} onClick={openLetter} aria-expanded={status !== 'closed'} aria-controls="love-letter" aria-label={status === 'closed' ? 'Buka surat untuk Cinut' : 'Baca lagi surat untuk Cinut'}>
            <span className="envelope-inner-note" aria-hidden="true">Dear Cinut,</span>
            <span className="envelope-back" aria-hidden="true" />
            <span className="envelope-front" aria-hidden="true" />
            <span className="envelope-flap" aria-hidden="true" />
            <span className="wax-seal" aria-hidden="true">♡</span>
            <span className="envelope-address">untuk Cinut,<br /><small>dengan seluruh sayangku.</small></span>
          </button>
          <p className="envelope-hint">{status === 'closed' ? <>Sentuh segelnya, ada surat untukmu <span aria-hidden="true">↗</span></> : 'Untuk dibaca pelan-pelan, ya. ♡'}</p>
        </Reveal>
        <LoveLetter visible={status === 'open'} letterRef={letterRef} onClose={closeLetter} />
      </div>
    </section>
  );
}
