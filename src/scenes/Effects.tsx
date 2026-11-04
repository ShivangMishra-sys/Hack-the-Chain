import React, { useMemo } from 'react';
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

  // Dynamic 2D offset vector for chromatic aberration spikes during break
  const aberrationOffset = useMemo(() => {
    return new THREE.Vector2(chromaticOffset, chromaticOffset);
  }, [chromaticOffset]);

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.45}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Noise
        opacity={0.035}
        blendFunction={BlendFunction.OVERLAY}
      />
      <Vignette
        eskil={false}
        offset={0.22}
        darkness={0.82}
      />
      <ChromaticAberration
        offset={aberrationOffset}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
};

export default Effects;
