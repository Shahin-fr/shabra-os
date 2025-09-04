-- DropIndex
DROP INDEX "public"."stories_day_idx";

-- DropIndex
DROP INDEX "public"."stories_projectId_idx";

-- AlterTable
ALTER TABLE "public"."stories" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
