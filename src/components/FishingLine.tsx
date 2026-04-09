"use client";

import { useEffect, useRef } from "react";

export function FishingLine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    const W = 160, H = 240;
    canvas.width = W * 2; // retina
    canvas.height = H * 2;
    ctx.scale(2, 2);

    // Rod pivot (handle) — pushed down to give room for upswing
    const pivotX = 50, pivotY = 65;
    const rodLen = 60;

    // Line segments (rope simulation)
    const SEGS = 12;
    const segLen = 10;
    const points: { x: number; y: number; ox: number; oy: number }[] = [];

    // Animation state
    let rodAngle = 0.3; // radians, 0 = horizontal right
    let time = 0;
    const CAST_DURATION = 1.2;
    const SETTLE_DURATION = 2.8;
    const CYCLE = CAST_DURATION + SETTLE_DURATION;

    // Initialize points hanging from rod tip
    function initPoints() {
      const tipX = pivotX + Math.cos(rodAngle) * rodLen;
      const tipY = pivotY - Math.sin(rodAngle) * rodLen;
      for (let i = 0; i <= SEGS; i++) {
        const x = tipX;
        const y = tipY + i * segLen;
        points[i] = { x, y, ox: x, oy: y };
      }
    }
    initPoints();

    function getRodAngle(t: number): number {
      const phase = t % CYCLE;
      if (phase < 0.3) {
        // Wind up — pull back
        return 0.3 + (phase / 0.3) * 0.8;
      } else if (phase < 0.6) {
        // Cast forward — fast whip
        const p = (phase - 0.3) / 0.3;
        return 1.1 - p * 1.5;
      } else if (phase < CAST_DURATION) {
        // Follow through — settle rod
        const p = (phase - 0.6) / 0.6;
        return -0.4 + p * 0.5;
      } else {
        // Idle — gentle bob
        const p = (phase - CAST_DURATION) / SETTLE_DURATION;
        return 0.1 + Math.sin(p * Math.PI * 2) * 0.05;
      }
    }

    function simulate() {
      const tipX = pivotX + Math.cos(rodAngle) * rodLen;
      const tipY = pivotY - Math.sin(rodAngle) * rodLen;

      // Pin first point to rod tip
      points[0].x = tipX;
      points[0].y = tipY;

      // Verlet integration for each segment
      for (let i = 1; i <= SEGS; i++) {
        const p = points[i];
        const vx = (p.x - p.ox) * 0.98; // damping
        const vy = (p.y - p.oy) * 0.98;
        p.ox = p.x;
        p.oy = p.y;
        p.x += vx;
        p.y += vy + 0.25; // gravity
      }

      // Constraint solving — keep segments connected
      for (let iter = 0; iter < 5; iter++) {
        for (let i = 0; i < SEGS; i++) {
          const a = points[i], b = points[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.001) continue;
          const diff = (segLen - dist) / dist * 0.5;
          const ox = dx * diff, oy = dy * diff;
          if (i > 0) { a.x -= ox; a.y -= oy; }
          b.x += ox; b.y += oy;
        }
        // Re-pin first point
        points[0].x = tipX;
        points[0].y = tipY;
      }
    }

    // Get theme colors
    function getColors() {
      const style = getComputedStyle(document.documentElement);
      const rod = style.getPropertyValue("--text-ransom").trim() || "#0d4a44";
      return { rod };
    }

    let animId: number;
    let lastTime = 0;

    function draw(timestamp: number) {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;
      time += dt;

      rodAngle = getRodAngle(time);
      simulate();

      const { rod } = getColors();

      ctx.clearRect(0, 0, W, H);

      // Draw rod
      const tipX = pivotX + Math.cos(rodAngle) * rodLen;
      const tipY = pivotY - Math.sin(rodAngle) * rodLen;

      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(tipX, tipY);
      ctx.strokeStyle = rod;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Handle grip
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = rod;
      ctx.fill();

      // Draw line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i <= SEGS; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = rod;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Bobber — at segment 7
      const bx = points[7].x, by = points[7].y;
      ctx.beginPath();
      ctx.ellipse(bx, by, 4, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(240, 140, 50, 0.7)";
      ctx.fill();
      ctx.strokeStyle = "rgba(200, 100, 30, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // White highlight
      ctx.beginPath();
      ctx.ellipse(bx, by - 2.5, 3, 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fill();

      // Hook — hangs down from end of line
      const hx = points[SEGS].x, hy = points[SEGS].y;
      const hpx = points[SEGS - 1].x, hpy = points[SEGS - 1].y;
      const angle = Math.atan2(hy - hpy, hx - hpx);
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(angle - Math.PI * 0.5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(6, 8, 2, 16);
      ctx.quadraticCurveTo(-2, 14, -1, 10);
      ctx.strokeStyle = "rgba(240, 140, 50, 0.8)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "160px", height: "240px", margin: "32px auto 0", display: "block" }}
      aria-hidden="true"
    />
  );
}
