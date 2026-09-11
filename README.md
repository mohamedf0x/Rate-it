# Rate It

Yelp-style rating & review platform for places — shops, restaurants, pharmacies,
gaming zones, padel courts, football courts — and the specific products/services
inside them. Gamified on both sides: reviewers earn XP, ranks and badges; places and
products climb quality tiers and earn their own badges.

Standalone project, unrelated to any other repo.

Arabic is the default language (RTL); a header button switches to English.

## Stack
- Next.js (App Router) + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS
- Leaflet + OpenStreetMap tiles for the places map (no API key; tiles are
  fetched by the visitor's browser, so they add no load to the server)

## Getting started
```bash
npm install
cp .env.example .env   # set DATABASE_URL
npm run db:generate
npm run db:migrate
npm run db:seed        # seeds RankTier ladders and the badge catalog
npm run dev            # http://localhost:3200
```

`npm run db:resync` replays cached game state (reviewer stats, badges, place
rollups and tiers) from the source rows — run it after tuning any numbers in
`src/lib/gamification.ts`.

## Docs
- [`DATA_MODEL.md`](./DATA_MODEL.md) — entities, relationships, and open questions
- [`prisma/schema.prisma`](./prisma/schema.prisma) — implemented schema
- [`src/lib/gamification.ts`](./src/lib/gamification.ts) — XP awards, rank/tier ladders
- [`deploy/README.md`](./deploy/README.md) — deploying alongside other apps on a shared, memory-constrained box
