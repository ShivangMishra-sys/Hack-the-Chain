import React, { useState } from 'react';
import CanvasContainer from './scenes/CanvasContainer';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import HeroOverlay from './sections/HeroOverlay';
import BlockchainTexture from './components/BlockchainTexture';
import BreakGlitchOverlay from './components/BreakGlitchOverlay';
import Dashboard from './sections/Dashboard';
import { useAppStore } from './store/useAppStore';

export const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const phase = useAppStore((state) => state.phase);

  // Guarantee clean start at top on page mount / refresh
  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    useAppStore.getState().setScrollY(0);
    useAppStore.getState().setScrollTarget(0);
    useAppStore.getState().setScrollEased(0);
  }, []);

  // Phase S9: iOS unlock paused media on first user interaction
  React.useEffect(() => {
    const unlockMedia = () => {
      if (typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
      }
      window.removeEventListener('touchstart', unlockMedia);
      window.removeEventListener('click', unlockMedia);
    };
    window.addEventListener('touchstart', unlockMedia, { passive: true, once: true });
    window.addEventListener('click', unlockMedia, { passive: true, once: true });
  }, []);

  // Phase S8: Apply misregistration jitter once when each heading scrolls into view
  React.useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !seen.has(entry.target)) {
            seen.add(entry.target);
            entry.target.classList.add('misregistration-active');
            setTimeout(() => {
              entry.target.classList.remove('misregistration-active');
            }, 450);
          }
        });
      },
      { threshold: 0.25 }
    );

    const headings = document.querySelectorAll('h1, h2');
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [phase]);

  return (
    <>
      {/* 1. Custom cursor outside shake wrapper */}
      <CustomCursor />

      {/* 2. Shake wrapper contains all page content */}
      <div id="shake-wrapper" style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
        {/* White flash overlay */}
        <div className="break-flash" aria-hidden="true" />

        {/* Preloader */}
        <Preloader onComplete={() => setIsReady(true)} />

        {/* Persistent 3D Canvas */}
        <CanvasContainer />

        {/* Film grain, vignette, and faint halftone dot overlays */}
        <div className="grain-overlay" aria-hidden="true" />
        <div className="vignette-overlay" aria-hidden="true" />
        <div className="halftone-overlay" aria-hidden="true" />

        {/* Blockchain hex flank streams */}
        <BlockchainTexture />

        {/* Hero Overlay (intro + breaking phases) */}
        <HeroOverlay isReady={isReady} />

        {/* Comic-print break overlay (Fracture Cracks & Halftone Burst) */}
        <BreakGlitchOverlay />

        {/* Dashboard foundation (dashboard phase) */}
        {phase === 'dashboard' && <Dashboard />}
      </div>
    </>
  );
};

export default App;
