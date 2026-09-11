import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canEditPlace, productCreateSchema } from "@/lib/places";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  const place = await prisma.place.findUnique({
    where: { slug },
    select: { products: { orderBy: { createdAt: "desc" } } },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  return NextResponse.json({ products: place.products });
}

export async function POST(request: Request, { params }: Params) {
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
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const product = await prisma.product.create({ data: { ...parsed.data, placeId: place.id } });

  return NextResponse.json({ product }, { status: 201 });
}
