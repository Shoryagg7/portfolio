"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Radial falloff sprite for the corona. White with an alpha ramp so the sprite's
 * `color` prop does the tinting. The ramp is smooth from the centre out: a flat
 * inner stop makes the glow render as a hard disc rather than a light source.
 */
function coronaTexture(): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.08, "rgba(255,255,255,0.55)");
  g.addColorStop(0.25, "rgba(255,255,255,0.18)");
  g.addColorStop(0.55, "rgba(255,255,255,0.04)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Star({ color, quality }: { color: string; quality: number }) {
  const corona = useRef<THREE.Sprite>(null);
  const core = useRef<THREE.Mesh>(null);

  const tex = useMemo(() => coronaTexture(), []);
  const c = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    // Slow asymmetric breathing so the star never looks like a static decal.
    const t = clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 0.6) * 0.04 + Math.sin(t * 1.37) * 0.02;
    if (corona.current) corona.current.scale.setScalar(1.9 * pulse);
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 0.9) * 0.015);
  });

  return (
    <group>
      <mesh ref={core}>
        <sphereGeometry args={[0.26, quality > 0.5 ? 48 : 24, quality > 0.5 ? 48 : 24]} />
        <meshBasicMaterial color={c} toneMapped={false} />
      </mesh>

      <sprite ref={corona} scale={1.9}>
        <spriteMaterial
          map={tex}
          color={c}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* Wide, faint halo. Sells the light source without washing out the text. */}
      <sprite scale={9}>
        <spriteMaterial
          map={tex}
          color={c}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      <pointLight color={c} intensity={14} distance={22} decay={1.5} />
    </group>
  );
}
