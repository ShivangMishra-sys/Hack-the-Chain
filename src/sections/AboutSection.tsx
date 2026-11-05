import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../content';
import ScrambleText from '../components/ScrambleText';

gsap.registerPlugin(ScrollTrigger);

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current?.querySelectorAll('.about-reveal') || [],
        {
          opacity: 0,
          y: 35,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="about-section"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '5rem clamp(1.5rem, 5vw, 4rem) 7rem',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Section Header */}
      <div style={{ maxWidth: '850px', marginBottom: '3.5rem' }}>
        <p
          className="about-reveal"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            letterSpacing: '0.25em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          {siteContent.about.tag}
        </p>

        <h2
          className="about-reveal"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: '#f2f2f2',
            marginBottom: '1.5rem',
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
            01
          </span>
          <ScrambleText text={siteContent.about.heading} />
        </h2>

        <div
          className="about-reveal"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
          }}
        >
          <span>HOSTED BY</span>
          <span style={{ opacity: 0.4 }}>//</span>
          <span>{siteContent.about.clubName}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Card 1: The Philosophy */}
        <div
          className="about-reveal glass-card"
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
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.2em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '1.25rem',
              }}
            >
              [ 01 // ORIGIN & INTENT ]
            </span>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.65,
                color: 'var(--fg)',
                marginBottom: '1.5rem',
              }}
            >
              {siteContent.about.body1}
            </p>
          </div>

          <div
            style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--muted)',
              letterSpacing: '0.1em',
            }}
          >
            PEER VERIFIED // 100% MERITOCRACY
          </div>
        </div>

        {/* Card 2: The Crucible & Culture */}
        <div
          className="about-reveal glass-card"
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
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.2em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '1.25rem',
              }}
            >
              [ 02 // REAL-WORLD COLLISION ]
            </span>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.65,
                color: 'var(--fg)',
                marginBottom: '1.5rem',
              }}
            >
              {siteContent.about.body2}
            </p>
          </div>

          <blockquote
            style={{
              padding: '1rem 1.25rem',
              borderLeft: '2px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              color: 'var(--fg)',
              fontStyle: 'italic',
            }}
          >
            {siteContent.about.quote}
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

