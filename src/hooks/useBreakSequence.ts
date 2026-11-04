import { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useAppStore } from '../store/useAppStore';

export function useBreakSequence() {
  const fired = useRef(false);
  const {
    setPhase,
    setChainSpeedMultiplier,
    setChainShake,
    setBreakFired,
    setChromaticOffset,
    setCameraZOffset,
    setAmbienceIntensity,
  } = useAppStore.getState();

  const triggerBreak = useCallback(() => {
    if (fired.current) return;
    fired.current = true;

    // Transition phase immediately
    useAppStore.getState().setPhase('breaking');

    const tl = gsap.timeline();
    const state = { shake: 0, chromatic: 0.0006, camZ: 0 };

    // ── Beat 1 (0s – 0.9s): Slow chain to a halt with tension shake ──
    tl.to(state, {
      duration: 0.8,
      ease: 'power2.in',
      onUpdate() {
        const progress = this.progress();
        setChainSpeedMultiplier(1 - progress);
      },
    });

    // Tension shake while tightening
    tl.to(state, {
      shake: 1,
      duration: 0.0,
      onComplete() {
        setChainShake(1);
      },
    }, '<0.35');

    // Camera push-in
    tl.to(state, {
      camZ: -1.4,
      duration: 0.65,
      ease: 'power2.in',
      onUpdate() {
        setCameraZOffset(state.camZ);
      },
    }, '<');

    // ── Beat 2 (0.9s – 1.4s): White flash + chromatic aberration spike + screen shake ──
    tl.to(state, {
      chromatic: 0.038,
      duration: 0.12,
      ease: 'power4.out',
      onStart() {
        setChainShake(0);
        // Screen shake applied to #shake-wrapper (NOT body) so position:fixed
        // cursor elements are never inside a transformed ancestor.
        const wrapper = document.getElementById('shake-wrapper');
        if (wrapper) {
          wrapper.style.animation = 'screenShake 0.38s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
          setTimeout(() => { wrapper.style.animation = ''; }, 420);
        }
      },
      onUpdate() {
        setChromaticOffset(state.chromatic);
      },
    });

    // Flash overlay
    tl.to('.break-flash', {
      opacity: 1,
      duration: 0.08,
      ease: 'none',
    }, '<');

    tl.to('.break-flash', {
      opacity: 0,
      duration: 0.45,
      ease: 'power2.out',
    });

    // Aberration decays back
    tl.to(state, {
      chromatic: 0.0006,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate() {
        setChromaticOffset(state.chromatic);
      },
    }, '<0.1');

    // ── Beat 3 (1.4s – 1.6s): Chain SNAPS — links explode ──
    tl.call(() => {
      setBreakFired(true);
    }, undefined, 1.4);

    // ── Beat 4 (1.5s – 2.5s): Hero title + button glitch/fade out ──
    tl.to('.hero-overlay-root', {
      opacity: 0,
      skewX: 2,
      duration: 0.55,
      ease: 'power3.in',
    }, 1.5);

    // ── Beat 5 (2.5s – 3.5s): Camera eases back out ──
    tl.to(state, {
      camZ: 1.2,
      duration: 1.1,
      ease: 'power3.out',
      onUpdate() {
        setCameraZOffset(state.camZ);
      },
    }, 2.4);
    tl.to(state, {
      camZ: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate() {
        setCameraZOffset(state.camZ);
      },
      onComplete() {
        // Dim ambience slightly for dashboard
        setAmbienceIntensity(0.55);
        useAppStore.getState().setPhase('dashboard');
      },
    }, 3.1);

  }, [
    setPhase,
    setChainSpeedMultiplier,
    setChainShake,
    setBreakFired,
    setChromaticOffset,
    setCameraZOffset,
    setAmbienceIntensity,
  ]);

  return { triggerBreak };
}

