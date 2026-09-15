import {
  Gamepad2,
  LandPlot,
  MapPin,
  Pill,
  ShoppingBag,
  UtensilsCrossed,
  Volleyball,
  type LucideIcon,
} from "lucide-react";
import type { PlaceCategoryValue } from "@/lib/places";
import { cn } from "@/lib/cn";

/*
 * One icon set, one stroke weight, one source of colour. Emoji were doing this job before,
 * but each platform draws its own — and their built-in colours fought the palette, which is
 * what made a row of categories look random.
 *
 * Colour classes are written out rather than built from the category name, because Tailwind
 * scans source text for complete class names and would not emit `text-cat-${category}`.
 */
export const CATEGORY_ICON: Record<PlaceCategoryValue, { Icon: LucideIcon; text: string; bg: string }> = {
  RESTAURANT: { Icon: UtensilsCrossed, text: "text-cat-restaurant", bg: "bg-cat-restaurant/10" },
  SHOP: { Icon: ShoppingBag, text: "text-cat-shop", bg: "bg-cat-shop/10" },
  PHARMACY: { Icon: Pill, text: "text-cat-pharmacy", bg: "bg-cat-pharmacy/10" },
  GAMING_ZONE: { Icon: Gamepad2, text: "text-cat-gaming", bg: "bg-cat-gaming/10" },
  PADEL_COURT: { Icon: Volleyball, text: "text-cat-padel", bg: "bg-cat-padel/10" },
  FOOTBALL_COURT: { Icon: LandPlot, text: "text-cat-football", bg: "bg-cat-football/10" },
  OTHER: { Icon: MapPin, text: "text-cat-other", bg: "bg-cat-other/10" },
};

const SIZES = {
  sm: { box: "size-8", icon: 16 },
  md: { box: "size-9", icon: 18 },
  lg: { box: "size-10", icon: 20 },
} as const;

/** Decorative: the category is always named in text beside it, so it is hidden from
 *  assistive tech rather than repeating the label. */
export default function CategoryIcon({
  category,
  size = "md",
  className,
}: {
  category: PlaceCategoryValue;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { Icon, text, bg } = CATEGORY_ICON[category];
  const { box, icon } = SIZES[size];

  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full", box, bg, text, className)}
      aria-hidden="true"
    >
      <Icon size={icon} strokeWidth={2} />
    </span>
  );
}
