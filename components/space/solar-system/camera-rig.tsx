"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DURATION } from "@/lib/design/motion";

const HOME = new THREE.Vector3(0, 2.35, 9.6);
/**
 * Mobile gets its own framing, not the desktop one letterboxed. The phone canvas
 * is a short wide band, so the camera moves closer and tilts further over the
 * plane: at the desktop distance the whole system occupied about a third of the
 * band's height and read as a doodle.
 */
const HOME_NEAR = new THREE.Vector3(0, 1.9, 6.2);
/** Where the intro starts: closer and lower, so the pull-back reveals the system. */
const INTRO_START = new THREE.Vector3(0, 0.55, 3.4);
const INTRO_START_NEAR = new THREE.Vector3(0, 0.4, 2.4);

/** Canvas widths below this are treated as the phone band. */
const NARROW = 700;

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

    const narrow = size.width < NARROW;
    const home = narrow ? HOME_NEAR : HOME;
    const from = narrow ? INTRO_START_NEAR : INTRO_START;

    // Intro: ease from the near position out to home on an expo-out curve.
    const t = intro ? Math.min(elapsed / DURATION.intro, 1) : 1;
    const eased = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    target.current.copy(from).lerp(home, eased);

    if (enabled) {
      const drift = clock.elapsedTime * 0.08;
      // Drift is scaled down on the narrow band, where the same swing reads huge.
      const sway = narrow ? 0.3 : 0.55;
      target.current.x += Math.sin(drift) * sway;
      target.current.y += Math.sin(drift * 0.7) * sway * 0.4;

      // Parallax scales with viewport so it feels the same on a laptop and a 4K display.
      const strength = narrow ? 0.25 : 0.9;
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
