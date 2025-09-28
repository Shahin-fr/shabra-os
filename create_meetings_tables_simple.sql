-- Create meeting-related tables with simple TEXT columns
CREATE TABLE meetings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    type TEXT NOT NULL DEFAULT 'ONE_ON_ONE',
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE meeting_attendees (
    id TEXT PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("meetingId", "userId")
);

CREATE TABLE talking_points (
    id TEXT PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    content TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE action_items (
    id TEXT PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    content TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "relatedTaskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes
CREATE INDEX "meetings_creatorId_idx" ON meetings("creatorId");
CREATE INDEX "meetings_startTime_idx" ON meetings("startTime");
CREATE INDEX "meetings_endTime_idx" ON meetings("endTime");
CREATE INDEX "meetings_type_idx" ON meetings(type);
CREATE INDEX "meetings_status_idx" ON meetings(status);

CREATE INDEX "meeting_attendees_meetingId_idx" ON meeting_attendees("meetingId");
CREATE INDEX "meeting_attendees_userId_idx" ON meeting_attendees("userId");

CREATE INDEX "talking_points_meetingId_idx" ON talking_points("meetingId");
CREATE INDEX "talking_points_addedById_idx" ON talking_points("addedById");

CREATE INDEX "action_items_meetingId_idx" ON action_items("meetingId");
CREATE INDEX "action_items_assigneeId_idx" ON action_items("assigneeId");
CREATE INDEX "action_items_relatedTaskId_idx" ON action_items("relatedTaskId");

-- Add foreign key constraints
ALTER TABLE meetings ADD CONSTRAINT "meetings_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE meeting_attendees ADD CONSTRAINT "meeting_attendees_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES meetings(id) ON DELETE CASCADE;
ALTER TABLE meeting_attendees ADD CONSTRAINT "meeting_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE talking_points ADD CONSTRAINT "talking_points_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES meetings(id) ON DELETE CASCADE;
ALTER TABLE talking_points ADD CONSTRAINT "talking_points_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE action_items ADD CONSTRAINT "action_items_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES meetings(id) ON DELETE CASCADE;
ALTER TABLE action_items ADD CONSTRAINT "action_items_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES users(id) ON DELETE CASCADE;
