import { useEffect, useRef } from 'react';

export default function ReadingProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let frame;
    const update = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      ref.current.style.width = `${available > 0 ? Math.min(100, window.scrollY / available * 100) : 0}%`;
      frame = null;
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(queue) : null;
    observer?.observe(document.body);
    update();
    return () => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div ref={ref} className="reading-progress" aria-hidden="true" />;
}
