import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export const ScrollProgressHairline: React.FC = () => {
  const lineRef = useRef<HTMLDivElement>(null);
  const scrollY = useAppStore((state) => state.scrollY);

  useEffect(() => {
    if (!lineRef.current) return;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
    lineRef.current.style.transform = `scaleX(${progress})`;
  }, [scrollY]);

  return (
    <div
      ref={lineRef}
      className="scroll-progress-hairline"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        backgroundColor: 'var(--accent)',
        opacity: 0.6,
        transformOrigin: 'left',
        transform: 'scaleX(0)',
        zIndex: 100,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
};

export default ScrollProgressHairline;
