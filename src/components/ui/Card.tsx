import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** `interactive` is for cards that are a link target — it adds the lift on hover.
 *  Static cards stay flat, so the movement keeps meaning "you can click this". */
export default function Card({
  as: Tag = "div",
  interactive = false,
  className,
  children,
}: {
  as?: ElementType;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-border bg-surface shadow-card",
        interactive &&
          "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
