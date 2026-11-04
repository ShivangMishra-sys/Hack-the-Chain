import { useEffect, RefObject } from 'react';
import gsap from 'gsap';

export function useCardEffects(
  containerRef: RefObject<HTMLElement | null>,
  selector: string = '.glass-card'
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Disable tilt and spotlight on touch devices or when prefers-reduced-motion is active
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        !window.matchMedia('(pointer: fine)').matches ||
        'ontouchstart' in window);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) return;

    const cards = container.querySelectorAll<HTMLElement>(selector);
    if (!cards.length) return;

    const cleanups: (() => void)[] = [];

    cards.forEach((card) => {
      // Perspective 800px on cards for 3D tilt
      gsap.set(card, {
        transformPerspective: 800,
        transformStyle: 'preserve-3d',
      });

      // QuickTo setters for 60fps responsive 3D tilt without React state updates
      const quickRotX = gsap.quickTo(card, 'rotateX', {
        duration: 0.3,
        ease: 'power2.out',
      });
      const quickRotY = gsap.quickTo(card, 'rotateY', {
        duration: 0.3,
        ease: 'power2.out',
      });

      let rafId: number | null = null;
      let targetMx = -1000;
      let targetMy = -1000;

      const updateCssVars = () => {
        card.style.setProperty('--mx', `${targetMx}px`);
        card.style.setProperty('--my', `${targetMy}px`);
        rafId = null;
      };

      const onMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Schedule CSS variables (--mx, --my) via rAF to eliminate layout thrashing
        targetMx = x;
        targetMy = y;
        if (rafId === null) {
          rafId = requestAnimationFrame(updateCssVars);
        }

        // 3D tilt: max 6 degrees
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const normX = (x - centerX) / centerX; // -1 to 1
        const normY = (y - centerY) / centerY; // -1 to 1

        const rotX = Math.max(-6, Math.min(6, -normY * 6));
        const rotY = Math.max(-6, Math.min(6, normX * 6));

        quickRotX(rotX);
        quickRotY(rotY);
      };

      const onMouseLeave = () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }

        // Smooth return on mouse leave
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
        });

        // Reset spotlight coordinates
        card.style.setProperty('--mx', '-1000px');
        card.style.setProperty('--my', '-1000px');
      };

      card.addEventListener('mousemove', onMouseMove, { passive: true });
      card.addEventListener('mouseleave', onMouseLeave, { passive: true });

      cleanups.push(() => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
        gsap.killTweensOf(card);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [containerRef, selector]);
}

export default useCardEffects;

