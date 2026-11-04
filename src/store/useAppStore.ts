import { create } from 'zustand';

export type AppPhase = 'intro' | 'breaking' | 'dashboard';

interface AppState {
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  breakProgress: number; // 0 to 1 during breaking transition
  setBreakProgress: (progress: number) => void;
  chromaticOffset: number; // For break explosion spike effect
  setChromaticOffset: (offset: number) => void;
  ambienceIntensity: number; // For background depth layers (default 1)
  setAmbienceIntensity: (val: number) => void;
  // Break sequence signals (R3F reads these from outside the canvas)
  chainSpeedMultiplier: number; // 1 = normal, 0 = stopped
  setChainSpeedMultiplier: (v: number) => void;
  chainShake: number; // non-zero triggers tension shake in Chain
  setChainShake: (v: number) => void;
  breakFired: boolean; // true = links have exploded
  setBreakFired: (v: boolean) => void;
  cameraZOffset: number; // push-in / ease-back for camera
  setCameraZOffset: (v: number) => void;
  // Scroll tracking for camera and floating debris depth shift
  scrollY: number;
  setScrollY: (y: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  phase: 'intro',
  setPhase: (phase) => set({ phase }),
  breakProgress: 0,
  setBreakProgress: (progress) => set({ breakProgress: progress }),
  chromaticOffset: 0.0006,
  setChromaticOffset: (offset) => set({ chromaticOffset: offset }),
  ambienceIntensity: 1.0,
  setAmbienceIntensity: (val) => set({ ambienceIntensity: val }),
  chainSpeedMultiplier: 1,
  setChainSpeedMultiplier: (v) => set({ chainSpeedMultiplier: v }),
  chainShake: 0,
  setChainShake: (v) => set({ chainShake: v }),
  breakFired: false,
  setBreakFired: (v) => set({ breakFired: v }),
  cameraZOffset: 0,
  setCameraZOffset: (v) => set({ cameraZOffset: v }),
  scrollY: 0,
  setScrollY: (scrollY) => set({ scrollY }),
}));
