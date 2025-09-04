-- AlterTable
ALTER TABLE "public"."content_slots" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'STORY',
ALTER COLUMN "updatedAt" DROP DEFAULT;
