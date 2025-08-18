/*
  Warnings:

  - You are about to drop the column `caption` on the `stories` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_stories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "visualNotes" TEXT,
    "link" TEXT,
    "day" DATETIME NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "projectId" TEXT,
    "storyTypeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stories_storyTypeId_fkey" FOREIGN KEY ("storyTypeId") REFERENCES "story_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_stories" ("createdAt", "day", "id", "link", "notes", "order", "projectId", "status", "storyTypeId", "title", "updatedAt", "visualNotes") SELECT "createdAt", "day", "id", "link", "notes", "order", "projectId", "status", "storyTypeId", "title", "updatedAt", "visualNotes" FROM "stories";
DROP TABLE "stories";
ALTER TABLE "new_stories" RENAME TO "stories";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
