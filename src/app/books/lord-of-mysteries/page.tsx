import { LotmArchive } from "@/archive/lotm/LotmArchive";
import { LOTM_V1_CHARACTERS } from "@/data/lotm/v1-characters";

export const metadata = {
  title: "Повелитель тайн · Архив томов и картотека",
  description:
    "Интерактивная энциклопедия и пергаментные досье по веб-новелле «Повелитель тайн» (Том I «Клоун»).",
};

export default function LordOfMysteriesPage() {
  return <LotmArchive characters={LOTM_V1_CHARACTERS} />;
}
