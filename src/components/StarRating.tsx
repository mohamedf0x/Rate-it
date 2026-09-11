import { cn } from "@/lib/cn";

export default function StarRating({
  value,
  count,
  size = "sm",
}: {
  value: number;
  count?: number;
  size?: "sm" | "lg";
}) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <span
      className={cn("inline-flex items-baseline gap-1.5", size === "lg" ? "text-base" : "text-sm")}
      dir="ltr"
    >
      <span className="text-gold" aria-hidden="true">
        {"★".repeat(Math.floor(rounded))}
        {rounded % 1 ? "½" : ""}
        <span className="text-border-strong">{"★".repeat(5 - Math.ceil(rounded))}</span>
      </span>
      <span className="font-semibold tabular-nums text-ink">{value.toFixed(1)}</span>
      {count !== undefined ? (
        <span className="tabular-nums text-muted">({count})</span>
      ) : null}
    </span>
  );
}
