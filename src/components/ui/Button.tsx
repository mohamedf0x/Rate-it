import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand/90 shadow-sm",
  secondary: "bg-surface text-ink border border-border-strong hover:bg-surface-2",
  ghost: "text-muted hover:text-ink hover:bg-surface-2",
};

const SIZES: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
};

/** Shared so a Link can be styled as a button without nesting one inside the other. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className = "") {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium",
    "transition-[transform,background-color,border-color] duration-150",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}
