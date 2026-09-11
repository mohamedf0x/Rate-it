import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createReview, ReviewError, reviewCreateSchema } from "@/lib/reviews";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const review = await createReview(parsed.data, user.id);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof ReviewError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
