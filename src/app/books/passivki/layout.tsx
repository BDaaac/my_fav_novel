import { Gabriela, Spectral } from "next/font/google";

// «Пассивки»: рабочая шрифтовая пара до утверждения — каллиграфическая антиква для имён и заголовков,
// книжная антиква для записей летописца.
const display = Gabriela({ variable: "--pv-display", subsets: ["latin", "cyrillic"], weight: "400" });
const text = Spectral({ variable: "--pv-text", subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], style: ["normal", "italic"] });

export const metadata = { title: "Пассивки · Записи летописца" };

export default function PassivkiLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${text.variable}`}>{children}</div>;
}
