import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SoundToggle from '../components/SoundToggle.jsx';

function mediaProperty(audio, name, value) {
  Object.defineProperty(audio, name, { configurable: true, value });
}

beforeEach(() => {
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  HTMLMediaElement.prototype.play.mockImplementation(function () {
    mediaProperty(this, 'paused', false);
    mediaProperty(this, 'ended', false);
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  });
  HTMLMediaElement.prototype.pause.mockImplementation(function () {
    if (this.paused) return;
    mediaProperty(this, 'paused', true);
    this.dispatchEvent(new Event('pause'));
  });
  HTMLMediaElement.prototype.load.mockImplementation(function () {
    mediaProperty(this, 'readyState', 0);
    mediaProperty(this, 'ended', false);
    this.currentTime = 0;
  });
});

async function mountPlayer(props = { introComplete: true }, ready = true) {
  const result = render(<StrictMode><SoundToggle {...props} /></StrictMode>);
  const audio = result.container.querySelector('audio');
  if (ready) await act(async () => fireEvent.canPlay(audio));
  return { ...result, audio };
}

async function click(button) {
  await act(async () => fireEvent.click(button));
}

describe('Pemutar MP3 ulang tahun', () => {
  it('memakai file lokal dan menunggu amplop selesai sebelum autoplay satu kali', async () => {
    const { audio, rerender, container } = await mountPlayer({ introComplete: false });
    expect(audio.getAttribute('src')).toBe('/assets/happy-birthday-intro.mp3');
    expect(audio.preload).toBe('auto');
    expect(container.querySelector('iframe')).toBeNull();
    expect(audio.play).not.toHaveBeenCalled();
    await act(async () => rerender(<StrictMode><SoundToggle introComplete /></StrictMode>));
    expect(audio.volume).toBe(.4);
    expect(audio.currentTime).toBe(0);
    expect(audio.play).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Jeda lagu' })).not.toBeNull();
    rerender(<StrictMode><SoundToggle introComplete /></StrictMode>);
    fireEvent.canPlay(audio);
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it('menunggu audio siap jika loading amplop lebih dahulu selesai', async () => {
    const { audio } = await mountPlayer({ introComplete: true }, false);
    expect(audio.play).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Putar lagu' }).disabled).toBe(true);
    await act(async () => fireEvent.canPlay(audio));
    expect(audio.play).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Jeda lagu' }).disabled).toBe(false);
  });

  it('slider, tombol volume, dan bisu mengubah volume elemen audio', async () => {
    const { audio } = await mountPlayer();
    const slider = screen.getByRole('slider', { name: 'Volume' });
    fireEvent.change(slider, { target: { value: '23' } });
    expect(audio.volume).toBe(.23);
    fireEvent.click(screen.getByRole('button', { name: 'Besarkan volume' }));
    expect(audio.volume).toBe(.33);
    fireEvent.click(screen.getByRole('button', { name: 'Kecilkan volume' }));
    expect(audio.volume).toBe(.23);
    fireEvent.click(screen.getByRole('button', { name: 'Bisukan lagu' }));
    expect(audio.muted).toBe(true);
    expect(audio.volume).toBe(0);
    expect(slider.value).toBe('0');
    fireEvent.click(screen.getByRole('button', { name: 'Aktifkan suara' }));
    expect(audio.volume).toBe(.23);
    expect(audio.muted).toBe(false);
    fireEvent.change(slider, { target: { value: '100' } });
    expect(audio.volume).toBe(1);
    expect(screen.getByRole('button', { name: 'Besarkan volume' }).disabled).toBe(true);
  });

  it('menyediakan Play ketika browser menolak autoplay bersuara', async () => {
    HTMLMediaElement.prototype.play.mockRejectedValueOnce(new DOMException('Gesture required', 'NotAllowedError'));
    const { audio } = await mountPlayer();
    expect(screen.getByText('Ketuk Play untuk memulai lagunya.')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Jeda lagu' })).toBeNull();
    await click(screen.getByRole('button', { name: 'Putar lagu' }));
    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Lagu diputar')).not.toBeNull();
  });

  it('menjeda saat ditutup dan melanjutkan dari posisi terakhir setelah Play', async () => {
    const { audio } = await mountPlayer();
    audio.currentTime = 12;
    fireEvent.timeUpdate(audio);
    expect(screen.getByText('0:12 / 0:30')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Tutup dan jeda lagu' }));
    expect(audio.paused).toBe(true);
    expect(screen.queryByRole('region', { name: 'Lagu untuk Cinut' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Buka pemutar lagu' }));
    expect(audio.play).toHaveBeenCalledOnce();
    await click(screen.getByRole('button', { name: 'Putar lagu' }));
    expect(audio.currentTime).toBe(12);
    expect(audio.paused).toBe(false);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(audio.paused).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Buka pemutar lagu' }));
  });

  it('mengakhiri potongan dan mengulangnya dari awal', async () => {
    const { audio } = await mountPlayer();
    audio.currentTime = 30;
    mediaProperty(audio, 'ended', true);
    mediaProperty(audio, 'paused', true);
    fireEvent.ended(audio);
    expect(screen.getByText('Mau dengar bagian awalnya lagi?')).not.toBeNull();
    expect(screen.getByText('0:30 / 0:30')).not.toBeNull();
    await click(screen.getByRole('button', { name: /Ulangi awal/ }));
    expect(audio.currentTime).toBe(0);
    expect(screen.getByText('0:00 / 0:30')).not.toBeNull();
    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(audio.paused).toBe(false);
  });

  it('menjeda saat galeri dibuka atau tab ditinggalkan', async () => {
    const { audio, rerender } = await mountPlayer();
    rerender(<StrictMode><SoundToggle introComplete obscured /></StrictMode>);
    expect(audio.paused).toBe(true);
    rerender(<StrictMode><SoundToggle introComplete /></StrictMode>);
    expect(audio.play).toHaveBeenCalledOnce();
    await click(screen.getByRole('button', { name: 'Putar lagu' }));
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(audio.paused).toBe(true);
  });

  it('menyinkronkan perubahan volume audio dan membersihkan player saat dilepas', async () => {
    vi.useFakeTimers();
    const { audio, unmount } = await mountPlayer();
    audio.volume = .77;
    fireEvent.volumeChange(audio);
    expect(screen.getByRole('slider', { name: 'Volume' }).value).toBe('77');
    // Flush jsdom's queued native volumechange events before checking hook cleanup.
    act(() => vi.advanceTimersByTime(0));
    unmount();
    expect(audio.paused).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('bisa memuat ulang MP3 yang gagal dimuat', async () => {
    const { audio } = await mountPlayer({ introComplete: true }, false);
    fireEvent.error(audio);
    expect(screen.getByRole('button', { name: 'Putar lagu' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /Coba muat lagi/ }));
    expect(audio.load).toHaveBeenCalledOnce();
    await act(async () => fireEvent.canPlay(audio));
    expect(audio.play).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Jeda lagu' })).not.toBeNull();
  });

  it('memberi opsi coba lagi bila file tidak merespons', async () => {
    vi.useFakeTimers();
    await mountPlayer({ introComplete: true }, false);
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole('button', { name: /Coba muat lagi/ })).not.toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('mengabaikan penolakan play yang datang setelah panel ditutup', async () => {
    let rejectPlay;
    HTMLMediaElement.prototype.play.mockImplementationOnce(function () {
      mediaProperty(this, 'paused', false);
      return new Promise((resolve, reject) => { rejectPlay = reject; });
    });
    await mountPlayer();
    fireEvent.click(screen.getByRole('button', { name: 'Tutup dan jeda lagu' }));
    await act(async () => rejectPlay(new DOMException('Interrupted', 'AbortError')));
    fireEvent.click(screen.getByRole('button', { name: 'Buka pemutar lagu' }));
    expect(screen.getByText('Lagunya dijeda. Lanjutkan kapan saja.')).not.toBeNull();
    expect(screen.queryByText('Ketuk Play untuk memulai lagunya.')).toBeNull();
  });
});
