import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../content';

gsap.registerPlugin(ScrollTrigger);

export const RegisterCtaSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const elements = sectionRef.current.querySelectorAll('.cta-reveal');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
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
      id="register"
      ref={sectionRef}
      className="register-cta-section"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '6rem clamp(1.5rem, 5vw, 4rem) 9rem',
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: 'clamp(3.5rem, 8vw, 6.5rem) clamp(1.5rem, 5vw, 4rem)',
          borderRadius: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle radial inner glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '180px',
            background: 'radial-gradient(circle at top, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <p
          className="cta-reveal"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            letterSpacing: '0.25em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}
        >
          {siteContent.cta.tag}
        </p>

        <h2
          className="cta-reveal"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 6.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 0.98,
            color: '#f2f2f2',
            maxWidth: '16ch',
            marginBottom: '2rem',
            textTransform: 'uppercase',
          }}
        >
          {siteContent.cta.heading}
        </h2>

        <p
          className="cta-reveal"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            lineHeight: 1.6,
            color: 'var(--muted)',
            maxWidth: '46ch',
            marginBottom: '3rem',
          }}
        >
          {siteContent.cta.subtext}
        </p>

        {/* Huge CTA Button */}
        <div className="cta-reveal" style={{ marginBottom: '2.5rem' }}>
          <a
            href="https://devpost.com"
            target="_blank"
            rel="noopener noreferrer"
            className="huge-register-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.35rem 3.5rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--accent)',
              color: '#0a0a0a',
              border: '1px solid var(--accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9375rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 0 30px rgba(198, 255, 61, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.boxShadow = '0 0 45px rgba(198, 255, 61, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
              e.currentTarget.style.color = '#0a0a0a';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(198, 255, 61, 0.25)';
            }}
            data-cursor-hover="true"
          >
            {siteContent.cta.buttonText}
          </a>
        </div>

        {/* Deadline Mono Pill */}
        <div
          className="cta-reveal"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.45rem 1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            color: 'var(--muted)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
            }}
          />
          {siteContent.cta.deadline}
        </div>
      </div>
    </section>
  );
};

export default RegisterCtaSection;

