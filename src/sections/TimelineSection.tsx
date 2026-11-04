import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteContent } from '../content';

gsap.registerPlugin(ScrollTrigger);

export const TimelineSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const items = sectionRef.current.querySelectorAll('.timeline-item');
    const header = sectionRef.current.querySelectorAll('.timeline-header-reveal');

    const ctx = gsap.context(() => {
      // Header entrance
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

      // Line drawing scrub
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              end: 'bottom 85%',
              scrub: 0.5,
            },
          }
        );
      }

      // Individual item reveal
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="timeline-section"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '5rem clamp(1.5rem, 5vw, 4rem) 8rem',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '750px', marginBottom: '4.5rem' }}>
        <p
          className="timeline-header-reveal"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            letterSpacing: '0.25em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          // 03. CHRONOLOGY
        </p>

        <h2
          className="timeline-header-reveal"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: '#f2f2f2',
            marginBottom: '1rem',
          }}
        >
          36 HOURS OF SYNCHRONIZED EXECUTION
        </h2>

        <p
          className="timeline-header-reveal"
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: 'var(--muted)',
          }}
        >
          Every milestone is calibrated for maximum engineering density. From the first line of genesis code to the final cryptographic freeze.
        </p>
      </div>

      {/* Timeline Container */}
      <div
        style={{
          position: 'relative',
          paddingLeft: 'clamp(2rem, 4vw, 3.5rem)',
          maxWidth: '920px',
        }}
      >
        {/* Background track line */}
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            bottom: '0.5rem',
            left: 'clamp(0.6rem, 1.2vw, 1rem)',
            width: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          }}
        />

        {/* Dynamic drawing line */}
        <div
          ref={lineRef}
          style={{
            position: 'absolute',
            top: '0.5rem',
            bottom: '0.5rem',
            left: 'clamp(0.6rem, 1.2vw, 1rem)',
            width: '2px',
            backgroundColor: '#f2f2f2',
            transformOrigin: 'top center',
            boxShadow: '0 0 12px rgba(255, 255, 255, 0.6)',
          }}
        />

        {/* Timeline Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {siteContent.timeline.map((event, idx) => (
            <div
              key={idx}
              className="timeline-item"
              style={{
                position: 'relative',
              }}
            >
              {/* Timeline Node Dot on Line */}
              <div
                style={{
                  position: 'absolute',
                  top: '1.75rem',
                  left: 'calc(-1 * clamp(2rem, 4vw, 3.5rem) + clamp(0.6rem, 1.2vw, 1rem) - 5px)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#0a0a0a',
                  border: '2px solid var(--accent)',
                  boxShadow: '0 0 8px rgba(198, 255, 61, 0.6)',
                  zIndex: 2,
                }}
              />

              {/* Event Glass Card */}
              <div
                className="glass-card"
                style={{
                  padding: '2rem 2.25rem',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.18em',
                      color: 'var(--fg)',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    {event.time}
                  </span>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      letterSpacing: '0.2em',
                      color: 'var(--muted)',
                    }}
                  >
                    PHASE // {event.id}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#f2f2f2',
                    marginBottom: '0.85rem',
                  }}
                >
                  {event.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.9375rem',
                    lineHeight: 1.65,
                    color: 'var(--muted)',
                  }}
                >
                  {event.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;

