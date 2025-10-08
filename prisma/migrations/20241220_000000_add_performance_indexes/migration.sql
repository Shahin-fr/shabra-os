-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_tasks_project_status_priority" ON "tasks"("projectId", "status", "priority");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_tasks_assigned_status" ON "tasks"("assignedTo", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_tasks_due_status" ON "tasks"("dueDate", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_tasks_created_status" ON "tasks"("createdBy", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_tasks_status_priority_due" ON "tasks"("status", "priority", "dueDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_tasks_created_at" ON "tasks"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_stories_project_day_status" ON "stories"("projectId", "day", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_stories_type_day" ON "stories"("storyTypeId", "day");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_stories_author_day" ON "stories"("authorId", "day");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_stories_day_status" ON "stories"("day", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_stories_status_created" ON "stories"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_stories_created_at" ON "stories"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_meetings_creator_start" ON "meetings"("creatorId", "startTime");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_meetings_start_end" ON "meetings"("startTime", "endTime");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_meetings_type_status" ON "meetings"("type", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_meetings_status_start" ON "meetings"("status", "startTime");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_meetings_created_at" ON "meetings"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_leave_requests_user_status" ON "leave_requests"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_leave_requests_status_start" ON "leave_requests"("status", "startDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_leave_requests_reviewer_status" ON "leave_requests"("reviewedBy", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_leave_requests_type_status" ON "leave_requests"("leaveType", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_leave_requests_created_at" ON "leave_requests"("createdAt");
