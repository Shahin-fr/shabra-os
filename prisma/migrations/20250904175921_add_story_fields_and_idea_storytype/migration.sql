-- AlterTable
ALTER TABLE "public"."stories" ADD COLUMN     "customTitle" TEXT,
ADD COLUMN     "ideaId" TEXT,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "public"."story_ideas" ADD COLUMN     "storyType" TEXT NOT NULL DEFAULT 'تعامل با مخاطب';
