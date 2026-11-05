import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../content';
import ScrambleText from '../components/ScrambleText';
import useCardEffects from '../hooks/useCardEffects';

gsap.registerPlugin(ScrollTrigger);

export const PrizesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // 3D tilt and cursor spotlight
  useCardEffects(sectionRef, '.prize-card');

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.prize-card');
    const header = sectionRef.current.querySelectorAll('.prize-header-reveal');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        header,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        cards,
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="prizes"
      ref={sectionRef}
      className="prizes-section"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '5rem clamp(1.5rem, 5vw, 4rem) 8rem',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '750px', marginBottom: '4rem' }}>
        <p
          className="prize-header-reveal"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            letterSpacing: '0.25em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          // 04 / BOUNTIES & ALLOCATIONS
        </p>

        <h2
          className="prize-header-reveal"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: '#f2f2f2',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.6em',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8em',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'rgba(255, 255, 255, 0.22)',
              userSelect: 'none',
            }}
            aria-hidden="true"
          >
            04
          </span>
          <ScrambleText text={`${siteContent.meta.totalPrizePool} POOL`} />
        </h2>

        <p
          className="prize-header-reveal"
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: 'var(--muted)',
          }}
        >
          Direct non-dilutive capital, compute grants, incubation slots, and venture fast-tracks for top engineering squads.
        </p>
      </div>

      {/* 3 Tiered Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '2rem',
          alignItems: 'stretch',
        }}
      >
        {siteContent.prizes.map((prize, idx) => {
          const isChampion = idx === 0;

          return (
            <div
              key={idx}
              className={`prize-card glass-card ${isChampion ? 'champion-card' : ''}`}
              style={{
                padding: '2.75rem 2rem',
                borderRadius: '16px',
                backgroundColor: isChampion
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.035)',
                border: isChampion
                  ? '1px solid rgba(255, 255, 255, 0.22)'
                  : '1px solid rgba(255, 255, 255, 0.09)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'visible',
                boxShadow: isChampion ? '0 0 35px rgba(255, 255, 255, 0.05)' : 'none',
              }}
            >
              {/* Champion Badge */}
              {isChampion && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-13px',
                    left: '2rem',
                    padding: '0.35rem 0.9rem',
                    borderRadius: '9999px',
                    backgroundColor: '#f2f2f2',
                    color: '#0a0a0a',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {prize.badge}
                </div>
              )}

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '1rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      letterSpacing: '0.2em',
                      color: isChampion ? '#f2f2f2' : 'var(--muted)',
                    }}
                  >
                    {prize.place} // {prize.rank}
                  </span>
                </div>

                {/* Amount */}
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2.5rem, 4vw, 3.4rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    color: '#f2f2f2',
                    lineHeight: 1,
                    marginBottom: '2rem',
                    paddingBottom: '1.75rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {prize.amount}
                </div>

                {/* Perks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {prize.perks.map((perk, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        color: 'var(--fg)',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--muted)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          marginTop: '2px',
                        }}
                      >
                        +
                      </span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: '2.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.15em',
                  color: 'var(--muted)',
                }}
              >
                NON-DILUTIVE GRANT ALLOCATION
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PrizesSection;

