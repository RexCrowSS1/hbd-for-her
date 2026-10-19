import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import OpeningEnvelope from '../components/OpeningEnvelope.jsx';
import { mockMotion } from './setup.js';

const originalImage = window.Image;
const originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts');
let images;
let finishFonts;

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  images = [];
  const fontReady = new Promise(resolve => { finishFonts = resolve; });
  Object.defineProperty(document, 'fonts', { configurable: true, value: { load: vi.fn(() => fontReady) } });
  window.Image = class {
    complete = false;
    naturalWidth = 0;
    decode = vi.fn(() => Promise.resolve());
    constructor() { images.push(this); }
  };
});

afterEach(() => {
  window.Image = originalImage;
  if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts);
  else delete document.fonts;
});

async function finishPhotos({ failFirst = false } = {}) {
  await act(async () => {
    images.filter(image => image.onload).forEach((image, index) => {
      if (failFirst && index === 0) image.onerror();
      else image.onload();
    });
  });
}

async function finishAllAssets(options) {
  await finishPhotos(options);
  await act(async () => finishFonts([]));
}

describe('Amplop pembuka', () => {
  it('menunggu ketukan dan memulai audio langsung sebelum animasi, tanpa menunggu canplay', async () => {
    const { container } = render(<StrictMode><App /></StrictMode>);
    const audio = container.querySelector('audio');
    audio.play.mockImplementation(function () {
      Object.defineProperty(this, 'paused', { configurable: true, value: false });
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    });
    const content = container.querySelector('.site-content');
    expect(content.hasAttribute('inert')).toBe(true);
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    await finishPhotos();
    await act(async () => vi.advanceTimersByTimeAsync(1400));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50');
    expect(screen.getByRole('status').textContent).toContain('Sebentar ya');
    await act(async () => finishFonts([]));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
    expect(screen.queryByRole('button', { name: 'Buka suratnya' })).toBeNull();
    await act(async () => vi.advanceTimersByTimeAsync(950));
    const open = screen.getByRole('button', { name: 'Buka suratnya' });
    expect(document.activeElement).toBe(open);
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(audio.play).not.toHaveBeenCalled();
    expect(content.hasAttribute('inert')).toBe(true);
    fireEvent.click(open);
    // No timer, effect, or await should separate the click from native play().
    expect(audio.play).toHaveBeenCalledOnce();
    expect(screen.getByRole('status').textContent).toBe('Selamat ulang tahun, sayang.');
    expect(content.hasAttribute('inert')).toBe(true);
    await act(async () => vi.advanceTimersByTimeAsync(1700));
    expect(screen.queryByLabelText('Membuka ucapan untuk Cinut')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Cinut.');
    expect(content.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole('main'));
    expect(document.body.style.overflow).toBe('');
    fireEvent.canPlay(audio);
    expect(audio.play).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Jeda lagu' })).not.toBeNull();
  });

  it('tetap membuka surat jika audio ditolak dan menyediakan Play tanpa mengulang otomatis', async () => {
    const { container } = render(<StrictMode><App /></StrictMode>);
    const audio = container.querySelector('audio');
    audio.play.mockRejectedValueOnce(new DOMException('Playback blocked', 'NotAllowedError'));
    fireEvent.canPlay(audio);
    await finishAllAssets();
    await act(async () => vi.advanceTimersByTimeAsync(1200));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Buka suratnya' })));
    await act(async () => vi.advanceTimersByTimeAsync(1700));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Cinut.');
    expect(screen.getByText('Ketuk Play untuk memulai lagunya.')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Putar lagu' }).disabled).toBe(false);
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it('tetap membuka halaman jika sebuah foto gagal dimuat', async () => {
    const complete = vi.fn();
    render(<OpeningEnvelope onComplete={complete} />);
    await finishAllAssets({ failFirst: true });
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
    await act(async () => vi.advanceTimersByTimeAsync(1200));
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Buka suratnya' }));
    await act(async () => vi.advanceTimersByTimeAsync(1700));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('tidak menahan pengunjung selamanya saat aset tidak merespons', async () => {
    const complete = vi.fn();
    render(<OpeningEnvelope onComplete={complete} />);
    await act(async () => vi.advanceTimersByTimeAsync(8000));
    await act(async () => vi.advanceTimersByTimeAsync(950));
    fireEvent.click(screen.getByRole('button', { name: 'Buka suratnya' }));
    await act(async () => vi.advanceTimersByTimeAsync(1700));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('melewati waktu animasi jika reduced motion aktif', async () => {
    mockMotion(true);
    const complete = vi.fn();
    render(<OpeningEnvelope onComplete={complete} />);
    await finishAllAssets();
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Buka suratnya' }));
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('membersihkan pemuatan dan kunci scroll saat dilepas', async () => {
    const complete = vi.fn();
    const { unmount } = render(<OpeningEnvelope onComplete={complete} />);
    const lateLoad = images[0].onload;
    unmount();
    await act(async () => { lateLoad(); finishFonts([]); });
    await act(async () => vi.advanceTimersByTimeAsync(12000));
    expect(complete).not.toHaveBeenCalled();
    expect(images.every(image => image.onload === null && image.onerror === null)).toBe(true);
    expect(document.body.style.overflow).toBe('');
  });
});
