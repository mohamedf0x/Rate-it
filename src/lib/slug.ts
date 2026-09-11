import { prisma } from "@/lib/prisma";

/** Keeps Arabic and Latin word characters, turns everything else into hyphens. */
export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{Script=Arabic}\p{Script=Latin}0-9]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || "place";
}

/** Page-route params arrive percent-encoded (route handlers get them decoded), so Arabic
 * slugs reach a page as "%D9%85..." and have to be decoded before hitting the database. */
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/** Appends a counter until the slug is free. */
export async function uniquePlaceSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;

  while (await prisma.place.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}
