"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Deterministic PRNG (mulberry32). Seeded rather than Math.random so the dust
 * field is identical on every render: the layout is stable, and generating it
 * stays a pure computation that can live in useMemo.
 */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sparse particle shell around the system. Its only job is parallax: without
 * something at varying depth the orbits read as a flat diagram rather than a
 * space you're looking into.
 */
export function CosmicDust({ color, count }: { color: string; count: number }) {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const rand = mulberry32(0x5eed);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Shell rather than sphere, so dust never sits inside the orbits.
      const r = 6 + rand() * 12;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      // Flattened vertically: a disc reads as a system, a ball reads as noise.
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.35;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame(({ clock }) => {
    if (points.current) points.current.rotation.y = clock.elapsedTime * 0.012;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.055}
        sizeAttenuation
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}
