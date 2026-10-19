import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import LoveRibbon from './components/LoveRibbon.jsx';
import Memories from './components/Memories.jsx';
import LetterSection from './components/LetterSection.jsx';
import WishSection from './components/WishSection.jsx';
import Footer from './components/Footer.jsx';
import Lightbox from './components/Lightbox.jsx';
import ReadingProgress from './components/ReadingProgress.jsx';
import OpeningEnvelope from './components/OpeningEnvelope.jsx';
import { photos } from './data/photos.js';

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const completeIntro = useCallback(() => setIntroComplete(true), []);
  const mainRef = useRef(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const photoOpener = useRef(null);
  const openPhoto = useCallback((index, opener) => {
    photoOpener.current = opener;
    setActivePhoto(index);
  }, []);
  const closePhoto = useCallback(() => setActivePhoto(null), []);
  const changePhoto = useCallback((direction) => {
    setActivePhoto(index => (index + direction + photos.length) % photos.length);
  }, []);

  useEffect(() => {
    if (introComplete) mainRef.current.focus({ preventScroll: true });
  }, [introComplete]);

  return (
    <>
      {!introComplete && <OpeningEnvelope onComplete={completeIntro} />}
      <div className="site-content" data-ready={introComplete} inert={!introComplete} aria-hidden={!introComplete}>
        <a className="skip-link" href="#main">Lewati ke isi</a>
        <ReadingProgress />
        <Header introComplete={introComplete} musicObscured={activePhoto !== null} />
        <main id="main" ref={mainRef} tabIndex={-1}>
          <Hero onPhoto={openPhoto} />
          <LoveRibbon />
          <Memories onPhoto={openPhoto} />
          <LetterSection />
          <WishSection />
        </main>
        <Footer />
        <Lightbox index={activePhoto} openerRef={photoOpener} onClose={closePhoto} onChange={changePhoto} />
      </div>
    </>
  );
}
