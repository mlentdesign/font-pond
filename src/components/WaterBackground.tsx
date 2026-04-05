"use client";

import { useEffect, useRef, useState } from "react";

// Simple 2D water ripple simulation using a grid
// Based on the classic Hugo Elias water algorithm
export function WaterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const animRef = useRef<number>(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    setMounted(true);

    const handlePause = (e: Event) => {
      pausedRef.current = (e as CustomEvent).detail;
    };
    window.addEventListener("animationPauseToggle", handlePause);
    return () => window.removeEventListener("animationPauseToggle", handlePause);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use lower resolution for performance
    const SCALE = 4;
    let width = Math.floor(window.innerWidth / SCALE);
    let height = Math.floor(window.innerHeight / SCALE);

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    // Two buffers for the ripple simulation
    let buf1 = new Float32Array(width * height);
    let buf2 = new Float32Array(width * height);

    const DAMPING = 0.985;
    const EDGE_MARGIN = 16; // absorption zone width in grid cells

    // Add a ripple at a position — variable radius for organic feel
    // Energy fades to zero inside the EDGE_MARGIN absorption zone
    function addRipple(x: number, y: number, strength: number = 200, radius: number = 3) {
      const rx = Math.floor(x / SCALE);
      const ry = Math.floor(y / SCALE);
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const px = rx + dx;
          const py = ry + dy;
          if (px >= 1 && px < width - 1 && py >= 1 && py < height - 1) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
              // Fade strength near edges
              const edgeDist = Math.min(px, py, width - 1 - px, height - 1 - py);
              const edgeFade = Math.min(1, edgeDist / EDGE_MARGIN);
              buf1[py * width + px] += strength * (1 - dist / radius) * edgeFade;
            }
          }
        }
      }
    }

    // Expose addRipple globally so fish can trigger water ripples
    (window as any).__waterAddRipple = addRipple;

    // Short directional wave — a line of connected ripples
    function addWave(startX: number, startY: number, angle: number, length: number, strength: number) {
      for (let i = 0; i < length; i++) {
        const x = startX + Math.cos(angle) * i * SCALE * 3;
        const y = startY + Math.sin(angle) * i * SCALE * 3;
        const wobble = Math.sin(i * 0.5) * strength * 0.3;
        addRipple(x, y, strength * 0.4 + wobble, 2);
      }
    }

    // Ocean wave front — organic, with gaps, bunching, and strength variation
    function addOceanWave(yCenter: number, strength: number, waviness: number) {
      const steps = Math.floor(width / 2);
      // Random seed for this wave's character
      const wavePhase = Math.random() * Math.PI * 2;
      const gapFreq = 0.08 + Math.random() * 0.12; // how often gaps appear
      const bunchFreq = 0.04 + Math.random() * 0.06; // bunching frequency
      const startOffset = Math.floor(Math.random() * steps * 0.3); // don't always start at edge
      const endOffset = steps - Math.floor(Math.random() * steps * 0.3);

      for (let i = startOffset; i < endOffset; i++) {
        // Skip some points for gaps — waves break and reform
        const gapNoise = Math.sin(i * gapFreq + wavePhase) + Math.sin(i * gapFreq * 2.3 + wavePhase * 1.7);
        if (gapNoise < -0.8) continue; // gap in the wave

        const x = (i / steps) * width;
        // Multiple sine frequencies for organic waviness
        const yOff = Math.sin(i * 0.25 + wavePhase) * waviness
                   + Math.sin(i * 0.11 + wavePhase * 0.7) * waviness * 0.6
                   + Math.sin(i * 0.47 + wavePhase * 1.3) * waviness * 0.3;
        const px = Math.floor(x);
        const py = Math.floor(yCenter / SCALE + yOff);
        if (py >= 1 && py < height - 1 && px >= 1 && px < width - 1) {
          // Fade strength near edges
          const edgeDist = Math.min(px, py, width - 1 - px, height - 1 - py);
          const edgeFade = Math.min(1, edgeDist / EDGE_MARGIN);
          // Strength varies along the wave — bunching effect
          const bunchMod = 0.5 + (Math.sin(i * bunchFreq + wavePhase) + 1) * 0.4;
          const localStr = strength * bunchMod * edgeFade;
          buf1[py * width + px] += localStr;
          if (py + 1 < height - 1) buf1[(py + 1) * width + px] += localStr * 0.5;
          if (py - 1 >= 1) buf1[(py - 1) * width + px] += localStr * 0.3;
          // Occasional extra thickness for cresting
          if (bunchMod > 0.8 && py + 2 < height - 1) {
            buf1[(py + 2) * width + px] += localStr * 0.2;
          }
        }
      }
    }

    // Diagonal swell — organic with varying strength
    function addDiagonalSwell(phase: number, strength: number) {
      const swellAngle = 0.03 + Math.random() * 0.04; // slightly different each time
      const startX = Math.floor(Math.random() * width * 0.2);
      const endX = width - Math.floor(Math.random() * width * 0.2);
      for (let x = startX; x < endX; x++) {
        // Skip randomly for organic feel
        if (Math.random() < 0.05) continue;
        const y = Math.floor(height * 0.3
          + Math.sin(x * swellAngle + phase) * (height * 0.15)
          + Math.sin(x * swellAngle * 2.7 + phase * 0.6) * (height * 0.05));
        const localStr = strength * (0.6 + Math.sin(x * 0.03 + phase) * 0.4);
        if (y >= 1 && y < height - 1 && x >= 1 && x < width - 1) {
          const edgeDist = Math.min(x, y, width - 1 - x, height - 1 - y);
          const edgeFade = Math.min(1, edgeDist / EDGE_MARGIN);
          buf1[y * width + x] += localStr * edgeFade;
          if (y + 1 < height - 1) buf1[(y + 1) * width + x] += localStr * 0.5 * edgeFade;
        }
      }
    }

    // Detect theme
    function isDark() {
      return document.documentElement.getAttribute("data-theme") === "dark";
    }

    // Track pending timeouts so we can clean them up on unmount
    const pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

    // Organic ambient activity — heavily weighted toward ocean waves
    let ambientTimer = 0;
    function addAmbientActivity() {
      if (pausedRef.current) return;
      const roll = Math.random();
      if (roll < 0.35) {
        // Full-width ocean wave at a random height
        const yCenter = (0.15 + Math.random() * 0.7) * height * SCALE;
        addOceanWave(yCenter, 4 + Math.random() * 4, 1 + Math.random() * 2);
      } else if (roll < 0.55) {
        // Diagonal swell
        addDiagonalSwell(Math.random() * Math.PI * 2, 3 + Math.random() * 3);
      } else if (roll < 0.7) {
        // Directional wave — like a current
        const x = Math.random() * width * SCALE;
        const y = Math.random() * height * SCALE;
        const angle = -0.3 + Math.random() * 0.6; // mostly horizontal
        addWave(x, y, angle, 6 + Math.floor(Math.random() * 8), 25 + Math.random() * 30);
      } else if (roll < 0.85) {
        // Small gentle ripple — occasional point disturbance
        const x = Math.random() * width * SCALE;
        const y = Math.random() * height * SCALE;
        addRipple(x, y, 30 + Math.random() * 40, 2);
      } else {
        // Larger swell — broad area disturbance
        const x = Math.random() * width * SCALE;
        const y = Math.random() * height * SCALE;
        addRipple(x, y, 60 + Math.random() * 40, 4 + Math.floor(Math.random() * 2));
      }
    }

    // Mouse interaction
    let mouseX = -1;
    let mouseY = -1;
    let mouseDown = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (!pausedRef.current) {
        addRipple(mouseX, mouseY, 40, 2);
      }
    };

    const handleMouseDown = () => { mouseDown = true; };
    const handleMouseUp = () => { mouseDown = false; };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.touches[0].clientX - rect.left;
        mouseY = e.touches[0].clientY - rect.top;
        if (!pausedRef.current) {
          addRipple(mouseX, mouseY, 50, 2);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);

    const handleResize = () => {
      width = Math.floor(window.innerWidth / SCALE);
      height = Math.floor(window.innerHeight / SCALE);
      canvas.width = width;
      canvas.height = height;
      buf1 = new Float32Array(width * height);
      buf2 = new Float32Array(width * height);
      imageData = ctx.createImageData(width, height);
    };
    window.addEventListener("resize", handleResize);

    function simulate() {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const i = y * width + x;
          // Classic heightfield propagation — smooth and stable
          buf2[i] = (
            buf1[i - 1] +
            buf1[i + 1] +
            buf1[i - width] +
            buf1[i + width]
          ) / 2 - buf2[i];
          buf2[i] *= DAMPING;
        }
      }
      const temp = buf1;
      buf1 = buf2;
      buf2 = temp;

      // Absorbing boundary — cubic fade for aggressive damping near edges
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const edgeDist = Math.min(x, y, width - 1 - x, height - 1 - y);
          if (edgeDist < EDGE_MARGIN) {
            const t = edgeDist / EDGE_MARGIN;
            const fade = t * t * t; // cubic — very aggressive near edges
            const i = y * width + x;
            buf1[i] *= fade;
            buf2[i] *= fade;
          }
        }
      }
    }

    // Pre-allocate imageData once — reuse every frame to avoid ~30MB/s garbage
    let imageData = ctx.createImageData(width, height);

    function render() {
      const dark = isDark();
      const data = imageData.data;
      // Zero out the pixel buffer for reuse
      data.fill(0);

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          // Skip rendering in edge zone — prevents caustic/gradient artifacts
          const edgeDist = Math.min(x, y, width - 1 - x, height - 1 - y);
          if (edgeDist < EDGE_MARGIN) continue;

          const i = y * width + x;
          const val = buf1[i];

          // Primary: smooth wave height (the original effect)
          const intensity = Math.max(-1, Math.min(1, val / 100));
          const absI = Math.abs(intensity);

          // Enhancement: subtle caustic from curvature (gentle layer on top)
          const laplacian = buf1[i - 1] + buf1[i + 1] + buf1[i - width] + buf1[i + width] - 4 * val;
          const caustic = Math.max(0, laplacian * 0.08); // gentle — not dominant

          // Enhancement: soft specular from surface gradient
          const dx = buf1[i + 1] - buf1[i - 1];
          const dy = buf1[i + width] - buf1[i - width];
          const specular = Math.max(0, (-dx * 0.6 + -dy * 0.6)) * 0.008; // very soft

          const pi = (y * width + x) * 4;

          if (dark) {
            // Base: smooth teal from wave height (dominant)
            const baseR = 15 + intensity * 15;
            const baseG = 90 + intensity * 25;
            const baseB = 85 + intensity * 22;
            const baseA = absI * 40;

            // Add subtle caustic shimmer + specular glint
            const enhance = caustic * 3 + specular * 5;

            data[pi]     = Math.min(255, Math.floor(baseR + enhance * 0.3));
            data[pi + 1] = Math.min(255, Math.floor(baseG + enhance * 0.8));
            data[pi + 2] = Math.min(255, Math.floor(baseB + enhance * 0.7));
            data[pi + 3] = absI > 0.006 || enhance > 0.1
              ? Math.min(255, Math.floor(baseA + enhance * 15))
              : 0;
          } else {
            // Base: saturated teal from wave height (dominant)
            const baseR = 0 + intensity * 10;
            const baseG = 145 + intensity * 30;
            const baseB = 125 + intensity * 26;
            const baseA = absI * 32;

            // Add subtle caustic shimmer + specular glint
            const enhance = caustic * 2.5 + specular * 4;

            data[pi]     = Math.min(255, Math.floor(baseR + enhance * 0.2));
            data[pi + 1] = Math.min(255, Math.floor(baseG + enhance * 0.6));
            data[pi + 2] = Math.min(255, Math.floor(baseB + enhance * 0.5));
            data[pi + 3] = absI > 0.006 || enhance > 0.1
              ? Math.min(255, Math.floor(baseA + enhance * 12))
              : 0;
          }
        }
      }

      ctx!.putImageData(imageData, 0, 0);
    }

    function loop() {
      if (!pausedRef.current) {
        ambientTimer++;

        // ── CONTINUOUS OCEAN SWELLS — irregular timing for realism ──

        // Primary swell: varies timing with a sine-modulated interval
        const primaryInterval = 25 + Math.floor(Math.sin(ambientTimer * 0.001) * 10);
        if (ambientTimer % primaryInterval === 0) {
          const yPos = ((ambientTimer * 0.3 + Math.sin(ambientTimer * 0.002) * height * 0.1) % (height * SCALE * 1.3));
          addOceanWave(yPos, 4 + Math.random() * 3, 1 + Math.random() * 1.5);
        }

        // Secondary swell: different rhythm
        const secondaryInterval = 35 + Math.floor(Math.cos(ambientTimer * 0.0015) * 12);
        if (ambientTimer % secondaryInterval === 0) {
          const yPos2 = height * SCALE - ((ambientTimer * 0.2 + Math.cos(ambientTimer * 0.003) * height * 0.08) % (height * SCALE * 1.2));
          addOceanWave(yPos2, 3 + Math.random() * 3, 0.8 + Math.random() * 1.2);
        }

        // Diagonal swell: occasional, unpredictable
        if (ambientTimer % (45 + Math.floor(Math.random() * 20)) === 0) {
          addDiagonalSwell(ambientTimer * 0.005 + Math.random() * 2, 2 + Math.random() * 2);
        }

        // Wave sets — sometimes 2-3 waves come close together, then a pause (like real ocean)
        if (ambientTimer % 120 === 0) {
          const setY = (0.2 + Math.random() * 0.6) * height * SCALE;
          for (let w = 0; w < 2 + Math.floor(Math.random() * 2); w++) {
            const tid = setTimeout(() => {
              if (pausedRef.current) return;
              addOceanWave(setY + w * SCALE * 8, 5 + Math.random() * 2, 1 + Math.random());
            }, w * 400);
            pendingTimeouts.push(tid);
          }
        }

        // ── AMBIENT ACTIVITY — mix of waves and occasional ripples ──
        if (ambientTimer % 12 === 0) addAmbientActivity();

        // Gentle surface current — horizontal drift
        if (ambientTimer % 6 === 0) {
          const cx = ((ambientTimer * 1.2) % (width * SCALE));
          const cy = (Math.sin(ambientTimer * 0.004) * 0.3 + 0.5) * height * SCALE;
          addRipple(cx, cy, 6, 1);
        }

        // Edge waves — water lapping at the sides
        if (ambientTimer % 35 === 0) {
          const side = Math.random() > 0.5;
          const edgeX = side ? width * SCALE * 0.02 : width * SCALE * 0.98;
          const edgeY = Math.random() * height * SCALE;
          const angle = side ? 0 : Math.PI;
          addWave(edgeX, edgeY, angle, 5, 25);
        }
        if (mouseDown && mouseX >= 0) addRipple(mouseX, mouseY, 80, 3);

        simulate();
        render();
      }
      animRef.current = requestAnimationFrame(loop);
    }

    // Start with a few initial activities for immediate life
    for (let i = 0; i < 6; i++) {
      pendingTimeouts.push(setTimeout(() => addAmbientActivity(), i * 400));
    }

    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      for (const tid of pendingTimeouts) clearTimeout(tid);
      pendingTimeouts.length = 0;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        imageRendering: "auto",
      }}
      aria-hidden="true"
    />
  );
}
