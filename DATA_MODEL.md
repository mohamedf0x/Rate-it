# Rate It — Data Model

Yelp-style ratings/reviews for places (and the products/services inside them), with a
gamification layer on both sides: places/products earn tiers & badges from review
quality/volume, and reviewers earn XP, ranks, and badges from their activity.

## Entity overview

```
User ──1:1── ReviewerStats
User ──1:N── Review
User ──1:N── UserBadge ──N:1── Badge
User ──1:N── XpEvent
User ──1:N── SkillListing (a reviewer's own personal skills/services)

Place ──1:N── ProductOrService
Place ──1:N── Review (place-level reviews)
Place ──1:N── PlaceBadge ──N:1── Badge
Place ──1:N── Photo

ProductOrService ──1:N── Review (item-level reviews)
SkillListing ──1:N── Review (reviews of a reviewer's personal skill/service)

Review ──1:N── ReviewVote (helpful/unhelpful)
Review ──1:N── Photo
Review ──N:1── User (author)
Review ──N:1── Place | ProductOrService | SkillListing  (exactly one target)
```

## Core entities

### User
Authentication + identity only. Gamification stats live in `ReviewerStats` so auth
concerns stay separate from the game layer.
- `id, email, username, passwordHash, displayName, avatarUrl, bio`
- `role`: `USER | BUSINESS_OWNER | ADMIN`
- `createdAt`

### ReviewerStats (1:1 with User)
The reviewer-side game state. Kept as its own table (not columns on `User`) so it can
be recomputed/replayed from `XpEvent` without touching auth data.
- `userId`
- `xp` (int, cached total — always equal to `sum(XpEvent.amount)` for that user)
- `level` (derived from `xp` via `RankTier` thresholds, cached for cheap reads)
- `rankTierId` → `RankTier`
- `reviewCount, firstReviewCount, helpfulVotesReceived, currentStreak, longestStreak`
- `updatedAt`

### XpEvent (append-only ledger)
Every XP change is a row here; `ReviewerStats.xp` is a materialized sum. This gives
an audit trail and makes anti-abuse/rollback possible (e.g. a review gets deleted →
insert a negative `REVIEW_REMOVED` event instead of mutating history).
- `id, userId, type, amount, refType, refId, createdAt`
- `type` enum: `REVIEW_WRITTEN | FIRST_TO_REVIEW | REVIEW_GOT_UPVOTED | REVIEW_REMOVED | PROFILE_COMPLETED | SKILL_LISTED | STREAK_BONUS | ADMIN_ADJUSTMENT`

### RankTier
Shared lookup table for both reviewer ranks and place/product tiers (`scope` tells
them apart), so the ladder is data-driven and editable without a code deploy.
- `id, scope (REVIEWER | PLACE), name, order, minScore, icon, color`
- Reviewer scope thresholds key off `xp`; place scope thresholds key off a computed
  quality score (see `Place.qualityScore` below).

### Badge (catalog) / UserBadge / PlaceBadge
- `Badge`: `id, code, name, description, icon, scope (REVIEWER | PLACE), criteria` —
  `criteria` is a human-readable description; the actual award logic lives in code
  (a small rules engine), not in the DB.
- `UserBadge` / `PlaceBadge`: join tables with `awardedAt`, unique on (owner, badge).

### Place
- `id, slug, name, category, description`
- `category` enum: `RESTAURANT | SHOP | PHARMACY | GAMING_ZONE | PADEL_COURT | FOOTBALL_COURT | OTHER`
- `address, city, lat, lng, phone, website`
- `ownerId?` → `User` (claimed business account, optional)
- `avgRating, reviewCount, qualityScore, rankTierId` — cached rollups, recomputed
  whenever a review lands (avoid an aggregate query on every page view)
- `createdAt`

### ProductOrService
A specific item or service *inside* a place — the "name something and rate it"
feature (e.g. "Chicken Shawarma" at a restaurant, "Court 2" at a padel venue).
- `id, placeId, name, description, category?`
- `avgRating, reviewCount` — cached rollups
- `createdAt`

### SkillListing
A reviewer's own personal skill or service they offer (separate from a `Place` —
this is person-to-person, not a venue). Lets a reviewer be recognized/reviewed for
something they're good at, independent of the places they review.
- `id, userId, title, description, category`
- `avgRating, reviewCount` — cached rollups
- `verified` (bool — future: light verification flag)

### Review
Polymorphic target: exactly one of `placeId`, `productId`, `skillListingId` is set
(enforced at the application layer + a DB check constraint).
- `id, authorId, placeId?, productId?, skillListingId?`
- `rating (1-5), title?, body, isFirstReview (bool)`
- `helpfulCount, unhelpfulCount` — cached rollups
- `status`: `PUBLISHED | FLAGGED | REMOVED`
- `createdAt, editedAt?`

### ReviewVote
- `id, reviewId, userId, type (HELPFUL | UNHELPFUL)`
- unique on `(reviewId, userId)` — one vote per user per review

### Photo
- `id, url, reviewId? | placeId? | productId?` (polymorphic, same rule as Review)

## Cached rollups & consistency

`avgRating`/`reviewCount`/`xp`/`level` are all *cached* fields recomputed by
application logic on write (new review, vote, removal) rather than computed live on
every read — this keeps list/browse pages cheap. `XpEvent` is the source of truth for
XP so stats can be rebuilt if a cache ever drifts.

## Open questions for next pass
- Exact XP amounts per event type and rank/tier thresholds (numbers TBD — should be
  tunable, not hardcoded, so likely a seed-time config rather than magic numbers).
- Anti-abuse for votes/first-review claims (e.g. rate limiting, no self-voting).
- Whether `SkillListing` reviews need a different trust model than place reviews
  (person-to-person reputation vs. venue reputation).
