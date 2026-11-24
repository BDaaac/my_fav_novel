"use client";

import React, { useEffect, useRef, useState } from "react";

interface VhsLoaderProps {
  ready?: boolean;
  progress?: number;
  onStartOut?: () => void;
  onDone: () => void;
}

/**
 * Analog CRT Boot / Loading Screen.
 * Bottom-anchored tabular percentage, vertical CRT ticks progress bar,
 * dashed inactive rail, and smooth exponential glide tied to real asset loading.
 */
export function VhsLoader({ ready = false, progress = 0, onStartOut, onDone }: VhsLoaderProps) {
  const [percent, setPercent] = useState(0);
  const [isOut, setIsOut] = useState(false);
  const animRef = useRef(0);
  const readyRef = useRef(ready);
  const progressRef = useRef(progress);
  const onDoneRef = useRef(onDone);
  const onStartOutRef = useRef(onStartOut);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    onStartOutRef.current = onStartOut;
  }, [onStartOut]);

  // Smooth exponential glide: never jumps on frame 1, tracks real texture/font loading up to 94%, then finishes to 100%
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      // Clamp dt to 40ms so hydration stalls never jump 0% -> 75% in one frame
      const dt = Math.min(0.04, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const isReadyNow = readyRef.current;
      const realCap = Math.min(94, 24 + Math.max(0, Math.min(1, progressRef.current)) * 70);
      const target = isReadyNow ? 100 : realCap;

      // Smooth deliberate CRT loading pace (~1.1s total 0 -> 100)
      const rate = isReadyNow ? 4.2 : 3.2;
      animRef.current += (target - animRef.current) * (1 - Math.exp(-rate * dt));

      if (isReadyNow && 100 - animRef.current < 0.6) {
        animRef.current = 100;
      }

      const floorVal = Math.min(100, Math.floor(animRef.current));
      setPercent((prev) => (floorVal > prev ? floorVal : prev));

      if (animRef.current < 100) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Hold 100% briefly, then dissolve while triggering staggered entrance choreography
  useEffect(() => {
    if (percent < 100) return;

    const tOut = window.setTimeout(() => {
      setIsOut(true);
      onStartOutRef.current?.();
    }, 280);

    const tDone = window.setTimeout(() => {
      onDoneRef.current();
    }, 780);

    return () => {
      window.clearTimeout(tOut);
      window.clearTimeout(tDone);
    };
  }, [percent]);

  return (
    <div
      role="status"
      aria-label={`Загрузка, ${percent}%`}
      className={`vhs-loader absolute inset-0 z-[45] flex flex-col justify-end p-7 select-none sm:p-11 md:p-14 ${
        isOut ? "is-out" : ""
      }`}
    >
      {/* Label & tabular counter */}
      <div className="osd-text mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[#ece9e1] sm:text-[13px]">
        <span>ЗАГРУЗКА</span>
        <span className="font-bold tabular-nums">{percent}</span>
      </div>

      {/* Vertical ticks & dashed inactive track */}
      <div className="flex h-3 w-full items-center overflow-hidden sm:h-3.5" aria-hidden="true">
        <div
          className="vhs-loader-ticks h-full shrink-0 transition-[width] duration-75 ease-out"
          style={{ width: `${percent}%` }}
        />
        <div className="vhs-loader-dashes ml-1.5 h-[2px] flex-1 shrink-0 opacity-40" />
      </div>
    </div>
  );
}

interface RevealProps {
  on?: boolean;
  i?: number;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Masked staggered reveal: slides smoothly up from translateY(110%)
 * with cubic-bezier(0.16, 1, 0.3, 1), staggered by 70ms per index.
 */
export function Reveal({
  on = true,
  i = 0,
  inline = false,
  className = "",
  children,
}: RevealProps) {
  return (
    <span className={`${inline ? "rv-inline" : "rv"} ${className}`}>
      <span
        className={`rv-i ${on ? "rv-in" : ""}`}
        style={{ transitionDelay: `${70 * i}ms` }}
      >
        {children}
      </span>
    </span>
  );
}
