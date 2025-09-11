-- CreateTable
CREATE TABLE "public"."tracked_instagram_pages" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracked_instagram_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instagram_reels" (
    "id" SERIAL NOT NULL,
    "postUrl" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "pageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instagram_reels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tracked_instagram_pages_username_key" ON "public"."tracked_instagram_pages"("username");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_reels_postUrl_key" ON "public"."instagram_reels"("postUrl");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_reels_shortCode_key" ON "public"."instagram_reels"("shortCode");

-- AddForeignKey
ALTER TABLE "public"."instagram_reels" ADD CONSTRAINT "instagram_reels_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."tracked_instagram_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
