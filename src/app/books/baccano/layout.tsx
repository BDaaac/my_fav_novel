import { Cormorant_Infant, Cousine, Jost, PT_Mono, Prata } from "next/font/google";

// «Шумиха!» — вариант C «Машинный век» (утверждён): геометрический гротеск эпохи
// экспрессов для заголовков, старая антиква (--ff-press из корневого layout) для текста справок, машинопись агентства.
const display = Jost({ variable: "--bc-display", subsets: ["latin", "cyrillic"], weight: ["300", "400", "500", "600"] });
const mono = PT_Mono({ variable: "--bc-mono", subsets: ["latin", "cyrillic"], weight: "400" });
// досье «дело на столе» (утверждено): грузятся по требованию при открытии справки, не блокируя первый экран
const title = Prata({ variable: "--bc-title", subsets: ["latin", "cyrillic"], weight: "400", preload: false });
const typed = Cousine({ variable: "--bc-typed", subsets: ["latin", "cyrillic"], weight: "400", preload: false });
const hand = Cormorant_Infant({ variable: "--bc-hand", subsets: ["latin", "cyrillic"], weight: "500", style: "italic", preload: false });

export const metadata = { title: "Шумиха! · Справки агентства" };

export default function BaccanoLayout({ children }: { children: React.ReactNode }) {
  // --bc-serif переиспользует уже загруженный Old_Standard_TT (--ff-press), --bc-deco — гротеск Jost
  return (
    <div
      className={`${display.variable} ${mono.variable} ${title.variable} ${typed.variable} ${hand.variable}`}
      style={{
        ["--bc-serif" as string]: "var(--ff-press)",
        ["--bc-deco" as string]: "var(--bc-display)",
      }}
    >
      {children}
    </div>
  );
}
