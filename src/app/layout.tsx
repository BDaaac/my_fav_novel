import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Inter, Caveat, Rubik_Glitch, Rubik_Wet_Paint, Old_Standard_TT, Kurale, Literata, Ma_Shan_Zheng, Handjet } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
});
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin", "cyrillic"] });
const glitch = Rubik_Glitch({ variable: "--ff-glitch", subsets: ["latin", "cyrillic"], weight: "400" });
const wet = Rubik_Wet_Paint({ variable: "--ff-wet", subsets: ["latin", "cyrillic"], weight: "400" });
const inter = Inter({ variable: "--font-sans", subsets: ["latin", "cyrillic"] });
// полка: антиква XIX века для названий книг (стиль Stripe Press), подписи моноширинным
const press = Old_Standard_TT({
  variable: "--ff-press",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

// «Преподобный Гу»: каллиграфическая антиква для имён, книжный шрифт для текста, кисть для иероглифов кланов
const kurale = Kurale({ variable: "--ff-kurale", subsets: ["latin", "cyrillic"], weight: "400" });
const literata = Literata({ variable: "--ff-literata", subsets: ["latin", "cyrillic"], style: ["normal", "italic"] });
const brush = Ma_Shan_Zheng({ variable: "--ff-brush", subsets: ["latin"], weight: "400", preload: false });

// VHS-меню: пиксельный шрифт экранных надписей кассетной деки
const handjet = Handjet({ variable: "--ff-vhs-bit", subsets: ["latin", "cyrillic"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Архив новелл",
  description: "Картотека героев любимых новелл",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="dark">
      <body className={`${cormorant.variable} ${jetbrains.variable} ${inter.variable} ${caveat.variable} ${glitch.variable} ${wet.variable} ${press.variable} ${kurale.variable} ${literata.variable} ${brush.variable} ${handjet.variable} grain antialiased`}>
        {children}
      </body>
    </html>
  );
}
