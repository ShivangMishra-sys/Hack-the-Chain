import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

// Helper to create a soft circular sprite texture for dust particles
function createCircleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

// Background Radial Glow Shader
const GlowShader = {
  uniforms: {
    uIntensity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      vec2 centered = (vUv - vec2(0.5)) * vec2(1.6, 1.0);
      float d = length(centered);
      float glow = smoothstep(0.7, 0.0, d);
      vec3 col = mix(vec3(0.04), vec3(0.14), glow);
      gl_FragColor = vec4(col, glow * 0.42 * uIntensity);
    }
  `,
};

// Subtle Scrolling Perspective Grid Shader
const GridShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      // Scale and scroll grid right-to-left (+x to -x) to match chain
      vec2 gridUv = vUv * vec2(38.0, 22.0) + vec2(uTime * 0.1, 0.0);
      vec2 f = abs(fract(gridUv - 0.5) - 0.5) / fwidth(gridUv);
      float line = 1.0 - min(min(f.x, f.y), 1.0);

      // Smooth radial vignette mask
      float mask = smoothstep(0.5, 0.12, length(vUv - vec2(0.5)));
      float alpha = line * mask * 0.065 * uIntensity;
      gl_FragColor = vec4(vec3(0.85), alpha);
    }
  `,
};

// Volumetric Light Beam Shader
const BeamShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      float fadeY = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
      float fadeX = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
      float pulse = 0.85 + 0.15 * sin(uTime * 0.6);
      float alpha = fadeY * fadeX * 0.055 * uIntensity * pulse;
      gl_FragColor = vec4(vec3(0.95), alpha);
    }
  `,
};

export const Ambience: React.FC = () => {
  const ambienceIntensity = useAppStore((state) => state.ambienceIntensity);

  // Responsive: check screen width (< 768px reduces particles and skips beams)
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const particleCount = isMobile ? 140 : 300;

  // Particle texture
  const circleTexture = useMemo(() => createCircleTexture(), []);

  // Pre-allocate dust particles data
  const { positions, velocities, scales } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const sca = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Spread across deep volume around the chain
      pos[i * 3] = (Math.random() - 0.5) * 44; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2; // Z

      // Slow drift velocities
      vel[i * 3] = -(Math.random() * 0.25 + 0.1); // slow drift left matching chain
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.12; // vertical flutter
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.1; // depth drift

      // Varied sizes: mostly tiny (0.08 - 0.16), few larger foreground ones (0.28)
      sca[i] = Math.random() > 0.9 ? 0.3 : Math.random() * 0.12 + 0.06;
    }
    return { positions: pos, velocities: vel, scales: sca };
  }, [particleCount]);

  const pointsRef = useRef<THREE.Points>(null);
  const pointsGroupRef = useRef<THREE.Group>(null);
  const gridMatRef = useRef<THREE.ShaderMaterial>(null);
  const glowMatRef = useRef<THREE.ShaderMaterial>(null);
  const beamMat1Ref = useRef<THREE.ShaderMaterial>(null);
  const beamMat2Ref = useRef<THREE.ShaderMaterial>(null);

  // Reusable materials
  const glowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...GlowShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const gridMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...GridShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const beamMaterial1 = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...BeamShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const beamMaterial2 = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...BeamShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    const time = state.clock.getElapsedTime();

    // 1. Update shader uniforms
    if (glowMatRef.current) {
      glowMatRef.current.uniforms.uIntensity.value = ambienceIntensity;
    }
    if (gridMatRef.current) {
      gridMatRef.current.uniforms.uIntensity.value = ambienceIntensity;
      if (!reducedMotion) {
        gridMatRef.current.uniforms.uTime.value = time;
      }
    }
    if (!isMobile) {
      if (beamMat1Ref.current) {
        beamMat1Ref.current.uniforms.uIntensity.value = ambienceIntensity;
        if (!reducedMotion) beamMat1Ref.current.uniforms.uTime.value = time;
      }
      if (beamMat2Ref.current) {
        beamMat2Ref.current.uniforms.uIntensity.value = ambienceIntensity;
        if (!reducedMotion) beamMat2Ref.current.uniforms.uTime.value = time + 1.8;
      }
    }

    // 2. Parallax response for dust points (subtler & slower than the camera rig)
    if (pointsGroupRef.current) {
      const targetParallaxX = state.pointer.x * 0.22;
      const targetParallaxY = state.pointer.y * 0.12;
      pointsGroupRef.current.position.x = THREE.MathUtils.damp(
        pointsGroupRef.current.position.x,
        targetParallaxX,
        2.0,
        safeDelta
      );
      pointsGroupRef.current.position.y = THREE.MathUtils.damp(
        pointsGroupRef.current.position.y,
        targetParallaxY,
        2.0,
        safeDelta
      );
    }

    // 3. Update dust particle positions
    if (!reducedMotion && pointsRef.current) {
      const geom = pointsRef.current.geometry;
      const posAttr = geom.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        arr[i3] += velocities[i3] * safeDelta;
        arr[i3 + 1] += velocities[i3 + 1] * safeDelta;
        arr[i3 + 2] += velocities[i3 + 2] * safeDelta;

        // Wrap boundaries
        if (arr[i3] < -22) arr[i3] = 22;
        if (arr[i3 + 1] < -9) arr[i3 + 1] = 9;
        if (arr[i3 + 1] > 9) arr[i3 + 1] = -9;
        if (arr[i3 + 2] < -10) arr[i3 + 2] = 6;
        if (arr[i3 + 2] > 6) arr[i3 + 2] = -10;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group name="AmbienceLayer">
      {/* Exponential Fog matching page --bg #0a0a0a */}
      <fogExp2 attach="fog" args={['#0a0a0a', 0.045]} />

      {/* Layer 3: Soft Background Radial Glow Centered Behind Chain */}
      <mesh position={[0, 0, -8.5]}>
        <planeGeometry args={[44, 26]} />
        <primitive object={glowMaterial} ref={glowMatRef} attach="material" />
      </mesh>

      {/* Layer 4: Data Grid Floor/Wall Scrolling Right-to-Left */}
      <mesh position={[0, 0, -4.8]}>
        <planeGeometry args={[48, 28]} />
        <primitive object={gridMaterial} ref={gridMatRef} attach="material" />
      </mesh>

      {/* Layer 2: Volumetric Light Beams (Desktop only) */}
      {!isMobile && (
        <group position={[0, 0, -3]}>
          {/* Shaft 1: From top-left diagonal */}
          <mesh position={[-6, 4, -1]} rotation={[0, 0, -0.45]}>
            <planeGeometry args={[7, 24]} />
            <primitive object={beamMaterial1} ref={beamMat1Ref} attach="material" />
          </mesh>

          {/* Shaft 2: From top-right diagonal */}
          <mesh position={[7, 5, -2]} rotation={[0, 0, 0.42]}>
            <planeGeometry args={[8, 26]} />
            <primitive object={beamMaterial2} ref={beamMat2Ref} attach="material" />
          </mesh>
        </group>
      )}

      {/* Layer 1: Dust Particles in 3D Volume */}
      <group ref={pointsGroupRef}>
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={particleCount}
              array={scales}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            map={circleTexture}
            size={0.22}
            sizeAttenuation={true}
            transparent={true}
            opacity={0.38 * ambienceIntensity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            color="#ffffff"
          />
        </points>
      </group>
    </group>
  );
};

export default Ambience;

