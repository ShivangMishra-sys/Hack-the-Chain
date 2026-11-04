import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

export const CameraRig: React.FC = () => {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    const { cameraZOffset, scrollY } = useAppStore.getState();

    // Subtle mouse parallax targets
    const targetX = mouseRef.current.x * 0.75;
    const targetY = 1.0 + mouseRef.current.y * 0.45 - scrollY * 0.0015;
    const targetZ = 11.5 + cameraZOffset + scrollY * 0.0025;

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 3.2, safeDelta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 3.2, safeDelta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 4.5, safeDelta);

    state.camera.lookAt(0, -scrollY * 0.001, 0);
  });

  return null;
};

export default CameraRig;
