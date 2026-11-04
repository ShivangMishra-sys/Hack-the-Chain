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

    return () => { tl.kill(); };
  }, [isReady]);

  // Hide during dashboard phase
  if (phase === 'dashboard') return null;

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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="hero-meta-reveal" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, backgroundColor: 'var(--accent)', boxShadow: '0 0 8px rgba(198, 255, 61, 0.7)', borderRadius: '50%' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', letterSpacing: '0.25em', color: 'var(--fg)', textTransform: 'uppercase' }}>
            {siteContent.meta.edition}
          </span>
        </div>
        <div className="hero-meta-reveal">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--muted)', textTransform: 'uppercase' }}>
            SCROLL / CLICK TO BEGIN
          </span>
        </div>
      </header>

      {/* Hero Title */}
      <div style={{ width: '100%', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', transform: 'translateY(-14vh)' }}>
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
                <span key={cIdx} className="hero-char" style={{ display: 'inline-block', willChange: 'transform, opacity' }}>
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p
          className="hero-meta-reveal"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', letterSpacing: '0.2em', color: 'var(--muted)', marginTop: '1.25rem', textTransform: 'uppercase' }}
        >
          {siteContent.hero.subtext}
        </p>
      </div>

      {/* CTA Button */}
      <div
        className="hero-btn-container"
        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2vh', pointerEvents: 'auto' }}
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
