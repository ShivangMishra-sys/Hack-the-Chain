import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

let activeSubscribers = 0;
let globalRafId: number | null = null;

function globalTick() {
  const { scrollTarget, scrollEased, setScrollEased } = useAppStore.getState();
  const diff = scrollTarget - scrollEased;

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    if (scrollEased !== scrollTarget) {
      setScrollEased(scrollTarget);
    }
  } else if (Math.abs(diff) > 0.00001) {
    setScrollEased(scrollEased + diff * 0.115);
  } else if (scrollEased !== scrollTarget) {
    setScrollEased(scrollTarget);
  }

  globalRafId = requestAnimationFrame(globalTick);
}

function subscribeLoop() {
  activeSubscribers++;
  if (activeSubscribers === 1 && globalRafId === null) {
    globalRafId = requestAnimationFrame(globalTick);
  }
}

function unsubscribeLoop() {
  activeSubscribers = Math.max(0, activeSubscribers - 1);
  if (activeSubscribers === 0 && globalRafId !== null) {
    cancelAnimationFrame(globalRafId);
    globalRafId = null;
  }
}

/**
 * Shared hook that returns scrollEased and ensures the lerp loop
 * toward scrollTarget (with factor 0.115 every frame via rAF) is active.
 */
export function useEasedProgress(): number {
  const scrollEased = useAppStore((state) => state.scrollEased);

  useEffect(() => {
    subscribeLoop();
    return () => {
      unsubscribeLoop();
    };
  }, []);

  return scrollEased;
}

export default useEasedProgress;

