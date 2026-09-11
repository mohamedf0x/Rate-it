// Central config for the game layer. Kept as plain constants (not DB rows) for the
// numbers that are cheap to tune in code; RankTier rows in the DB mirror these at
// seed time so they're still queryable/joinable from Place/ReviewerStats.

export const XP_AWARDS = {
  REVIEW_WRITTEN: 10,
  FIRST_TO_REVIEW: 25,
  REVIEW_GOT_UPVOTED: 5,
  PROFILE_COMPLETED: 15,
  SKILL_LISTED: 20,
  STREAK_BONUS: 10,
} as const;

export const REVIEWER_RANKS = [
  { order: 1, name: "Newcomer", minScore: 0 },
  { order: 2, name: "Regular", minScore: 100 },
  { order: 3, name: "Trusted Voice", minScore: 500 },
  { order: 4, name: "Local Expert", minScore: 1500 },
  { order: 5, name: "Legend", minScore: 5000 },
] as const;

// Place/product tiers key off a quality score, not raw XP: a function of avgRating
// and reviewCount so a single 5-star review can't outrank a place with hundreds.
export const PLACE_TIERS = [
  { order: 1, name: "Unrated", minScore: 0 },
  { order: 2, name: "Rising", minScore: 50 },
  { order: 3, name: "Popular", minScore: 200 },
  { order: 4, name: "Top Rated", minScore: 500 },
  { order: 5, name: "Iconic", minScore: 1500 },
] as const;

// Badge catalog. Names/descriptions here are the canonical English copy stored in the DB;
// the UI translates them by code. Awards are additive — a badge is never taken back.
export const REVIEWER_BADGES = [
  {
    code: "FIRST_REVIEW",
    name: "First Review",
    description: "Wrote their first review",
    icon: "✍️",
    criteria: "Write 1 review",
  },
  {
    code: "REVIEWER_10",
    name: "Regular Reviewer",
    description: "Wrote 10 reviews",
    icon: "📝",
    criteria: "Write 10 reviews",
  },
  {
    code: "REVIEWER_50",
    name: "Review Machine",
    description: "Wrote 50 reviews",
    icon: "🏅",
    criteria: "Write 50 reviews",
  },
  {
    code: "PIONEER_5",
    name: "Pioneer",
    description: "First to review 5 different places",
    icon: "🧭",
    criteria: "Be first to review 5 targets",
  },
  {
    code: "HELPFUL_10",
    name: "Trusted Reviewer",
    description: "Received 10 helpful votes",
    icon: "👍",
    criteria: "Receive 10 helpful votes",
  },
] as const;

export const PLACE_BADGES = [
  {
    code: "RISING_STAR",
    name: "Rising Star",
    description: "Climbed out of the unrated tier",
    icon: "🌟",
    criteria: "Reach the Rising tier",
  },
  {
    code: "TOP_RATED",
    name: "Top Rated",
    description: "Reached the Top Rated tier",
    icon: "🏆",
    criteria: "Reach the Top Rated tier",
  },
  {
    code: "CROWD_FAVORITE",
    name: "Crowd Favourite",
    description: "Collected 25 reviews",
    icon: "🔥",
    criteria: "Collect 25 reviews",
  },
] as const;

export function earnedReviewerBadges(stats: {
  reviewCount: number;
  firstReviewCount: number;
  helpfulVotesReceived: number;
}): string[] {
  const codes: string[] = [];
  if (stats.reviewCount >= 1) codes.push("FIRST_REVIEW");
  if (stats.reviewCount >= 10) codes.push("REVIEWER_10");
  if (stats.reviewCount >= 50) codes.push("REVIEWER_50");
  if (stats.firstReviewCount >= 5) codes.push("PIONEER_5");
  if (stats.helpfulVotesReceived >= 10) codes.push("HELPFUL_10");
  return codes;
}

export function earnedPlaceBadges(place: {
  reviewCount: number;
  tierOrder: number;
}): string[] {
  const codes: string[] = [];
  if (place.tierOrder >= 2) codes.push("RISING_STAR");
  if (place.tierOrder >= 4) codes.push("TOP_RATED");
  if (place.reviewCount >= 25) codes.push("CROWD_FAVORITE");
  return codes;
}

/** avgRating in [0,5], reviewCount >= 0 — favors both quality and volume, capped so
 * a handful of 5-star reviews can't jump straight to the top tier. */
export function computePlaceQualityScore(avgRating: number, reviewCount: number): number {
  const volumeWeight = Math.min(reviewCount, 300);
  return Math.round(avgRating * 20 * Math.sqrt(volumeWeight));
}

export function rankForScore(
  ladder: readonly { order: number; name: string; minScore: number }[],
  score: number,
) {
  return [...ladder].reverse().find((tier) => score >= tier.minScore) ?? ladder[0];
}
