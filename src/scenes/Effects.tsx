import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useAppStore } from '../store/useAppStore';

export const Effects: React.FC = () => {
  const chromaticOffset = useAppStore((state) => state.chromaticOffset);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dynamic 2D offset vector for chromatic aberration spikes during break
  const aberrationOffset = useMemo(() => {
    return new THREE.Vector2(chromaticOffset, chromaticOffset);
  }, [chromaticOffset]);

  // On mobile (< 768px), disable heavy Bloom and ChromaticAberration to maintain smooth 60fps
  if (isMobile) {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
        <Vignette eskil={false} offset={0.22} darkness={0.82} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.45}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.22} darkness={0.82} />
      <ChromaticAberration
        offset={aberrationOffset}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
};

export default Effects;
