import { preload } from "react-dom";
import { LotmArchive } from "@/archive/lotm/LotmArchive";
import { LOTM_V1_CHARACTERS } from "@/data/lotm/v1-characters";

export const metadata = {
  title: "Повелитель тайн · Архив томов и картотека",
  description:
    "Интерактивная энциклопедия и пергаментные досье по веб-новелле «Повелитель тайн» (Том I «Клоун»).",
};

export default function LordOfMysteriesPage() {
  preload("/art/lotm/bg-tingen.webp", { as: "image", fetchPriority: "high" });
  preload("/art/lotm/vol1-grimoire.webp", { as: "image", fetchPriority: "high" });
  return <LotmArchive characters={LOTM_V1_CHARACTERS} />;
}
