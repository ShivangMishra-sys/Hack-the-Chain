import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import Chain from './Chain';
import CameraRig from './CameraRig';
import Effects from './Effects';

export const CanvasContainer: React.FC = () => {
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
          antialias: false, // Handled with high performance by postprocessing
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        onCreated={({ scene, gl }) => {
          scene.background = null;
          gl.setClearColor('#0a0a0a', 1);
        }}
      >
        {/* Subtle camera mouse parallax */}
        <CameraRig />

        {/* Cinematic High-Contrast Monochrome Lighting */}
        {/* Low ambient to ensure deep obsidian shadows */}
        <ambientLight intensity={0.12} />

        {/* Sharp Rim Light 1 (top-left back) - razor chrome edge */}
        <directionalLight position={[-12, 10, -7]} intensity={5.8} color="#ffffff" />

        {/* Sharp Rim Light 2 (bottom-right back) - underside silhouette */}
        <directionalLight position={[12, -8, -6]} intensity={4.5} color="#e0e0e0" />

        {/* Glancing Key Light (top frontal) */}
        <directionalLight position={[0, 7, 5]} intensity={1.8} color="#f0f0f0" />

        {/* Subtle center specular punch */}
        <pointLight position={[0, 0, 4.5]} intensity={1.2} distance={18} decay={2} color="#ffffff" />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.65} />
          <Chain />
          <Effects />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default CanvasContainer;
