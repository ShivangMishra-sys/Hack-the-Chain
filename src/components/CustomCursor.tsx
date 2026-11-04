import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    // Only enable on desktop devices with fine pointer (mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    document.body.classList.add('custom-cursor-enabled');

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Use GSAP xPercent & yPercent to ensure true geometric center alignment
    gsap.set(dot, {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      transformOrigin: 'center center',
    });
    gsap.set(ring, {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      transformOrigin: 'center center',
    });

    // quickTo setters with snappy, smooth response so the ring stays right in center
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.04, ease: 'power3.out' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.04, ease: 'power3.out' });
    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.14, ease: 'power3.out' });
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.14, ease: 'power3.out' });

    let isHovered = false;

    const onMouseMove = (e: MouseEvent) => {
      // Snap to cursor position immediately on first move
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        gsap.set(ring, { x: e.clientX, y: e.clientY });
        gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
      }
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);
    };

    const onMouseEnterInteractive = () => {
      if (isHovered) return;
      isHovered = true;
      gsap.to(ring, {
        scale: 1.75,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        duration: 0.22,
        ease: 'power2.out',
      });
      gsap.to(dot, { scale: 0.45, duration: 0.18 });
    };

    const onMouseLeaveInteractive = () => {
      isHovered = false;
      gsap.to(ring, {
        scale: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        backgroundColor: 'transparent',
        duration: 0.22,
        ease: 'power2.out',
      });
      gsap.to(dot, { scale: 1, duration: 0.18 });
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

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#f2f2f2',
          pointerEvents: 'none',
          zIndex: 100000,
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default CustomCursor;
