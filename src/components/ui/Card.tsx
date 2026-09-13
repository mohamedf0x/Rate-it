import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "default" | "gold" | "danger" | "success";

/*
 * Background and border come from `tone` and nowhere else. Passing a bg-* class through
 * `className` would set the same Tailwind property twice, and Tailwind resolves that by
 * stylesheet order rather than the order classes appear on the element — so the winner is
 * whichever Tailwind emitted last, not the one the caller wrote. Add a tone here instead.
 *
 * Tinted tones are callouts, not raised objects, so only `default` carries a shadow.
 */
const TONES: Record<Tone, string> = {
  default: "border-border bg-surface shadow-card",
  gold: "border-gold/25 bg-gold-soft/70",
  danger: "border-pomegranate/25 bg-pomegranate-soft/70",
  success: "border-pistachio/25 bg-pistachio-soft/70",
};

/** `interactive` is for cards that are a link target — it adds the lift on hover.
 *  Static cards stay flat, so the movement keeps meaning "you can click this". */
export default function Card({
  as: Tag = "div",
  tone = "default",
  interactive = false,
  className,
  children,
}: {
  as?: ElementType;
  tone?: Tone;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "rounded-card border",
        TONES[tone],
        interactive &&
          "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
