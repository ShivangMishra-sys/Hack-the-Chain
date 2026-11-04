import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import Chain, { LinkTransformSnapshot } from './Chain';
import BrokenChain from './BrokenChain';
import Ambience from './Ambience';
import CameraRig from './CameraRig';
import Effects from './Effects';

export const CanvasContainer: React.FC = () => {
  const [breakSnapshot, setBreakSnapshot] = useState<LinkTransformSnapshot[] | null>(null);

  const handleBreakSnapshot = useCallback((transforms: LinkTransformSnapshot[]) => {
    setBreakSnapshot(transforms);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 1.0, 11.5], fov: 38 }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2)]}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a0a', 1);
        }}
      >
        <CameraRig />
        <Ambience />

        {/* Lighting */}
        <ambientLight intensity={0.12} />
        <directionalLight position={[-12, 10, -7]} intensity={5.8} color="#ffffff" />
        <directionalLight position={[12, -8, -6]} intensity={4.5} color="#e0e0e0" />
        <directionalLight position={[0, 7, 5]} intensity={1.8} color="#f0f0f0" />
        <pointLight position={[0, 0, 4.5]} intensity={1.2} distance={18} decay={2} color="#ffffff" />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.65} />

          {/* Only render Chain during intact phase, switch cleanly to BrokenChain on break */}
          {!breakSnapshot ? (
            <Chain onBreakSnapshot={handleBreakSnapshot} />
          ) : (
            <BrokenChain breakTransforms={breakSnapshot} />
          )}

          <Effects />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default CanvasContainer;
