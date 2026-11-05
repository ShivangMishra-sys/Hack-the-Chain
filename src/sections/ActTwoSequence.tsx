import React, { useState, useEffect, useRef } from 'react';
import { siteContent } from '../content';
import { clamp, ramp } from '../lib/cues';
import { useAppStore } from '../store/useAppStore';

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

// Cue table [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]
const CUE_P1: [number, number, number, number] = [0.00, 0.06, 0.24, 0.32];
const CUE_P2: [number, number, number, number] = [0.38, 0.46, 0.60, 0.68];
const CUE_P3: [number, number, number, number] = [0.74, 0.82, 1.00, 1.00];

function computePanelStyle(
  p: number,
  cue: [number, number, number, number],
  reducedMotion: boolean
): { opacity: number; translateY: number; pointerEvents: 'auto' | 'none' } {
  const [inStart, inEnd, outStart, outEnd] = cue;
  const enter = ramp(p, inStart, inEnd);
  const leave = ramp(p, outStart, outEnd);

  const opacity = enter * (1 - leave);
  const translateY = reducedMotion ? 0 : (1 - enter) * 22 - leave * 22;
  const pointerEvents = opacity > 0.6 ? 'auto' : 'none';

  return { opacity, translateY, pointerEvents };
}

export const ActTwoSequence: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fixedLayerRef = useRef<HTMLDivElement>(null);
  const panel1Ref = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLDivElement>(null);
  const panel3Ref = useRef<HTMLDivElement>(null);
  const comicWipeRef = useRef<HTMLDivElement>(null);
  const wasInDz1Ref = useRef(false);
  const wasInDz2Ref = useRef(false);

  // Live countdown state
  const [targetDate] = useState(() => new Date('2026-10-24T18:00:00'));
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const el = comicWipeRef.current;
    if (!el) return;
    const onAnimEnd = () => {
      el.classList.remove('comic-wipe-active');
    };
    el.addEventListener('animationend', onAnimEnd);
    return () => el.removeEventListener('animationend', onAnimEnd);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      // 1. Calculate actProgress (0..1) from wrapper position
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const totalDistance = wrapperRef.current.offsetHeight - window.innerHeight;
        const currentOffset = -rect.top;
        const rawProgress = totalDistance > 0 ? currentOffset / totalDistance : 0;
        const actProgress = clamp(rawProgress, 0, 1);

        // Write actProgress into store.scrollTarget
        useAppStore.getState().setScrollTarget(actProgress);

        // Manage visibility and exit fade of the fixed layer
        if (fixedLayerRef.current) {
          const inView = rect.bottom > 0 && rect.top < window.innerHeight;
          fixedLayerRef.current.style.display = inView ? 'flex' : 'none';

          // Fade out the fixed layer cleanly at the end of the act
          if (inView && rect.bottom < window.innerHeight) {
            const exitAlpha = clamp(rect.bottom / window.innerHeight, 0, 1);
            fixedLayerRef.current.style.opacity = String(exitAlpha);
          } else if (inView) {
            fixedLayerRef.current.style.opacity = '1';
          }
        }
      }

      // 2. Read scrollEased from store to drive text panels
      const p = useAppStore.getState().scrollEased;
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Imperative updates in rAF loop (no CSS transitions on opacity)
      if (panel1Ref.current) {
        const s1 = computePanelStyle(p, CUE_P1, prefersReduced);
        panel1Ref.current.style.opacity = String(s1.opacity);
        panel1Ref.current.style.transform = `translate3d(0, ${s1.translateY}px, 0)`;
        panel1Ref.current.style.pointerEvents = s1.pointerEvents;
      }

      if (panel2Ref.current) {
        const s2 = computePanelStyle(p, CUE_P2, prefersReduced);
        panel2Ref.current.style.opacity = String(s2.opacity);
        panel2Ref.current.style.transform = `translate3d(0, ${s2.translateY}px, 0)`;
        panel2Ref.current.style.pointerEvents = s2.pointerEvents;
      }

      if (panel3Ref.current) {
        const s3 = computePanelStyle(p, CUE_P3, prefersReduced);
        panel3Ref.current.style.opacity = String(s3.opacity);
        panel3Ref.current.style.transform = `translate3d(0, ${s3.translateY}px, 0)`;
        panel3Ref.current.style.pointerEvents = s3.pointerEvents;
      }

      // 3. Comic panel wipe during dead zones (Phase S8)
      const inDz1 = p >= 0.32 && p <= 0.38;
      const inDz2 = p >= 0.68 && p <= 0.74;

      if ((inDz1 && !wasInDz1Ref.current) || (inDz2 && !wasInDz2Ref.current)) {
        if (comicWipeRef.current && !prefersReduced) {
          comicWipeRef.current.classList.remove('comic-wipe-active');
          void comicWipeRef.current.offsetWidth;
          comicWipeRef.current.classList.add('comic-wipe-active');
        }
      }
      wasInDz1Ref.current = inDz1;
      wasInDz2Ref.current = inDz2;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      id="dashboard"
      ref={wrapperRef}
      className="act-two-track"
      style={{
        position: 'relative',
        width: '100%',
        height: '400vh',
        pointerEvents: 'none',
      }}
    >
      {/* Pinned text layer: visible only while Act 2 is in view */}
      <div
        ref={fixedLayerRef}
        className="act-two-fixed-layer"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 25,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          padding: 'clamp(1.5rem, 5vw, 4rem)',
          paddingTop: 'calc(clamp(1.5rem, 5vw, 4rem) + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(clamp(1.5rem, 5vw, 4rem) + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
          willChange: 'opacity',
        }}
      >
        {/* Phase S8: Comic Panel Wipe across dead zones */}
        <div
          ref={comicWipeRef}
          className="comic-panel-wipe"
          aria-hidden="true"
        />

        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1440px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* PANEL 1: ACT 01 / THE BREAK */}
          <div
            ref={panel1Ref}
            className="act-panel act-panel-1"
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translate3d(0, 22px, 0)',
              marginTop: '-120px',
              maxWidth: '15ch',
              opacity: 0,
              pointerEvents: 'none',
              transition: 'none',
              willChange: 'opacity, transform',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                letterSpacing: '0.045em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                margin: '0 0 1rem',
              }}
            >
              {siteContent.actSequence.panel1.eyebrow}
            </p>
            <h1
              className="act-title"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(34px, 7.1vw, 104px)',
                lineHeight: 0.98,
                letterSpacing: '-0.036em',
                textWrap: 'balance',
                color: '#f2f2f2',
                margin: 0,
                maxWidth: '15ch',
              }}
            >
              {siteContent.actSequence.panel1.title}
            </h1>
          </div>

          {/* PANEL 2: ACT 02 / THE BUILD */}
          <div
            ref={panel2Ref}
            className="act-panel act-panel-2"
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translate3d(0, 22px, 0)',
              marginTop: '-140px',
              maxWidth: '15ch',
              opacity: 0,
              pointerEvents: 'none',
              transition: 'none',
              willChange: 'opacity, transform',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                letterSpacing: '0.045em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                margin: '0 0 1rem',
              }}
            >
              {siteContent.actSequence.panel2.eyebrow}
            </p>
            <h1
              className="act-title"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(34px, 7.1vw, 104px)',
                lineHeight: 0.98,
                letterSpacing: '-0.036em',
                textWrap: 'balance',
                color: '#f2f2f2',
                margin: 0,
                maxWidth: '15ch',
              }}
            >
              {siteContent.actSequence.panel2.title}
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)',
                color: 'var(--muted)',
                marginTop: '1.25rem',
                lineHeight: 1.45,
                maxWidth: '38ch',
              }}
            >
              {siteContent.actSequence.panel2.sub}
            </p>
          </div>

          {/* PANEL 3: ACT 03 / THE DROP */}
          <div
            ref={panel3Ref}
            className="act-panel act-panel-3"
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translate3d(0, 22px, 0)',
              marginTop: '-180px',
              maxWidth: '720px',
              opacity: 0,
              pointerEvents: 'none',
              transition: 'none',
              willChange: 'opacity, transform',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                letterSpacing: '0.045em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                margin: '0 0 0.85rem',
              }}
            >
              {siteContent.actSequence.panel3.eyebrow}
            </p>
            <h1
              className="act-title"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(26px, 5.2vw, 56px)',
                lineHeight: 1.02,
                letterSpacing: '-0.036em',
                textWrap: 'balance',
                color: '#f2f2f2',
                margin: '0 0 1.25rem',
                maxWidth: '22ch',
              }}
            >
              {siteContent.actSequence.panel3.dateVenue}
            </h1>

            {/* Live countdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 'clamp(0.5rem, 1.5vw, 1rem)',
                maxWidth: '480px',
                width: '100%',
                margin: '1rem 0 1.5rem',
              }}
            >
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HOURS', val: timeLeft.hours },
                { label: 'MINS', val: timeLeft.minutes },
                { label: 'SECS', val: timeLeft.seconds },
              ].map((unit, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.85rem 0.5rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(20, 20, 20, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)',
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
                      fontSize: '0.625rem',
                      letterSpacing: '0.15em',
                      color: 'var(--muted)',
                      marginTop: '0.35rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Register pill button (Phase S4 Spec) */}
            <a
              href="#register"
              className="act-register-btn pill-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '40px',
                minHeight: '40px',
                maxHeight: '40px',
                padding: '0 2rem',
                borderRadius: '999px',
                backgroundColor: 'var(--accent)',
                color: '#0a0a0a',
                WebkitTextFillColor: '#0a0a0a',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.10), 0 0 24px rgba(198, 255, 61, 0.25)',
                transition: 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
              }}
            >
              {siteContent.actSequence.panel3.cta}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActTwoSequence;

