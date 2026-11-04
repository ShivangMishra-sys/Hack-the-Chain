import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obj = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
              if (containerRef.current) {
                containerRef.current.style.display = 'none';
              }
              onComplete();
            },
          });
        }
      },
    });

    tl.to(obj, {
      val: 100,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        setProgress(Math.floor(obj.val));
      },
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a0a0a',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          letterSpacing: '0.3em',
          color: 'var(--muted)',
          textTransform: 'uppercase',
        }}
      >
        INITIALIZING PROTOCOL // HTC-2026
      </div>

      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: ' clamp(3.5rem, 8vw, 6rem)',
          fontWeight: 700,
          color: '#f2f2f2',
          letterSpacing: '-0.04em',
        }}
      >
        {String(progress).padStart(3, '0')}%
      </div>

      {/* Sleek hairline progress bar */}
      <div
        style={{
          width: '180px',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#f2f2f2',
            transition: 'width 0.05s linear',
          }}
        />
      </div>
    </div>
  );
};

export default Preloader;

