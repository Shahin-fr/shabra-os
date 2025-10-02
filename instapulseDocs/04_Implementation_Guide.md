# Phase 3: Implementation Guide

**Document Version:** 1.0
**Date:** 2025-09-14
**Status:** Completed

## 1. Overview
This document provides technical details about the implementation of the InstaPulse module. It is intended for developers who will maintain or extend this feature in the future.

## 2. Backend Implementation (`/api/instapulse`)

The backend consists of three main API route groups:

- **`/pages`**: Handles CRUD operations for tracked pages.
- **`/reels`**: Handles fetching processed data for the frontend dashboard.
- **`/save-result`**: An internal endpoint used by the n8n workflow to save scraped data.

All data validation is performed using **Zod**, ensuring type-safety and robustness. The database logic is handled by **Prisma**.

### Key API Endpoint: `POST /save-result`
This endpoint is secured via a Bearer Token (`N8N_SECRET_TOKEN`). Its primary role is to accept raw data from the n8n workflow, validate its structure, and then `upsert` (update or insert) the `InstagramReel` records into the database.

## 3. Frontend Implementation (`/dashboard/instapulse`)

The frontend is built with a component-based architecture using React and Shadcn/UI.

- **Data Fetching:** All client-server communication is managed by **TanStack Query (React Query)**, which handles caching, background refetching, and server state management.
- **State Management:**
    - Custom hooks (`useInstapulsePages`, `useInstapulseReels`) encapsulate all data-fetching logic.
    - Local component state (`useState`) is used for managing UI elements like forms and filters.
- **Key Components:**
    - **`page.tsx`**: The main page container, responsible for layout and orchestrating data flow between filter and grid components.
    - **`PageManager`**: A dialog-based component for adding, viewing, and deleting tracked pages. Implements optimistic updates for a smoother UX.
    - **`ReelsGrid` & `ReelCard`**: Responsible for displaying the fetched reels in a responsive grid. Uses Next.js Image Optimization (`next/image`) to act as a proxy and bypass Instagram's cross-origin restrictions.
    - **`ReelsFilters`**: Manages the UI for date and sort filtering.

## 4. Automation Workflow (n8n)

The core automation is handled by a dedicated n8n workflow. The final, stable workflow consists of the following nodes:

1.  **Schedule Trigger:** Runs the workflow daily.
2.  **Get Tracked Pages (HTTP Request):** Fetches the list of target pages from our own API.
3.  **Loop Over Items:** Iterates through each page.
4.  **Run an Actor and get dataset (Apify Node):** Executes the `apify/instagram-reel-scraper` actor for the current page and waits for the dataset result.
5.  **Code in JavaScript:** A custom code node that performs the critical task of transforming the raw, complex data from Apify into the clean, simple JSON structure that our `save-result` API expects.
6.  **Save Results (HTTP Request):** Sends the cleaned data to our API to be saved in the database.

This decoupled approach makes the system robust. If the data structure from Apify changes in the future, we only need to update the logic in the **`Code`** node in n8n, without touching our main application code.```
