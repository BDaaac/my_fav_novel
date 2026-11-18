"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LobbySvg } from "./LobbySvg";
import { RasterScene } from "./RasterScene";
import { Panel, rackKeys } from "./Panels";
import { SKINS } from "./skin";
import { THEMES, VARIANTS, type Variant } from "./themes";
import { VIEW_W, useGuest } from "./useGuest";
import type { Hotspot, HotspotId, SceneState } from "./world";
import { cn } from "@/lib/utils";

const DESK_X = 910;
const HINTS = [
  "Персонал стесняется. Позвоните в колокольчик, отойдите от стойки и отвернитесь.",
  "У входа есть выключатель. В темноте за стеклом видно больше, чем днём.",
  "Не нажимайте «Побег», если не знаете пароль.",
];

export function LobbyGame({ variant }: { variant: Variant }) {
  const t = THEMES[variant];
  const skin = SKINS[variant];
  const keys = useMemo(() => rackKeys().map(({ id, tone }) => ({ id, tone })), []);

  const [scene, setScene] = useState<SceneState>({ doorOpen: false, lightsOff: false, snacks: false, blink: false, burning: false });
  const [panel, setPanel] = useState<HotspotId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [hints, setHints] = useState(3);
  const [seed, setSeed] = useState(1);
  const snacksPending = useRef(false);

  const say = useCallback((m: string) => setToast(m), []);

  const onInteract = useCallback(
    (h: Hotspot) => {
      if (h.id === "switch") {
        setScene((s) => {
          say(s.lightsOff ? "Свет снова горит." : "Щелчок. Свет в вестибюле погас.");
          return { ...s, lightsOff: !s.lightsOff };
        });
        return;
      }
      setPanel(h.id);
    },
    [say],
  );

  const g = useGuest({ paused: panel !== null || scene.burning, onInteract });

  // мигание дисплеев
  useEffect(() => {
    const id = setInterval(() => setScene((s) => ({ ...s, blink: !s.blink })), 650);
    return () => clearInterval(id);
  }, []);
  // «кипящая» линия у чернил
  useEffect(() => {
    if (variant !== "ink") return;
    const id = setInterval(() => setSeed((s) => (s % 6) + 1), 160);
    return () => clearInterval(id);
  }, [variant]);
  // подсказка гаснет сама
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  // Esc закрывает окно
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  // закуски появляются, когда гость отошёл от стойки и отвернулся
  useEffect(() => {
    if (!snacksPending.current || panel) return;
    const away = Math.abs(g.x - DESK_X) > 140 && Math.sign(g.x - DESK_X) === g.facing;
    if (away || Math.abs(g.x - DESK_X) > 700) {
      snacksPending.current = false;
      setScene((s) => ({ ...s, snacks: true }));
      say("За спиной тихо звякнула посуда.");
    }
  }, [g.x, g.facing, panel, say]);

  const burn = () => {
    setPanel(null);
    setScene((s) => ({ ...s, burning: true }));
    setTimeout(() => {
      g.teleport(160);
      setScene((s) => ({ ...s, burning: false }));
      say("Отель вернул вас в лобби. Пароль был неверным.");
    }, 2600);
  };

  const onSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panel || scene.burning) return;
    const r = e.currentTarget.getBoundingClientRect();
    g.walkTo(g.cam + ((e.clientX - r.left) / r.width) * VIEW_W);
  };

  return (
    <main className={cn("flex min-h-screen flex-col items-center justify-center gap-3 px-4 py-4", skin.page)}>
      {/* верхняя панель: окно статуса и переключатель стилей */}
      <div className="flex w-full max-w-[min(100%,calc((100vh-150px)*2))] flex-wrap items-start justify-between gap-3">
        <div className={cn("px-3 py-2 text-[13px]", skin.system)}>
          [Пользователь: Гость · Уровень 1 · Лобби · Совет Мудреца: {hints}]
          {hints > 0 && (
            <button
              className="ml-3 underline decoration-dotted underline-offset-4 opacity-80 hover:opacity-100"
              onClick={() => {
                say(HINTS[3 - hints]);
                setHints((h) => h - 1);
              }}
            >
              спросить совета
            </button>
          )}
        </div>
        <nav className="flex flex-wrap gap-1.5">
          {VARIANTS.map((x) => (
            <Link key={x.id} href={`/styles/${x.id}`} className={cn(skin.btn, x.id === variant && "ring-2 ring-current")}>
              {x.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* сцена */}
      <div
        className="relative aspect-[2/1] w-full max-w-[min(100%,calc((100vh-150px)*2))] cursor-pointer overflow-hidden"
        onClick={onSceneClick}
      >
        {variant === "pixel" || variant === "onebit" ? (
          <RasterScene t={t} v={variant} scene={scene} keys={keys} x={g.x} facing={g.facing} dist={g.dist} walking={g.walking} cam={g.cam} />
        ) : (
          <LobbySvg t={t} v={variant} scene={scene} keys={keys} x={g.x} facing={g.facing} dist={g.dist} walking={g.walking} cam={g.cam} seed={seed} />
        )}

        {/* подсказка над объектом */}
        {g.near && !panel && !scene.burning && (
          <div
            className={cn("pointer-events-none absolute top-[2.5%] -translate-x-1/2 whitespace-nowrap", skin.prompt)}
            style={{ left: `${((g.near.x - g.cam) / VIEW_W) * 100}%` }}
          >
            E · {g.near.id === "switch" ? (scene.lightsOff ? "Включить свет" : "Выключить свет") : g.near.id === "entrance" && scene.lightsOff ? "Тьма за стеклом" : g.near.label}
          </div>
        )}

        <AnimatePresence>
          {panel && (
            <div className="absolute inset-0 bg-black/30" onClick={() => setPanel(null)}>
              <Panel
                key={panel}
                id={panel}
                skin={skin}
                scene={scene}
                setScene={setScene}
                onClose={() => setPanel(null)}
                onBurn={burn}
                onBell={() => (snacksPending.current = true)}
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scene.burning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.85, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{
                background:
                  variant === "onebit"
                    ? "repeating-linear-gradient(0deg,#e9e1d0 0 3px,#111 3px 6px)"
                    : variant === "ink"
                      ? "radial-gradient(circle at 50% 70%, #a8392c, #1b1612 75%)"
                      : "radial-gradient(circle at 50% 80%, #ffdd66, #ff5a1f 35%, #5a0b0b 75%, #000)",
              }}
            >
              <div className={cn("px-4 py-2 text-lg", skin.system)}>[Неверный пароль]</div>
              <div className={cn("px-4 py-2 text-3xl tracking-[0.3em]", skin.system)}>СОЖЖЕНИЕ</div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn("pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 text-sm", skin.system)}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className={cn("font-system text-xs", skin.muted)}>← → или A D — идти · клик — идти туда · E — осмотреть · Esc — закрыть</p>
    </main>
  );
}
