import React, { useState, useEffect } from 'react';
import { siteContent } from '../content';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const diff = Math.max(0, targetDate.getTime() - new Date().getTime());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export const DashboardHero: React.FC = () => {
  // Placeholder target date: October 24, 2026
  const [targetDate] = useState(() => new Date('2026-10-24T18:00:00'));
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section
      id="dashboard"
      className="dashboard-hero-section"
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'clamp(7rem, 16vh, 10rem) clamp(1.5rem, 5vw, 4rem) 5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Status indicator */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.4rem 0.9rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(22, 22, 22, 0.5)',
          backdropFilter: 'blur(10px)',
          width: 'fit-content',
          marginBottom: '2rem',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 8px rgba(198, 255, 61, 0.8)',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
          }}
        >
          CHAIN SEVERED // PROTOCOL ACTIVE
        </span>
      </div>

      {/* Main Headline */}
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2.75rem, 6.8vw, 6.2rem)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 1.0,
          color: '#f2f2f2',
          maxWidth: '18ch',
          marginBottom: '2rem',
        }}
      >
        You broke the chain.{' '}
        <span style={{ color: 'var(--muted)', fontWeight: 500 }}>
          Now build what’s next.
        </span>
      </h1>

      {/* Metadata Pill Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '3.5rem',
        }}
      >
        <div className="meta-badge">
          <span className="mono">{siteContent.meta.dates}</span>
        </div>
        <div className="meta-badge">
          <span className="mono">{siteContent.meta.venue}</span>
        </div>
        <div className="meta-badge">
          <span className="mono">{siteContent.meta.duration} CRUCIBLE</span>
        </div>
        <div className="meta-badge">
          <span className="mono">{siteContent.meta.totalPrizePool} POOL</span>
        </div>
      </div>

      {/* Live Countdown Timer Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '1.25rem',
          maxWidth: '720px',
        }}
      >
        {[
          { label: 'DAYS', val: timeLeft.days },
          { label: 'HOURS', val: timeLeft.hours },
          { label: 'MINUTES', val: timeLeft.minutes },
          { label: 'SECONDS', val: timeLeft.seconds },
        ].map((unit, idx) => (
          <div
            key={idx}
            className="countdown-card"
            style={{
              padding: '1.75rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(22, 22, 22, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.3s ease, transform 0.3s ease',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 600,
                color: '#f2f2f2',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(unit.val).padStart(2, '0')}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.22em',
                color: 'var(--muted)',
                marginTop: '0.6rem',
                textTransform: 'uppercase',
              }}
            >
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DashboardHero;

