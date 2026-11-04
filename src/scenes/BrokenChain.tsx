import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createLinkGeometry } from './StadiumCurve';
import { LinkTransformSnapshot } from './Chain';
import { useAppStore } from '../store/useAppStore';

const SHARD_COUNT = 60;

interface LinkPhysics {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  vel: THREE.Vector3;
  angVel: THREE.Vector3;
  settled: boolean;
}

function buildPhysics(transforms: LinkTransformSnapshot[]): LinkPhysics[] {
  const data: LinkPhysics[] = [];
  const count = transforms.length;

  for (let i = 0; i < count; i++) {
    const snap = transforms[i] || {
      pos: new THREE.Vector3((i - count / 2) * 1.62, 0, 0),
      quat: new THREE.Quaternion(),
    };

    const bx = snap.pos.x;
    const isLeft = bx <= 0;
    const dirX = isLeft ? -(Math.random() * 2.5 + 1.5) : (Math.random() * 2.5 + 1.5);
    const dirY = (Math.random() - 0.5) * 2.4;
    const dirZ = (Math.random() - 0.5) * 2.8;

    // Links closest to center break harder
    const proximity = Math.max(0, 1 - Math.abs(bx) / 8);
    const speed = (0.8 + proximity * 1.8) * (Math.random() * 0.5 + 0.75);

    data.push({
      pos: snap.pos.clone(),
      quat: snap.quat.clone(),
      vel: new THREE.Vector3(dirX * speed, dirY * speed, dirZ * speed),
      angVel: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ),
      settled: false,
    });
  }
  return data;
}

function buildShardData() {
  const positions = new Float32Array(SHARD_COUNT * 3);
  const velocities: THREE.Vector3[] = [];

  for (let i = 0; i < SHARD_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    positions[i * 3] = (Math.random() - 0.5) * 1.5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1.0;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    velocities.push(
      new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed * 0.6 + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 4
      )
    );
  }
  return { positions, velocities };
}

interface BrokenChainProps {
  breakTransforms: LinkTransformSnapshot[];
}

export const BrokenChain: React.FC<BrokenChainProps> = ({ breakTransforms }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const shardsRef = useRef<THREE.Points>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const deltaQuat = useMemo(() => new THREE.Quaternion(), []);
  const deltaEuler = useMemo(() => new THREE.Euler(), []);

  const physics = useMemo(() => buildPhysics(breakTransforms), [breakTransforms]);
  const shardData = useMemo(() => buildShardData(), []);

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

  const shardMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: '#c6ff3d',
        size: 0.1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const DAMPING_VEL = 0.985;
    const DAMPING_ANG = 0.978;
    const DRIFT_VEL = 0.012;

    const { phase, scrollY } = useAppStore.getState();

    // Dim and soften debris in dashboard phase so content remains readable
    if (phase === 'dashboard') {
      material.color.set('#060606');
      material.roughness = 0.38;
      material.envMapIntensity = 0.45;

      // Depth and parallax shift on scroll
      if (groupRef.current) {
        groupRef.current.position.y = -scrollY * 0.0015;
        groupRef.current.position.z = -scrollY * 0.001;
      }
    }

    if (!meshRef.current) return;

    const count = physics.length;
    for (let i = 0; i < count; i++) {
      const p = physics[i];
      const speed = p.vel.length();

      if (!p.settled) {
        // Position integration
        p.pos.addScaledVector(p.vel, dt);
        p.vel.multiplyScalar(DAMPING_VEL);

        // Rotation integration with quaternions
        deltaEuler.set(p.angVel.x * dt, p.angVel.y * dt, p.angVel.z * dt);
        deltaQuat.setFromEuler(deltaEuler);
        p.quat.multiply(deltaQuat);

        p.angVel.multiplyScalar(DAMPING_ANG);

        if (speed < 0.04) p.settled = true;
      } else {
        // Gentle, lazy drift post-break
        p.pos.x += p.vel.x * DRIFT_VEL;
        p.pos.y += p.vel.y * DRIFT_VEL;
        p.pos.z += p.vel.z * DRIFT_VEL;

        deltaEuler.set(p.angVel.x * 0.12 * dt, p.angVel.y * 0.12 * dt, p.angVel.z * 0.12 * dt);
        deltaQuat.setFromEuler(deltaEuler);
        p.quat.multiply(deltaQuat);
      }

      dummy.position.copy(p.pos);
      dummy.quaternion.copy(p.quat);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Shards
    if (shardsRef.current) {
      const posAttr = shardsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < SHARD_COUNT; i++) {
        const v = shardData.velocities[i];
        arr[i * 3] += v.x * dt;
        arr[i * 3 + 1] += v.y * dt;
        arr[i * 3 + 2] += v.z * dt;
        v.multiplyScalar(0.97);
      }
      posAttr.needsUpdate = true;

      const mat = shardsRef.current.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, mat.opacity - 0.004);
    }
  });

  return (
    <group ref={groupRef} name="BrokenChain">
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, physics.length]}
        castShadow
      />
      <points ref={shardsRef} material={shardMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={SHARD_COUNT}
            array={shardData.positions}
            itemSize={3}
          />
        </bufferGeometry>
      </points>
    </group>
  );
};

export default BrokenChain;
