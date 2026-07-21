"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Star } from "./star";
import { OrbitalBodyMesh, OrbitPath } from "./orbital-body";
import { CosmicDust } from "./cosmic-dust";
import { CameraRig } from "./camera-rig";
import { useAccentColor } from "./use-accent-color";
import { INNER_RADIUS, OUTER_RADIUS, type OrbitalBody } from "./bodies";

interface Props {
  bodies: OrbitalBody[];
  /** Play the camera pull-back. False when the intro was already seen this session. */
  intro: boolean;
  /** False under prefers-reduced-motion: one static frame, no drift, no orbiting. */
  animate: boolean;
}

function SceneContents({ bodies, intro, animate }: Props) {
  const accent = useAccentColor();
  const [hovered, setHovered] = useState<string | null>(null);
  // 1 = full fidelity. PerformanceMonitor walks this down on weak GPUs.
  const [quality, setQuality] = useState(1);

  const dustCount = Math.round(420 * quality);

  return (
    <>
      <PerformanceMonitor
        onDecline={() => setQuality((q) => Math.max(q - 0.35, 0.3))}
        onIncline={() => setQuality((q) => Math.min(q + 0.2, 1))}
      />

      <ambientLight intensity={0.35} />
      <CameraRig intro={intro} enabled={animate} />

      <Star color={accent} quality={quality} />

      <OrbitPath radius={INNER_RADIUS} color={accent} opacity={0.3} />
      <OrbitPath radius={OUTER_RADIUS} color={accent} opacity={0.18} />

      {bodies.map((b) => (
        <OrbitalBodyMesh
          key={b.id}
          body={b}
          color={accent}
          quality={quality}
          hoveredId={hovered}
          onHover={setHovered}
        />
      ))}

      {quality > 0.4 && <CosmicDust color={accent} count={dustCount} />}
    </>
  );
}

export default function SolarSystemScene(props: Props) {
  return (
    <Canvas
      // Decorative. Every entity here also exists as real DOM elsewhere on the page.
      aria-hidden
      tabIndex={-1}
      // Cap DPR at 2: past that the cost is real and the gain is not.
      dpr={[1, 2]}
      // Static frame under reduced motion instead of a paused render loop.
      frameloop={props.animate ? "always" : "demand"}
      camera={{ position: [0, 2.35, 9.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "auto" }}
    >
      <SceneContents {...props} />
    </Canvas>
  );
}
