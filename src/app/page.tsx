export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Rate It</h1>
      <p className="mt-3 text-neutral-600">
        Rate shops, restaurants, pharmacies, gaming zones and courts — plus the
        specific products and services inside them. Earn XP, ranks and badges as a
        reviewer; places climb tiers as they earn genuine reviews.
      </p>
      <p className="mt-8 text-sm text-neutral-400">
        Scaffold stage — data model in <code>DATA_MODEL.md</code>, schema in{" "}
        <code>prisma/schema.prisma</code>.
      </p>
    </main>
  );
}
