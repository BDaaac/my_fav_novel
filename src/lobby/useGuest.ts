"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { HOTSPOTS, WORLD_W, type Hotspot } from "./world";

export const VIEW_W = 1200;
export const VIEW_H = 600;
const SPEED = 330; // px/с в координатах мира
const MIN_X = 70;
const MAX_X = WORLD_W - 70;

export function hotspotAt(x: number): Hotspot | null {
  let best: Hotspot | null = null;
  for (const h of HOTSPOTS) {
    if (Math.abs(x - h.x) <= h.w / 2 && (!best || h.w < best.w)) best = h;
  }
  return best;
}

export function cameraFor(x: number) {
  return Math.max(0, Math.min(WORLD_W - VIEW_W, x - VIEW_W / 2));
}

/**
 * Гость: позиция, направление, пройденный путь (для анимации шага).
 * ←/→ или A/D — идти, клик — идти к точке (и осмотреть объект, если кликнули по нему), E/Enter/↑ — осмотреть.
 */
export function useGuest(opts: { paused: boolean; onInteract: (h: Hotspot) => void; startX?: number }) {
  const [x, setX] = useState(opts.startX ?? 160);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [dist, setDist] = useState(0);
  const [walking, setWalking] = useState(false);

  const xRef = useRef(x);
  const keys = useRef({ left: false, right: false });
  const target = useRef<{ x: number; then?: Hotspot } | null>(null);
  const paused = useRef(opts.paused);
  const onInteract = useRef(opts.onInteract);
  paused.current = opts.paused;
  onInteract.current = opts.onInteract;

  const interact = useCallback(() => {
    const h = hotspotAt(xRef.current);
    if (h) onInteract.current(h);
  }, []);

  const walkTo = useCallback((wx: number) => {
    const h = hotspotAt(wx);
    const tx = Math.max(MIN_X, Math.min(MAX_X, h ? h.x : wx));
    target.current = { x: tx, then: h ?? undefined };
  }, []);

  const teleport = useCallback((wx: number) => {
    xRef.current = wx;
    target.current = null;
    setX(wx);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a" || k === "ф") keys.current.left = true;
      else if (k === "arrowright" || k === "d" || k === "в") keys.current.right = true;
      else if ((k === "e" || k === "у" || k === "enter" || k === "arrowup") && !paused.current) {
        e.preventDefault();
        interact();
        return;
      } else return;
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a" || k === "ф") keys.current.left = false;
      if (k === "arrowright" || k === "d" || k === "в") keys.current.right = false;
    };
    const blur = () => (keys.current = { left: false, right: false });
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [interact]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let wasWalking = false;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      let dir = 0;
      if (!paused.current) {
        dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
        if (dir !== 0) target.current = null;
        else if (target.current) {
          const d = target.current.x - xRef.current;
          if (Math.abs(d) < 5) {
            const then = target.current.then;
            target.current = null;
            if (then) onInteract.current(then);
          } else dir = Math.sign(d);
        }
      }
      if (dir !== 0) {
        const nx = Math.max(MIN_X, Math.min(MAX_X, xRef.current + dir * SPEED * dt));
        const moved = Math.abs(nx - xRef.current);
        xRef.current = nx;
        setX(nx);
        setFacing(dir > 0 ? 1 : -1);
        setDist((v) => v + moved);
        if (moved === 0) target.current = null;
      }
      const isWalking = dir !== 0;
      if (isWalking !== wasWalking) {
        wasWalking = isWalking;
        setWalking(isWalking);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return { x, facing, dist, walking, cam: cameraFor(x), near: hotspotAt(x), walkTo, interact, teleport };
}
