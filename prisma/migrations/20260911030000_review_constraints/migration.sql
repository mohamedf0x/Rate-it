-- One review per user per target. Postgres treats NULLs as distinct, so a user can still
-- review many products/skills while holding at most one review per individual target.
CREATE UNIQUE INDEX "reviews_authorId_placeId_key" ON "reviews"("authorId", "placeId");

CREATE UNIQUE INDEX "reviews_authorId_productId_key" ON "reviews"("authorId", "productId");

CREATE UNIQUE INDEX "reviews_authorId_skillListingId_key" ON "reviews"("authorId", "skillListingId");

-- A review points at exactly one target (DATA_MODEL.md); Prisma can't express this, so it
-- lives here to stop a bad write from ever landing.
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_exactly_one_target" CHECK (
  (CASE WHEN "placeId" IS NULL THEN 0 ELSE 1 END)
  + (CASE WHEN "productId" IS NULL THEN 0 ELSE 1 END)
  + (CASE WHEN "skillListingId" IS NULL THEN 0 ELSE 1 END) = 1
);

-- Same rule for photos, which are polymorphic in the same way but may also be unattached.
ALTER TABLE "photos" ADD CONSTRAINT "photos_at_most_one_target" CHECK (
  (CASE WHEN "placeId" IS NULL THEN 0 ELSE 1 END)
  + (CASE WHEN "productId" IS NULL THEN 0 ELSE 1 END)
  + (CASE WHEN "reviewId" IS NULL THEN 0 ELSE 1 END) <= 1
);
