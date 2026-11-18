import Link from "next/link";
import { VARIANTS } from "@/lobby/themes";

export default function StylesIndex() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="font-display text-5xl text-brass">Вестибюль: выбор стиля</h1>
      <p className="text-paper/70">
        Одно и то же лобби в четырёх стилях. Пройдитесь по каждому (← → / клик, E — осмотреть) и выберите, какой станет стилем всего отеля.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {VARIANTS.map((v, i) => (
          <li key={v.id}>
            <Link href={`/styles/${v.id}`} className="block rounded-lg border border-brass/30 p-5 transition hover:border-brass hover:bg-brass/10">
              <div className="font-system text-xs text-system">Вариант {i + 1}</div>
              <div className="font-display text-2xl text-brass">{v.label}</div>
              <div className="mt-1 text-sm text-paper/60">{v.note}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
