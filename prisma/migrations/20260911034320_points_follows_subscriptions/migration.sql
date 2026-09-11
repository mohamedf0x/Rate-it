-- CreateEnum
CREATE TYPE "PointEventType" AS ENUM ('REVIEW_WRITTEN', 'FIRST_TO_REVIEW', 'FIRST_TO_ADD_PLACE', 'REVIEW_GOT_UPVOTED', 'REDEMPTION', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "RewardKind" AS ENUM ('BADGE', 'PROFILE_BOOST', 'PINNED_REVIEW', 'COUPON');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'FULFILLED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PerkKind" AS ENUM ('PROFILE_BOOST', 'EXCLUSIVE_FRAME');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_REVIEW_ON_FOLLOWED_PLACE', 'FOLLOWED_USER_REVIEWED', 'NEW_FOLLOWER', 'REVIEW_GOT_HELPFUL', 'POINTS_EARNED', 'REWARD_READY', 'BADGE_EARNED', 'OWNER_RESPONDED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('OPEN', 'CLEARED', 'CONFIRMED');

-- AlterTable
ALTER TABLE "reviewer_stats" ADD COLUMN     "pointsBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsLifetime" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "point_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PointEventType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "refType" TEXT,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "kind" "RewardKind" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "costPoints" INTEGER NOT NULL,
    "badgeId" TEXT,
    "placeId" TEXT,
    "durationDays" INTEGER,
    "stock" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redemptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "costPoints" INTEGER NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "code" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_pins" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "redemptionId" TEXT NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_perks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "PerkKind" NOT NULL,
    "redemptionId" TEXT,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_perks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followedUserId" TEXT,
    "placeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "actorId" TEXT,
    "placeId" TEXT,
    "reviewId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" TEXT,
    "providerRef" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_flags" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "status" "FlagStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_responses" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "owner_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "point_events_userId_createdAt_idx" ON "point_events"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "rewards_code_key" ON "rewards"("code");

-- CreateIndex
CREATE INDEX "rewards_active_kind_idx" ON "rewards"("active", "kind");

-- CreateIndex
CREATE INDEX "rewards_placeId_idx" ON "rewards"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "redemptions_code_key" ON "redemptions"("code");

-- CreateIndex
CREATE INDEX "redemptions_userId_createdAt_idx" ON "redemptions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "redemptions_rewardId_idx" ON "redemptions"("rewardId");

-- CreateIndex
CREATE UNIQUE INDEX "review_pins_redemptionId_key" ON "review_pins"("redemptionId");

-- CreateIndex
CREATE INDEX "review_pins_placeId_endsAt_idx" ON "review_pins"("placeId", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "review_pins_placeId_reviewId_key" ON "review_pins"("placeId", "reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "user_perks_redemptionId_key" ON "user_perks"("redemptionId");

-- CreateIndex
CREATE INDEX "user_perks_userId_endsAt_idx" ON "user_perks"("userId", "endsAt");

-- CreateIndex
CREATE INDEX "follows_followedUserId_idx" ON "follows"("followedUserId");

-- CreateIndex
CREATE INDEX "follows_placeId_idx" ON "follows"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "follows_followerId_followedUserId_key" ON "follows"("followerId", "followedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "follows_followerId_placeId_key" ON "follows"("followerId", "placeId");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON "notifications"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "review_flags_status_createdAt_idx" ON "review_flags"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "review_flags_reviewId_rule_key" ON "review_flags"("reviewId", "rule");

-- CreateIndex
CREATE UNIQUE INDEX "owner_responses_reviewId_key" ON "owner_responses"("reviewId");

-- CreateIndex
CREATE INDEX "owner_responses_authorId_idx" ON "owner_responses"("authorId");

-- AddForeignKey
ALTER TABLE "point_events" ADD CONSTRAINT "point_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_pins" ADD CONSTRAINT "review_pins_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_pins" ADD CONSTRAINT "review_pins_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_pins" ADD CONSTRAINT "review_pins_redemptionId_fkey" FOREIGN KEY ("redemptionId") REFERENCES "redemptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_perks" ADD CONSTRAINT "user_perks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_perks" ADD CONSTRAINT "user_perks_redemptionId_fkey" FOREIGN KEY ("redemptionId") REFERENCES "redemptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followedUserId_fkey" FOREIGN KEY ("followedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_flags" ADD CONSTRAINT "review_flags_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_responses" ADD CONSTRAINT "owner_responses_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_responses" ADD CONSTRAINT "owner_responses_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
