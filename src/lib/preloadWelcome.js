import { photos } from '../data/photos.js';

const fonts = [
  '500 24px Cormorant',
  'italic 400 24px Cormorant',
  '400 14px "DM Sans"',
  '400 24px Caveat',
];

// Wait for local images and fonts, never for the external music player.
// Errors count as settled resources; a slow asset cannot trap visitors.
export function preloadWelcome({ signal, onProgress }) {
  return new Promise(resolve => {
    const cleanups = [];
    const total = photos.length + fonts.length;
    let completed = 0;
    let finished = false;
    let deadline;

    function finish(timedOut = false) {
      if (finished) return;
      finished = true;
      clearTimeout(deadline);
      signal.removeEventListener('abort', abort);
      cleanups.forEach(cleanup => cleanup());
      resolve({ timedOut, completed, total });
    }
    function abort() { finish(); }
    function settled() {
      if (finished) return;
      completed += 1;
      onProgress(Math.round(completed / total * 100));
      if (completed === total) finish();
    }

    if (signal.aborted) { finish(); return; }
    signal.addEventListener('abort', abort, { once: true });
    deadline = setTimeout(() => finish(true), 8000);
    onProgress(0);

    photos.forEach(photo => {
      const image = new Image();
      let handled = false;
      const loaded = () => {
        if (handled || finished) return;
        handled = true;
        // Decode first so photos are painted when the envelope fades away.
        Promise.resolve().then(() => image.decode?.()).then(settled, settled);
      };
      const failed = () => {
        if (handled || finished) return;
        handled = true;
        settled();
      };
      image.onload = loaded;
      image.onerror = failed;
      cleanups.push(() => { image.onload = null; image.onerror = null; });
      image.src = photo.src;
      if (image.complete) {
        if (image.naturalWidth > 0) loaded();
        else failed();
      }
    });

    fonts.forEach(font => {
      Promise.resolve().then(() => document.fonts?.load(font)).then(settled, settled);
    });
  });
}
