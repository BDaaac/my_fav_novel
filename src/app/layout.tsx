import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Inter, Caveat, Rubik_Glitch, Rubik_Wet_Paint } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Картотека",
  description: "Картотека героев любимых новелл",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="dark">
      <body className={`${cormorant.variable} ${jetbrains.variable} ${inter.variable} ${caveat.variable} ${glitch.variable} ${wet.variable} grain antialiased`}>
        {children}
      </body>
    </html>
  );
}
