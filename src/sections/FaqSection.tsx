import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../content';
import ScrambleText from '../components/ScrambleText';

gsap.registerPlugin(ScrollTrigger);

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const items = sectionRef.current.querySelectorAll('.faq-item');
    const header = sectionRef.current.querySelectorAll('.faq-header-reveal');

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
        items,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
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

  const toggleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="faq-section"
      aria-label="Frequently Asked Questions"
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
          className="faq-header-reveal"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            letterSpacing: '0.25em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          // 06. INTELLIGENCE & INQUIRIES
        </p>

        <h2
          className="faq-header-reveal"
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
            06
          </span>
          <ScrambleText text="FREQUENTLY ASKED QUESTIONS" />
        </h2>

        <p
          className="faq-header-reveal"
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: 'var(--muted)',
          }}
        >
          Essential operational details regarding logistics, eligibility, intellectual property, and requirements.
        </p>
      </div>

      {/* Accordion Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '920px',
        }}
      >
        {siteContent.faq.map((item, idx) => {
          const isOpen = openIdx === idx;
          const buttonId = `faq-btn-${idx}`;
          const panelId = `faq-panel-${idx}`;

          return (
            <div
              key={idx}
              className="faq-item glass-card"
              style={{
                borderRadius: '14px',
                backgroundColor: isOpen
                  ? 'rgba(255, 255, 255, 0.055)'
                  : 'rgba(255, 255, 255, 0.035)',
                border: isOpen
                  ? '1px solid rgba(255, 255, 255, 0.20)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              <button
                id={buttonId}
                type="button"
                onClick={() => toggleAccordion(idx)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                style={{
                  width: '100%',
                  padding: '1.75rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#f2f2f2',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
                data-cursor-hover="true"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: isOpen ? '#f2f2f2' : 'var(--muted)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    0{idx + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: isOpen ? '#ffffff' : '#f2f2f2',
                    }}
                  >
                    {item.q}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    color: isOpen ? '#f2f2f2' : 'var(--muted)',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease, color 0.3s ease',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                style={{
                  maxHeight: isOpen ? '250px' : '0px',
                  opacity: isOpen ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
                  padding: isOpen ? '0 2rem 1.75rem 4rem' : '0 2rem 0 4rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    color: 'var(--muted)',
                  }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
