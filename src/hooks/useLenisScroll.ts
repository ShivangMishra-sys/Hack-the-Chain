import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useAppStore } from '../store/useAppStore';

export function useLenisScroll() {
  const phase = useAppStore((state) => state.phase);
  const setScrollY = useAppStore((state) => state.setScrollY);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (phase !== 'dashboard') {
      // In intro and breaking phases, prevent document scrolling
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    // Enable scrolling in dashboard phase
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e: { scroll: number }) => {
      setScrollY(e.scroll);
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [phase, setScrollY]);

  return lenisRef;
}

export default useLenisScroll;

