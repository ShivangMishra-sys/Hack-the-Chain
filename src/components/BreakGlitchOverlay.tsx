import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export const BreakGlitchOverlay: React.FC = () => {
  const breakFired = useAppStore((state) => state.breakFired);
  const phase = useAppStore((state) => state.phase);
  const [isActive, setIsActive] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (breakFired) {
      setIsActive(true);
      // Clean up overlay after animations conclude (~1.1s)
      const timer = setTimeout(() => {
        setIsActive(false);
      }, 1100);
      return () => clearTimeout(timer);
    } else {
      setIsActive(false);
    }
  }, [breakFired]);

  if (!isActive && !breakFired) return null;
  if (phase === 'dashboard') return null;

  return (
    <div
      className="break-glitch-overlay-root"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 25,
        overflow: 'hidden',
      }}
    >
      {/* 1. Halftone Burst: expanding radial halftone dot pattern (skipped on mobile and prefers-reduced-motion) */}
      {!prefersReducedMotion && !isMobile && (
        <div
          className="halftone-burst"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 'min(95vw, 850px)',
            height: 'min(95vw, 850px)',
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'screen',
            backgroundImage:
              'radial-gradient(circle, rgba(255, 255, 255, 0.8) 1.5px, transparent 1.5px)',
            backgroundSize: '14px 14px',
            maskImage:
              'radial-gradient(circle at center, black 0%, black 45%, transparent 70%)',
            WebkitMaskImage:
              'radial-gradient(circle at center, black 0%, black 45%, transparent 70%)',
            animation: 'halftoneBurst 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        />
      )}

      {/* 2. Fracture Cracks: thin white crack lines radiating from the break point (500, 500) */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {prefersReducedMotion ? (
          // Reduced-motion: single static crack line, no growth animation, fading gently
          <path
            d="M 500 500 L 460 410 L 410 360 L 330 280 L 220 210 L 120 180"
            stroke="#ffffff"
            strokeWidth="1.5"
            fill="none"
            opacity="0.8"
            style={{
              animation: 'staticCrackFade 0.7s ease-out forwards',
            }}
          />
        ) : (
          // Standard fracture cracks radiating across the screen with 5-step easing over 0.3s
          <g className="fracture-cracks-group">
            {/* Primary radiating jagged branches */}
            <path
              className="fracture-path"
              d="M 500 500 L 455 415 L 405 365 L 325 285 L 215 210 L 115 175"
            />
            <path
              className="fracture-path"
              d="M 500 500 L 585 435 L 645 375 L 715 325 L 835 255 L 925 225"
            />
            <path
              className="fracture-path"
              d="M 500 500 L 435 565 L 385 625 L 315 705 L 235 795 L 135 855"
            />
            <path
              className="fracture-path"
              d="M 500 500 L 575 555 L 655 635 L 735 695 L 825 775 L 905 845"
            />
            <path
              className="fracture-path"
              d="M 500 500 L 515 390 L 490 310 L 525 220 L 500 120 L 495 30"
            />
            <path
              className="fracture-path"
              d="M 500 500 L 490 610 L 525 700 L 485 810 L 515 910 L 500 980"
            />

            {/* Jagged forks */}
            <path
              className="fracture-path"
              d="M 455 415 L 495 375 L 535 330"
            />
            <path
              className="fracture-path"
              d="M 645 375 L 675 415 L 725 445"
            />
            <path
              className="fracture-path"
              d="M 385 625 L 365 675 L 325 725"
            />
            <path
              className="fracture-path"
              d="M 735 695 L 775 665 L 815 640"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default BreakGlitchOverlay;

