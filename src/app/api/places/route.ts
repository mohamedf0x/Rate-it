import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PLACE_CATEGORIES, placeCreateSchema } from "@/lib/places";
import { uniquePlaceSlug } from "@/lib/slug";

const listQuerySchema = z.object({
  category: z.enum(PLACE_CATEGORIES).optional(),
  city: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  take: z.coerce.number().int().min(1).max(50).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { category, city, q, take, skip } = parsed.data;

  const where = {
    ...(category ? { category } : {}),
    ...(city ? { city: { equals: city, mode: "insensitive" as const } } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [places, total] = await Promise.all([
    prisma.place.findMany({
      where,
      orderBy: [{ qualityScore: "desc" }, { createdAt: "desc" }],
      take,
      skip,
      include: { rankTier: true },
    }),
    prisma.place.count({ where }),
  ]);

  return NextResponse.json({ places, total });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = placeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const unratedTier = await prisma.rankTier.findUnique({
    where: { scope_order: { scope: "PLACE", order: 1 } },
    select: { id: true },
  });

  const place = await prisma.place.create({
    data: {
      ...parsed.data,
      slug: await uniquePlaceSlug(parsed.data.name),
      rankTierId: unratedTier?.id,
    },
  });

  return NextResponse.json({ place }, { status: 201 });
}
