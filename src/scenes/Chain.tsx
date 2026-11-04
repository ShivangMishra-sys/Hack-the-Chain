import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Stadium / elongated torus curve for realistic chain links
class StadiumCurve extends THREE.Curve<THREE.Vector3> {
  halfLength: number;
  bendRadius: number;

  constructor(halfLength = 0.52, bendRadius = 0.62) {
    super();
    this.halfLength = halfLength;
    this.bendRadius = bendRadius;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const straight = 2 * this.halfLength;
    const arc = Math.PI * this.bendRadius;
    const total = 2 * straight + 2 * arc;

    let d = (t % 1) * total;
    if (d < 0) d += total;

    // Segment 1: top straight from (+halfLength, bendRadius, 0) to (-halfLength, bendRadius, 0)
    if (d <= straight) {
      const u = d / straight;
      return optionalTarget.set(this.halfLength - u * straight, this.bendRadius, 0);
    }
    d -= straight;

    // Segment 2: left semi-circle from (-halfLength, bendRadius, 0) to (-halfLength, -bendRadius, 0)
    if (d <= arc) {
      const theta = Math.PI / 2 + (d / arc) * Math.PI;
      return optionalTarget.set(
        -this.halfLength + this.bendRadius * Math.cos(theta),
        this.bendRadius * Math.sin(theta),
        0
      );
    }
    d -= arc;

    // Segment 3: bottom straight from (-halfLength, -bendRadius, 0) to (+halfLength, -bendRadius, 0)
    if (d <= straight) {
      const u = d / straight;
      return optionalTarget.set(-this.halfLength + u * straight, -this.bendRadius, 0);
    }
    d -= straight;

    // Segment 4: right semi-circle from (+halfLength, -bendRadius, 0) to (+halfLength, bendRadius, 0)
    const theta = -Math.PI / 2 + (d / arc) * Math.PI;
    return optionalTarget.set(
      this.halfLength + this.bendRadius * Math.cos(theta),
      this.bendRadius * Math.sin(theta),
      0
    );
  }
}

export const LINK_COUNT = 40;
export const LINK_PITCH = 1.62; // Distance between consecutive link centers along X
export const WIRE_RADIUS = 0.17; // Wire thickness
export const HALF_LENGTH = 0.52; // Half straight length
export const BEND_RADIUS = 0.62; // Semi-circle radius
export const TRAVEL_SPEED = 1.4; // Units per second from right to left (+x to -x)
export const AXIAL_ROTATION_SPEED = 0.16; // Radian per second about the X axis

export const Chain: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const travelDistance = useRef(0);

  const totalSpan = LINK_COUNT * LINK_PITCH;
  const halfSpan = totalSpan / 2;

  // Generate the stadium link geometry
  const geometry = useMemo(() => {
    const curve = new StadiumCurve(HALF_LENGTH, BEND_RADIUS);
    return new THREE.TubeGeometry(curve, 64, WIRE_RADIUS, 20, true);
  }, []);

  // Premium dark obsidian chrome with crisp specular response
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0c0c0c'),
      metalness: 0.98,
      roughness: 0.18,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
      envMapIntensity: 0.9,
    });
  }, []);

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1);

    // 1. Rotate whole chain slowly about its length axis (X axis)
    if (groupRef.current) {
      groupRef.current.rotation.x += AXIAL_ROTATION_SPEED * safeDelta;
    }

    if (!meshRef.current) return;

    // 2. Travel horizontally from +x to -x in a seamless infinite loop
    travelDistance.current += TRAVEL_SPEED * safeDelta;

    for (let i = 0; i < LINK_COUNT; i++) {
      const baseX = (i - (LINK_COUNT - 1) / 2) * LINK_PITCH;
      let x = baseX - travelDistance.current;

      // Wrap seamlessly within [-halfSpan, +halfSpan]
      x = ((((x + halfSpan) % totalSpan) + totalSpan) % totalSpan) - halfSpan;

      dummy.position.set(x, 0, 0);

      // Alternate links rotated 90 degrees about the X axis
      const isOdd = i % 2 !== 0;
      dummy.rotation.set(isOdd ? Math.PI / 2 : 0, 0, 0);
      dummy.scale.set(1, 1, 1);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, LINK_COUNT]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default Chain;
