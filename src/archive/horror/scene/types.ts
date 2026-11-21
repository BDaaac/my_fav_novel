export type BoardCharacter = { id: string; name: string; portrait?: string;
  /** снимок уже в тонах доски (вырезан из кадра) — не перекрашивать */
  toned?: boolean; dossier?: boolean };
export type House = { id: string; label: string; characters: BoardCharacter[] };
