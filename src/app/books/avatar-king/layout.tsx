import type { Metadata } from "next";
import { Tektur } from "next/font/google";

const tektur = Tektur({
  variable: "--ff-king-px",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Аватар короля · Монитор C-47",
  description: "Архив персонажей «Аватара короля» внутри клиента «Славы» на мониторе C-47 интернет-кафе «Счастье».",
};

export default function KingLayout({ children }: { children: React.ReactNode }) {
  return <div className={tektur.variable}>{children}</div>;
}
