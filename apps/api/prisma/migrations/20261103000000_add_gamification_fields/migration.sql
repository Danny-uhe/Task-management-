-- Add gamification fields to User table
-- streak: consecutive days active
-- points: total earned points

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "points" INTEGER NOT NULL DEFAULT 0;
