/*
  Warnings:

  - You are about to drop the column `type` on the `stories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."stories" DROP COLUMN "type",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "storyTypeId" TEXT,
ALTER COLUMN "day" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."story_types" ADD COLUMN     "icon" TEXT;

-- AddForeignKey
ALTER TABLE "public"."stories" ADD CONSTRAINT "stories_storyTypeId_fkey" FOREIGN KEY ("storyTypeId") REFERENCES "public"."story_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
