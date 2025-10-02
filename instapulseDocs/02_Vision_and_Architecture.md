# Phase 1: Vision & Architecture Design

**Document Version:** 1.0
**Date:** 2025-09-11
**Status:** Finalized

## 1. Project Vision: InstaPulse

### 1.1. The "Why"
The primary goal of InstaPulse is to provide our content and strategy teams with a data-driven tool for identifying viral Instagram Reels. By automating the discovery of high-performing content, we aim to reduce manual research time and enhance our content strategy with actionable, timely insights.

### 1.2. The "What" (Core Features for v1.0)
- **Page Management:** Users can add, view, and remove a list of Instagram pages to be tracked.
- **Automated Data Collection:** The system will automatically fetch new Reels and their view counts from the tracked pages on a daily basis.
- **Follower Count Tracking:** The system will also update the follower count for each tracked page to enable engagement analysis.
- **Viral Content Dashboard:** A dedicated page within our platform will display the top-performing Reels based on various metrics, including a calculated "virality score" (view-to-follower ratio).
- **Historical Data Access:** Users will be able to filter and view trending Reels from previous days, weeks, or custom date ranges.

### 1.3. The "Who" (Target Users)
- Content Managers
- Marketing Strategists
- Social Media Teams

### 1.4. Out of Scope (for v1.0)
- Tracking of static posts, stories, or carousels.
- Analysis of likes, comments, or shares.
- AI-based content analysis (e.g., topic detection).
- Real-time notifications.

## 2. System Architecture

To achieve a cost-effective, scalable, and maintainable solution, we will adopt a decoupled architecture leveraging our existing Next.js platform and a self-hosted n8n instance for workflow automation.

### 2.1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph "Self-Hosted n8n Server"
        N1[Cron Trigger: Daily]
        N2[HTTP Request: Get Tracked Pages]
        N3[Loop Over Pages Node]
        N4[HTTP Request: Call Apify for one page]
        N5[IF Node: Check Success]
        N6[HTTP Request: Save Results via API]
        N7[Error Handling]

        N1 --> N2
        N2 --> N3
        N3 --"For each page"--> N4
        N4 --> N5
        N5 --"Success"--> N6
        N5 --"Failure"--> N7
    end

    subgraph "Next.js Platform (Vercel)"
        A[React Frontend - InstaPulse Page]
        B["API: /api/instapulse/pages"]
        C["API: /api/instapulse/reels"]
        D["API: /api/instapulse/save-result"]
        E[(PostgreSQL Database)]
    end

    subgraph "External Services"
        F[Apify API]
    end

    %% n8n Workflow Connections
    N2 -- "GET /api/instapulse/pages" --> B
    N4 -- "Calls Apify API" --> F
    N6 -- "POST /api/instapulse/save-result" --> D

    %% User Flow Connections
    A -- "Manages pages & views Reels" --> B & C
    B & C & D -- "Interact with DB" --> E
````

### 2.2. Component Responsibilities

- **n8n Instance (The Orchestrator):** An **n8n** instance (Cloud or self-hosted) will be responsible for the entire data collection workflow.
    
- **Next.js Backend (The Data Layer):** Our existing application's backend will expose a set of simple, stateless API endpoints for:
    
    - Managing the list of tracked pages (CRUD operations).
        
    - Serving the collected Reels data to the frontend with filtering and sorting.
        
    - Receiving and saving the processed data from the n8n workflow.
        
- **Next.js Frontend (The User Interface):** A new page will be developed to provide the user-facing dashboard, allowing users to interact with the collected data and manage the list of tracked pages.
    
- **PostgreSQL Database (The State):** The single source of truth for our application. It will store the list of tracked pages and all the collected Reels data.
    

## 3. Data Schema (Prisma)

The following models will be added to our schema.prisma file.

codePrisma

```
// in schema.prisma

model TrackedInstagramPage {
  id            Int      @id @default(autoincrement())
  username      String   @unique
  profileUrl    String
  followerCount Int      @default(0)
  status        String   @default("ACTIVE") // e.g., ACTIVE, FAILED_LAST_CHECK
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  reels         InstagramReel[]

  @@map("tracked_instagram_pages")
}

model InstagramReel {
  id              Int      @id @default(autoincrement())
  postUrl         String   @unique
  shortCode       String   @unique
  thumbnailUrl    String?
  viewCount       Int      @default(0)
  publishedAt     DateTime
  
  pageId          Int
  trackedPage     TrackedInstagramPage @relation(fields: [pageId], references: [id], onDelete: Cascade)

  createdAt       DateTime @default(now())

  @@map("instagram_reels")
}
```

## 4. Database & Indexing Strategy

To ensure fast query performance on the instagram_reels table, especially for the main dashboard which queries recent and high-performing content, the following indexing strategy will be implemented:

1. **Primary Performance Index:** A composite B-Tree index will be created to optimize for the most common query: fetching recent, viral Reels.
    
    codeSQL
    
```
    CREATE INDEX idx_reels_viral_perf ON instagram_reels (publishedAt DESC, viewCount DESC);
```
    
2. **Foreign Key Index:** Prisma automatically creates an index on the pageId foreign key, which is sufficient for queries related to a specific page.
    
3. **Fillfactor Optimization:** For append-only data like ours, setting fillfactor to 100 on indexes can slightly improve performance and storage efficiency.
    

## 5. API Endpoint Design

The following RESTful API endpoints will be created within the Next.js app router.

- **GET /api/instapulse/pages**
    
    - **Description:** Fetches the list of all tracked Instagram pages. Used by both the frontend and the n8n workflow.
        
    - **Returns:** TrackedInstagramPage[]
        
- **POST /api/instapulse/pages**
    
    - **Description:** Adds a new Instagram page to the tracking list.
        
    - **Body:** { username: string }
        
    - **Returns:** TrackedInstagramPage
        
- **DELETE /api/instapulse/pages/:id**
    
    - **Description:** Removes a tracked page from the list.
        
    - **Returns:** { success: boolean }
        
- **GET /api/instapulse/reels**
    
    - **Description:** Fetches the collected Reels data with support for filtering and sorting. The primary data source for the dashboard.
        
    - **Query Params:** startDate, endDate, sortBy ('publishedAt' | 'viewCount'), page
        
    - **Returns:** Paginated<InstagramReel[]>
        
- **POST /api/instapulse/save-result**
    
    - **Description:** An internal endpoint for the n8n workflow to save the data collected from Apify.
        
    - **Security:** This endpoint will be secured with a secret key/token known only to our n8n instance.
        
    - **Body:** { page: { username: string }, reels: { postUrl: string, ... }[] }
        
    - **Returns:** { success: boolean }
        

## 6. Risks & Mitigation

- **Primary Risk:** High dependency on the Apify service, which is a third-party black box. Changes in Instagram's structure or Apify's service could break our data pipeline.
    
- **Mitigation:**
    
    1. **Robust Monitoring:** The n8n workflow will have built-in error handling to notify us immediately if a job fails.
        
    2. **Status Tracking:** The status field in the TrackedInstagramPage model will help us identify and temporarily disable pages that consistently fail to be scraped.
        
    3. **Decoupled Architecture:** Our choice of architecture means that if Apify fails, only the data collection is affected. The main application and existing data remain fully functional.