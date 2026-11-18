import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Inter, Caveat } from "next/font/google";
import "./globals.css";
import { SpoilerProvider } from "@/lib/spoiler";

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
const inter = Inter({ variable: "--font-sans", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Отель",
  description: "Фан-сайт по новелле «Побег из отеля с привидениями»",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="dark">
      <body className={`${cormorant.variable} ${jetbrains.variable} ${inter.variable} ${caveat.variable} grain antialiased`}>
        <SpoilerProvider>{children}</SpoilerProvider>
      </body>
    </html>
  );
}
