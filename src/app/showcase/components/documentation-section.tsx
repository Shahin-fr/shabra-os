'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * DocumentationSection Component - Professional IDE-like Interface
 * 
 * A sophisticated showcase of product design documents with interactive tabs,
 * markdown rendering, and smooth animations for the InstaPulse module.
 */
export default function DocumentationSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [activeTab, setActiveTab] = useState('00_Project_Overview.md');

  const tabs = [
    {
      id: '00_Project_Overview.md',
      label: '00_Project_Overview.md',
      icon: '📋'
    },
    {
      id: '01_Discovery_and_Foundation.md',
      label: '01_Discovery_and_Foundation.md',
      icon: '🔍'
    },
    {
      id: '02_Vision_and_Architecture.md',
      label: '02_Vision_and_Architecture.md',
      icon: '🏗️'
    },
    {
      id: '03_Development_Roadmap.md',
      label: '03_Development_Roadmap.md',
      icon: '🗺️'
    },
    {
      id: '04_Implementation_Guide.md',
      label: '04_Implementation_Guide.md',
      icon: '⚙️'
    },
    {
      id: '05_Testing_and_Deployment.md',
      label: '05_Testing_and_Deployment.md',
      icon: '🚀'
    },
    {
      id: '06_Project_Vision_and_Future_Roadmap.md',
      label: '06_Project_Vision_and_Future_Roadmap.md',
      icon: '🔮'
    },
  ];

  // Hardcoded markdown content for each tab
  const getTabContent = (tabId: string) => {
    switch (tabId) {
      case '00_Project_Overview.md':
        return `# Project InstaPulse - Overview & Goals

**Document Version:** 1.0
**Date:** 2025-09-10
**Authors:** Shahin Farahmadn

## 1. Introduction

This document provides a high-level overview of **Project InstaPulse**, a new internal module to be integrated into our existing business operations platform. The purpose of this module is to automate the process of tracking high-performing content on Instagram, providing actionable insights to our content and marketing teams.

## 2. The Problem

Our content team currently spends significant manual effort researching trending content on Instagram. This process is time-consuming, inconsistent, and often fails to capture viral trends in a timely manner. We lack a systematic, data-driven approach to identify what kind of content is currently resonating with audiences in our target niches.

## 3. The Solution: InstaPulse

InstaPulse will be a simple, yet powerful, dashboard that automatically tracks a curated list of Instagram pages. Every day, it will fetch the new posts from these pages and identify the top 10 most-viewed posts within the last 24 hours.

This provides our team with a daily, at-a-glance brief of the most viral content, enabling them to:
-   Quickly understand current trends.
-   Generate ideas for our own content calendar.
-   Make data-informed decisions for our content strategy.

## 4. High-Level Project Phases

The development of InstaPulse will be executed in the following distinct phases, each with its own set of deliverables and documentation.

-   **Phase 0: Discovery & Foundation:** Analyzing the existing platform to ensure seamless integration.
-   **Phase 1: Vision & Architecture Design:** Defining the project scope, system architecture, and data models.
-   **Phase 2: Development Roadmap:** Breaking down the project into actionable tasks and sprints.
-   **Phase 3: Implementation & Development:** The core coding and development phase.
-   **Phase 4: Testing & Deployment:** Ensuring quality and deploying the feature into production.

## 5. Technology Stack Summary

InstaPulse will be built natively within our existing platform, leveraging the current tech stack:
-   **Frontend:** Next.js, React, TypeScript, TailwindCSS, Shadcn/UI
-   **Backend:** Next.js API Routes (Serverless), TypeScript
-   **Database:** PostgreSQL with Prisma ORM
-   **External APIs:** Apify for data scraping
-   **Deployment:** Vercel

---`;

      case '01_Discovery_and_Foundation.md':
        return `# Phase 0: Discovery & Foundation

**Document Version:** 1.0
**Date:** 2025-09-10
**Status:** Completed

## 1. Objective

The primary objective of this phase was to conduct a thorough analysis of the existing internal business platform. This foundational understanding is critical to ensure that the new **InstaPulse** module is architected for seamless integration, technical consistency, and future scalability. The analysis was performed using the AI code assistant Cursor.

## 2. System Analysis Summary

The existing platform is a modern, monolithic Next.js application with a serverless backend, built with a strong emphasis on type-safety, performance, and a robust component-based architecture.

### 2.1. Technology Stack

| Category      | Technology / Library        | Version / Details                                    |
|---------------|-----------------------------|------------------------------------------------------|
| **Frontend**  | Next.js (App Router)        | \`15.5.2\`                                             |
|               | React                       | \`19.1.0\`                                             |
|               | TypeScript                  | \`5.x\` (Strict Mode)                                  |
|               | UI Library                  | Tailwind CSS \`3.4\`, Shadcn/UI, Radix UI              |
|               | State Management            | Zustand \`5.0\`, TanStack Query \`5.8\`                  |
|               | Animations / Icons          | Framer Motion, Lucide React                          |
| **Backend**   | Runtime / Framework         | Node.js with Next.js API Routes                      |
|               | Language                    | TypeScript                                           |
|               | API Architecture            | RESTful via Serverless Functions                     |
| **Database**  | System                      | PostgreSQL                                           |
|               | ORM                         | Prisma \`6.14.0\`                                      |
| **Auth**      | Framework / Method          | NextAuth.js \`5.0\` (JWT-based)                        |
| **DevOps**    | Deployment / Hosting        | Vercel (CI/CD from GitHub)                           |
|               | Bundler                     | Next.js (Webpack)                                    |
|               | Testing                     | Vitest (Unit), Playwright (E2E)                      |

### 2.2. Architectural Findings

-   **Monorepo with Serverless Functions:** The architecture is a monolith, which simplifies development and deployment. The use of serverless functions for the backend is cost-effective and highly scalable.
-   **Component-Driven UI:** The use of Shadcn/UI and a clear component directory structure (\`src/components\`) allows for rapid development of new UI features that are consistent with the existing design system.
-   **Type-Safe Data Layer:** The combination of PostgreSQL and Prisma provides a robust, type-safe interface for all database operations, reducing the likelihood of runtime data errors.
-   **Integrated Authentication:** The existing NextAuth.js implementation with Role-Based Access Control (RBAC) can be easily extended to secure the new InstaPulse routes and pages.

## 3. Integration Strategy Conclusion

Based on this analysis, the integration of the InstaPulse module will be a "native extension" rather than a separate service. We will leverage all aspects of the current stack:
-   **UI:** New pages will be built in the \`src/app\` directory using existing Shadcn/UI components.
-   **API:** New endpoints will be created as Next.js API Routes (e.g., \`/api/instapulse/...\`).
-   **Database:** New tables will be added to the existing PostgreSQL database via a Prisma schema migration.
-   **Automation:** Scheduled tasks will be implemented using an external workflow automation tool (**n8n Cloud** or a self-hosted instance), which will call our application's API endpoints. This provides greater flexibility and control over the data collection pipeline.

This approach minimizes technical complexity, ensures consistency, and accelerates the development lifecycle.

---`;

      case '02_Vision_and_Architecture.md':
        return `# Phase 1: Vision & Architecture Design

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

\`\`\`mermaid
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
\`\`\`

### 2.2. Component Responsibilities

- **n8n Instance (The Orchestrator):** An n8n instance (Cloud or self-hosted) will be responsible for the entire data collection workflow.
    
- **Next.js Backend (The Data Layer):** Our existing application's backend will expose a set of simple, stateless API endpoints for:
    
    - Managing the list of tracked pages (CRUD operations).
        
    - Serving the collected Reels data to the frontend with filtering and sorting.
        
    - Receiving and saving the processed data from the n8n workflow.
        
- **Next.js Frontend (The User Interface):** A new page will be developed to provide the user-facing dashboard, allowing users to interact with the collected data and manage the list of tracked pages.
    
- **PostgreSQL Database (The State):** The single source of truth for our application. It will store the list of tracked pages and all the collected Reels data.

## 3. Data Schema (Prisma)

The following models will be added to our schema.prisma file.

\`\`\`prisma
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
\`\`\`

## 4. Database & Indexing Strategy

To ensure fast query performance on the instagram_reels table, especially for the main dashboard which queries recent and high-performing content, the following indexing strategy will be implemented:

1. **Primary Performance Index:** A composite B-Tree index will be created to optimize for the most common query: fetching recent, viral Reels.
    
\`\`\`sql
    CREATE INDEX idx_reels_viral_perf ON instagram_reels (publishedAt DESC, viewCount DESC);
\`\`\`

2. **Foreign Key Index:** Prisma automatically creates an index on the pageId foreign key, which is sufficient for queries related to a specific page.
    
3. **Fillfactor Optimization:** For append-only data like ours, setting fillfactor to 100 on indexes can slightly improve performance and storage efficiency.

## 5. API Endpoint Design

The following RESTful API endpoints will be created within the Next.js app router.

- **GET /api/instapulse/pages**
    
    - **Description:** Fetches the list of all tracked Instagram pages. Used by both the frontend and the n8n workflow.
        
    - **Returns:** TrackedInstagramPage[]
        
- **POST /api/instapulse/pages**
    
    - **Description:** Adds a new Instagram page to the tracking list.
        
    - **Body:** { username: string }
        
    - **Returns:** TrackedInstagramPage
        
- **DELETE /api/instapulse/pages/:id**
    
    - **Description:** Removes a tracked page from the list.
        
    - **Returns:** { success: boolean }
        
- **GET /api/instapulse/reels**
    
    - **Description:** Fetches the collected Reels data with support for filtering and sorting. The primary data source for the dashboard.
        
    - **Query Params:** startDate, endDate, sortBy ('publishedAt' | 'viewCount'), page
        
    - **Returns:** Paginated<InstagramReel[]>
        
- **POST /api/instapulse/save-result**
    
    - **Description:** An internal endpoint for the n8n workflow to save the data collected from Apify.
        
    - **Security:** This endpoint will be secured with a secret key/token known only to our n8n instance.
        
    - **Body:** { page: { username: string }, reels: { postUrl: string, ... }[] }
        
    - **Returns:** { success: boolean }

## 6. Risks & Mitigation

- **Primary Risk:** High dependency on the Apify service, which is a third-party black box. Changes in Instagram's structure or Apify's service could break our data pipeline.
    
- **Mitigation:**
    
    1. **Robust Monitoring:** The n8n workflow will have built-in error handling to notify us immediately if a job fails.
        
    2. **Status Tracking:** The status field in the TrackedInstagramPage model will help us identify and temporarily disable pages that consistently fail to be scraped.
        
    3. **Decoupled Architecture:** Our choice of architecture means that if Apify fails, only the data collection is affected. The main application and existing data remain fully functional.`;

      case '03_Development_Roadmap.md':
        return `# Phase 2: Development Roadmap

**Document Version:** 1.0
**Date:** 2025-09-11
**Status:** In Progress

## 1. Overview

This document breaks down the development of the **InstaPulse** module into actionable tasks, organized into logical milestones. Each task represents a concrete step towards implementing the architecture defined in \`02_Vision_and_Architecture.md\`. This roadmap will serve as our guide during the implementation phase.

## 2. Milestone 1: Backend Foundation & API Scaffolding

**Goal:** To build the core data structures and server-side logic. At the end of this milestone, our database will be ready and our APIs will be functional (testable with tools like Postman).

| Task ID | Description                                                                                                 | Status |
| ------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| T-01    | **DB Schema:** Implement the \`TrackedInstagramPage\` and \`InstagramReel\` models in \`schema.prisma\`.          | Done   |
| T-02    | **DB Migration:** Generate and apply the database migration to create the new tables.                       | Done   |
| T-03    | **API - Pages:** Create the API route (\`/api/instapulse/pages\`) for \`GET\`, \`POST\`, and \`DELETE\` operations. | Done   |
| T-04    | **API - Save Result:** Create the internal API route (\`/api/instapulse/save-result\`) for the n8n workflow.  | Done   |
| T-05    | **API Security:** Secure the \`save-result\` endpoint using a secret API key.                                 | Done   |
| T-06    | **API - Reels:** Create the API route (\`/api/instapulse/reels\`) for fetching data with filtering & sorting. | Done   |

## 3. Milestone 2: Frontend Implementation (The Dashboard)

**Goal:** To build the user interface that allows users to interact with the system. At the end of this milestone, the InstaPulse page will be fully functional and integrated with the backend APIs.

| Task ID | Description                                                                                                       | Status |
| ------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| T-07    | **UI Layout:** Create the main page layout for InstaPulse under a new route (e.g., \`/dashboard/instapulse\`).      | Done   |
| T-08    | **UI Component - Page Manager:** Develop a component (e.g., a Dialog/Modal) to add and list/delete tracked pages. | Done   |
| T-09    | **UI State - Pages:** Integrate the Page Manager component with the \`/pages\` API using TanStack Query.            | Done   |
| T-10    | **UI Component - Reels Grid:** Develop the main component to display Reels in a card-based grid format.           | Done   |
| T-11    | **UI Component - Filters:** Add UI controls for date range filtering and sorting options.                         | Done   |
| T-12    | **UI State - Reels:** Integrate the Reels Grid and filters with the \`/reels\` API using TanStack Query.            | Done   |
| T-13    | **UI Polish:** Ensure the UI is fully responsive and consistent with the existing design system.                  | Done   |

## 4. Milestone 3: Automation & Integration (The n8n Workflow)

**Goal:** To automate the data collection pipeline. At the end of this milestone, the system will be fully autonomous, fetching and saving new data daily.

| Task ID | Description                                                                                                  | Status |
| ------- | ------------------------------------------------------------------------------------------------------------ | ------ |
| T-14    | **n8n Setup:** Install and configure the self-hosted n8n instance.                                           | Done   |
| T-15    | **n8n Workflow - Trigger:** Create a new workflow with a Cron node to run daily.                             | Done   |
| T-16    | **n8n Workflow - Fetch Pages:** Add a node to call our \`GET /api/instapulse/pages\` endpoint.                 | Done   |
| T-17    | **n8n Workflow - Loop:** Add a node to loop through each page returned from the previous step.               | Done   |
| T-18    | **n8n Workflow - Call Apify:** Configure a node to call the Apify API for the current page in the loop.      | Done   |
| T-19    | **n8n Workflow - Save Data:** Configure a node to call our \`POST /api/instapulse/save-result\` with the data. | Done   |
| T-20    | **n8n Workflow - Error Handling:** Implement basic error handling and notification (e.g., email on failure). | Done   |
| T-21    | **End-to-End Test:** Run the entire workflow and verify that data appears correctly in the UI.               | Done   |

#### **Roadmap for v1.1: Automated Follower Count Updates**

**Objective:** To transition the InstaPulse module from a manual data-entry system to a fully automated data analysis platform by eliminating the need for manual follower count updates.

**Proposed Architecture:**

1. **New n8n Workflow:** A separate, weekly scheduled workflow dedicated to updating follower counts.
    
2. **New Apify Actor:** Utilize the apify/instagram-profile-scraper Actor to fetch profile data, including followersCount.
    
3. **New API Endpoint:** Create a new PATCH endpoint (e.g., /api/instapulse/update-followers) that accepts a username and followerCount to update the corresponding record in the database.

**Technical Complexity:** Low to Medium.  
**Primary Risk:** Increased dependency on a second Apify Actor.`;

      case '04_Implementation_Guide.md':
        return `# Phase 3: Implementation Guide

**Document Version:** 1.0
**Date:** 2025-09-14
**Status:** Completed

## 1. Overview
This document provides technical details about the implementation of the InstaPulse module. It is intended for developers who will maintain or extend this feature in the future.

## 2. Backend Implementation (\`/api/instapulse\`)

The backend consists of three main API route groups:

- **\`/pages\`**: Handles CRUD operations for tracked pages.
- **\`/reels\`**: Handles fetching processed data for the frontend dashboard.
- **\`/save-result\`**: An internal endpoint used by the n8n workflow to save scraped data.

All data validation is performed using **Zod**, ensuring type-safety and robustness. The database logic is handled by **Prisma**.

### Key API Endpoint: \`POST /save-result\`
This endpoint is secured via a Bearer Token (\`N8N_SECRET_TOKEN\`). Its primary role is to accept raw data from the n8n workflow, validate its structure, and then \`upsert\` (update or insert) the \`InstagramReel\` records into the database.

## 3. Frontend Implementation (\`/dashboard/instapulse\`)

The frontend is built with a component-based architecture using React and Shadcn/UI.

- **Data Fetching:** All client-server communication is managed by **TanStack Query (React Query)**, which handles caching, background refetching, and server state management.
- **State Management:**
    - Custom hooks (\`useInstapulsePages\`, \`useInstapulseReels\`) encapsulate all data-fetching logic.
    - Local component state (\`useState\`) is used for managing UI elements like forms and filters.
- **Key Components:**
    - **\`page.tsx\`**: The main page container, responsible for layout and orchestrating data flow between filter and grid components.
    - **\`PageManager\`**: A dialog-based component for adding, viewing, and deleting tracked pages. Implements optimistic updates for a smoother UX.
    - **\`ReelsGrid\` & \`ReelCard\`**: Responsible for displaying the fetched reels in a responsive grid. Uses Next.js Image Optimization (\`next/image\`) to act as a proxy and bypass Instagram's cross-origin restrictions.
    - **\`ReelsFilters\`**: Manages the UI for date and sort filtering.

## 4. Automation Workflow (n8n)

The core automation is handled by a dedicated n8n workflow. The final, stable workflow consists of the following nodes:

1.  **Schedule Trigger:** Runs the workflow daily.
2.  **Get Tracked Pages (HTTP Request):** Fetches the list of target pages from our own API.
3.  **Loop Over Items:** Iterates through each page.
4.  **Run an Actor and get dataset (Apify Node):** Executes the \`apify/instagram-reel-scraper\` actor for the current page and waits for the dataset result.
5.  **Code in JavaScript:** A custom code node that performs the critical task of transforming the raw, complex data from Apify into the clean, simple JSON structure that our \`save-result\` API expects.
6.  **Save Results (HTTP Request):** Sends the cleaned data to our API to be saved in the database.

This decoupled approach makes the system robust. If the data structure from Apify changes in the future, we only need to update the logic in the **\`Code\`** node in n8n, without touching our main application code.`;

      case '05_Testing_and_Deployment.md':
        return `# Phase 4: Testing & Deployment Guide

**Document Version:** 1.0
**Date:** 2025-09-14
**Status:** Completed

## 1. Local Development & Testing

### 1.1. Running the Application
The Next.js application can be run locally using the standard command:
\`\`\`bash
npm run dev
\`\`\`

Ensure that your local .env file is properly configured with the DATABASE_URL and a development N8N_SECRET_TOKEN.

### 1.2. Manual Testing Checklist
To perform a full end-to-end test of the InstaPulse module:

-   [ ] **Page Management:**
    -   [ ] Can you successfully add a new, valid Instagram page?
    -   [ ] Do you receive a proper error when adding a duplicate page?
    -   [ ] Can you successfully delete a page?
-   [ ] **Data Display:**
    -   [ ] Does the dashboard display a skeleton loader while data is fetching?
    -   [ ] Are the reel cards displayed correctly after data is loaded?
    -   [ ] Do the thumbnail images for the reels load correctly?
-   [ ] **Filtering & Sorting:**
    -   [ ] Does the date range filter work as expected?
    -   [ ] Do all sorting options work correctly?
    -   [ ] Does the "Reset" button clear the filters and refetch the default view?
-   **n8n Workflow:**
    -   [ ] Can you manually execute the n8n workflow (\`Execute Workflow\`)?
    -   [ ] Does it run to completion without errors?
    -   [ ] After a successful run, are new reels visible in the dashboard after a refresh?

## 2. Deployment

### 2.1. Vercel Application
The Next.js application is configured for **Continuous Deployment** with Vercel. Any push to the \`main\` branch of the connected GitHub repository will automatically trigger a new deployment.

**Post-Deployment Checks:**
1.  Verify that all environment variables (especially \`DATABASE_URL\` and \`N8N_SECRET_TOKEN\`) are correctly set in the Vercel project settings.
2.  Navigate to the \`/dashboard/instapulse\` page to ensure the module is operational.

### 2.2. n8n Workflow
The n8n workflow must be **Saved** and set to **Active** in the n8n dashboard to run on its schedule.

**Important:** If the application's domain changes, the URLs in the n8n workflow's HTTP Request nodes must be updated manually.`;

      case '06_Project_Vision_and_Future_Roadmap.md':
        return `# Project Vision & Future Roadmap: The Evolution of InstaPulse

**Document Version:** 1.0
**Date:** 2025-09-14
**Status:** Strategic Vision

## 1. The Core Vision: From Data Collector to Strategic Advisor

The journey of InstaPulse does not end with v1.0. Our core vision is to evolve InstaPulse from a simple data collection tool into an **intelligent strategic advisor** for our content and marketing teams.

We envision a future where InstaPulse doesn't just show *what* is trending, but actively predicts *what will trend*, suggests *why* certain content succeeds, and provides **actionable, AI-driven recommendations** to systematically enhance our brand's social media presence.

## 2. The Strategic Roadmap

To achieve this vision, we will progress through three strategic phases, each building upon the last.

### **Phase 1: Automation & Enhancement (Version 1.1 - 1.5)**

**Goal:** To achieve full automation and enrich our core dataset.

-   **v1.1: Full Data Automation**
    -   [ ] **Automated Follower Count Updates:** Implement a new, weekly-scheduled n8n workflow using the \`apify/instagram-profile-scraper\` to automatically update follower counts for all tracked pages, eliminating the need for any manual data entry.
    -   [ ] **Manual Override & Enrichment:** Introduce the ability to manually edit follower counts and upload custom logos for each page, providing greater control and better visual identification.

-   **v1.2: Deep Engagement Metrics**
    -   [ ] **Track Likes & Comments:** Enhance the Apify scraper and our database schema to collect and store the number of likes and comments for each Reel.
    -   [ ] **New Virality Metrics:** Introduce new sorting and filtering options based on "Like-to-View Ratio" and "Comment-to-View Ratio" to identify content that sparks conversation.

-   **v1.3: User Experience Polish**
    -   [ ] **Search & Pagination:** Add a search bar to quickly find tracked pages and implement server-side pagination for handling hundreds of reels efficiently.
    -   [ ] **UI Enhancements:** Introduce bulk actions (e.g., delete multiple pages at once) and refine the UI based on team feedback.

### **Phase 2: Intelligence & Insight (Version 2.0)**

**Goal:** To transform raw data into actionable intelligence using AI.

-   **v2.0: The AI Insight Engine**
    -   [ ] **Topic & Trend Analysis:** Integrate a Natural Language Processing (NLP) model to analyze the captions and comments of viral Reels. The system will automatically identify and tag trending topics, keywords, and hashtags.
    -   [ ] **Performance Prediction:** Develop a simple predictive model that analyzes the early performance of our own posts (e.g., views in the first 3 hours) and predicts their potential to go viral, allowing for timely promotion.
    -   [ ] **Visual Trend Identification:** Use an image recognition model to analyze thumbnails and identify visual patterns in trending content (e.g., color palettes, presence of text, faces, etc.).
    -   [ ] **Analytics Dashboard:** Create a new dashboard with charts and graphs to visualize trends over time, track the performance of specific topics, and compare the growth of different tracked pages.

### **Phase 3: Expansion & Integration (Version 3.0)**

**Goal:** To expand the platform's reach beyond Instagram and integrate its insights into the wider business ecosystem.

-   **v3.0: The Omni-Platform Trend Hub**
    -   [ ] **TikTok Integration:** Expand the system to track and analyze trending content on TikTok, providing a cross-platform view of viral trends.
    -   **Competitor Analysis Module:** Introduce a dedicated module for directly comparing our page's performance against key competitors on metrics like engagement rate, post frequency, and topic coverage.
    -   [ ] **Content Idea Generator:** Create an AI-powered feature that, based on the analyzed trends, suggests concrete content ideas, including potential formats, topics, and even caption starters.
    -   [ ] **Public API:** Develop a secure, internal API for InstaPulse, allowing other tools within our business ecosystem (like our content planning calendar) to programmatically access trend data and insights.

---

## 3. The End Goal

By the end of this roadmap, InstaPulse will be an indispensable asset—a proactive, intelligent hub that not only saves time but fundamentally elevates our content strategy, giving us a significant competitive advantage in the fast-paced world of social media.`;

      default:
        return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section 
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden"
    >
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6">
           اولین آزمایش عملی: ساخت ماژول اینستاپالس در ۱۶ ساعت
          </h2>
          <p className="text-lg sm:text-xl text-[#A1A1A1] max-w-4xl mx-auto leading-relaxed">
            این ماژول، اولین پاسخ عملی به کنجکاوی اصلی پروژه بود. یک اسپرینت ۱۶ ساعته برای تبدیل یک ایده مشخص به یک ابزار کاربردی با مستندات کامل.
          </p>
        </motion.div>

        {/* IDE-like Window Container */}
        <motion.div 
          className="relative bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden"
          variants={itemVariants}
          dir="ltr"
        >
          {/* Window Header */}
          <div className="bg-zinc-800 border-b border-zinc-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm text-zinc-400 font-mono">
                  InstaPulse Documentation
                </span>
              </div>
              <div className="text-xs text-zinc-500 font-mono">
                v1.0.0
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-zinc-800 border-b border-zinc-700">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  className={`
                    flex items-center space-x-1.5 px-3 py-3 text-xs font-medium transition-all duration-300 whitespace-nowrap min-w-0
                    ${activeTab === tab.id 
                      ? 'text-[#E000A0] border-b-2 border-[#E000A0] bg-zinc-700/50' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/30'
                    }
                  `}
                  onClick={() => setActiveTab(tab.id)}
                  variants={tabVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm flex-shrink-0">{tab.icon}</span>
                  <span className="font-mono text-xs truncate">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="max-h-[500px] overflow-y-auto"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.3 }}
              >
                <div className="p-8">
                  <div className="prose prose-invert prose-zinc max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-mono leading-relaxed">
                      {getTabContent(activeTab)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-[#E000A0]/5 via-transparent to-[#8B5CF6]/5" />
        </motion.div>

      </motion.div>
    </section>
  );
}
