import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createLinkGeometry, LINK_PITCH } from './StadiumCurve';
import { LinkTransformSnapshot } from './Chain';
import { useAppStore } from '../store/useAppStore';

const SHARD_COUNT = 60;

interface LinkPhysics {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  vel: THREE.Vector3;
  angVel: THREE.Vector3;
  settled: boolean;
  offset: THREE.Vector3;
  offsetVel: THREE.Vector3;
}

function buildPhysics(transforms: LinkTransformSnapshot[]): LinkPhysics[] {
  const data: LinkPhysics[] = [];
  const count = transforms.length;
  const positions: THREE.Vector3[] = [];
  const MIN_SEPARATION = 2.3;

  for (let i = 0; i < count; i++) {
    const snap = transforms[i] || {
      pos: new THREE.Vector3((i - count / 2) * 1.62, 0, 0),
      quat: new THREE.Quaternion(),
    };

    const isLeft = i % 2 === 0;
    const side = isLeft ? -1 : 1;

    // Pick non-overlapping positions spread across wide flanks (zoom-out & widescreen friendly)
    let chosenPos = new THREE.Vector3();
    let bestDist = 0;
    let fallbackPos = new THREE.Vector3();

    for (let attempt = 0; attempt < 40; attempt++) {
      // Wide flank coverage: 3.6 to 16.5 from center
      const distFromCenter = 3.6 + Math.random() * 12.8;
      const candX = side * distFromCenter;
      const candY = (Math.random() - 0.5) * 10.5; // -5.25 to +5.25
      const candZ = (Math.random() - 0.5) * 9.5;  // -4.75 to +4.75
      const cand = new THREE.Vector3(candX, candY, candZ);

      if (attempt === 0) fallbackPos.copy(cand);

      let closest = Infinity;
      for (const p of positions) {
        const d = cand.distanceTo(p);
        if (d < closest) closest = d;
      }

      if (closest >= MIN_SEPARATION) {
        chosenPos = cand;
        break;
      }

      if (closest > bestDist) {
        bestDist = closest;
        fallbackPos.copy(cand);
      }

      if (attempt === 39) {
        chosenPos = fallbackPos;
      }
    }

    positions.push(chosenPos);

    // Initial blast velocities away from central reading corridor
    const dirX = isLeft ? -(Math.random() * 1.5 + 0.5) : +(Math.random() * 1.5 + 0.5);
    const dirY = (Math.random() - 0.5) * 2.2;
    const dirZ = (Math.random() - 0.5) * 2.6;
    const speed = 0.75 + Math.random() * 0.45;

    // Natural random tumbling orientation to prevent parallel grid tangling
    const randomEuler = new THREE.Euler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    const tumblingQuat = snap.quat.clone().multiply(new THREE.Quaternion().setFromEuler(randomEuler));

    data.push({
      pos: chosenPos,
      quat: tumblingQuat,
      vel: new THREE.Vector3(dirX * speed, dirY * speed, dirZ * speed),
      angVel: new THREE.Vector3(
        (Math.random() - 0.5) * 3.0,
        (Math.random() - 0.5) * 3.0,
        (Math.random() - 0.5) * 3.0
      ),
      settled: false,
      offset: new THREE.Vector3(0, 0, 0),
      offsetVel: new THREE.Vector3(0, 0, 0),
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
  const pulseLightRef = useRef<THREE.PointLight>(null);

  // Scratch objects reused every frame — zero allocations inside useFrame
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const deltaQuat = useMemo(() => new THREE.Quaternion(), []);
  const deltaEuler = useMemo(() => new THREE.Euler(), []);
  const mouseNdc = useMemo(() => new THREE.Vector2(-1000, -1000), []);
  const mouseWorld = useMemo(() => new THREE.Vector3(), []);
  const mouseLocal = useMemo(() => new THREE.Vector3(), []);
  const planeNormal = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const debrisPlane = useMemo(() => new THREE.Plane(), []);
  const tempGroupWorldPos = useMemo(() => new THREE.Vector3(), []);
  const tempLinkCurrentPos = useMemo(() => new THREE.Vector3(), []);
  const diffVec = useMemo(() => new THREE.Vector3(), []);

  // Re-forge scratch vectors and target orientation quaternions
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetQuat = useMemo(() => new THREE.Quaternion(), []);
  const assembledQuatH = useMemo(() => new THREE.Quaternion(), []);
  const assembledQuatV = useMemo(
    () => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2),
    []
  );
  const finalPos = useMemo(() => new THREE.Vector3(), []);
  const finalQuat = useMemo(() => new THREE.Quaternion(), []);

  const isMouseActiveRef = useRef(false);
  const pulseTriggeredRef = useRef(false);
  const pulseProgressRef = useRef(0);

  // Responsive assembled links count: fewer on mobile (8 vs 16)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Check if current device is a touch screen (tilt/mouse repulsion disabled)
  const isTouchDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(pointer: coarse)').matches ||
      !window.matchMedia('(pointer: fine)').matches ||
      'ontouchstart' in window ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
    );
  }, []);

  // Track global window mouse coordinates to ensure continuous tracking even when canvas is pointer-events: none
  useEffect(() => {
    if (isTouchDevice) return;

    const onMouseMove = (e: MouseEvent) => {
      isMouseActiveRef.current = true;
      mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onMouseLeave = () => {
      isMouseActiveRef.current = false;
    };

    const onMouseEnter = () => {
      isMouseActiveRef.current = true;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isTouchDevice, mouseNdc]);

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

  useFrame((state, delta) => {
    // Pause immediately when browser tab is hidden to save resources and avoid frame jumps
    if (typeof document !== 'undefined' && document.hidden) return;

    const dt = Math.min(delta, 0.05);
    const DAMPING_VEL = 0.985;
    const DAMPING_ANG = 0.978;

    const { phase, scrollY, scrollEased, reforgeProgress } = useAppStore.getState();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Calculate smooth reforge easing (skips animation under prefers-reduced-motion)
    const reforgeEase = prefersReducedMotion
      ? reforgeProgress >= 0.5
        ? 1.0
        : 0.0
      : THREE.MathUtils.smoothstep(reforgeProgress, 0.0, 1.0);

    // Dynamic material adaptation: dim debris in dashboard, restore to chrome during re-forge
    if (phase === 'dashboard') {
      if (reforgeEase > 0.01) {
        material.color.setRGB(
          THREE.MathUtils.lerp(0.024, 0.08, reforgeEase),
          THREE.MathUtils.lerp(0.024, 0.08, reforgeEase),
          THREE.MathUtils.lerp(0.024, 0.08, reforgeEase)
        );
        material.roughness = THREE.MathUtils.lerp(0.38, 0.16, reforgeEase);
        material.metalness = THREE.MathUtils.lerp(0.98, 1.0, reforgeEase);
        material.envMapIntensity = THREE.MathUtils.lerp(0.45, 1.4, reforgeEase);
      } else {
        material.color.set('#060606');
        material.roughness = 0.38;
        material.metalness = 0.98;
        material.envMapIntensity = 0.45;
      }

      // Depth and parallax shift on scroll
      if (groupRef.current) {
        groupRef.current.position.y = -scrollY * 0.0015;
        groupRef.current.position.z = -scrollY * 0.001;
      }
    }

    if (!meshRef.current || !groupRef.current) return;

    // Project cursor onto plane at debris depth for interactive repulsion
    let hasMouseIntersection = false;
    if (!isTouchDevice && isMouseActiveRef.current && phase === 'dashboard' && reforgeEase < 0.8) {
      groupRef.current.getWorldPosition(tempGroupWorldPos);
      debrisPlane.setFromNormalAndCoplanarPoint(planeNormal, tempGroupWorldPos);

      state.raycaster.setFromCamera(mouseNdc, state.camera);
      const hit = state.raycaster.ray.intersectPlane(debrisPlane, mouseWorld);
      if (hit) {
        groupRef.current.worldToLocal(mouseLocal.copy(mouseWorld));
        hasMouseIntersection = true;
      }
    }

    const REPEL_RADIUS = 3.2;
    const REPEL_RADIUS_SQ = REPEL_RADIUS * REPEL_RADIUS;
    // Mouse repulsion yields to magnetic re-forge as progress increases
    const REPEL_FORCE = 28.0 * (1.0 - reforgeEase);
    const SPRING_K = 11.5;
    const SPRING_DAMPING = 4.2;

    // Assembled chain layout behind CTA (fewer links on mobile)
    const assembledCount = isMobile ? 8 : 16;
    const startX = -((assembledCount - 1) * LINK_PITCH) / 2;

    const count = physics.length;
    for (let i = 0; i < count; i++) {
      const p = physics[i];

      if (!p.settled) {
        // Initial break explosion integration
        p.pos.addScaledVector(p.vel, dt);
        p.vel.multiplyScalar(DAMPING_VEL);

        // Rotation integration with quaternions
        deltaEuler.set(p.angVel.x * dt, p.angVel.y * dt, p.angVel.z * dt);
        deltaQuat.setFromEuler(deltaEuler);
        p.quat.multiply(deltaQuat);

        p.angVel.multiplyScalar(DAMPING_ANG);

        if (p.vel.length() < 0.04) p.settled = true;
      } else {
        // Gentle, lazy harmonic floating micro-drift post-break (bobs smoothly in place across the field)
        const floatSpeed = 0.45 + (i % 5) * 0.12;
        const driftX = Math.sin(state.clock.elapsedTime * floatSpeed + i * 1.3) * 0.003;
        const driftY = Math.cos(state.clock.elapsedTime * floatSpeed * 0.8 + i * 1.7) * 0.003;
        const driftZ = Math.sin(state.clock.elapsedTime * floatSpeed * 0.6 + i * 2.2) * 0.002;

        p.pos.x += driftX;
        p.pos.y += driftY;
        p.pos.z += driftZ;

        // Preserve open central reading channel: gently keep debris in flank zones
        if (p.pos.x > -3.5 && p.pos.x < 0) {
          p.pos.x -= 0.015;
        } else if (p.pos.x < 3.5 && p.pos.x >= 0) {
          p.pos.x += 0.015;
        }

        // Soft outer bounds keep debris nicely dispersed across wide viewports and zoom-out
        if (p.pos.x < -17.5) p.pos.x += 0.02;
        if (p.pos.x > 17.5) p.pos.x -= 0.02;

        deltaEuler.set(p.angVel.x * 0.12 * dt, p.angVel.y * 0.12 * dt, p.angVel.z * 0.12 * dt);
        deltaQuat.setFromEuler(deltaEuler);
        p.quat.multiply(deltaQuat);

        // Dampen any angular velocity kick back toward baseline
        p.angVel.multiplyScalar(Math.max(0, 1.0 - 0.75 * dt));
      }

      // Mouse repulsion physics (dashboard phase only)
      if (hasMouseIntersection && phase === 'dashboard' && REPEL_FORCE > 0.01) {
        tempLinkCurrentPos.addVectors(p.pos, p.offset);
        const distSq = tempLinkCurrentPos.distanceToSquared(mouseLocal);

        if (distSq < REPEL_RADIUS_SQ) {
          const dist = Math.sqrt(distSq);
          const proximity = 1.0 - dist / REPEL_RADIUS;
          const factor = proximity * proximity; // Smooth quadratic falloff

          diffVec.subVectors(tempLinkCurrentPos, mouseLocal);
          diffVec.z += proximity * 0.4; // Push slightly backward in Z for 3D depth

          const len = diffVec.length();
          if (len > 0.0001) {
            diffVec.divideScalar(len);
          } else {
            diffVec.set(0, 1, 0.5).normalize();
          }

          // Add repulsion impulse to offset velocity
          p.offsetVel.addScaledVector(diffVec, REPEL_FORCE * factor * dt);

          // Angular velocity kick on contact
          const kick = 4.5 * factor * dt;
          p.angVel.x += (diffVec.y - diffVec.z) * kick;
          p.angVel.y += (diffVec.z - diffVec.x) * kick;
          p.angVel.z += (diffVec.x - diffVec.y) * kick;
        }
      }

      // Spring back toward original drift path with damping
      // F = -k * offset - c * offsetVel
      p.offsetVel.addScaledVector(p.offset, -SPRING_K * dt);
      p.offsetVel.multiplyScalar(Math.max(0, 1.0 - SPRING_DAMPING * dt));

      // Velocity cap to guarantee zero explosions
      const speedSq = p.offsetVel.lengthSq();
      if (speedSq > 144) {
        p.offsetVel.multiplyScalar(12 / Math.sqrt(speedSq));
      }

      p.offset.addScaledVector(p.offsetVel, dt);

      // Displacement cap for stability
      const offSq = p.offset.lengthSq();
      if (offSq > 20.25) {
        p.offset.multiplyScalar(4.5 / Math.sqrt(offSq));
      }

      // Calculate final rendered transform with continuous scrub interpolation
      tempLinkCurrentPos.addVectors(p.pos, p.offset);

      // Debris parallax: nearer links move faster during scroll
      if (phase === 'dashboard') {
        const depthFactor = THREE.MathUtils.clamp((p.pos.z + 4.0) / 8.0, 0.2, 2.0);
        const parallaxBlend = (1.0 - reforgeEase) * scrollEased;
        tempLinkCurrentPos.z += parallaxBlend * depthFactor * 2.0;
      }

      if (i < assembledCount) {
        // Target assembled position for link i
        targetPos.set(startX + i * LINK_PITCH, 0.2, 0.0);

        // Interlocking 90-degree alternating orientation
        if (i % 2 === 0) {
          targetQuat.copy(assembledQuatH);
        } else {
          targetQuat.copy(assembledQuatV);
        }

        // Seamless continuous interpolation between drift and re-forged chain
        finalPos.lerpVectors(tempLinkCurrentPos, targetPos, reforgeEase);
        finalQuat.slerpQuaternions(p.quat, targetQuat, reforgeEase);

        dummy.position.copy(finalPos);
        dummy.quaternion.copy(finalQuat);
        dummy.scale.setScalar(1.0);
      } else {
        // Extra debris links outside the short assembled chain scale down smoothly
        dummy.position.copy(tempLinkCurrentPos);
        dummy.quaternion.copy(p.quat);
        dummy.scale.setScalar(Math.max(0, 1.0 - reforgeEase * 1.25));
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // ── Single Accent Light Pulse when Fully Assembled ──
    if (reforgeProgress >= 0.95 && !pulseTriggeredRef.current) {
      pulseTriggeredRef.current = true;
      pulseProgressRef.current = 0;
    }

    if (pulseTriggeredRef.current && pulseProgressRef.current <= 1.0 && !prefersReducedMotion) {
      pulseProgressRef.current += dt * 1.15; // ~0.85s sweep across links
      const p = Math.min(1.0, pulseProgressRef.current);
      const xMin = startX - 1.2;
      const xMax = -startX + 1.2;
      const pulseX = THREE.MathUtils.lerp(xMin, xMax, p);

      if (pulseLightRef.current) {
        pulseLightRef.current.position.set(pulseX, 0.2, 1.4);
        const arc = Math.sin(p * Math.PI);
        pulseLightRef.current.intensity = arc * 10.0;
      }

      const arc = Math.sin(p * Math.PI);
      material.emissive.set('#c6ff3d');
      material.emissiveIntensity = arc * 0.45;
    } else if (pulseProgressRef.current > 1.0) {
      if (pulseLightRef.current) pulseLightRef.current.intensity = 0;
      material.emissiveIntensity = 0;
    }

    // Scrolling back up releases pulse trigger so it can fire again on next reassembly
    if (reforgeProgress < 0.65) {
      pulseTriggeredRef.current = false;
      pulseProgressRef.current = 0;
      if (pulseLightRef.current) pulseLightRef.current.intensity = 0;
      material.emissiveIntensity = 0;
    }

    // Shards simulation
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
      {/* Accent light pulse along re-forged chain */}
      <pointLight
        ref={pulseLightRef}
        color="#c6ff3d"
        intensity={0}
        distance={12}
        decay={2}
      />
    </group>
  );
};

export default BrokenChain;
