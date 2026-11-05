import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

const HEX_CHARS = '0123456789abcdefx';

// Module-level set of keys that have already scrambled once across remounts & re-renders
const globalScrambledKeys = new Set<string>();

interface ScrambleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  duration?: number;
  triggerOnHover?: boolean;
  triggerOnScroll?: boolean;
  scrambleOnce?: boolean;
  persistKey?: string;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  className = '',
  style,
  as: Component = 'span',
  duration = 600,
  triggerOnHover = true,
  triggerOnScroll = true,
  scrambleOnce = false,
  persistKey,
}) => {
  const isPersistedInStore = persistKey === 'final-cta-heading' && useAppStore.getState().hasCtaHeadingScrambled;
  const isAlreadyScrambled = Boolean(
    persistKey && (globalScrambledKeys.has(persistKey) || isPersistedInStore)
  );

  const [displayText, setDisplayText] = useState(text);
  const isAnimatingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const hasRevealedRef = useRef(isAlreadyScrambled);

  if (isAlreadyScrambled) {
    hasRevealedRef.current = true;
  }

  const startScramble = useCallback(() => {
    // Accessibility check: prefers-reduced-motion skips scramble entirely
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplayText(text);
      return;
    }

    // Never replay if scrambleOnce is enabled and it has already revealed
    if (scrambleOnce && hasRevealedRef.current && displayText === text && !isAnimatingRef.current) {
      return;
    }

    if (persistKey) {
      globalScrambledKeys.add(persistKey);
      if (persistKey === 'final-cta-heading') {
        useAppStore.getState().setHasCtaHeadingScrambled(true);
      }
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    isAnimatingRef.current = true;
    const startTime = performance.now();
    const length = text.length;

    let lastUpdate = 0;
    const updateInterval = 32; // ~30ms interval between random char iterations for crisp cyber decipher effect

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (now - lastUpdate >= updateInterval || progress >= 1) {
        lastUpdate = now;

        const resolvedCount = Math.floor(progress * length);
        let current = '';

        for (let i = 0; i < length; i++) {
          if (i < resolvedCount) {
            current += text[i];
          } else if (text[i] === ' ') {
            current += ' ';
          } else {
            const randIndex = Math.floor(Math.random() * HEX_CHARS.length);
            current += HEX_CHARS[randIndex];
          }
        }

        setDisplayText(current);
      }

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayText(text);
        isAnimatingRef.current = false;
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [text, duration, scrambleOnce, persistKey, displayText]);

  // Handle scroll reveal via IntersectionObserver
  useEffect(() => {
    if (!triggerOnScroll) return;
    if (scrambleOnce && hasRevealedRef.current) return;

    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRevealedRef.current) {
            hasRevealedRef.current = true;
            if (persistKey) {
              globalScrambledKeys.add(persistKey);
              if (persistKey === 'final-cta-heading') {
                useAppStore.getState().setHasCtaHeadingScrambled(true);
              }
            }
            startScramble();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [triggerOnScroll, startScramble, scrambleOnce, persistKey]);

  // Reset text and cancel RAF on unmount or text prop update
  useEffect(() => {
    if (!isAnimatingRef.current) {
      setDisplayText(text);
    }
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [text]);

  const handleMouseEnter = () => {
    if (triggerOnHover) {
      startScramble();
    }
  };

  return (
    <Component
      ref={elementRef}
      className={`scramble-text ${className}`.trim()}
      style={{ display: 'inline-block', ...style }}
      aria-label={text}
      {...(triggerOnHover ? { onMouseEnter: handleMouseEnter } : {})}
    >
      <span aria-hidden="true">{displayText}</span>
    </Component>
  );
};

export default ScrambleText;

