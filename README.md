# Rate It

Yelp-style rating & review platform for places — shops, restaurants, pharmacies,
gaming zones, padel courts, football courts — and the specific products/services
inside them. Gamified on both sides: reviewers earn XP, ranks and badges; places and
products climb quality tiers and earn their own badges.

Standalone project, unrelated to any other repo.

## Stack
- Next.js (App Router) + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS

## Getting started
```bash
npm install
cp .env.example .env   # set DATABASE_URL
npm run db:generate
npm run db:migrate
npm run db:seed        # seeds RankTier ladders
npm run dev            # http://localhost:3200
```

## Docs
- [`DATA_MODEL.md`](./DATA_MODEL.md) — entities, relationships, and open questions
- [`prisma/schema.prisma`](./prisma/schema.prisma) — implemented schema
- [`src/lib/gamification.ts`](./src/lib/gamification.ts) — XP awards, rank/tier ladders
- [`deploy/README.md`](./deploy/README.md) — deploying alongside other apps on a shared, memory-constrained box
