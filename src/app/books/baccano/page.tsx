import { CaseSelect } from "@/archive/baccano/CaseSelect";
import { countFor } from "@/archive/baccano/load";
import { CASES } from "@/data/baccano/cases";

export const metadata = { title: "Шумиха! · Выбор дела" };

export default function Page() {
  return <CaseSelect cases={CASES.map((c) => ({ ...c, count: countFor(c) }))} />;
}
