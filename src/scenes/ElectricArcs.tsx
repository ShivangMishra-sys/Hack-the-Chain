import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

const SEGMENTS_PER_ARC = 6;
const VERTICES_PER_ARC = SEGMENTS_PER_ARC * 2; // 12 vertices for LineSegments

export const ElectricArcs: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreLineRef = useRef<THREE.LineSegments>(null);
  const ghostLineRef = useRef<THREE.LineSegments>(null);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive arc count: 5 on desktop (within 4-6 range), halved to 3 on mobile
  const arcCount = isMobile ? 3 : 5;
  const totalVertices = arcCount * VERTICES_PER_ARC;

  // Pre-allocated typed arrays for positions — zero allocations inside useFrame
  const corePositions = useMemo(() => new Float32Array(totalVertices * 3), [totalVertices]);
  const ghostPositions = useMemo(() => new Float32Array(totalVertices * 3), [totalVertices]);

  // Pre-allocated geometries
  const coreGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
    return geom;
  }, [corePositions]);

  const ghostGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(ghostPositions, 3));
    return geom;
  }, [ghostPositions]);

  // Core material in lime accent (#c6ff3d)
  const coreMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#c6ff3d',
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  // Offset duplicate material in off-white ghost (rgba(242, 242, 242, 0.55))
  const ghostMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#f2f2f2',
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  // Scratch objects for arc math — completely persistent, zero GC in useFrame
  const pStart = useMemo(() => new THREE.Vector3(), []);
  const pEnd = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const altVec = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const perp1 = useMemo(() => new THREE.Vector3(), []);
  const perp2 = useMemo(() => new THREE.Vector3(), []);
  const currentPt = useMemo(() => new THREE.Vector3(), []);
  const prevPt = useMemo(() => new THREE.Vector3(), []);

  const breakFiredTimeRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const wasFiredRef = useRef(false);

  useFrame((state) => {
    if (prefersReducedMotion) {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }

    const { breakFired } = useAppStore.getState();

    // Detect snap moment trigger
    if (breakFired && !wasFiredRef.current) {
      wasFiredRef.current = true;
      breakFiredTimeRef.current = state.clock.elapsedTime;
      lastUpdateRef.current = 0;
    }

    if (!breakFired || breakFiredTimeRef.current === null) {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }

    const elapsedSinceSnap = state.clock.elapsedTime - breakFiredTimeRef.current;

    // Arcs persist for ~0.6s post-snap
    if (elapsedSinceSnap > 0.6) {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }

    if (groupRef.current) groupRef.current.visible = true;

    // Fade arcs toward end of 0.6s lifetime
    const lifetimeProgress = elapsedSinceSnap / 0.6;
    const alpha = Math.max(0, 1.0 - lifetimeProgress * lifetimeProgress);
    coreMaterial.opacity = 0.95 * alpha;
    ghostMaterial.opacity = 0.55 * alpha;

    // Stepped update rate: regenerate procedural jitter at ~12fps (~0.083s interval)
    const FPS_INTERVAL = 1 / 12;
    if (state.clock.elapsedTime - lastUpdateRef.current < FPS_INTERVAL) {
      return;
    }
    lastUpdateRef.current = state.clock.elapsedTime;

    let writeIdx = 0;

    for (let a = 0; a < arcCount; a++) {
      // Pick random 3D direction from center break point
      const angle = (a / arcCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
      const elevation = (Math.random() - 0.5) * 1.6;
      const arcLength = 2.4 + Math.random() * 2.2;

      pStart.set(0, 0, 0);
      pEnd.set(
        Math.cos(angle) * Math.cos(elevation) * arcLength,
        Math.sin(elevation) * arcLength,
        Math.sin(angle) * Math.cos(elevation) * arcLength
      );

      // Compute perpendicular basis vectors for jitter
      dir.subVectors(pEnd, pStart).normalize();
      if (Math.abs(dir.y) < 0.9) {
        perp1.crossVectors(dir, upVec).normalize();
      } else {
        perp1.crossVectors(dir, altVec).normalize();
      }
      perp2.crossVectors(dir, perp1).normalize();

      prevPt.copy(pStart);

      for (let s = 1; s <= SEGMENTS_PER_ARC; s++) {
        const t = s / SEGMENTS_PER_ARC;

        if (s === SEGMENTS_PER_ARC) {
          currentPt.copy(pEnd);
        } else {
          // Parabolic envelope: maximum jitter at arc midpoint, 0 at root and tip
          const envelope = Math.sin(t * Math.PI);
          const jitter1 = (Math.random() - 0.5) * 0.9 * envelope;
          const jitter2 = (Math.random() - 0.5) * 0.9 * envelope;

          currentPt.lerpVectors(pStart, pEnd, t);
          currentPt.addScaledVector(perp1, jitter1);
          currentPt.addScaledVector(perp2, jitter2);
        }

        // 1. Core arc segment
        corePositions[writeIdx] = prevPt.x;
        corePositions[writeIdx + 1] = prevPt.y;
        corePositions[writeIdx + 2] = prevPt.z;
        corePositions[writeIdx + 3] = currentPt.x;
        corePositions[writeIdx + 4] = currentPt.y;
        corePositions[writeIdx + 5] = currentPt.z;

        // 2. Off-white ghost duplicate shifted by a few pixels (+0.04, -0.04, 0.02)
        ghostPositions[writeIdx] = prevPt.x + 0.04;
        ghostPositions[writeIdx + 1] = prevPt.y - 0.04;
        ghostPositions[writeIdx + 2] = prevPt.z + 0.02;
        ghostPositions[writeIdx + 3] = currentPt.x + 0.04;
        ghostPositions[writeIdx + 4] = currentPt.y - 0.04;
        ghostPositions[writeIdx + 5] = currentPt.z + 0.02;

        writeIdx += 6;
        prevPt.copy(currentPt);
      }
    }

    coreGeometry.attributes.position.needsUpdate = true;
    ghostGeometry.attributes.position.needsUpdate = true;
  });

  if (prefersReducedMotion) return null;

  return (
    <group ref={groupRef} visible={false}>
      {/* Off-white ghost duplicate offset layer */}
      <primitive object={new THREE.LineSegments(ghostGeometry, ghostMaterial)} ref={ghostLineRef} />
      {/* Lime core arc layer */}
      <primitive object={new THREE.LineSegments(coreGeometry, coreMaterial)} ref={coreLineRef} />
    </group>
  );
};

export default ElectricArcs;

