import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../content';
import ScrambleText from '../components/ScrambleText';
import useCardEffects from '../hooks/useCardEffects';

gsap.registerPlugin(ScrollTrigger);

export const TracksSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // 3D tilt and cursor spotlight
  useCardEffects(sectionRef, '.track-card');

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.track-card');
    const headers = sectionRef.current.querySelectorAll('.track-header-reveal');

    const ctx = gsap.context(() => {
      // Header entrance
      gsap.fromTo(
        headers,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Cards staggered entrance
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
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
      id="tracks"
      ref={sectionRef}
      className="tracks-section"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '5rem clamp(1.5rem, 5vw, 4rem) 8rem',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Section Header */}
      <div style={{ maxWidth: '750px', marginBottom: '3.5rem' }}>
        <p
          className="track-header-reveal mono-eyebrow"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            letterSpacing: '0.25em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          // 02 / EXPLORATION VECTORS
        </p>

        <h2
          className="track-header-reveal section-heading"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            textWrap: 'balance',
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
            02
          </span>
          <ScrambleText text="FOUR DOMAINS. ZERO LIMITS." />
        </h2>

        <p
          className="track-header-reveal"
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: 'var(--muted)',
          }}
        >
          Select your arena of warfare. Build standalone breakthroughs or synthesize multiple domains into unprecedented technological leverage.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {siteContent.tracks.map((track, idx) => (
          <div
            key={idx}
            className="track-card glass-card"
            style={{
              padding: '2.5rem 2rem',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, background-color 0.3s ease',
              willChange: 'transform',
            }}
          >
            <div>
              {/* Card Meta Top */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.75rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.2em',
                    color: 'var(--muted)',
                  }}
                >
                  {track.id}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#f2f2f2',
                  marginBottom: '1rem',
                }}
              >
                {track.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  color: 'var(--muted)',
                  marginBottom: '1.75rem',
                }}
              >
                {track.description}
              </p>
            </div>

            <div>
              {/* Code preview snippet */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: '#e0e0e0',
                  marginBottom: '1.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: 'var(--muted)', marginRight: '0.5rem' }}>$</span>
                {track.codeSnippet}
              </div>

              {/* Tags */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                {track.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      letterSpacing: '0.08em',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'var(--fg)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TracksSection;

