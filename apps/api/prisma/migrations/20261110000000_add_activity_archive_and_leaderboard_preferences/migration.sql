ALTER TABLE "User"
ADD COLUMN "leaderboardVisible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "shareStreak" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "notifyAchievement" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Task"
ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "Task_isArchived_idx" ON "Task"("isArchived");
