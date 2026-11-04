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
}

export const useAppStore = create<AppState>((set) => ({
  phase: 'intro',
  setPhase: (phase) => set({ phase }),
  breakProgress: 0,
  setBreakProgress: (progress) => set({ breakProgress: progress }),
  chromaticOffset: 0.0006, // subtle baseline
  setChromaticOffset: (offset) => set({ chromaticOffset: offset }),
  ambienceIntensity: 1.0, // default full ambience
  setAmbienceIntensity: (val) => set({ ambienceIntensity: val }),
}));
