import { notFound } from "next/navigation";
import { LobbyGame } from "@/lobby/LobbyGame";
import { VARIANTS, type Variant } from "@/lobby/themes";

export function generateStaticParams() {
  return VARIANTS.map((v) => ({ v: v.id }));
}

export default async function StylePage({ params }: { params: Promise<{ v: string }> }) {
  const { v } = await params;
  if (!VARIANTS.some((x) => x.id === v)) notFound();
  return <LobbyGame variant={v as Variant} />;
}
