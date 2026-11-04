import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop devices with fine pointer (mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    setIsEnabled(true);
    document.body.classList.add('custom-cursor-enabled');

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Quick smooth GSAP setters
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' });
    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.25, ease: 'power2.out' });
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.25, ease: 'power2.out' });

    let isHovered = false;

    const onMouseMove = (e: MouseEvent) => {
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);
    };

    const onMouseEnterInteractive = () => {
      if (isHovered) return;
      isHovered = true;
      gsap.to(ring, {
        scale: 1.8,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        duration: 0.25,
        ease: 'power2.out',
      });
      gsap.to(dot, {
        scale: 0.4,
        duration: 0.2,
      });
    };

    const onMouseLeaveInteractive = () => {
      isHovered = false;
      gsap.to(ring, {
        scale: 1,
        borderColor: 'rgba(255, 255, 255, 0.35)',
        backgroundColor: 'transparent',
        duration: 0.25,
        ease: 'power2.out',
      });
      gsap.to(dot, {
        scale: 1,
        duration: 0.2,
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('button, a, input, [data-cursor-hover]')) {
        onMouseEnterInteractive();
      } else {
        onMouseLeaveInteractive();
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: '#f2f2f2',
          pointerEvents: 'none',
          zIndex: 99999,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          pointerEvents: 'none',
          zIndex: 99998,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default CustomCursor;

