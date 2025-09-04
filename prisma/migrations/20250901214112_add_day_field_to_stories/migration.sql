/*
  Warnings:

  - Added the required column `day` to the `stories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."stories" ADD COLUMN     "day" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "stories_day_idx" ON "public"."stories"("day");

-- CreateIndex
CREATE INDEX "stories_projectId_idx" ON "public"."stories"("projectId");
