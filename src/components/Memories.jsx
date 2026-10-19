import Reveal from './Reveal.jsx';
import { photos } from '../data/photos.js';

export default function Memories({ onPhoto }) {
  return (
    <section className="memories section-wrap" id="kenangan" aria-labelledby="memories-title">
      <Reveal className="section-heading">
        <div>
          <p className="eyebrow"><span className="section-index">01 /</span> TENTANG KAMU</p>
          <h2 id="memories-title">Kamu, dalam hal-hal<br />yang <em>aku suka.</em></h2>
        </div>
        <p className="section-aside">Nggak perlu alasan yang besar.<br />Kadang, sesederhana melihat kamu.<span className="handwritten">dan aku senyum sendiri.</span></p>
      </Reveal>
      <div className="gallery">
        {photos.map((photo, index) => (
          <Reveal as="figure" key={photo.src} className={`memory ${photo.className}`}>
            <button className="memory-image" type="button" onClick={event => onPhoto(index, event.currentTarget)} aria-label={`Perbesar foto ${photo.title}`}>
              <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" />
              <span className="photo-open" aria-hidden="true">↗</span>
            </button>
            <figcaption>
              <span className="photo-number">0{index + 1}</span>
              <div><h3>{photo.title}</h3><p>{photo.note}</p></div>
              {photo.heart && <span className="caption-heart" aria-hidden="true">♡</span>}
            </figcaption>
          </Reveal>
        ))}
      </div>
      <Reveal as="p" className="gallery-postscript"><span aria-hidden="true">↳</span> beberapa foto, banyak alasan untuk sayang.</Reveal>
    </section>
  );
}
