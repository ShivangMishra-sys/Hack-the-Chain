import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppStore } from '../store/useAppStore';
import { siteContent } from '../content';
import MagneticButton from '../components/MagneticButton';
import { useBreakSequence } from '../hooks/useBreakSequence';

interface HeroOverlayProps {
  isReady: boolean;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ isReady }) => {
  const { phase } = useAppStore();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { triggerBreak } = useBreakSequence();

  const titleText = siteContent.meta.title;
  const words = titleText.split(' ');

  // Entrance animations once preloader finishes
  useEffect(() => {
    if (!isReady || !titleRef.current) return;

    const chars = titleRef.current.querySelectorAll('.hero-char');
    const metaElements = containerRef.current?.querySelectorAll('.hero-meta-reveal');

    const tl = gsap.timeline();
    tl.fromTo(
      metaElements || [],
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
      0.1
    );
    tl.fromTo(
      chars,
      { opacity: 0, y: 60, rotateX: -60 },
      { opacity: 1, y: 0, rotateX: 0, stagger: 0.035, duration: 1.1, ease: 'power4.out' },
      0.2
    );
    tl.fromTo(
      '.hero-btn-container',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
      0.6
    );

    return () => {
      tl.kill();
    };
  }, [isReady]);

  // Support "SCROLL / CLICK TO BEGIN" via wheel, touch gestures, and keyboard
  useEffect(() => {
    if (phase !== 'intro') return;

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 15) {
        triggerBreak();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY) > 25) {
        triggerBreak();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'Enter') {
        triggerBreak();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, triggerBreak]);

  // Hide completely once inside dashboard phase
  if (phase === 'dashboard') return null;

  return (
    <div
      ref={containerRef}
      className="hero-overlay-root"
      onClick={(e) => {
        // If clicking on overlay (not directly on another interactive child), trigger break
        if ((e.target as HTMLElement).tagName !== 'BUTTON') {
          triggerBreak();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(1.5rem, 4vw, 3rem)',
        cursor: 'default',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          pointerEvents: 'auto',
        }}
      >
        <div className="hero-meta-reveal">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              letterSpacing: '0.25em',
              color: 'var(--muted)',
              textTransform: 'uppercase',
            }}
          >
            {siteContent.meta.edition}
          </span>
        </div>
        <div className="hero-meta-reveal">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              color: 'var(--muted)',
              textTransform: 'uppercase',
            }}
          >
            SCROLL / CLICK TO BEGIN
          </span>
        </div>
      </header>

      {/* Hero Title & Subtext (Clean vertical centering, zero overlap with header) */}
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          margin: 'auto 0',
          transform: 'translateY(-2vh)',
          pointerEvents: 'auto',
        }}
      >
        <h1
          ref={titleRef}
          aria-label={titleText}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.75rem, 8.5vw, 8.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            textTransform: 'uppercase',
            color: '#f2f2f2',
            display: 'inline-flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.35em',
            perspective: 800,
          }}
        >
          {words.map((word, wIdx) => (
            <span key={wIdx} style={{ display: 'inline-flex', overflow: 'hidden' }}>
              {word.split('').map((char, cIdx) => (
                <span
                  key={cIdx}
                  className="hero-char"
                  style={{ display: 'inline-block', willChange: 'transform, opacity' }}
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p
          className="hero-meta-reveal"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            letterSpacing: '0.2em',
            color: 'var(--muted)',
            marginTop: '1.5rem',
            textTransform: 'uppercase',
          }}
        >
          {siteContent.hero.subtext}
        </p>
      </div>

      {/* CTA Button */}
      <div
        className="hero-btn-container"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '2vh',
          pointerEvents: 'auto',
        }}
      >
        <MagneticButton
          label={siteContent.hero.cta}
          onClick={triggerBreak}
          disabled={phase === 'breaking'}
        />
      </div>
    </div>
  );
};

export default HeroOverlay;
