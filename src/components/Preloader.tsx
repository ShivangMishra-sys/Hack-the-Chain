import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useProgress } from '@react-three/drei';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [minWaitPassed, setMinWaitPassed] = useState(false);
  const isFinishedRef = useRef(false);

  // Drei / THREE.DefaultLoadingManager live progress
  const { active, progress: dreiProgress, loaded, total } = useProgress();

  // 1. Track font loading via document.fonts.ready
  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready
        .then(() => setFontsLoaded(true))
        .catch(() => setFontsLoaded(true));
    } else {
      setFontsLoaded(true);
    }
  }, []);

  // 2. Give 3D loaders a brief window (~350ms) to register in THREE.DefaultLoadingManager
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinWaitPassed(true);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // 3. 12-second stall safety timeout: never block forever
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTimedOut(true);
    }, 12000);

    return () => clearTimeout(timeout);
  }, []);

  // 4. Compute true combined progress from fonts + 3D assets
  useEffect(() => {
    if (isFinishedRef.current) return;

    let target = 0;

    if (isTimedOut) {
      target = 100;
    } else {
      const fontScore = fontsLoaded ? 35 : 10;

      // Calculate Drei 3D progress ratio (textures, HDR environment map)
      const threeRatio = total > 0 ? loaded / total : dreiProgress ? dreiProgress / 100 : 0;
      const threeScore = threeRatio * 65;

      const isThreeDone =
        dreiProgress >= 100 || (minWaitPassed && !active && loaded >= total);

      if (fontsLoaded && isThreeDone) {
        target = 100;
      } else {
        target = Math.min(99, Math.round(fontScore + threeScore));
      }
    }

    // Step displayProgress smoothly toward target
    let rafId: number;
    const updateProgress = () => {
      setDisplayProgress((prev) => {
        if (prev < target) {
          const step = Math.max(1, Math.ceil((target - prev) * 0.2));
          const next = Math.min(target, prev + step);
          return next;
        }
        return prev;
      });

      if (displayProgress < target) {
        rafId = requestAnimationFrame(updateProgress);
      }
    };

    rafId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(rafId);
  }, [dreiProgress, active, loaded, total, fontsLoaded, minWaitPassed, isTimedOut, displayProgress]);

  // 5. When displayProgress reaches 100%, fade out over 0.7s then start hero reveal
  useEffect(() => {
    if (displayProgress >= 100 && !isFinishedRef.current) {
      isFinishedRef.current = true;

      // Brief moment so user perceives 100%
      const holdTimer = setTimeout(() => {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.7,
            ease: 'power2.inOut',
            onComplete: () => {
              if (containerRef.current) {
                containerRef.current.style.display = 'none';
              }
              onComplete();
            },
          });
        } else {
          onComplete();
        }
      }, 120);

      return () => clearTimeout(holdTimer);
    }
  }, [displayProgress, onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a0a0a',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
      }}
    >
      {/* Mono progress label: "LOADING 0%" to "LOADING 100%" */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          letterSpacing: '0.22em',
          color: '#f2f2f2',
          textTransform: 'uppercase',
          userSelect: 'none',
        }}
      >
        LOADING {displayProgress}%
      </div>

      {/* 150px 1px progress bar with accent (lime) fill */}
      <div
        style={{
          width: '150px',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${displayProgress}%`,
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 10px rgba(198, 255, 61, 0.5)',
            transition: 'width 0.08s ease-out',
          }}
        />
      </div>
    </div>
  );
};

export default Preloader;
