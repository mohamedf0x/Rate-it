-- Invariants Prisma can't express, kept in their own migration alongside
-- 20260911030000_review_constraints so the rules for a table live in one predictable place.

-- A follow points at exactly one target, same rule as reviews and photos.
ALTER TABLE "follows" ADD CONSTRAINT "follows_exactly_one_target" CHECK (
  (CASE WHEN "followedUserId" IS NULL THEN 0 ELSE 1 END)
  + (CASE WHEN "placeId" IS NULL THEN 0 ELSE 1 END) = 1
);

-- Following yourself would put your own reviews in your own feed.
ALTER TABLE "follows" ADD CONSTRAINT "follows_no_self_follow" CHECK (
  "followedUserId" IS NULL OR "followedUserId" <> "followerId"
);

-- Points are earned as positive amounts and spent as negative. A zero-amount row is the
-- deliberate record of an award that was withheld, so it has to say why.
ALTER TABLE "point_events" ADD CONSTRAINT "point_events_zero_needs_reason" CHECK (
  "amount" <> 0 OR "reason" IS NOT NULL
);

-- Severity is a 1-3 scale (DATA_MODEL.md).
ALTER TABLE "review_flags" ADD CONSTRAINT "review_flags_severity_range" CHECK (
  "severity" BETWEEN 1 AND 3
);

-- A reward's kind decides which of its optional columns are actually required: a BADGE
-- reward has to grant a badge, and the timed perks have to say how long they last.
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_badge_kind_has_badge" CHECK (
  ("kind" = 'BADGE') = ("badgeId" IS NOT NULL)
);

ALTER TABLE "rewards" ADD CONSTRAINT "rewards_timed_kind_has_duration" CHECK (
  "kind" NOT IN ('PROFILE_BOOST', 'PINNED_REVIEW') OR "durationDays" IS NOT NULL
);

ALTER TABLE "rewards" ADD CONSTRAINT "rewards_cost_non_negative" CHECK ("costPoints" >= 0);

-- A receipt records what was actually charged, which can never be negative.
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_cost_non_negative" CHECK ("costPoints" >= 0);
