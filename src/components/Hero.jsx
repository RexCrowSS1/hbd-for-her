export default function Hero({ onPhoto }) {
  return (
      <section className="hero section-wrap" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow hero-enter"><span className="tiny-star" aria-hidden="true">✳</span> HARI INI, TENTANG KAMU</div>
          <h1 id="hero-title" className="hero-enter">Selamat<br />ulang tahun,<br /><em>Cinut.</em><svg className="title-heart" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M39 66C26 54 6 38 12 23C17 9 34 14 39 25C45 9 65 10 69 24C74 41 51 58 39 66Z" stroke="currentColor" strokeWidth="1.8"/><path d="M44 65C30 55 15 43 13 33" stroke="currentColor" strokeWidth=".8"/></svg></h1>
          <p className="hero-description hero-enter">Ada banyak hal baik di dunia.<br />Buat aku, salah satunya kamu.</p>
          <a className="button button-burgundy hero-enter" href="#surat">Ada sesuatu buat kamu <span aria-hidden="true">↗</span></a>
          <p className="hero-footnote hero-enter">dibuat dengan sayang, khusus untukmu.</p>
        </div>

        <div className="hero-art" aria-label="Foto-foto Cinut">
          <div className="orbit orbit-one" aria-hidden="true"></div>
          <div className="orbit orbit-two" aria-hidden="true"></div>
          <span className="art-spark spark-one" aria-hidden="true">✧</span>
          <span className="art-spark spark-two" aria-hidden="true">✦</span>
          <button className="polaroid polaroid-back" onClick={(event) => onPhoto(0, event.currentTarget)} type="button" aria-label="Lihat foto Cinut dengan filter lucu">
            <img src="assets/cinut-01.jpeg" alt="Cinut dengan filter telinga anjing yang lucu" width="887" height="1600" />
            <span>gemasnya kamu.</span>
          </button>
          <button className="polaroid polaroid-side" onClick={(event) => onPhoto(1, event.currentTarget)} type="button" aria-label="Lihat foto Cinut berkacamata">
            <img src="assets/cinut-02.jpeg" alt="Dua potret Cinut berkacamata" width="798" height="880" />
            <span>my kind of lovely ♡</span>
          </button>
          <button className="polaroid polaroid-front" onClick={(event) => onPhoto(3, event.currentTarget)} type="button" aria-label="Lihat foto favorit Cinut">
            <span className="photo-tape" aria-hidden="true"></span>
            <img src="assets/cinut-04.jpeg" alt="Potret dekat Cinut dengan senyum lembut" width="884" height="1600" fetchPriority="high" />
            <span>my favorite person.</span>
          </button>
          <div className="birthday-stamp" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="stamp-circle" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs><circle cx="60" cy="60" r="58"/><circle cx="60" cy="60" r="34"/><text><textPath href="#stamp-circle" textLength="280">CENAT · CENUT · CINUT · DENGAN SAYANG · </textPath></text><path className="stamp-heart" d="M60 77C50 69 40 60 43 51C46 42 56 45 60 51C65 42 75 44 78 52C81 61 69 72 60 77Z"/></svg></div>
          <div className="handwritten hero-note" aria-hidden="true">yes, it's you!<svg viewBox="0 0 90 60" fill="none"><path d="M85 8C68 6 71 38 45 36C29 35 20 26 9 23M9 23L16 35M9 23L23 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        </div>
        <a className="scroll-cue" href="#kenangan"><span className="scroll-line" aria-hidden="true"></span> PELAN-PELAN, MASIH ADA CERITANYA <span aria-hidden="true">↓</span></a>
        <span className="hero-edition">A LITTLE LOVE NOTE / 01</span>
      </section>
  );
}
