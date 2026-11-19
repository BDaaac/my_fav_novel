"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { create } from "zustand";

gsap.registerPlugin(useGSAP, SplitText);

/**
 * Переход между сценами: две шторки смыкаются, в темноте бьёт название следующей сцены, шторки расходятся.
 * Навигация идёт через go(), чтобы смена маршрута случалась, когда экран уже закрыт.
 */
type Next = { href: string; kicker: string; title: string };
type S = { next: Next | null; busy: boolean; go: (n: Next) => void; clear: () => void };
export const useCurtain = create<S>((set, get) => ({
  next: null,
  busy: false,
  go: (n) => !get().busy && set({ next: n, busy: true }),
  clear: () => set({ next: null, busy: false }),
}));

export function Curtain() {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { next, clear } = useCurtain();
  const arrived = useRef<(() => void) | null>(null);

  // маршрут сменился — можно открывать
  useEffect(() => {
    arrived.current?.();
    arrived.current = null;
  }, [pathname]);

  useGSAP(
    () => {
      if (!next || !root.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);
      if (next.href === pathname) return clear();
      if (reduced) {
        router.push(next.href);
        clear();
        return;
      }
      const split = SplitText.create(q(".cur-title"), { type: "chars" });
      const tl = gsap.timeline();
      tl.set(root.current, { autoAlpha: 1 })
        .fromTo(q(".cur-top"), { yPercent: -100 }, { yPercent: 0, duration: 0.38, ease: "power4.in" }, 0)
        .fromTo(q(".cur-bot"), { yPercent: 100 }, { yPercent: 0, duration: 0.38, ease: "power4.in" }, 0)
        .add(() => {
          router.push(next.href);
        })
        .fromTo(q(".cur-line"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "expo.out" })
        .fromTo(q(".cur-kicker"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, "<0.05")
        .fromTo(split.chars, { autoAlpha: 0, yPercent: 60, rotateX: -70 }, { autoAlpha: 1, yPercent: 0, rotateX: 0, duration: 0.5, ease: "expo.out", stagger: 0.022 }, "<0.05")
        .addPause("+=0.35", () => {
          // ждём, пока новая сцена действительно смонтируется
          if (window.location.pathname === next.href) tl.play();
          else arrived.current = () => tl.play();
        })
        .to([q(".cur-kicker"), q(".cur-line"), split.chars], { autoAlpha: 0, duration: 0.22, ease: "power2.in" })
        .to(q(".cur-top"), { yPercent: -100, duration: 0.55, ease: "expo.inOut" }, "<0.05")
        .to(q(".cur-bot"), { yPercent: 100, duration: 0.55, ease: "expo.inOut" }, "<")
        .set(root.current, { autoAlpha: 0 })
        .add(() => {
          split.revert();
          clear();
        });
      // страховка: если что-то пошло не так, экран не останется закрытым
      const guard = setTimeout(() => tl.progress() < 1 && tl.play(), 4000);
      return () => clearTimeout(guard);
    },
    { dependencies: [next], scope: root },
  );

  return (
    <div ref={root} className="pointer-events-none invisible fixed inset-0 z-[70]" aria-hidden>
      <div className="cur-top absolute inset-x-0 top-0 h-1/2 bg-[#050606]" />
      <div className="cur-bot absolute inset-x-0 bottom-0 h-1/2 bg-[#050606]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center [perspective:800px]">
        <div className="cur-kicker font-system text-[12px] tracking-[0.5em] text-[#c9b27a]">{next?.kicker}</div>
        <div className="cur-line my-3 h-px w-[min(520px,70vw)] origin-center bg-[#c9b27a]" />
        <div className="cur-title font-display text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-none text-[#efe6cf]">{next?.title}</div>
      </div>
    </div>
  );
}
