import { preload } from "react-dom";
import { notFound } from "next/navigation";
import { CasePage } from "@/archive/baccano/CasePage";
import { loadCase } from "@/archive/baccano/load";
import { CASES, caseBySlug, TRAIN } from "@/data/baccano/cases";

// статическая сборка: оба дела собираются заранее
export const dynamicParams = false;
export function generateStaticParams() {
  return CASES.map((c) => ({ arc: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ arc: string }> }) {
  const c = caseBySlug((await params).arc);
  return { title: c ? `${c.title} · Шумиха!` : "Шумиха!" };
}

export default async function Page({ params }: { params: Promise<{ arc: string }> }) {
  const c = caseBySlug((await params).arc);
  if (!c) notFound();
  preload(c.arc === "1930" ? "/art/baccano/ny1930-street.webp" : "/art/baccano/express-1931.webp", {
    as: "image",
    fetchPriority: "high",
  });
  preload("/art/baccano/desk.webp", { as: "image" });
  return <CasePage data={c} dossiers={loadCase(c)} train={c.arc === "1931" ? TRAIN : undefined} />;
}
