import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';
import {
  LINK_PITCH,
  createLinkGeometry,
} from './StadiumCurve';

const TRAVEL_SPEED = 1.4;
const AXIAL_ROTATION_SPEED = 0.16;

export interface LinkTransformSnapshot {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
}

interface ChainProps {
  onBreakSnapshot: (transforms: LinkTransformSnapshot[]) => void;
}

export const Chain: React.FC<ChainProps> = ({ onBreakSnapshot }) => {
  // Mobile uses 22 links, desktop uses 40 links (both even numbers for parity preservation)
  const [linkCount, setLinkCount] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 22 : 40
  );

  useEffect(() => {
    const handleResize = () => {
      setLinkCount(window.innerWidth < 768 ? 22 : 40);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const travelDistance = useRef(0);
  const shakeTime = useRef(0);
  const snapshotTaken = useRef(false);

  const totalSpan = linkCount * LINK_PITCH;
  const halfSpan = totalSpan / 2;

  const geometry = useMemo(() => createLinkGeometry(), []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#0c0c0c'),
        metalness: 0.98,
        roughness: 0.18,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        reflectivity: 1.0,
        envMapIntensity: 0.9,
      }),
    []
  );

  const takeSnapshot = useCallback(() => {
    if (!meshRef.current || snapshotTaken.current) return;
    snapshotTaken.current = true;

    if (groupRef.current) {
      groupRef.current.updateMatrixWorld(true);
    }
    const groupWorldMatrix = groupRef.current ? groupRef.current.matrixWorld : new THREE.Matrix4();

    const transforms: LinkTransformSnapshot[] = [];
    const tempMatrix = new THREE.Matrix4();
    const tempScale = new THREE.Vector3();

    for (let i = 0; i < linkCount; i++) {
      meshRef.current.getMatrixAt(i, tempMatrix);
      const worldMat = new THREE.Matrix4().multiplyMatrices(groupWorldMatrix, tempMatrix);

      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      worldMat.decompose(pos, quat, tempScale);

      transforms.push({ pos, quat });
    }

    onBreakSnapshot(transforms);
  }, [linkCount, onBreakSnapshot]);

  useFrame((_state, delta) => {
    if (typeof document !== 'undefined' && document.hidden) return;
    const safeDelta = Math.min(delta, 0.1);
    const { chainSpeedMultiplier, chainShake, breakFired } = useAppStore.getState();

    if (breakFired && !snapshotTaken.current) {
      takeSnapshot();
      return;
    }

    // Axial rotation
    if (groupRef.current) {
      groupRef.current.rotation.x += AXIAL_ROTATION_SPEED * safeDelta * chainSpeedMultiplier;
    }

    // Tension shake jitter
    if (chainShake > 0 && groupRef.current) {
      shakeTime.current += safeDelta * 28;
      const shakeMag = 0.025 * chainShake;
      groupRef.current.position.y = Math.sin(shakeTime.current * 2.1) * shakeMag;
      groupRef.current.position.z = Math.cos(shakeTime.current * 1.7) * shakeMag * 0.5;
    } else if (groupRef.current) {
      groupRef.current.position.y *= 0.85;
      groupRef.current.position.z *= 0.85;
    }

    if (!meshRef.current) return;

    // Travel leftwards
    travelDistance.current += TRAVEL_SPEED * chainSpeedMultiplier * safeDelta;

    for (let i = 0; i < linkCount; i++) {
      const baseX = (i - (linkCount - 1) / 2) * LINK_PITCH;
      let x = baseX - travelDistance.current;
      x = ((((x + halfSpan) % totalSpan) + totalSpan) % totalSpan) - halfSpan;

      dummy.position.set(x, 0, 0);
      dummy.rotation.set(i % 2 !== 0 ? Math.PI / 2 : 0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        key={linkCount} // recreate instance array when resizing between mobile/desktop
        args={[geometry, material, linkCount]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default Chain;
