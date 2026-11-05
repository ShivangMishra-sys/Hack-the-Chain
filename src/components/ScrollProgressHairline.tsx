import React, { useEffect, useRef } from 'react';
import { useEasedProgress } from '../hooks/useEasedProgress';

export const ScrollProgressHairline: React.FC = () => {
  const eased = useEasedProgress();
  const lineRef = useRef<HTMLDivElement>(null);

  const progress = Math.min(1, Math.max(0, eased));

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.style.transform = `scaleX(${progress})`;
    }
  }, [progress]);

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
        transform: `scaleX(${progress})`,
        zIndex: 100,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
};

export default ScrollProgressHairline;

