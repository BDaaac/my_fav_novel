import { LAMP, SCENE } from "@/data/horror/board/geometry";

/** тёплый свет лампы сверху справа и холодная виньетка по краям */
export function AtmosphereEffects() {
  return (
    <>
      <div
        className="hs-lamp"
        aria-hidden
        style={{ background: `radial-gradient(ellipse 620px 520px at ${LAMP.x}px ${LAMP.y + 40}px, rgba(255,178,92,.20), rgba(255,140,60,.06) 45%, transparent 70%)` }}
      />
      <div className="hs-cold" aria-hidden style={{ width: SCENE.w, height: SCENE.h }} />
    </>
  );
}
