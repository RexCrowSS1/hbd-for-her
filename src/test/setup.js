import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

export function mockMotion(reduced = false) {
  vi.stubGlobal('matchMedia', vi.fn(query => ({
    matches: reduced, media: query,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
}
mockMotion();

vi.stubGlobal('IntersectionObserver', class {
  constructor(callback) { this.callback = callback; }
  observe(target) { this.callback([{ target, isIntersecting: true }]); }
  disconnect() {}
});

// jsdom has no layout or native modal top layer. Mock only those platform APIs.
HTMLElement.prototype.scrollIntoView = vi.fn();
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };

// jsdom does not decode or play media. Player tests dispatch real media events.
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  mockMotion();
});
