-- AlterTable
ALTER TABLE "public"."stories" ADD COLUMN     "storyIdeaId" TEXT;

-- CreateTable
CREATE TABLE "public"."story_ideas" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "guidelines" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_ideas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."stories" ADD CONSTRAINT "stories_storyIdeaId_fkey" FOREIGN KEY ("storyIdeaId") REFERENCES "public"."story_ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
