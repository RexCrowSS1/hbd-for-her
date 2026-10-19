import { useEffect, useRef } from 'react';
import { photos } from '../data/photos.js';

export default function Lightbox({ index, openerRef, onClose, onChange }) {
  const dialogRef = useRef(null);
  const isOpen = index !== null;
  const photo = photos[index ?? 0];
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const opener = openerRef.current;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      opener?.focus({ preventScroll: true });
    };
  }, [isOpen, openerRef]);

  function handleKey(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      onChange(event.key === 'ArrowRight' ? 1 : -1);
    }
  }

  return (
    <dialog ref={dialogRef} className="lightbox" aria-label="Galeri foto Cinut" onCancel={onClose} onKeyDown={handleKey} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="lightbox-top">
        <span className="lightbox-count">0{(index ?? 0) + 1} / 04</span>
        <button className="lightbox-close" aria-label="Tutup foto" type="button" onClick={onClose}>Tutup <span aria-hidden="true">×</span></button>
      </div>
      <div className="lightbox-body">
        <button className="lightbox-prev" aria-label="Foto sebelumnya" type="button" onClick={() => onChange(-1)}>←</button>
        <img className="lightbox-image" src={photo.src} alt={photo.alt} />
        <button className="lightbox-next" aria-label="Foto berikutnya" type="button" onClick={() => onChange(1)}>→</button>
      </div>
      <p className="lightbox-caption handwritten">{photo.caption}</p>
    </dialog>
  );
}
