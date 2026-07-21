"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitalBody } from "./bodies";
import { INNER_RADIUS, OUTER_RADIUS } from "./bodies";
import { ORBIT_PERIOD } from "@/lib/design/motion";

interface Props {
  body: OrbitalBody;
  color: string;
  quality: number;
  /** Any body hovered, so the others can dim. */
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}

export function OrbitalBodyMesh({
  body,
  color,
  quality,
  hoveredId,
  onHover,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const radius = body.ring === "inner" ? INNER_RADIUS : OUTER_RADIUS;
  const period = body.ring === "inner" ? ORBIT_PERIOD.inner : ORBIT_PERIOD.outer;

  const tinted = useMemo(() => {
    const c = new THREE.Color(color);
    return c.lerp(new THREE.Color("#dce4f5"), body.tint);
  }, [color, body.tint]);

  const dimmed = hoveredId !== null && hoveredId !== body.id;

  useFrame(({ clock }) => {
    const angle = body.phase + (clock.elapsedTime / period) * Math.PI * 2;
    if (group.current) {
      group.current.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      );
    }
    if (mesh.current) {
      const target = hovered ? 1.45 : 1;
      mesh.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
      const m = mesh.current.material as THREE.MeshStandardMaterial;
      m.opacity = THREE.MathUtils.lerp(m.opacity, dimmed ? 0.28 : 1, 0.1);
      m.emissiveIntensity = THREE.MathUtils.lerp(
        m.emissiveIntensity,
        hovered ? 1.5 : 0.38,
        0.1,
      );
    }
  });

  const setHover = (v: boolean) => {
    setHovered(v);
    onHover(v ? body.id : null);
    // The canvas is decorative, but a pointer cue still helps sighted users.
    document.body.style.cursor = v ? "pointer" : "";
  };

  return (
    <group ref={group}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[body.size, quality > 0.5 ? 32 : 16, quality > 0.5 ? 32 : 16]} />
        {/*
          Low emissive on purpose. Cranked up, every body renders as a flat disc
          of its own colour; kept low, the star's point light gives each one a lit
          side and a terminator, which is what makes them read as bodies in space.
        */}
        <meshStandardMaterial
          color={tinted}
          emissive={tinted}
          emissiveIntensity={0.38}
          roughness={0.55}
          metalness={0.05}
          transparent
          /*
            Starts fully opaque, not at 0. Under prefers-reduced-motion the canvas
            runs frameloop="demand" and renders a single frame, so an opacity that
            eases up from 0 only ever advances one lerp step and the bodies render
            at ~10%. The wrapper's fade handles the entrance instead.
          */
          opacity={1}
        />
      </mesh>

      {hovered && (
        <Html
          center
          distanceFactor={9}
          position={[0, body.size + 0.28, 0]}
          // Decorative duplicate of content that already exists in the DOM.
          wrapperClass="pointer-events-none"
        >
          <div
            aria-hidden
            className="pointer-events-none -translate-y-1/2 rounded-lg border border-edge-strong bg-deep/90 px-3 py-2 text-center whitespace-nowrap backdrop-blur"
          >
            <p className="font-display text-sm font-medium text-foreground">{body.label}</p>
            <p className="font-mono text-xs text-faint">{body.detail}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

/** Flat ring marking an orbit path. */
export function OrbitPath({
  radius,
  color,
  opacity,
}: {
  radius: number;
  color: string;
  opacity: number;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.006, radius + 0.006, 160]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
