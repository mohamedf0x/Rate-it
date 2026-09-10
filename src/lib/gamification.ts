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
