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
Review ──1:1── OwnerResponse (the place owner's public reply)

User ──1:N── PointEvent          (spendable currency ledger)
User ──1:N── Redemption ──N:1── Reward
User ──1:N── UserPerk            (timed profile perks)
User ──1:1── Subscription
User ──1:N── Follow ──N:1── User | Place  (exactly one target)
User ──1:N── Notification

Reward ──1:N── Redemption ──1:1── ReviewPin | UserPerk
Review ──1:N── ReviewFlag        (suspicious-pattern records)
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

### OwnerResponse
A place owner's public reply to a review — the Google/Yelp model. Owners answer reviews,
they never remove them, so the platform keeps its integrity while the business gets a voice.
- `id, reviewId (unique), authorId, body, createdAt, editedAt?`
- One reply per review, editable. The author must own the reviewed place (or the place the
  reviewed product belongs to) — checked at the application layer.

## Points, rewards & subscriptions

### PointEvent (append-only ledger)
The spendable currency, deliberately separate from XP. **XP measures activity** and is
granted on every review; **points have value**, so they only land when a review clears the
quality gates in `POINT_RULES`. Withheld awards are still written here with `amount = 0` and
a `reason`, so a reviewer can always be told why a review earned nothing.
- `id, userId, type, amount, reason?, refType, refId, createdAt`
- `type`: `REVIEW_WRITTEN | FIRST_TO_REVIEW | FIRST_TO_ADD_PLACE | REVIEW_GOT_UPVOTED | REDEMPTION | ADMIN_ADJUSTMENT`
- `ReviewerStats.pointsBalance` = `sum(amount)`; `pointsLifetime` = `sum(amount > 0)`, so
  spending points never costs a badge that was already earned.

### Reward / Redemption
`Reward` is the catalog of what points buy; `Redemption` is one purchase.
- `Reward`: `id, code, kind, title, description, costPoints, badgeId?, placeId?, durationDays?, stock?, startsAt?, endsAt?, active`
- `kind`: `BADGE | PROFILE_BOOST | PINNED_REVIEW | COUPON`
- `COUPON` + `placeId` exist so a real discounts programme can be switched on later without a
  migration. **No partnership is assumed** — rows stay `active = false` until an admin enables them.
- `Redemption`: `id, userId, rewardId, costPoints, status, code?, expiresAt, createdAt`
- `costPoints` is copied onto the redemption rather than read back from the reward, because
  catalog prices change and a receipt must not. Rewards are deactivated, never deleted.

### ReviewPin / UserPerk
What a redemption actually grants.
- `ReviewPin`: `reviewId, placeId, redemptionId (unique), endsAt` — a bought slot at the top
  of a place's review list. Expiry is read from `endsAt` at query time, so a lapsed pin needs
  no cleanup job to stop showing. A place owner can report a pinned review but cannot remove it.
- `UserPerk`: `userId, kind (PROFILE_BOOST | EXCLUSIVE_FRAME), redemptionId?, endsAt` —
  `redemptionId` is optional so an admin can grant a perk directly.

### Follow / Notification
- `Follow`: `id, followerId, followedUserId? | placeId?, createdAt` — exactly one target,
  and no self-follows (both enforced by DB check constraints).
- The personalized feed is a **query over follows**, not a stored table. That is cheap enough
  for the foreseeable row counts and keeps the write path simple; a materialized feed is a
  later optimization, not a starting position.
- `Notification`: `id, userId, type, actorId?, placeId?, reviewId?, readAt?, createdAt`

### Subscription
- `id, userId (unique), plan (FREE | PREMIUM), status, provider?, providerRef?, currentPeriodEnd?, cancelAtPeriodEnd, createdAt`
- Premium perks (profile frame, review visibility, photo limits, analytics) are all derived
  from `status` at request time, so they need no columns of their own.
- `provider` is `"mock"` until a real processor is connected. Payments are deliberately not
  enabled at launch: the tier gets built, but stays free/waitlist until there's a user base.

### ReviewFlag
Records a suspicious pattern for human review. Flagging **withholds points**; it never hides
the review or blocks the account on its own.
- `id, reviewId, rule, severity (1-3), status (OPEN | CLEARED | CONFIRMED), createdAt`
- unique on `(reviewId, rule)`, so re-running detection doesn't pile up duplicates.

## Cached rollups & consistency

`avgRating`/`reviewCount`/`xp`/`level`/`pointsBalance` are all *cached* fields recomputed by
application logic on write (new review, vote, removal) rather than computed live on
every read — this keeps list/browse pages cheap. `XpEvent` and `PointEvent` are the sources
of truth, so `npm run db:resync` can rebuild every cache from them after tuning
`src/lib/gamification.ts` or if a cache is ever suspected to drift.

Point balances are allowed to be recomputed negative: a clawback (`ADMIN_ADJUSTMENT`) may
exceed what's left. Overdraw is prevented on the *spend* path instead, which checks the
balance inside the same transaction that writes the negative event.

## Settled
- Points are called "نقاط" and are **earn-only** — never purchasable with money. Selling them
  would undercut the incentive to write a good review and drags in payment/regulatory
  complexity for no gain.
- A place owner can reply to and report a review, but never remove one — including pinned
  reviews. Removal rights would cost the platform its credibility, which is the product.
- XP amounts and point amounts are tunable constants in `src/lib/gamification.ts` rather than
  DB rows, because the right numbers aren't knowable before real usage and `db:resync`
  replays every cache after a change.

## Open questions for next pass
- Anti-abuse for votes specifically (no self-voting is enforced; vote-ring detection is not).
- Whether `SkillListing` reviews need a different trust model than place reviews
  (person-to-person reputation vs. venue reputation).
- Whether the feed needs materializing — revisit when follows-per-user or review volume
  makes the live query slow, not before.
