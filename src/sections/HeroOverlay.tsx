import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppStore } from '../store/useAppStore';
import { siteContent } from '../content';
import MagneticButton from '../components/MagneticButton';

interface HeroOverlayProps {
  isReady: boolean;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ isReady }) => {
  const { phase } = useAppStore();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Split title into letters for staggered reveal
  const titleText = siteContent.meta.title; // "HACK THE CHAIN"
  const words = titleText.split(' ');

  useEffect(() => {
    if (!isReady || !titleRef.current) return;

    const chars = titleRef.current.querySelectorAll('.hero-char');
    const metaElements = containerRef.current?.querySelectorAll('.hero-meta-reveal');

    const tl = gsap.timeline();

    // Subtle fade/slide in for top labels and button
    tl.fromTo(
      metaElements || [],
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
      0.1
    );

    // Staggered per-letter cinematic entrance
    tl.fromTo(
      chars,
      {
        opacity: 0,
        y: 60,
        rotateX: -60,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.035,
        duration: 1.1,
        ease: 'power4.out',
      },
      0.2
    );

    // Reveal button below the chain
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

  // Only render when phase is intro or breaking
  if (phase !== 'intro') return null;

  return (
    <div
      ref={containerRef}
      className="hero-overlay-root"
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
        pointerEvents: 'none',
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div className="hero-meta-reveal" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              backgroundColor: '#f2f2f2',
              borderRadius: '50%',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              letterSpacing: '0.25em',
              color: 'var(--fg)',
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

      {/* Hero Title Section (Positioned above the chain) */}
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          marginTop: 'auto',
          marginBottom: 'auto',
          transform: 'translateY(-14vh)', // Positioned gracefully above the horizontal chain
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
                  style={{
                    display: 'inline-block',
                    willChange: 'transform, opacity',
                  }}
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
            marginTop: '1.25rem',
            textTransform: 'uppercase',
          }}
        >
          {siteContent.hero.subtext}
        </p>
      </div>

      {/* Bottom Center Button (Positioned directly below the chain) */}
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
          onClick={() => {
            // Button does nothing yet as specified in Phase 5
          }}
        />
      </div>
    </div>
  );
};

export default HeroOverlay;

