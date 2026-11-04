import React, { useEffect, useRef } from 'react';
import { getLenisVelocity } from '../hooks/useLenisScroll';

const PHRASE = 'BUILD • BREAK • HACK • REPEAT • ';
// 6 repeats to guarantee full coverage even on 4K ultra-wide viewports
const REPEATS = [0, 1, 2, 3, 4, 5];

export const MarqueeStrip: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const sampleItemRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const sampleItem = sampleItemRef.current;
    if (!track || !sampleItem) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let singleWidth = sampleItem.offsetWidth;

    const onResize = () => {
      if (sampleItem) {
        singleWidth = sampleItem.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);

    if (prefersReducedMotion) {
      // Static display for reduced motion
      return () => {
        window.removeEventListener('resize', onResize);
      };
    }

    let currentX = 0;
    const BASE_SPEED = 48; // Slow hypnotic base speed (px/sec)
    let currentSpeed = BASE_SPEED;
    let lastTime = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Read real-time scroll velocity from Lenis
      const velocity = getLenisVelocity();
      const velocityBoost = Math.min(Math.abs(velocity) * 60, 360);
      const targetSpeed = BASE_SPEED + velocityBoost;

      // Smooth exponential easing back to base speed
      currentSpeed += (targetSpeed - currentSpeed) * Math.min(1, dt * 5.5);

      // Advance position smoothly
      currentX -= currentSpeed * dt;

      // Seamless modulo wrap
      if (singleWidth > 0 && currentX <= -singleWidth) {
        currentX += singleWidth;
      }

      track.style.transform = `translate3d(${currentX}px, 0, 0)`;

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="marquee-strip-container"
      aria-hidden="true"
      style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        padding: 'clamp(1rem, 3vw, 2.5rem) 0',
        margin: '1rem 0 3rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(10, 10, 10, 0.45)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}
      >
        {REPEATS.map((idx) => (
          <span
            key={idx}
            ref={idx === 0 ? sampleItemRef : null}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(3.2rem, 7.5vw, 6.8rem)',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'transparent',
              WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.22)',
              paddingRight: '1rem',
              display: 'inline-block',
              lineHeight: 1.1,
            }}
          >
            {PHRASE}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeStrip;

