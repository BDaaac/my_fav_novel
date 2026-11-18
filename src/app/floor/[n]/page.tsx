import Link from "next/link";
import { notFound } from "next/navigation";
import { FLOORS } from "@/data/floors";
import { Door } from "@/components/hotel/Door";
import { CursorLight } from "@/components/hotel/CursorLight";

export function generateStaticParams() {
  return FLOORS.filter((f) => f.doors.length).map((f) => ({ n: String(f.n) }));
}

export default async function Floor({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const floor = FLOORS.find((f) => String(f.n) === n);
  if (!floor || !floor.doors.length) notFound();
  const left = floor.doors.filter((_, i) => i % 2 === 0);
  const right = floor.doors.filter((_, i) => i % 2 === 1);

  return (
    <main className="wallpaper relative min-h-screen overflow-hidden px-4 py-10">
      <CursorLight />
      <div className="relative mx-auto max-w-6xl">
        <div className="relative z-50 flex items-center justify-between">
          <Link href="/" className="font-system text-xs text-paper/60 hover:text-brass">← лифт / лобби</Link>
          <span className="font-system text-xs uppercase tracking-[0.3em] text-system/70">[ Уровень {floor.n} ]</span>
        </div>
        <h1 className="mt-6 text-center font-display text-5xl text-brass">Этаж {floor.n}</h1>
        <p className="text-center font-display italic text-paper/50">Ведите фонарём по коридору</p>

        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-14">
          {left.map((d) => <Door key={d.id} d={d} />)}
        </div>
        <div className="carpet mx-auto my-10 h-16 max-w-5xl border-y-2 border-brass/30" />
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-14">
          {right.map((d) => <Door key={d.id} d={d} />)}
        </div>
      </div>
    </main>
  );
}
