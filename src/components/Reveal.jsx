import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';

export default function Reveal({ as: Tag = 'div', className = '', children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: .09, rootMargin: '0px 0px -15px 0px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reducedMotion]);
  return <Tag {...props} ref={ref} className={`${className} reveal${visible || reducedMotion ? ' is-visible' : ''}`}>{children}</Tag>;
}
