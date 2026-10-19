import SoundToggle from './SoundToggle.jsx';

export default function Header({ introComplete, musicObscured }) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="Untuk Cinut, kembali ke awal">untuk cinut<span>♡</span></a>
      <nav aria-label="Navigasi utama">
        <a href="#kenangan">Tentang kamu</a>
        <a href="#surat">Surat kecil</a>
        <a href="#harapan">Satu harapan <span aria-hidden="true">↗</span></a>
      </nav>
      <SoundToggle introComplete={introComplete} obscured={musicObscured} />
    </header>
  );
}
