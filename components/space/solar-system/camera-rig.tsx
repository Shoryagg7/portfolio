"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DURATION } from "@/lib/design/motion";

const HOME = new THREE.Vector3(0, 2.35, 9.6);
/** Where the intro starts: closer and lower, so the pull-back reveals the system. */
const INTRO_START = new THREE.Vector3(0, 0.55, 3.4);

/**
 * Drives the camera: an intro pull-back, then a permanent slow drift with a
 * light mouse parallax on top. Pointer input is read from the window rather
 * than the canvas so it keeps working while the cursor is over the hero text.
 */
export function CameraRig({ intro, enabled }: { intro: boolean; enabled: boolean }) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const start = useRef<number | null>(null);
  const target = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  useFrame(({ clock, size }) => {
    if (start.current === null) start.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - start.current;

    // Intro: ease from INTRO_START out to HOME on an expo-out curve.
    const t = intro ? Math.min(elapsed / DURATION.intro, 1) : 1;
    const eased = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    target.current.copy(INTRO_START).lerp(HOME, eased);

    if (enabled) {
      const drift = clock.elapsedTime * 0.08;
      target.current.x += Math.sin(drift) * 0.55;
      target.current.y += Math.sin(drift * 0.7) * 0.22;

      // Parallax scales with viewport so it feels the same on a laptop and a 4K display.
      const strength = size.width > 768 ? 0.9 : 0.35;
      target.current.x += pointer.current.x * strength;
      target.current.y += -pointer.current.y * strength * 0.5;

      camera.position.lerp(target.current, 0.05);
    } else {
      camera.position.copy(target.current);
    }

    camera.lookAt(0, 0, 0);
  });

  return null;
}
