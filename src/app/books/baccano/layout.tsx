import { Cormorant_Infant, Cousine, Jost, Old_Standard_TT, PT_Mono, Prata } from "next/font/google";

// «Шумиха!» — вариант C «Машинный век» (утверждён): геометрический гротеск эпохи
// экспрессов для заголовков, старая антиква для текста справок, машинопись агентства.
const display = Jost({ variable: "--bc-display", subsets: ["latin", "cyrillic"], weight: ["300", "400", "500", "600"] });
const serif = Old_Standard_TT({ variable: "--bc-serif", subsets: ["latin", "cyrillic"], weight: ["400", "700"], style: ["normal", "italic"] });
const mono = PT_Mono({ variable: "--bc-mono", subsets: ["latin", "cyrillic"], weight: "400" });
// досье «дело на столе» (утверждено): заголовок бланка, машинопись, пометки от руки
const title = Prata({ variable: "--bc-title", subsets: ["latin", "cyrillic"], weight: "400" });
const typed = Cousine({ variable: "--bc-typed", subsets: ["latin", "cyrillic"], weight: "400" });
const hand = Cormorant_Infant({ variable: "--bc-hand", subsets: ["latin", "cyrillic"], weight: "500", style: "italic" });

export const metadata = { title: "Шумиха! · Справки агентства" };

export default function BaccanoLayout({ children }: { children: React.ReactNode }) {
  // --bc-deco (экспресс 1931) — тот же гротеск в светлом начертании
  return (
    <div className={`${display.variable} ${serif.variable} ${mono.variable} ${title.variable} ${typed.variable} ${hand.variable}`} style={{ ["--bc-deco" as string]: "var(--bc-display)" }}>
      {children}
    </div>
  );
}
