import React, { useState, useEffect, useRef, useCallback } from 'react';

const HEX_CHARS = '0123456789abcdefx';

interface ScrambleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  duration?: number;
  triggerOnHover?: boolean;
  triggerOnScroll?: boolean;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  className = '',
  style,
  as: Component = 'span',
  duration = 600,
  triggerOnHover = true,
  triggerOnScroll = true,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const isAnimatingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const hasRevealedRef = useRef(false);

  const startScramble = useCallback(() => {
    // Accessibility check: prefers-reduced-motion skips scramble entirely
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplayText(text);
      return;
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
  }, [text, duration]);

  // Handle scroll reveal via IntersectionObserver
  useEffect(() => {
    if (!triggerOnScroll) return;

    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRevealedRef.current) {
            hasRevealedRef.current = true;
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
  }, [triggerOnScroll, startScramble]);

  // Reset text and cancel RAF on unmount or text prop update
  useEffect(() => {
    setDisplayText(text);
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
      onMouseEnter={handleMouseEnter}
    >
      <span aria-hidden="true">{displayText}</span>
    </Component>
  );
};

export default ScrambleText;

