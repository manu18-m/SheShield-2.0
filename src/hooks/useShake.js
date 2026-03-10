// src/hooks/useShake.js
// Detects phone shake to trigger SOS (works on mobile browsers)

import { useEffect, useRef } from "react";

export function useShake(onShake, { threshold = 28, cooldownMs = 4000, enabled = true } = {}) {
  const lastPos    = useRef({ x: 0, y: 0, z: 0 });
  const lastFired  = useRef(0);
  const onShakeRef = useRef(onShake);

  useEffect(() => { onShakeRef.current = onShake; }, [onShake]);

  useEffect(() => {
    if (!enabled) return;

    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const { x = 0, y = 0, z = 0 } = acc;
      const prev  = lastPos.current;
      const delta = Math.abs(x - prev.x) + Math.abs(y - prev.y) + Math.abs(z - prev.z);

      if (delta > threshold) {
        const now = Date.now();
        if (now - lastFired.current > cooldownMs) {
          lastFired.current = now;
          onShakeRef.current?.();
        }
      }
      lastPos.current = { x, y, z };
    };

    // iOS 13+ needs permission
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      window.__requestShakePermission = async () => {
        try {
          const result = await DeviceMotionEvent.requestPermission();
          if (result === "granted") window.addEventListener("devicemotion", handleMotion);
        } catch (err) {
          console.warn("Shake permission denied:", err);
        }
      };
    } else {
      window.addEventListener("devicemotion", handleMotion);
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      delete window.__requestShakePermission;
    };
  }, [enabled, threshold, cooldownMs]);
}