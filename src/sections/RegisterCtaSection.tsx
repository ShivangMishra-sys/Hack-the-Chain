import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../content';
import ScrambleText from '../components/ScrambleText';
import { useAppStore } from '../store/useAppStore';

gsap.registerPlugin(ScrollTrigger);

export const RegisterCtaSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const elements = sectionRef.current.querySelectorAll('.cta-reveal');
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // CTA content text entrance
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

      // Re-forge finale: scrub-linked ScrollTrigger that pulls debris into assembled chain
      if (prefersReducedMotion) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 85%',
          onEnter: () => useAppStore.getState().setReforgeProgress(1),
          onLeaveBack: () => useAppStore.getState().setReforgeProgress(0),
        });
      } else {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 85%',
          end: 'center 45%',
          scrub: 0.6,
          onUpdate: (self) => {
            useAppStore.getState().setReforgeProgress(self.progress);
          },
        });
      }
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
          className="cta-reveal mono-eyebrow"
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
          className="cta-reveal section-heading"
          aria-label={`07 ${siteContent.cta.heading}`}
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 6.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            textWrap: 'balance',
            color: '#f2f2f2',
            maxWidth: '18ch',
            marginBottom: '2rem',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '0.6em',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75em',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'rgba(255, 255, 255, 0.22)',
              userSelect: 'none',
            }}
            aria-hidden="true"
          >
            07
          </span>
          <ScrambleText
            text={siteContent.cta.heading}
            triggerOnHover={false}
            triggerOnScroll={true}
            scrambleOnce={true}
            persistKey="final-cta-heading"
          />
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
            className="huge-register-btn pill-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem 3.5rem',
              borderRadius: '999px',
              backgroundColor: 'var(--accent)',
              color: '#0a0a0a',
              WebkitTextFillColor: '#0a0a0a',
              border: '1px solid var(--accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9375rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.10), 0 0 30px rgba(198, 255, 61, 0.25)',
              transition: 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--accent)';
              (e.currentTarget.style as any).WebkitTextFillColor = 'var(--accent)';
              e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255, 255, 255, 0.15), 0 0 45px rgba(198, 255, 61, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
              e.currentTarget.style.color = '#0a0a0a';
              (e.currentTarget.style as any).WebkitTextFillColor = '#0a0a0a';
              e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(255, 255, 255, 0.10), 0 0 30px rgba(198, 255, 61, 0.25)';
              e.currentTarget.style.transform = 'translateY(0px)';
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
            padding: '0.45rem 1.1rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            color: 'var(--muted)',
          }}
        >
          {siteContent.cta.deadline}
        </div>
      </div>
    </section>
  );
};

export default RegisterCtaSection;

