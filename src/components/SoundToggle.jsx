import { useEffect, useRef, useState } from 'react';
import { birthdaySong } from '../data/music.js';
import useBirthdayPlayer from '../hooks/useBirthdayPlayer.js';

const messages = {
  loading: 'Menyiapkan lagu untukmu…',
  ready: 'Bagian awal lagu, khusus untuk hari ini.',
  starting: 'Memulai lagu…',
  buffering: 'Lagunya sedang dimuat…',
  playing: 'Selamat ulang tahun, orang favoritku.',
  paused: 'Lagunya dijeda. Lanjutkan kapan saja.',
  ended: 'Mau dengar bagian awalnya lagi?',
  blocked: 'Ketuk Play untuk memulai lagunya.',
  error: 'Lagu belum bisa dimuat. Ketuk coba lagi, ya.',
};

const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function SoundToggle({ introComplete = false, obscured = false }) {
  const [expanded, setExpanded] = useState(false);
  const autoOpened = useRef(false);
  const buttonRef = useRef(null);
  const audioRef = useRef(null);
  const music = useBirthdayPlayer({ audioRef, visible: expanded && introComplete && !obscured, introComplete });
  const playing = music.status === 'playing';

  useEffect(() => {
    if (introComplete && !autoOpened.current) {
      autoOpened.current = true;
      setExpanded(true);
    }
  }, [introComplete]);

  useEffect(() => {
    if (!expanded) return;
    const handleKey = event => {
      if (event.key === 'Escape') {
        music.pause();
        setExpanded(false);
        buttonRef.current.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [expanded, music.pause]);

  function closePanel() {
    music.pause();
    setExpanded(false);
    buttonRef.current.focus({ preventScroll: true });
  }
  function togglePanel() {
    if (expanded) closePanel();
    else setExpanded(true);
  }

  return (
    <div className="sound-control">
      <audio ref={audioRef} src={birthdaySong.src} preload="auto" hidden />
      <button ref={buttonRef} className="sound-toggle" type="button" aria-expanded={expanded} aria-controls="birthday-music" aria-label={expanded ? 'Sembunyikan pemutar lagu' : 'Buka pemutar lagu'} onClick={togglePanel}>
        <svg width="15" height="17" viewBox="0 0 20 22" fill="none" aria-hidden="true"><path d="M7 16V4L17 2V14M7 7L17 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><ellipse cx="4" cy="17" rx="3" ry="2.5" stroke="currentColor" strokeWidth="1.3"/><ellipse cx="14" cy="15" rx="3" ry="2.5" stroke="currentColor" strokeWidth="1.3"/></svg>
        <span className="sound-label">{playing ? 'Lagu diputar' : 'Lagu untukmu'}</span>
      </button>
      <section id="birthday-music" className="music-panel" aria-label="Lagu untuk Cinut" hidden={!expanded}>
        <div className="music-panel-heading">
          <div><p className="eyebrow">SATU LAGU, KHUSUS UNTUKMU</p><p className="handwritten">teman baca surat kecil ini.</p></div>
          <button className="music-minimize" type="button" aria-label="Tutup dan jeda lagu" onClick={closePanel}>×</button>
        </div>
        <p className="music-track-title">{birthdaySong.title}<span>{birthdaySong.artist}</span></p>
        <div className="music-timeline" aria-hidden="true"><span style={{ width: `${music.currentTime / birthdaySong.durationSeconds * 100}%` }} /></div>
        <div className="music-playback-controls">
          <button className="music-play-button" type="button" disabled={!music.ready} onClick={() => playing ? music.pause() : music.play()} aria-label={playing ? 'Jeda lagu' : 'Putar lagu'}>
            <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>{playing ? 'Jeda' : 'Play'}
          </button>
          <button className="music-restart" type="button" disabled={!music.ready} onClick={() => music.play(true)}><span aria-hidden="true">↻</span> Ulangi awal</button>
          <span className="music-clip-label">{formatTime(music.currentTime)} / {formatTime(birthdaySong.durationSeconds)}</span>
        </div>
        <div className="music-volume">
          <div className="volume-heading"><label htmlFor="music-volume">Volume</label><output htmlFor="music-volume">{music.volume}%</output></div>
          <div className="volume-slider-row">
            <button className="volume-step" type="button" aria-label="Kecilkan volume" disabled={!music.ready || music.volume === 0} onClick={() => music.setVolume(music.volume - 10)}>−</button>
            <input id="music-volume" type="range" min="0" max="100" step="1" value={music.volume} disabled={!music.ready} aria-valuetext={`${music.volume} persen`} onChange={event => music.setVolume(event.target.value)} />
            <button className="volume-step" type="button" aria-label="Besarkan volume" disabled={!music.ready || music.volume === 100} onClick={() => music.setVolume(music.volume + 10)}>+</button>
            <button className="volume-mute" type="button" aria-label={music.volume === 0 ? 'Aktifkan suara' : 'Bisukan lagu'} disabled={!music.ready} onClick={music.toggleMute}>{music.volume === 0 ? 'Suara on' : 'Bisukan'}</button>
          </div>
        </div>
        <p className="music-note" aria-live="polite">{messages[music.status]}</p>
        {music.status === 'error' && <button className="music-retry" type="button" onClick={music.retry}>Coba muat lagi ↻</button>}
        <div className="music-source-links">
          <a href={birthdaySong.url} target="_blank" rel="noopener noreferrer">Buka Spotify <span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </div>
  );
}
