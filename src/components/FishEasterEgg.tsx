"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAppState } from "@/lib/store";

interface Fish {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  speed: number;
  targetX: number;
  targetY: number;
  flipX: boolean;
  tailPhase: number;
  eatingTimer: number;
}

interface FoodParticle {
  id: number;
  x: number;
  y: number;
  vy: number;
  opacity: number;
  size: number;
}

let fishIdCounter = 0;
let foodIdCounter = 0;
const MAX_FISH = 20;
const MAX_FOOD = 60;

// Check if a click is far enough from interactive elements
function isOpenWater(e: MouseEvent): boolean {
  const target = e.target as HTMLElement;
  if (!target) return false;

  // Walk up the DOM — if we hit any interactive/content element within 80px, skip
  let el: HTMLElement | null = target;
  while (el) {
    const tag = el.tagName?.toLowerCase();
    if (tag === "button" || tag === "a" || tag === "input" || tag === "textarea" || tag === "label") return false;
    if (el.getAttribute("role") === "link") return false;
    if (el.classList?.contains("bg-white") || el.classList?.contains("rounded-xl")) return false;
    if (tag === "header" || tag === "footer" || tag === "nav") return false;
    el = el.parentElement;
  }
  return true;
}

export function FishEasterEgg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fishRef = useRef<Fish[]>([]);
  const foodRef = useRef<FoodParticle[]>([]);
  const animRef = useRef<number>(0);
  const hadFoodRef = useRef(false);
  const foodGoneTimerRef = useRef(0);
  const pausedRef = useRef(false);
  const wasAtBottomRef = useRef(false);
  const mouseRef = useRef({ x: -1, y: -1 });
  const pathname = usePathname();
  const { hasSearched } = useAppState();
  // "Home landing" = root path before any search; after searching it's the explore/generate page
  const isHomeLanding = pathname === "/" && !hasSearched;

  // Clear fish on page navigation, spawn one on home landing
  useEffect(() => {
    fishRef.current = [];
    foodRef.current = [];
    wasAtBottomRef.current = false;
  }, [pathname]);

  // Spawn one fish on home landing so there's always something swimming
  useEffect(() => {
    if (!isHomeLanding) return;
    if (fishRef.current.length > 0) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bottomThird = vh * 0.67;
    fishRef.current.push({
      id: ++fishIdCounter,
      x: vw * 0.3 + Math.random() * vw * 0.4,
      y: bottomThird + Math.random() * (vh * 0.2),
      vx: 0,
      vy: 0,
      size: 18 + Math.random() * 6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.4,
      targetX: vw * 0.2 + Math.random() * vw * 0.6,
      targetY: bottomThird + Math.random() * (vh * 0.25),
      flipX: Math.random() > 0.5,
      tailPhase: Math.random() * Math.PI * 2,
      eatingTimer: 0,
    });
  }, [isHomeLanding]);

  // Pause listener
  useEffect(() => {
    const handlePause = (e: Event) => { pausedRef.current = (e as CustomEvent).detail; };
    window.addEventListener("animationPauseToggle", handlePause);
    return () => window.removeEventListener("animationPauseToggle", handlePause);
  }, []);

  // Track mouse position for fish curiosity
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const addFish = useCallback(() => {
    if (fishRef.current.length >= MAX_FISH) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bottomThird = vh * 0.67;
    const startLeft = Math.random() > 0.5;

    fishRef.current.push({
      id: ++fishIdCounter,
      x: startLeft ? -40 : vw + 40,
      y: bottomThird + Math.random() * (vh * 0.28),
      vx: 0,
      vy: 0,
      size: 16 + Math.random() * 8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.65,
      targetX: vw * 0.2 + Math.random() * vw * 0.6,
      targetY: bottomThird + Math.random() * (vh * 0.25),
      flipX: !startLeft,
      tailPhase: Math.random() * Math.PI * 2,
      eatingTimer: 0,
    });
  }, []);

  const sprinkleFood = useCallback((x: number, y: number) => {
    if (foodRef.current.length >= MAX_FOOD) return;
    for (let i = 0; i < 5; i++) {
      foodRef.current.push({
        id: ++foodIdCounter,
        x: x + (Math.random() - 0.5) * 30,
        y: y - 10 + Math.random() * 5,
        vy: 0.3 + Math.random() * 0.5,
        opacity: 1,
        size: 2 + Math.random() * 2,
      });
    }
  }, []);

  // Scroll-to-bottom detection (all pages except home landing)
  useEffect(() => {
    if (isHomeLanding) return;

    const poll = setInterval(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.body.scrollHeight || 0,
        document.documentElement.scrollHeight || 0,
        document.body.offsetHeight || 0,
        document.documentElement.offsetHeight || 0
      );
      const winHeight = window.innerHeight || 0;
      const atBottom = (scrollTop + winHeight) >= (docHeight - 100);

      if (atBottom && !wasAtBottomRef.current) {
        wasAtBottomRef.current = true;
        addFish();
      } else if (!atBottom) {
        wasAtBottomRef.current = false;
      }
    }, 500);

    return () => clearInterval(poll);
  }, [addFish, isHomeLanding, pathname]);

  // Home landing only: click in open water to spawn fish
  // Must be >80px from any existing fish (otherwise the feed handler handles it)
  useEffect(() => {
    if (!isHomeLanding) return;

    const handleClick = (e: MouseEvent) => {
      if (!isOpenWater(e)) return;

      // Check if click is near an existing fish — if so, don't spawn (feed handler will fire)
      for (const fish of fishRef.current) {
        const dx = e.clientX - fish.x;
        const dy = e.clientY - fish.y;
        if (Math.sqrt(dx * dx + dy * dy) < 80) return;
      }

      addFish();
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [isHomeLanding, addFish]);

  // Click on fish to feed (all pages)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (fishRef.current.length === 0) return;
      const vh = window.innerHeight;
      if (e.clientY < vh * 0.67) return;

      for (const fish of fishRef.current) {
        const dx = e.clientX - fish.x;
        const dy = e.clientY - fish.y;
        if (Math.sqrt(dx * dx + dy * dy) < 50) {
          sprinkleFood(e.clientX, e.clientY);
          fish.targetX = e.clientX;
          fish.targetY = e.clientY;
          return;
        }
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [sprinkleFood]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function drawFish(ctx: CanvasRenderingContext2D, fish: Fish) {
      const { x, y, size, tailPhase, flipX, eatingTimer } = fish;
      ctx.save();
      ctx.translate(x, y);
      if (flipX) ctx.scale(-1, 1);

      const tailWag = Math.sin(tailPhase) * 4;

      // Body — when eating, cut a wedge out at the mouth so background shows through
      const eating = eatingTimer > 0;
      const chewSpeed = 0.15 + (fish.phase % 1) * 0.12; // varies per fish, all gentler
      const chew = eating ? Math.abs(Math.sin(eatingTimer * chewSpeed)) * 0.8 + 0.2 : 0;
      const halfOpen = chew * 0.35; // radians — max ~0.28 rad wedge on each side

      ctx.beginPath();
      if (eating && halfOpen > 0.01) {
        // Pac-man body: ellipse with a wedge gap at the front
        // Trace from top-lip angle all the way around to bottom-lip angle
        ctx.ellipse(0, 0, size, size * 0.4, 0, halfOpen, Math.PI * 2 - halfOpen);
        // Draw jaw lines back to a hinge point inside the mouth
        const hingeX = size * 0.55;
        ctx.lineTo(hingeX, 0);
        ctx.closePath();
      } else {
        ctx.ellipse(0, 0, size, size * 0.4, 0, 0, Math.PI * 2);
      }
      ctx.fillStyle = "rgba(240, 140, 50, 0.7)";
      ctx.fill();
      ctx.strokeStyle = "rgba(200, 100, 30, 0.8)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Tail fill
      ctx.beginPath();
      ctx.moveTo(-size * 0.7, 0);
      ctx.quadraticCurveTo(-size * 1.1, -size * 0.1 + tailWag * 0.5, -size * 1.35, -size * 0.3 + tailWag);
      ctx.quadraticCurveTo(-size * 1.2, tailWag * 0.3, -size * 1.35, size * 0.3 + tailWag);
      ctx.quadraticCurveTo(-size * 1.1, size * 0.1 + tailWag * 0.5, -size * 0.7, 0);
      ctx.fillStyle = "rgba(240, 150, 60, 0.5)";
      ctx.fill();
      ctx.strokeStyle = "rgba(220, 120, 40, 0.8)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Dorsal fin — pointy with ridges, waves and warps like the tail
      const finBase = tailPhase * 0.8;
      const finW1 = Math.sin(finBase) * 2;
      const finW2 = Math.sin(finBase + 0.8) * 1.5;
      const finW3 = Math.sin(finBase + 1.6) * 1;

      // Outer edge with ridged points — wider base, taller peaks
      ctx.beginPath();
      ctx.moveTo(-size * 0.35, -size * 0.35);
      ctx.quadraticCurveTo(-size * 0.25, -size * 0.75 + finW1, -size * 0.1, -size * 0.62 + finW1 * 0.5);
      ctx.quadraticCurveTo(size * 0.02, -size * 0.92 + finW2, size * 0.15, -size * 0.65 + finW2 * 0.6);
      ctx.quadraticCurveTo(size * 0.25, -size * 0.72 + finW3, size * 0.4, -size * 0.35);
      ctx.quadraticCurveTo(size * 0.05, -size * 0.4, -size * 0.35, -size * 0.35);

      ctx.fillStyle = "rgba(240, 150, 60, 0.35)";
      ctx.fill();
      ctx.strokeStyle = "rgba(220, 120, 40, 0.7)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Fin ridge lines — internal structure that warps
      ctx.beginPath();
      ctx.moveTo(-size * 0.15, -size * 0.38);
      ctx.quadraticCurveTo(-size * 0.08, -size * 0.65 + finW1 * 0.7, size * 0.0, -size * 0.82 + finW2 * 0.5);
      ctx.strokeStyle = "rgba(210, 110, 35, 0.3)";
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size * 0.1, -size * 0.37);
      ctx.quadraticCurveTo(size * 0.15, -size * 0.6 + finW2 * 0.6, size * 0.22, -size * 0.65 + finW3 * 0.5);
      ctx.stroke();

      // Eye — closer to the snoot
      ctx.beginPath();
      ctx.arc(size * 0.55, -size * 0.06, size * 0.11, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(30, 20, 15, 0.9)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.57, -size * 0.09, size * 0.045, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fill();

      // Smile line (only when mouth is closed)
      if (!eating) {
        ctx.beginPath();
        ctx.arc(size * 0.6, size * 0.02, size * 0.15, 0.1, Math.PI * 0.5);
        ctx.strokeStyle = "rgba(180, 90, 25, 0.5)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawFood(ctx: CanvasRenderingContext2D, food: FoodParticle) {
      ctx.beginPath();
      ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 130, 50, ${food.opacity * 0.7})`;
      ctx.fill();
    }

    function loop() {
      if (!canvas) return;
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      if (!pausedRef.current) {
        const vh = canvas.height;
        const mouse = mouseRef.current;

        for (const fish of fishRef.current) {
          // Sense nearby food — steer toward the closest particle
          let attracted = false;
          if (foodRef.current.length > 0) {
            let closestFood: FoodParticle | null = null;
            let closestDist = 200; // sensing range
            for (const f of foodRef.current) {
              const fdx = f.x - fish.x;
              const fdy = f.y - fish.y;
              const fd = Math.sqrt(fdx * fdx + fdy * fdy);
              if (fd < closestDist) {
                closestDist = fd;
                closestFood = f;
              }
            }
            if (closestFood) {
              fish.targetX = closestFood.x;
              fish.targetY = closestFood.y;
              attracted = true;
            }
          }

          // Check if mouse is nearby (within 120px) — fish gets curious
          if (!attracted && mouse.x >= 0 && mouse.y >= vh * 0.5) {
            const dmx = mouse.x - fish.x;
            const dmy = mouse.y - fish.y;
            const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
            if (mouseDist < 80 && mouseDist > 20) {
              // Gently steer toward cursor
              fish.targetX = mouse.x;
              fish.targetY = Math.max(vh * 0.67, mouse.y);
              attracted = true;
            }
          }

          // Normal target steering
          const dx = fish.targetX - fish.x;
          const dy = fish.targetY - fish.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 30 && !attracted) {
            fish.targetX = Math.random() * canvas.width;
            fish.targetY = vh * 0.67 + Math.random() * (vh * 0.28);
          }

          const steerStrength = attracted ? 0.05 : 0.03;
          fish.vx += (dx / (dist + 1)) * fish.speed * steerStrength;
          fish.vy += (dy / (dist + 1)) * fish.speed * steerStrength;
          fish.vx *= 0.98;
          fish.vy *= 0.98;

          fish.phase += 0.02 + fish.speed * 0.01;
          fish.vy += Math.sin(fish.phase) * 0.02;

          fish.x += fish.vx;
          fish.y += fish.vy;

          fish.y = Math.max(vh * 0.67, Math.min(vh - 20, fish.y));
          if (fish.x < -60) fish.x = canvas.width + 40;
          if (fish.x > canvas.width + 60) fish.x = -40;

          fish.flipX = fish.vx < 0;
          fish.tailPhase += 0.08 + Math.abs(fish.vx) * 0.1;
          if (fish.eatingTimer > 0) fish.eatingTimer--;

          // Trigger water ripple at fish position
          const waterRipple = (window as any).__waterAddRipple;
          if (waterRipple && Math.abs(fish.vx) > 0.3) {
            waterRipple(fish.x, fish.y, 8 + Math.abs(fish.vx) * 5, 1);
          }
        }

        foodRef.current = foodRef.current.filter((f) => {
          f.y += f.vy;
          f.vy += 0.01;
          f.opacity -= 0.003;
          for (const fish of fishRef.current) {
            const fdx = f.x - fish.x;
            const fdy = f.y - fish.y;
            if (Math.sqrt(fdx * fdx + fdy * fdy) < fish.size) {
              f.opacity = 0;
              fish.eatingTimer = 25;
            }
          }
          return f.opacity > 0 && f.y < vh;
        });

        // Track food state — when food runs out, start a timer then disperse fish
        const hasFood = foodRef.current.length > 0;
        if (hasFood) {
          hadFoodRef.current = true;
          foodGoneTimerRef.current = 0;
        } else if (hadFoodRef.current) {
          foodGoneTimerRef.current++;
          // ~1.5 seconds at 60fps = 90 frames
          if (foodGoneTimerRef.current >= 90) {
            hadFoodRef.current = false;
            foodGoneTimerRef.current = 0;
            // Scatter all fish to different random positions
            for (const fish of fishRef.current) {
              fish.targetX = Math.random() * canvas.width;
              fish.targetY = vh * 0.67 + Math.random() * (vh * 0.28);
            }
          }
        }
      }

      for (const fish of fishRef.current) drawFish(ctx!, fish);
      for (const food of foodRef.current) drawFood(ctx!, food);

      animRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [pathname]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
      aria-hidden="true"
    />
  );
}
