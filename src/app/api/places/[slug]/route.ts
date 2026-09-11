import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canEditPlace, placeUpdateSchema } from "@/lib/places";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  const place = await prisma.place.findUnique({
    where: { slug },
    include: {
      rankTier: true,
      products: { orderBy: { createdAt: "desc" } },
      badges: { include: { badge: true } },
    },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  return NextResponse.json({ place });
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const place = await prisma.place.findUnique({ where: { slug }, select: { id: true, ownerId: true } });
  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }
  if (!canEditPlace(user, place)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = placeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.place.update({ where: { id: place.id }, data: parsed.data });

  return NextResponse.json({ place: updated });
}
