import { StrictMode } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { mockMotion } from './setup.js';

// OpeningEnvelope has its own integration tests with controlled asset loading.
vi.mock('../components/OpeningEnvelope.jsx', async () => {
  const { useEffect } = await import('react');
  return { default: function CompletedIntro({ onComplete }) {
    useEffect(onComplete, [onComplete]);
    return null;
  } };
});

function renderApp() {
  return render(<StrictMode><App /></StrictMode>);
}

describe('Ucapan ulang tahun Cinut', () => {
  it('menampilkan ucapan, keempat foto, dan navigasi ke bagian yang tersedia', () => {
    const { container } = renderApp();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Selamatulang tahun,Cinut.');
    expect(screen.getAllByRole('button', { name: /Perbesar foto/ })).toHaveLength(4);
    within(screen.getByRole('navigation')).getAllByRole('link').forEach(link => {
      expect(container.querySelector(link.hash)).not.toBeNull();
    });
  });

  it('membuka foto, berpindah dan berputar dengan keyboard, lalu mengembalikan fokus', () => {
    renderApp();
    const opener = screen.getByRole('button', { name: 'Lihat foto Cinut dengan filter lucu' });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Galeri foto Cinut' });
    expect(within(dialog).getByRole('img').getAttribute('src')).toContain('cinut-01');
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    expect(within(dialog).getByRole('img').getAttribute('src')).toContain('cinut-04');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Foto berikutnya' }));
    expect(within(dialog).getByRole('img').getAttribute('src')).toContain('cinut-01');
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(within(dialog).getByRole('img').getAttribute('src')).toContain('cinut-02');
    fireEvent(dialog, new Event('cancel', { bubbles: false, cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(opener);
  });

  it('membuka surat setelah animasi amplop dan dapat melipat serta membukanya lagi', () => {
    vi.useFakeTimers();
    renderApp();
    const envelope = screen.getByRole('button', { name: 'Buka surat untuk Cinut' });
    fireEvent.click(envelope);
    expect(envelope.disabled).toBe(true);
    expect(screen.queryByRole('article')).toBeNull();
    act(() => vi.advanceTimersByTime(650));
    const letter = screen.getByRole('article');
    expect(document.activeElement).toBe(letter);
    expect(within(letter).getByRole('heading', { level: 3 }).textContent).toMatch(/Cinut/i);
    fireEvent.click(screen.getByRole('button', { name: /Lipat lagi/ }));
    expect(screen.queryByRole('article')).toBeNull();
    expect(document.activeElement).toBe(envelope);
    fireEvent.click(envelope);
    act(() => vi.advanceTimersByTime(650));
    expect(screen.getByRole('article')).toBe(letter);
  });

  it('meniup lilin, menampilkan harapan, dan bisa dinyalakan kembali', () => {
    vi.useFakeTimers();
    renderApp();
    const wish = within(screen.getByRole('region', { name: /Satu lilin/ }));
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const blow = screen.getByRole('button', { name: /Sudah\? Tiup lilinnya/ });
      fireEvent.click(blow);
      expect(blow.disabled).toBe(true);
      act(() => vi.advanceTimersByTime(700));
      expect(wish.getByRole('status').textContent).toContain('Semoga semesta mengaminkan.');
      const relight = screen.getByRole('button', { name: /Nyalakan sekali lagi/ });
      expect(document.activeElement).toBe(relight);
      fireEvent.click(relight);
      expect(wish.queryByRole('status')).toBeNull();
      expect(blow.disabled).toBe(false);
      expect(document.activeElement).toBe(blow);
    }
  });

  it('menghormati reduced motion tanpa confetti atau waktu tunggu animasi', () => {
    vi.useFakeTimers();
    mockMotion(true);
    const { container } = renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Buka surat untuk Cinut' }));
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole('article')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Sudah\? Tiup lilinnya/ }));
    act(() => vi.advanceTimersByTime(0));
    expect(within(screen.getByRole('region', { name: /Satu lilin/ })).getByRole('status').textContent).toContain('Semoga semesta mengaminkan.');
    expect(container.querySelectorAll('.confetti')).toHaveLength(0);
  });
});

