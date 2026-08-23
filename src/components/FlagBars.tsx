import type { Country } from "@/model/countries.ts";
import { cn } from "@/lib/utils.ts";

export function FlagBars({
  country,
  className,
}: {
  country: Country;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex overflow-hidden rounded-[var(--radius-xs)] border border-border",
        country.flagDir === "v" ? "flex-row" : "flex-col",
        className ?? "h-4 w-6",
      )}
      aria-hidden
    >
      {country.flag.map((c, i) => (
        <span key={i} className="min-h-0 min-w-0 flex-1" style={{ background: c }} />
      ))}
    </span>
  );
}
