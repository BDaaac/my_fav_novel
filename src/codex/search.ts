import type { Claim, Entry, EntryType, Sure } from "./types";

/** Весь текст записи одной строкой, в нижнем регистре, ё → е. */
const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е");

function claimsOf(e: Entry): Claim[] {
  return [
    e.tagline,
    ...e.registry.map((r) => r.value),
    ...e.sections.flatMap((s) => s.claims),
    ...e.quotes,
    ...(e.timeline ?? []),
    ...(e.evidence ?? []).map((x) => x.claim),
    ...(e.suspects ?? []).map((x) => x.claim),
    ...(e.outcome ? [e.outcome] : []),
    ...(e.open ?? []),
    ...(e.messages ?? []),
    ...(e.conflicts ?? []),
  ];
}

export function haystack(e: Entry): string {
  return norm([e.title, ...(e.aliases ?? []), ...e.registry.map((r) => r.label), ...claimsOf(e).map((c) => c.text)].join(" \n "));
}

/** Самые ранняя и поздняя главы, на которые опирается запись. */
export function span(e: Entry): [number, number] {
  const all = claimsOf(e).flatMap((c) => c.ch);
  return all.length ? [Math.min(...all), Math.max(...all)] : [e.firstCh, e.firstCh];
}

export type Filter = { q: string; types: EntryType[]; from: number; to: number; sure?: Sure; conflicts?: boolean };

export function match(e: Entry, f: Filter): boolean {
  if (f.types.length && !f.types.includes(e.type)) return false;
  const [a, b] = span(e);
  if (b < f.from || a > f.to) return false;
  if (f.conflicts && !(e.conflicts ?? []).length) return false;
  if (f.sure && !claimsOf(e).some((c) => (c.sure ?? "факт") === f.sure)) return false;
  const words = norm(f.q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = haystack(e);
  return words.every((w) => hay.includes(w));
}

/** Кто ссылается на эту запись. */
export function backlinks(id: string, all: Entry[]) {
  return all.flatMap((e) => e.links.filter((l) => l.to === id).map((l) => ({ from: e, rel: l.rel, ch: l.ch })));
}
