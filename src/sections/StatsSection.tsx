import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../content';

gsap.registerPlugin(ScrollTrigger);

export const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.stat-card');

    // Staggered fade-up entrance
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Number counter animation
      siteContent.stats.forEach((stat, index) => {
        const el = countersRef.current[index];
        if (!el) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.targetNum,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate() {
            const current = Math.floor(obj.val);
            const prefix = stat.prefix || '';
            const suffix = stat.suffix || '';
            const formatted =
              current >= 1000
                ? current.toLocaleString('en-IN')
                : current.toString();
            el.textContent = `${prefix}${formatted}${suffix}`;
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="stats-section"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '2rem clamp(1.5rem, 5vw, 4rem) 6rem',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {siteContent.stats.map((stat, idx) => (
          <div
            key={idx}
            className="stat-card glass-card"
            style={{
              padding: '2.25rem 1.75rem',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, background-color 0.3s ease',
              willChange: 'transform',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.22em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              {stat.unit}
            </span>

            <span
              ref={(el) => (countersRef.current[idx] = el)}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--accent)',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {stat.prefix || ''}0{stat.suffix || ''}
            </span>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--muted)',
                marginTop: '1rem',
                letterSpacing: '0.04em',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;

