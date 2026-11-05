/**
 * Helper module for scroll-driven choreography and cue calculations.
 */

/**
 * Clamps a value between min and max (defaults to 0 and 1).
 */
export function clamp(val: number, min: number = 0, max: number = 1): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Standard cubic Hermite smoothstep: t * t * (3 - 2 * t).
 */
export function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Smooth ramp between a and b evaluated at progress p.
 * If b <= a, returns 1 when p >= b, otherwise 0.
 * Otherwise returns smooth(clamp((p - a) / (b - a), 0, 1)).
 */
export function ramp(p: number, a: number, b: number): number {
  if (b <= a) {
    return p >= b ? 1 : 0;
  }
  return smooth(clamp((p - a) / (b - a), 0, 1));
}

