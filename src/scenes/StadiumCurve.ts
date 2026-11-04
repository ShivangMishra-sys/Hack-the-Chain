import * as THREE from 'three';

export const LINK_COUNT = 40;
export const LINK_PITCH = 1.62;
export const WIRE_RADIUS = 0.17;
export const HALF_LENGTH = 0.52;
export const BEND_RADIUS = 0.62;

// Stadium / elongated torus curve for realistic chain links
export class StadiumCurve extends THREE.Curve<THREE.Vector3> {
  halfLength: number;
  bendRadius: number;

  constructor(halfLength = HALF_LENGTH, bendRadius = BEND_RADIUS) {
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
    d -= arc; // Fixed: subtract arc (not straight)

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

export function createLinkGeometry() {
  const curve = new StadiumCurve(HALF_LENGTH, BEND_RADIUS);
  return new THREE.TubeGeometry(curve, 64, WIRE_RADIUS, 20, true);
}

