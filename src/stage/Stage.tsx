"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { create } from "zustand";

/**
 * Общая WebGL-сцена комнаты. Один полноэкранный шейдер рисует арт текущей сцены и всю атмосферу поверх:
 * параллакс за курсором, перетекание между артами, дождь, вспышки молний, ударную волну (колокол),
 * хроматическую аберрацию, зерно и виньетку. Интерфейс лежит в DOM поверх холста.
 * При «меньше движения» кадр статичен: без дождя, вспышек и параллакса.
 */
type StageState = {
  image: string | null;
  rain: number; // 0..1
  dark: number; // 0..1 — затемнение под интерфейс
  flashAt: number;
  shockAt: number;
  set: (p: Partial<Pick<StageState, "image" | "rain" | "dark">>) => void;
  flash: () => void;
  shock: () => void;
};
export const useStage = create<StageState>((set) => ({
  image: null,
  rain: 0,
  dark: 0.35,
  flashAt: -10,
  shockAt: -10,
  set: (p) => set(p),
  flash: () => set({ flashAt: performance.now() / 1000 }),
  shock: () => set({ shockAt: performance.now() / 1000 }),
}));

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA; uniform sampler2D uB;
uniform vec2 uAspA; uniform vec2 uAspB; // x: аспект картинки, y: есть ли она
uniform float uMix; uniform float uTime; uniform float uView;
uniform vec2 uMouse; uniform float uRain; uniform float uDark;
uniform float uFlash; uniform float uShock; uniform float uStill;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
// «cover»: картинка заполняет экран без искажения пропорций
vec2 cover(vec2 uv, float imgAsp) {
  vec2 s = uView > imgAsp ? vec2(1.0, imgAsp / uView) : vec2(uView / imgAsp, 1.0);
  return (uv - 0.5) * s + 0.5;
}
vec3 art(sampler2D t, vec2 asp, vec2 uv, float ca) {
  if (asp.y < 0.5) return vec3(0.02, 0.03, 0.03);
  vec2 c = cover(uv, asp.x);
  vec2 d = (uv - 0.5) * ca;
  return vec3(texture2D(t, c + d).r, texture2D(t, c).g, texture2D(t, c - d).b);
}
// один слой косого дождя
float streaks(vec2 uv, float scale, float speed, float seed) {
  uv.x += uv.y * 0.18;
  vec2 g = vec2(uv.x * scale * uView, uv.y * scale * 0.09 + uTime * speed);
  vec2 id = floor(g); float r = hash(id + seed);
  float x = fract(g.x) - 0.5 + (r - 0.5) * 0.6;
  float len = smoothstep(0.0, 0.2, fract(g.y)) * smoothstep(1.0, 0.55, fract(g.y));
  return smoothstep(0.035, 0.0, abs(x)) * len * step(0.55, r);
}

void main() {
  vec2 uv = vUv;
  float still = uStill;
  // параллакс и медленное «дыхание» кадра
  vec2 par = (uMouse - 0.5) * 0.014 * (1.0 - still);
  float zoom = 1.03 + 0.008 * sin(uTime * 0.25) * (1.0 - still);
  uv = (uv - 0.5) / zoom + 0.5 + par * (0.6 + length(vUv - 0.5));

  // ударная волна: кольцо расходится от центра и гнёт изображение
  float st = uShock; float ring = 0.0;
  if (st > 0.0 && st < 1.6) {
    vec2 p = (vUv - 0.5) * vec2(uView, 1.0); float d = length(p);
    float radius = st * 0.9; ring = smoothstep(0.09, 0.0, abs(d - radius)) * (1.0 - st / 1.6);
    uv += normalize(p + 1e-5) * ring * 0.03;
  }
  // капли на «стекле» слегка преломляют картинку
  float wet = noise(vUv * vec2(60.0 * uView, 22.0) + vec2(0.0, uTime * 1.6)) * uRain * (1.0 - still);
  uv += (wet - 0.5 * uRain) * 0.0025;

  float ca = 0.0025 + ring * 0.03 + length(vUv - 0.5) * 0.004;
  vec3 col = mix(art(uA, uAspA, uv, ca), art(uB, uAspB, uv, ca), smoothstep(0.0, 1.0, uMix));

  // дождь в три слоя
  float rn = (streaks(vUv, 46.0, 2.6, 1.0) * 0.55 + streaks(vUv, 78.0, 3.4, 7.0) * 0.35 + streaks(vUv, 120.0, 4.4, 13.0) * 0.2) * uRain * (1.0 - still);
  col += vec3(0.62, 0.72, 0.74) * rn * 0.55;

  // молния: холодная вспышка, сильнее сверху
  col = mix(col, col * 1.9 + vec3(0.16, 0.2, 0.26), uFlash * (0.45 + 0.55 * vUv.y));
  col += vec3(0.85, 0.75, 0.45) * ring * 0.35;

  // затемнение под текст, виньетка, зерно
  col *= 1.0 - uDark * (0.55 + 0.45 * smoothstep(0.75, 0.0, vUv.y));
  float vig = smoothstep(1.15, 0.35, length((vUv - 0.5) * vec2(1.0, 0.85)) * 1.6);
  col *= mix(0.55, 1.0, vig);
  col += (hash(vUv * vec2(1920.0, 1080.0) + fract(uTime) * 91.0) - 0.5) * 0.055;
  gl_FragColor = vec4(col, 1.0);
}
`;

function Quad({ still }: { still: boolean }) {
  const { size, invalidate, advance } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const smooth = useRef(new THREE.Vector2(0.5, 0.5));
  const cur = useRef({ rain: 0, dark: 0.35 });
  const material = useMemo(() => {
    const uniforms = {
      uA: { value: null as THREE.Texture | null },
      uB: { value: null as THREE.Texture | null },
      uAspA: { value: new THREE.Vector2(1, 0) },
      uAspB: { value: new THREE.Vector2(1, 0) },
      uMix: { value: 1 },
      uTime: { value: 0 },
      uView: { value: 1 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRain: { value: 0 },
      uDark: { value: 0.35 },
      uFlash: { value: 0 },
      uShock: { value: -1 },
      uStill: { value: 0 },
    };
    return new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
  }, []);
  const uniforms = material.uniforms as {
    uA: { value: THREE.Texture | null };
    uB: { value: THREE.Texture | null };
    uAspA: { value: THREE.Vector2 };
    uAspB: { value: THREE.Vector2 };
    uMouse: { value: THREE.Vector2 };
  } & Record<"uMix" | "uTime" | "uView" | "uRain" | "uDark" | "uFlash" | "uShock" | "uStill", { value: number }>;
  useEffect(() => () => material.dispose(), [material]);

  // для проверки в dev: window.__stageRender() рисует один кадр немедленно
  useEffect(() => {
    if (process.env.NODE_ENV === "development") (window as unknown as { __stageRender: () => unknown }).__stageRender = () => {
        advance(performance.now() / 1000);
        return { image: useStage.getState().image, hasB: !!uniforms.uB.value, aspB: uniforms.uAspB.value.toArray(), mix: uniforms.uMix.value };
      };
  }, [advance, uniforms]);

  // смена арта: текущий уходит в слот A, новый грузится в B и проявляется
  const image = useStage((s) => s.image);
  useEffect(() => {
    if (!image) return;
    let dead = false;
    new THREE.TextureLoader().load(image, (t) => {
      if (dead) return t.dispose();
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      const u = uniforms;
      u.uA.value?.dispose();
      u.uA.value = u.uB.value;
      u.uAspA.value.copy(u.uAspB.value);
      u.uB.value = t;
      u.uAspB.value.set(t.image.width / t.image.height, 1);
      u.uMix.value = u.uA.value ? 0 : 1;
      invalidate();
    });
    return () => {
      dead = true;
    };
  }, [image, uniforms, invalidate]);

  useEffect(() => {
    const m = (e: PointerEvent) => mouse.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    window.addEventListener("pointermove", m, { passive: true });
    return () => window.removeEventListener("pointermove", m);
  }, []);
  // в статичном режиме перерисовываем только при изменении состояния
  useEffect(() => useStage.subscribe(() => invalidate()), [invalidate]);

  useFrame((_, dt) => {
    const u = uniforms;
    const s = useStage.getState();
    const now = performance.now() / 1000;
    const k = Math.min(1, dt * 3);
    cur.current.rain += (s.rain - cur.current.rain) * k;
    cur.current.dark += (s.dark - cur.current.dark) * k;
    smooth.current.lerp(mouse.current, Math.min(1, dt * 2.5));
    u.uTime.value = now % 10000;
    u.uView.value = size.width / size.height;
    u.uMouse.value.copy(smooth.current);
    u.uRain.value = still ? 0 : cur.current.rain;
    u.uDark.value = still ? s.dark : cur.current.dark;
    u.uStill.value = still ? 1 : 0;
    u.uMix.value = still ? 1 : Math.min(1, u.uMix.value + dt * 1.6);
    const f = now - s.flashAt;
    // двойная вспышка, как у настоящей молнии
    u.uFlash.value = still || f > 0.9 ? 0 : Math.max(0, Math.exp(-f * 9) + 0.7 * Math.exp(-Math.abs(f - 0.22) * 14) - 0.02);
    const sh = now - s.shockAt;
    u.uShock.value = still || sh > 1.6 ? -1 : sh;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/** Холст комнаты. Лежит под интерфейсом и не ловит клики. */
export function Stage({ storm = true }: { storm?: boolean }) {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setStill(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  // гроза: редкие вспышки, пока идёт сильный дождь
  useEffect(() => {
    if (!storm || still) return;
    let id: ReturnType<typeof setTimeout>;
    const loop = () => {
      id = setTimeout(
        () => {
          if (useStage.getState().rain > 0.55 && !document.hidden) useStage.getState().flash();
          loop();
        },
        7000 + Math.random() * 9000,
      );
    };
    loop();
    return () => clearTimeout(id);
  }, [storm, still]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#060807]" aria-hidden>
      <Canvas flat linear frameloop={still ? "demand" : "always"} dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }} orthographic camera={{ position: [0, 0, 1] }}>
        <Quad still={still} />
      </Canvas>
    </div>
  );
}
