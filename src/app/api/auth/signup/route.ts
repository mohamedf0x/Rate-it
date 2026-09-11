import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";

const signupSchema = z.object({
  email: z.string().trim().email(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  password: z.string().min(8).max(72),
  displayName: z.string().trim().min(1).max(60),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { email, username, password, displayName } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    const field = existing.email === email ? "email" : "username";
    return NextResponse.json({ error: `This ${field} is already taken` }, { status: 409 });
  }

  const newcomerTier = await prisma.rankTier.findUnique({
    where: { scope_order: { scope: "REVIEWER", order: 1 } },
  });

  const user = await prisma.user.create({
    data: {
      email,
      username,
      displayName,
      passwordHash: hashPassword(password),
      stats: { create: { rankTierId: newcomerTier?.id } },
    },
    select: { id: true, email: true, username: true, displayName: true },
  });

  await createSession(user.id);

  return NextResponse.json({ user }, { status: 201 });
}
