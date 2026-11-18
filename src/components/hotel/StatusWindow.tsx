import { cn } from "@/lib/utils";

/** Окно статуса — «системный» слой поверх отеля, как в новелле. */
export function StatusWindow({
  title,
  children,
  tone = "system",
  className,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  tone?: "system" | "danger";
  className?: string;
}) {
  const danger = tone === "danger";
  return (
    <div
      className={cn(
        "relative rounded-sm bg-[#07131a]/85 p-4 font-system text-[13px] leading-relaxed backdrop-blur-sm",
        danger
          ? "bg-[#1a0709]/85 text-[#ffb3b8] shadow-[0_0_0_1px_rgba(255,90,100,0.5),inset_0_0_24px_rgba(255,90,100,0.1)]"
          : "text-system system-glow",
        className,
      )}
    >
      {title && (
        <div className={cn("mb-2 text-[11px] uppercase tracking-[0.25em]", danger ? "text-[#ff6b74]" : "text-system/70")}>
          [ {title} ]
        </div>
      )}
      {children}
    </div>
  );
}
