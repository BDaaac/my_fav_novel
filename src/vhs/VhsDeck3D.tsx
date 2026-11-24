"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Book } from "@/shelf/Shelf";
import { vhsAudio } from "./audio";
import { createSlipcaseTexture, createSpineTexture, getSharedCassetteMaterials } from "./tapeTextures";

/** Cylindrical VHS carousel & CRT barrel distortion calibration. */
export const VHS_METRICS = {
  CASE: { w: 184, h: 294, t: 32 },
  TAPE: { w: 174, h: 274, t: 24 },
  SLOT_SPACING: 266,
  ARC_RADIUS: 820,
  PEEK: 56,
  PEEK_IDLE: 0,
  CRT_K: 0.075,
  CRT_FADE: 0.035,
};

function expDecay(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function smoothEntranceEase(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3.2);
}

function onArc(offset: number, radius: number) {
  const theta = offset / radius;
  return {
    x: Math.sin(theta) * radius,
    dropZ: (1 - Math.cos(theta)) * radius,
    rotationY: -theta,
  };
}

interface CarouselSharedState {
  currentOffset: number;
  enterProgress: number;
  velocity: number;
  squash: number;
  tilt: { x: number; y: number };
}

const SHARED_CASE_GEO = new THREE.BoxGeometry(VHS_METRICS.CASE.w, VHS_METRICS.CASE.h, VHS_METRICS.CASE.t);
const SHARED_TAPE_GEO = new THREE.BoxGeometry(VHS_METRICS.TAPE.w, VHS_METRICS.TAPE.h, VHS_METRICS.TAPE.t);

const CRT_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const CRT_FRAG = `
  uniform sampler2D map;
  uniform float k;
  uniform float fade;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv * 2.0 - 1.0) * 0.94;
    vec2 st = vec2(
      p.x * (1.0 + k * p.y * p.y),
      p.y * (1.0 + k * p.x * p.x)
    ) * 0.5 + 0.5;
    vec2 edge = smoothstep(vec2(0.0), vec2(fade), st) * smoothstep(vec2(0.0), vec2(fade), 1.0 - st);
    // Subtle RGB phosphor convergence offset toward outer CRT glass edges
    float rDist = dot(p, p);
    float chroma = 0.0018 * rDist;
    float r = texture2D(map, clamp(st + vec2(chroma, 0.0), 0.0, 1.0)).r;
    float g = texture2D(map, clamp(st, 0.0, 1.0)).g;
    float b = texture2D(map, clamp(st - vec2(chroma, 0.0), 0.0, 1.0)).b;
    float a = texture2D(map, clamp(st, 0.0, 1.0)).a;
    gl_FragColor = vec4(vec3(r, g, b) * (edge.x * edge.y), a);
  }
`;

function BentCrtPost({ paused }: { paused: boolean }) {
  const fallbackRef = useRef(false);

  const { target, screenScene, screenCamera, material } = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.UnsignedByteType,
      samples: 0,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
      depthBuffer: true,
      stencilBuffer: false,
    });
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: rt.texture },
        k: { value: VHS_METRICS.CRT_K },
        fade: { value: VHS_METRICS.CRT_FADE },
      },
      vertexShader: CRT_VERT,
      fragmentShader: CRT_FRAG,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    const sc = new THREE.Scene();
    sc.add(quad);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return { target: rt, screenScene: sc, screenCamera: cam, material: mat };
  }, []);

  useEffect(() => {
    return () => {
      target.dispose();
      material.dispose();
      screenScene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry?.dispose();
      });
    };
  }, [target, material, screenScene]);

  useFrame(({ gl, scene, camera }) => {
    if (paused) return;
    if (!fallbackRef.current) {
      try {
        const w = gl.domElement.width;
        const h = gl.domElement.height;
        if (w > 0 && h > 0) {
          if (target.width !== w || target.height !== h) target.setSize(w, h);
          gl.setRenderTarget(target);
          gl.render(scene, camera);
          gl.setRenderTarget(null);
          gl.render(screenScene, screenCamera);
          return;
        }
      } catch {
        fallbackRef.current = true;
      }
    }
    gl.setRenderTarget(null);
    gl.render(scene, camera);
  }, 1);

  return null;
}

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    if (aspect < 1) {
      const z = Math.min(920, Math.max(680, 650 / Math.max(0.64, aspect * 1.32)));
      camera.position.set(0, 6, z);
    } else {
      camera.position.set(0, 0, 655);
    }
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function TapeItem({
  book,
  bookIndex,
  slotIndex,
  totalSlots,
  isSelected,
  onClick,
  stateRef,
  onSlipcaseDataUrl,
}: {
  book: Book;
  bookIndex: number;
  slotIndex: number;
  totalSlots: number;
  isSelected: boolean;
  onClick: () => void;
  stateRef: React.RefObject<CarouselSharedState>;
  onSlipcaseDataUrl?: (slug: string, url: string) => void;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const cassetteRef = useRef<THREE.Mesh | null>(null);
  const currentPeekRef = useRef(isSelected ? VHS_METRICS.PEEK : VHS_METRICS.PEEK_IDLE);
  const frontMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const spineMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const { frontTex, spineTex } = useMemo(() => {
    const front = createSlipcaseTexture(book, bookIndex, (url) => {
      if (slotIndex === bookIndex) onSlipcaseDataUrl?.(book.slug, url);
    });
    const spine = createSpineTexture(book, bookIndex);
    return { frontTex: front, spineTex: spine };
  }, [book, bookIndex, slotIndex, onSlipcaseDataUrl]);

  useEffect(() => {
    return () => {
      frontTex.dispose();
      spineTex.dispose();
    };
  }, [frontTex, spineTex]);

  const sleeveMats = useMemo(() => {
    const baseCol = new THREE.Color(book.spine.bg || "#15171e");
    const sideMat = new THREE.MeshStandardMaterial({ color: baseCol, roughness: 0.85 });
    const spineMat = new THREE.MeshStandardMaterial({ map: spineTex, roughness: 0.65, metalness: 0.06 });
    const frontMat = new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.58, metalness: 0.08 });
    const hollowTop = new THREE.MeshBasicMaterial({ color: 0x050506 });
    frontMatRef.current = frontMat;
    spineMatRef.current = spineMat;
    return [spineMat, spineMat, hollowTop, sideMat, frontMat, frontMat];
  }, [book.spine.bg, frontTex, spineTex]);

  const cassetteMats = useMemo(() => getSharedCassetteMaterials(), []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const cassette = cassetteRef.current;
    const state = stateRef.current;
    if (!group || !cassette || !state) return;

    const dt = Math.min(delta, 0.05);
    const loopPeriod = totalSlots * VHS_METRICS.SLOT_SPACING;
    const halfPeriod = loopPeriod / 2;

    const rawOffset = slotIndex * VHS_METRICS.SLOT_SPACING - state.currentOffset;
    let offset = (rawOffset + halfPeriod) % loopPeriod;
    if (offset < 0) offset += loopPeriod;
    offset -= halfPeriod;

    const distUnits = Math.abs(offset) / VHS_METRICS.SLOT_SPACING;
    const easeM = smoothEntranceEase(state.enterProgress);

    if (distUnits > 2.35 || easeM <= 0.0001) {
      group.visible = false;
      return;
    }
    group.visible = true;

    const arc = onArc(offset, VHS_METRICS.ARC_RADIUS);
    const baseY = 18;
    const riseY = (1 - easeM) * 360;
    const pushZ = Math.abs(offset) * 0.045 * state.squash;

    group.position.set(arc.x, baseY - riseY, -arc.dropZ - pushZ);

    const isCenter = Math.max(0, 1 - distUnits);
    const tiltX = -0.3 * (1 - easeM) - 0.34 * state.squash - 0.15 * state.tilt.y * isCenter;
    const bankY = Math.max(-0.42, Math.min(0.42, -0.00014 * state.velocity)) + 0.2 * state.tilt.x * isCenter;
    group.rotation.set(tiltX, arc.rotationY + bankY, 0);

    // Pop the molded black VHS cassette out of the top of the centered slipcase!
    const centeredNow = distUnits < 0.35 && isSelected && easeM > 0.65;
    const targetPeek = centeredNow ? VHS_METRICS.PEEK : VHS_METRICS.PEEK_IDLE;
    currentPeekRef.current += (targetPeek - currentPeekRef.current) * (1 - Math.exp(-9 * dt));
    cassette.position.y = currentPeekRef.current;
    cassette.visible = centeredNow || currentPeekRef.current > 0.8;

    // Dramatic studio CRT spotlight falloff toward side tapes
    const litFactor = Math.max(0, 1 - distUnits / 1.58);
    const lit = litFactor * litFactor * (3 - 2 * litFactor) * easeM;
    const ambient = Math.min(1, easeM * 2.4);
    const b = 0.2 * ambient + 0.8 * lit;

    if (frontMatRef.current) frontMatRef.current.color.setRGB(b, b, b);
    if (spineMatRef.current) spineMatRef.current.color.setRGB(b, b, b);
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh ref={cassetteRef} geometry={SHARED_TAPE_GEO} material={cassetteMats} visible={isSelected} />
      <mesh geometry={SHARED_CASE_GEO} material={sleeveMats} />
    </group>
  );
}

function CarouselScene({
  books,
  virtualSlots,
  currentIndex,
  targetOffsetRef,
  mouseRef,
  isDraggingRef,
  onSlotClick,
  onSlotCrossed,
  onSlipcaseDataUrl,
  intro,
  onCardsEntered,
  paused,
  reducedMotion,
}: {
  books: Book[];
  virtualSlots: { book: Book; bookIndex: number }[];
  currentIndex: number;
  targetOffsetRef: React.RefObject<number>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  isDraggingRef: React.RefObject<boolean>;
  onSlotClick: (slotIdx: number, bookIndex: number) => void;
  onSlotCrossed: (bookIndex: number) => void;
  onSlipcaseDataUrl: (slug: string, url: string) => void;
  intro: boolean;
  onCardsEntered?: () => void;
  paused: boolean;
  reducedMotion: boolean;
}) {
  const totalSlots = virtualSlots.length;
  const stateRef = useRef<CarouselSharedState>({
    currentOffset: currentIndex * VHS_METRICS.SLOT_SPACING,
    enterProgress: 0,
    velocity: 0,
    squash: 0,
    tilt: { x: 0, y: 0 },
  });
  const prevOffsetRef = useRef(currentIndex * VHS_METRICS.SLOT_SPACING);
  const lastBookIdxRef = useRef(currentIndex);
  const enteredCalledRef = useRef(false);

  useFrame((_, delta) => {
    if (paused) return;
    const dt = Math.min(0.05, delta);
    const st = stateRef.current;

    // Smooth 0.9s physical glide up from below once the boot loader hands off
    if (intro) {
      st.enterProgress = Math.min(1, st.enterProgress + dt / 0.9);
      if (st.enterProgress >= 0.9 && !enteredCalledRef.current) {
        enteredCalledRef.current = true;
        window.setTimeout(() => onCardsEntered?.(), 0);
      }
    } else {
      st.enterProgress = 0;
      enteredCalledRef.current = false;
    }

    const target = targetOffsetRef.current ?? 0;
    const next = expDecay(st.currentOffset, target, isDraggingRef.current ? 26 : 13, dt);
    st.currentOffset = next;

    const rawVel = dt > 0 ? (next - prevOffsetRef.current) / dt : 0;
    prevOffsetRef.current = next;
    st.velocity = expDecay(st.velocity, rawVel, 10, dt);

    const targetSquash = Math.min(1, Math.abs(st.velocity) / 2300 + (isDraggingRef.current ? 0.18 : 0));
    st.squash = expDecay(st.squash, targetSquash, targetSquash > st.squash ? 8 : 3.5, dt);

    const m = mouseRef.current ?? { x: 0, y: 0 };
    st.tilt.x = expDecay(st.tilt.x, m.x, 3, dt);
    st.tilt.y = expDecay(st.tilt.y, m.y, 3, dt);

    const slot = Math.round(next / VHS_METRICS.SLOT_SPACING);
    const normSlot = ((slot % totalSlots) + totalSlots) % totalSlots;
    const bookIdx = virtualSlots[normSlot]?.bookIndex ?? 0;
    if (bookIdx !== lastBookIdxRef.current) {
      lastBookIdxRef.current = bookIdx;
      onSlotCrossed(bookIdx);
    }
  });

  // Subtle accent rim glow behind the active novel's color band
  const activeAccent = books[currentIndex]?.spine.band || "#f0b354";

  return (
    <>
      <ResponsiveCamera />
      <ambientLight intensity={0.68} color="#ece7dc" />
      <directionalLight position={[0, 230, 420]} intensity={2.25} color="#fffaf0" />
      <pointLight position={[0, 65, 270]} intensity={1.25} color="#f5efe2" distance={780} />
      <pointLight position={[0, -140, -60]} intensity={0.75} color={activeAccent} distance={640} />

      <group>
        {virtualSlots.map((entry, sIdx) => (
          <TapeItem
            key={`${entry.book.slug}-${sIdx}`}
            book={entry.book}
            bookIndex={entry.bookIndex}
            slotIndex={sIdx}
            totalSlots={totalSlots}
            isSelected={entry.bookIndex === currentIndex}
            onClick={() => onSlotClick(sIdx, entry.bookIndex)}
            stateRef={stateRef}
            onSlipcaseDataUrl={onSlipcaseDataUrl}
          />
        ))}
      </group>

      <BentCrtPost paused={paused} />
    </>
  );
}

export function VhsDeck3D({
  books,
  currentIndex,
  onIndexChange,
  onOpenBook,
  onSlipcaseDataUrl,
  intro = true,
  onReady,
  onCardsEntered,
  paused = false,
  reducedMotion = false,
}: {
  books: Book[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onOpenBook: (book: Book) => void;
  onSlipcaseDataUrl: (slug: string, url: string) => void;
  intro?: boolean;
  onReady?: () => void;
  onCardsEntered?: () => void;
  paused?: boolean;
  reducedMotion?: boolean;
}) {
  // For <= 4 books, repeat around a 6+ slot cylinder so left/right infinite looping is seamless without popping
  const virtualSlots = useMemo(() => {
    if (!books.length) return [];
    const reps = books.length >= 5 ? 1 : Math.ceil(6 / books.length);
    const out: { book: Book; bookIndex: number }[] = [];
    for (let r = 0; r < reps; r++) {
      books.forEach((book, bookIndex) => out.push({ book, bookIndex }));
    }
    return out;
  }, [books]);

  const totalSlots = virtualSlots.length;
  const targetOffsetRef = useRef(currentIndex * VHS_METRICS.SLOT_SPACING);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragRef = useRef({ x: 0, moved: 0, startOffset: 0, lastX: 0, lastT: 0, vel: 0 });
  const wheelLockRef = useRef(false);

  const snapToVirtualSlot = useCallback(
    (slot: number) => {
      if (!totalSlots) return;
      targetOffsetRef.current = slot * VHS_METRICS.SLOT_SPACING;
      const norm = ((slot % totalSlots) + totalSlots) % totalSlots;
      const bIdx = virtualSlots[norm]?.bookIndex ?? 0;
      onIndexChange(bIdx);
      vhsAudio.playSnap();
    },
    [onIndexChange, totalSlots, virtualSlots],
  );

  // Sync external index change via shortest arc path
  useEffect(() => {
    if (!totalSlots) return;
    const curSlot = Math.round(targetOffsetRef.current / VHS_METRICS.SLOT_SPACING);
    const curNorm = ((curSlot % totalSlots) + totalSlots) % totalSlots;
    const curBook = virtualSlots[curNorm]?.bookIndex ?? 0;
    if (curBook === currentIndex) return;
    // Find nearest virtual slot matching currentIndex
    let bestDiff = 0;
    let bestAbs = Infinity;
    for (let d = -Math.ceil(totalSlots / 2); d <= Math.ceil(totalSlots / 2); d++) {
      const n = (((curSlot + d) % totalSlots) + totalSlots) % totalSlots;
      if (virtualSlots[n]?.bookIndex === currentIndex && Math.abs(d) < bestAbs) {
        bestAbs = Math.abs(d);
        bestDiff = d;
      }
    }
    targetOffsetRef.current = (curSlot + bestDiff) * VHS_METRICS.SLOT_SPACING;
  }, [currentIndex, totalSlots, virtualSlots]);

  // Keyboard Left / Right / Enter
  useEffect(() => {
    if (paused || !intro) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const cur = Math.round(targetOffsetRef.current / VHS_METRICS.SLOT_SPACING);
        snapToVirtualSlot(cur - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const cur = Math.round(targetOffsetRef.current / VHS_METRICS.SLOT_SPACING);
        snapToVirtualSlot(cur + 1);
      } else if (e.key === "Enter" || e.key === " ") {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "BUTTON" || tag === "A") return;
        e.preventDefault();
        if (books[currentIndex]) onOpenBook(books[currentIndex]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, intro, books, currentIndex, onOpenBook, snapToVirtualSlot]);

  const handleWheel = (e: React.WheelEvent) => {
    if (paused || wheelLockRef.current) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 12) return;
    wheelLockRef.current = true;
    const cur = Math.round(targetOffsetRef.current / VHS_METRICS.SLOT_SPACING);
    snapToVirtualSlot(cur + (delta > 0 ? 1 : -1));
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 240);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (paused) return;
    isDraggingRef.current = true;
    dragRef.current = {
      x: e.clientX,
      moved: 0,
      startOffset: targetOffsetRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      vel: 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
      y: ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1,
    };
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const now = performance.now();
    const dt = Math.max(1, now - dragRef.current.lastT);
    dragRef.current.vel = (e.clientX - dragRef.current.lastX) / dt;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastT = now;
    dragRef.current.moved = Math.max(dragRef.current.moved, Math.abs(dx));
    targetOffsetRef.current = dragRef.current.startOffset - dx * 1.35;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (dragRef.current.moved > 8) {
      const momentum = -dragRef.current.vel * 120;
      const targetSlot = Math.round((targetOffsetRef.current + momentum) / VHS_METRICS.SLOT_SPACING);
      snapToVirtualSlot(targetSlot);
    }
  };

  const handleSlotClick = useCallback(
    (slotIdx: number, bookIndex: number) => {
      if (dragRef.current.moved > 10) return;
      if (bookIndex === currentIndex) {
        if (books[bookIndex]) onOpenBook(books[bookIndex]);
        return;
      }
      const curSlot = Math.round(targetOffsetRef.current / VHS_METRICS.SLOT_SPACING);
      let diff = slotIdx - (((curSlot % totalSlots) + totalSlots) % totalSlots);
      if (diff > totalSlots / 2) diff -= totalSlots;
      if (diff < -totalSlots / 2) diff += totalSlots;
      snapToVirtualSlot(curSlot + diff);
    },
    [books, currentIndex, onOpenBook, snapToVirtualSlot, totalSlots],
  );

  const handleSlotCrossed = useCallback(
    (bookIdx: number) => {
      onIndexChange(bookIdx);
      vhsAudio.playClick(0.95 + (bookIdx % 3) * 0.08);
    },
    [onIndexChange],
  );

  return (
    <div
      className="relative h-full w-full select-none touch-pan-y"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 44, near: 10, far: 3000, position: [0, 0, 655] }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => onReady?.());
          });
        }}
      >
        <CarouselScene
          books={books}
          virtualSlots={virtualSlots}
          currentIndex={currentIndex}
          targetOffsetRef={targetOffsetRef}
          mouseRef={mouseRef}
          isDraggingRef={isDraggingRef}
          onSlotClick={handleSlotClick}
          onSlotCrossed={handleSlotCrossed}
          onSlipcaseDataUrl={onSlipcaseDataUrl}
          intro={intro}
          onCardsEntered={onCardsEntered}
          paused={paused}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
