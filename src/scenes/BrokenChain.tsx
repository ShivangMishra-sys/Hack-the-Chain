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

  // ── Phase S7: Living Debris Network Specs & Buffers ──
  const MAX_NETWORK_SEGMENTS = 80;
  const networkPositions = useMemo(() => new Float32Array(MAX_NETWORK_SEGMENTS * 2 * 3), []);
  const networkColors = useMemo(() => new Float32Array(MAX_NETWORK_SEGMENTS * 2 * 3), []);

  const networkGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(networkPositions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(networkColors, 3));
    geom.setDrawRange(0, 0);
    return geom;
  }, [networkPositions, networkColors]);

  const networkMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.12, // 8% to 14% opacity range (subtle background texture)
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const lastNetworkUpdateRef = useRef<number>(0);

  // ── Phase S7: Ambient Arcs Specs & Buffers ──
  const MAX_AMBIENT_ARCS = 2;
  const SEGMENTS_PER_AMBIENT_ARC = 5;
  const VERTICES_PER_AMBIENT_ARC = SEGMENTS_PER_AMBIENT_ARC * 2;
  const TOTAL_AMBIENT_VERTICES = MAX_AMBIENT_ARCS * VERTICES_PER_AMBIENT_ARC;

  const ambientCorePositions = useMemo(() => new Float32Array(TOTAL_AMBIENT_VERTICES * 3), []);
  const ambientGhostPositions = useMemo(() => new Float32Array(TOTAL_AMBIENT_VERTICES * 3), []);

  const ambientCoreGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(ambientCorePositions, 3));
    return geom;
  }, [ambientCorePositions]);

  const ambientGhostGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(ambientGhostPositions, 3));
    return geom;
  }, [ambientGhostPositions]);

  const ambientCoreMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#c6ff3d',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const ambientGhostMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#f2f2f2',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const ambientLightRef = useRef<THREE.PointLight>(null);

  // Scratch objects for ambient arcs — zero allocations in useFrame
  const arcPStart = useMemo(() => new THREE.Vector3(), []);
  const arcPEnd = useMemo(() => new THREE.Vector3(), []);
  const arcDir = useMemo(() => new THREE.Vector3(), []);
  const arcUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const arcAlt = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const arcPerp1 = useMemo(() => new THREE.Vector3(), []);
  const arcPerp2 = useMemo(() => new THREE.Vector3(), []);
  const arcCurrentPt = useMemo(() => new THREE.Vector3(), []);
  const arcPrevPt = useMemo(() => new THREE.Vector3(), []);

  const ambientArcsRef = useRef<
    Array<{
      active: boolean;
      startTime: number;
      duration: number;
      idxA: number;
      idxB: number;
      lastJitterTime: number;
    }>
  >([
    { active: false, startTime: 0, duration: 0.25, idxA: -1, idxB: -1, lastJitterTime: 0 },
    { active: false, startTime: 0, duration: 0.25, idxA: -1, idxB: -1, lastJitterTime: 0 },
  ]);

  const nextAmbientSpawnTimeRef = useRef<number>(2.5);

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

    const now = state.clock.elapsedTime;

    // ── Phase S7: Node Network Connections (~12fps, fading with distance) ──
    if (!isMobile && !prefersReducedMotion && phase === 'dashboard' && reforgeEase < 0.8) {
      if (now - lastNetworkUpdateRef.current >= 1 / 12) {
        lastNetworkUpdateRef.current = now;

        let segmentCount = 0;
        const threshold = 7.5;
        const thresholdSq = 56.25;

        for (let i = 0; i < count; i++) {
          if (segmentCount >= MAX_NETWORK_SEGMENTS) break;
          const pA = physics[i];
          if (!pA.settled) continue;

          const pAx = pA.pos.x + pA.offset.x;
          const pAy = pA.pos.y + pA.offset.y;
          const pAz = pA.pos.z + pA.offset.z;

          let n1Idx = -1;
          let n1DistSq = thresholdSq;
          let n2Idx = -1;
          let n2DistSq = thresholdSq;

          for (let j = 0; j < count; j++) {
            if (i === j) continue;
            const pB = physics[j];
            if (!pB.settled) continue;

            const dx = pB.pos.x + pB.offset.x - pAx;
            const dy = pB.pos.y + pB.offset.y - pAy;
            const dz = pB.pos.z + pB.offset.z - pAz;
            const dSq = dx * dx + dy * dy + dz * dz;

            if (dSq < n1DistSq) {
              n2DistSq = n1DistSq;
              n2Idx = n1Idx;
              n1DistSq = dSq;
              n1Idx = j;
            } else if (dSq < n2DistSq) {
              n2DistSq = dSq;
              n2Idx = j;
            }
          }

          if (n1Idx !== -1 && i < n1Idx && segmentCount < MAX_NETWORK_SEGMENTS) {
            const pB = physics[n1Idx];
            const dist = Math.sqrt(n1DistSq);
            const fade = Math.max(0, 1.0 - dist / threshold) * (1.0 - reforgeEase);

            const vIdx = segmentCount * 6;
            networkPositions[vIdx] = pAx;
            networkPositions[vIdx + 1] = pAy;
            networkPositions[vIdx + 2] = pAz;
            networkPositions[vIdx + 3] = pB.pos.x + pB.offset.x;
            networkPositions[vIdx + 4] = pB.pos.y + pB.offset.y;
            networkPositions[vIdx + 5] = pB.pos.z + pB.offset.z;

            networkColors[vIdx] = fade;
            networkColors[vIdx + 1] = fade;
            networkColors[vIdx + 2] = fade;
            networkColors[vIdx + 3] = fade;
            networkColors[vIdx + 4] = fade;
            networkColors[vIdx + 5] = fade;

            segmentCount++;
          }

          if (n2Idx !== -1 && i < n2Idx && segmentCount < MAX_NETWORK_SEGMENTS) {
            const pB = physics[n2Idx];
            const dist = Math.sqrt(n2DistSq);
            const fade = Math.max(0, 1.0 - dist / threshold) * (1.0 - reforgeEase);

            const vIdx = segmentCount * 6;
            networkPositions[vIdx] = pAx;
            networkPositions[vIdx + 1] = pAy;
            networkPositions[vIdx + 2] = pAz;
            networkPositions[vIdx + 3] = pB.pos.x + pB.offset.x;
            networkPositions[vIdx + 4] = pB.pos.y + pB.offset.y;
            networkPositions[vIdx + 5] = pB.pos.z + pB.offset.z;

            networkColors[vIdx] = fade;
            networkColors[vIdx + 1] = fade;
            networkColors[vIdx + 2] = fade;
            networkColors[vIdx + 3] = fade;
            networkColors[vIdx + 4] = fade;
            networkColors[vIdx + 5] = fade;

            segmentCount++;
          }
        }

        networkGeometry.setDrawRange(0, segmentCount * 2);
        networkGeometry.attributes.position.needsUpdate = true;
        networkGeometry.attributes.color.needsUpdate = true;
      }
    } else {
      if (networkGeometry.drawRange.count > 0) {
        networkGeometry.setDrawRange(0, 0);
      }
    }

    // ── Phase S7: Ambient Arcs (Every 2–5s, ~0.25s duration, max 2, halved on mobile) ──
    const maxActiveArcs = isMobile ? 1 : 2;

    if (!prefersReducedMotion && phase === 'dashboard' && reforgeEase < 0.75) {
      let isMouseNearDebris = false;
      let mouseNearestLinkIdx = -1;
      let minMouseDistSq = 49.0; // ~7 units

      if (hasMouseIntersection) {
        for (let i = 0; i < count; i++) {
          const dSq = physics[i].pos.distanceToSquared(mouseLocal);
          if (dSq < minMouseDistSq) {
            minMouseDistSq = dSq;
            mouseNearestLinkIdx = i;
            isMouseNearDebris = true;
          }
        }
      }

      // Check if we should trigger a new ambient arc
      if (now >= nextAmbientSpawnTimeRef.current) {
        const freeSlot = ambientArcsRef.current.slice(0, maxActiveArcs).find((a) => !a.active);
        if (freeSlot) {
          const settledIndices: number[] = [];
          for (let i = 0; i < count; i++) {
            if (physics[i].settled) settledIndices.push(i);
          }

          if (settledIndices.length >= 2) {
            const chosenA =
              isMouseNearDebris && mouseNearestLinkIdx !== -1
                ? mouseNearestLinkIdx
                : settledIndices[Math.floor(Math.random() * settledIndices.length)];

            let chosenB = -1;
            let bestDistSq = Infinity;
            const posA = physics[chosenA].pos;

            for (const idx of settledIndices) {
              if (idx === chosenA) continue;
              const dSq = posA.distanceToSquared(physics[idx].pos);
              if (dSq > 2.25 && dSq < 36.0) { // between 1.5 and 6 units
                if (dSq < bestDistSq || Math.random() < 0.3) {
                  bestDistSq = dSq;
                  chosenB = idx;
                }
              }
            }

            if (chosenB !== -1) {
              freeSlot.active = true;
              freeSlot.startTime = now;
              freeSlot.duration = 0.22 + Math.random() * 0.06; // ~0.25s
              freeSlot.idxA = chosenA;
              freeSlot.idxB = chosenB;
              freeSlot.lastJitterTime = 0;
            }
          }
        }

        // Delay: 2-5s normally, faster (0.8s - 1.8s) when mouse is near debris
        const spawnDelay = isMouseNearDebris
          ? 0.8 + Math.random() * 1.0
          : 2.0 + Math.random() * 3.0;
        nextAmbientSpawnTimeRef.current = now + spawnDelay;
      }

      // Update active ambient arcs
      let anyArcActive = false;
      let activeMidpointX = 0;
      let activeMidpointY = 0;
      let activeMidpointZ = 0;
      let maxArcAlpha = 0;

      for (let k = 0; k < maxActiveArcs; k++) {
        const arc = ambientArcsRef.current[k];
        const baseIdx = k * VERTICES_PER_AMBIENT_ARC * 3;

        if (!arc.active) {
          for (let v = 0; v < VERTICES_PER_AMBIENT_ARC * 3; v++) {
            ambientCorePositions[baseIdx + v] = 0;
            ambientGhostPositions[baseIdx + v] = 0;
          }
          continue;
        }

        const elapsed = now - arc.startTime;
        if (elapsed >= arc.duration) {
          arc.active = false;
          for (let v = 0; v < VERTICES_PER_AMBIENT_ARC * 3; v++) {
            ambientCorePositions[baseIdx + v] = 0;
            ambientGhostPositions[baseIdx + v] = 0;
          }
          continue;
        }

        anyArcActive = true;
        const progress = elapsed / arc.duration;
        const alpha = Math.sin(progress * Math.PI) * (1.0 - reforgeEase); // smooth bell curve
        if (alpha > maxArcAlpha) maxArcAlpha = alpha;

        // Regenerate jitter at ~12fps
        if (now - arc.lastJitterTime >= 1 / 12) {
          arc.lastJitterTime = now;

          const pA = physics[arc.idxA];
          const pB = physics[arc.idxB];
          arcPStart.addVectors(pA.pos, pA.offset);
          arcPEnd.addVectors(pB.pos, pB.offset);

          activeMidpointX = (arcPStart.x + arcPEnd.x) * 0.5;
          activeMidpointY = (arcPStart.y + arcPEnd.y) * 0.5;
          activeMidpointZ = (arcPStart.z + arcPEnd.z) * 0.5;

          arcDir.subVectors(arcPEnd, arcPStart).normalize();
          if (Math.abs(arcDir.y) < 0.9) {
            arcPerp1.crossVectors(arcDir, arcUp).normalize();
          } else {
            arcPerp1.crossVectors(arcDir, arcAlt).normalize();
          }
          arcPerp2.crossVectors(arcDir, arcPerp1).normalize();

          arcPrevPt.copy(arcPStart);
          let writeIdx = baseIdx;

          for (let s = 1; s <= SEGMENTS_PER_AMBIENT_ARC; s++) {
            const t = s / SEGMENTS_PER_AMBIENT_ARC;

            if (s === SEGMENTS_PER_AMBIENT_ARC) {
              arcCurrentPt.copy(arcPEnd);
            } else {
              const envelope = Math.sin(t * Math.PI);
              const jitter1 = (Math.random() - 0.5) * 0.45 * envelope;
              const jitter2 = (Math.random() - 0.5) * 0.45 * envelope;

              arcCurrentPt.lerpVectors(arcPStart, arcPEnd, t);
              arcCurrentPt.addScaledVector(arcPerp1, jitter1);
              arcCurrentPt.addScaledVector(arcPerp2, jitter2);
            }

            // Core
            ambientCorePositions[writeIdx] = arcPrevPt.x;
            ambientCorePositions[writeIdx + 1] = arcPrevPt.y;
            ambientCorePositions[writeIdx + 2] = arcPrevPt.z;
            ambientCorePositions[writeIdx + 3] = arcCurrentPt.x;
            ambientCorePositions[writeIdx + 4] = arcCurrentPt.y;
            ambientCorePositions[writeIdx + 5] = arcCurrentPt.z;

            // Offset ghost duplicate (+0.04, -0.04, +0.02)
            ambientGhostPositions[writeIdx] = arcPrevPt.x + 0.04;
            ambientGhostPositions[writeIdx + 1] = arcPrevPt.y - 0.04;
            ambientGhostPositions[writeIdx + 2] = arcPrevPt.z + 0.02;
            ambientGhostPositions[writeIdx + 3] = arcCurrentPt.x + 0.04;
            ambientGhostPositions[writeIdx + 4] = arcCurrentPt.y - 0.04;
            ambientGhostPositions[writeIdx + 5] = arcCurrentPt.z + 0.02;

            writeIdx += 6;
            arcPrevPt.copy(arcCurrentPt);
          }
        }
      }

      ambientCoreGeometry.attributes.position.needsUpdate = true;
      ambientGhostGeometry.attributes.position.needsUpdate = true;

      // Update material opacities
      ambientCoreMaterial.opacity = 0.85 * maxArcAlpha;
      ambientGhostMaterial.opacity = 0.45 * maxArcAlpha;

      // Faint glow point light
      if (ambientLightRef.current) {
        if (anyArcActive && maxArcAlpha > 0.05) {
          ambientLightRef.current.position.set(activeMidpointX, activeMidpointY, activeMidpointZ);
          ambientLightRef.current.intensity = maxArcAlpha * 1.5;
        } else {
          ambientLightRef.current.intensity = 0;
        }
      }
    } else {
      ambientCoreMaterial.opacity = 0;
      ambientGhostMaterial.opacity = 0;
      if (ambientLightRef.current) ambientLightRef.current.intensity = 0;
    }

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

      {/* Living Debris: Node Network (Phase S7 - disabled on mobile) */}
      {!isMobile && (
        <lineSegments
          geometry={networkGeometry}
          material={networkMaterial}
        />
      )}

      {/* Living Debris: Ambient Arcs (Phase S7) */}
      <group>
        {/* Off-white ghost duplicate offset layer */}
        <lineSegments
          geometry={ambientGhostGeometry}
          material={ambientGhostMaterial}
        />
        {/* Lime core arc layer */}
        <lineSegments
          geometry={ambientCoreGeometry}
          material={ambientCoreMaterial}
        />
        {/* Faint ambient arc glow point light */}
        <pointLight
          ref={ambientLightRef}
          color="#c6ff3d"
          intensity={0}
          distance={6}
          decay={2}
        />
      </group>

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
