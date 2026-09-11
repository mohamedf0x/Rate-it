import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "tier" | "gold" | "premium" | "locked";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-transparent",
  tier: "bg-brand-soft text-brand border-transparent",
  gold: "bg-gold-soft text-gold border-transparent",
  premium: "bg-lapis-soft text-lapis border-transparent",
  locked: "text-muted border-border border-dashed",
};

export default function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
