import fs from "node:fs";
import path from "node:path";
import type { Entry } from "./types";

const arr = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
const ls = (dir: string) => {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
};

/** Недописанные поля становятся пустыми, чтобы досье не падало. */
function tidy(e: Entry): Entry {
  return {
    ...e,
    aliases: arr(e.aliases),
    firstCh: e.firstCh ?? 0,
    tagline: e.tagline ?? { text: "", ch: [] },
    registry: arr(e.registry),
    sections: arr<Entry["sections"][number]>(e.sections).map((s) => ({ ...s, claims: arr(s.claims) })),
    quotes: arr(e.quotes),
    links: arr<Entry["links"][number]>(e.links).filter((l) => l.to !== e.id),
    conflicts: arr(e.conflicts),
    timeline: arr(e.timeline),
    evidence: arr(e.evidence),
    suspects: arr(e.suspects),
    open: arr(e.open),
    messages: arr(e.messages),
  };
}

/** Все записи новеллы: src/data/<book>/<тип>/<id>.json; битый файл пропускаем. */
export function loadEntries(book: string): Entry[] {
  const root = path.join(process.cwd(), "src/data", book);
  const out: Entry[] = [];
  for (const dir of ls(root)) {
    for (const f of ls(path.join(root, dir))) {
      if (!f.endsWith(".json")) continue;
      try {
        const e = JSON.parse(fs.readFileSync(path.join(root, dir, f), "utf8")) as Entry;
        if (e?.id && e.title && e.type) out.push(tidy(e));
      } catch {}
    }
  }
  return out.sort((a, b) => a.firstCh - b.firstCh || a.title.localeCompare(b.title, "ru"));
}
