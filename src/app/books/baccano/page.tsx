import { preload } from "react-dom";
import { CaseSelect } from "@/archive/baccano/CaseSelect";
import { countFor } from "@/archive/baccano/load";
import { CASES } from "@/data/baccano/cases";

export const metadata = { title: "Шумиха! · Выбор дела" };

export default function Page() {
  preload("/art/baccano/desk.webp", { as: "image", fetchPriority: "high" });
  preload("/art/baccano/folder-1930.webp", { as: "image", fetchPriority: "high" });
  preload("/art/baccano/folder-1931.webp", { as: "image", fetchPriority: "high" });
  preload("/art/baccano/ny1930-thumb.webp", { as: "image", fetchPriority: "high" });
  preload("/art/baccano/express-bridge-thumb.webp", { as: "image", fetchPriority: "high" });
  preload("/art/baccano/paperclip.webp", { as: "image" });
  return <CaseSelect cases={CASES.map((c) => ({ ...c, count: countFor(c) }))} />;
}
