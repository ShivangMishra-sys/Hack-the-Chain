import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../content';

gsap.registerPlugin(ScrollTrigger);

export const SponsorsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.sponsor-card');
    const header = sectionRef.current.querySelectorAll('.sponsor-header-reveal');

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
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.08,
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
      id="sponsors"
      ref={sectionRef}
      className="sponsors-section"
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
          className="sponsor-header-reveal"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            letterSpacing: '0.25em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          // 05. ALLIANCE & BACKERS
        </p>

        <h2
          className="sponsor-header-reveal"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: '#f2f2f2',
            marginBottom: '1rem',
          }}
        >
          POWERED BY INDUSTRY GIANTS
        </h2>

        <p
          className="sponsor-header-reveal"
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: 'var(--muted)',
          }}
        >
          Leading infrastructure protocols, cloud providers, and venture capital partners powering the next generation of builders.
        </p>
      </div>

      {/* Grayscale Logo Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {siteContent.sponsors.map((sponsor, idx) => (
          <div
            key={idx}
            className="sponsor-card glass-card"
            style={{
              padding: '2.25rem 1.75rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.035)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              minHeight: '150px',
              position: 'relative',
            }}
          >
            {/* Minimalist Monochrome Logo Mark */}
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#f2f2f2',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  transform: 'rotate(45deg)',
                }}
              />
              {sponsor.name}
            </div>

            {/* Category / Tier */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.18em',
                color: 'var(--muted)',
                marginTop: '0.75rem',
                textTransform: 'uppercase',
              }}
            >
              {sponsor.category}
            </span>

            <span
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                right: '0.85rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                letterSpacing: '0.15em',
                color: 'rgba(255, 255, 255, 0.25)',
              }}
            >
              [{sponsor.tier}]
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SponsorsSection;

