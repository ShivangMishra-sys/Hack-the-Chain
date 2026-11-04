import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CameraRig: React.FC = () => {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Convert client coordinates to normalized coordinates [-1, 1]
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1);

    // Subtle parallax targets
    const targetX = mouseRef.current.x * 0.75;
    const targetY = 1.0 + mouseRef.current.y * 0.45;

    // Smooth framerate-independent exponential damping
    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      targetX,
      3.2,
      safeDelta
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      targetY,
      3.2,
      safeDelta
    );

    // Keep chain centered in perspective view
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};

export default CameraRig;

