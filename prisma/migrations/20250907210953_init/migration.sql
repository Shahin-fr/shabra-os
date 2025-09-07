-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_stories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "notes" TEXT,
    "visualNotes" TEXT,
    "link" TEXT,
    "day" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "projectId" TEXT,
    "storyTypeId" TEXT,
    "storyIdeaId" TEXT,
    "customTitle" TEXT,
    "type" TEXT,
    "ideaId" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stories_storyTypeId_fkey" FOREIGN KEY ("storyTypeId") REFERENCES "story_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stories_storyIdeaId_fkey" FOREIGN KEY ("storyIdeaId") REFERENCES "story_ideas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stories_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_stories" ("authorId", "content", "createdAt", "customTitle", "day", "id", "ideaId", "link", "notes", "order", "projectId", "status", "storyIdeaId", "storyTypeId", "title", "type", "updatedAt", "visualNotes") SELECT "authorId", "content", "createdAt", "customTitle", "day", "id", "ideaId", "link", "notes", "order", "projectId", "status", "storyIdeaId", "storyTypeId", "title", "type", "updatedAt", "visualNotes" FROM "stories";
DROP TABLE "stories";
ALTER TABLE "new_stories" RENAME TO "stories";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
