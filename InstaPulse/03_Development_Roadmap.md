# Phase 2: Development Roadmap

**Document Version:** 1.0
**Date:** 2025-09-11
**Status:** In Progress

## 1. Overview

This document breaks down the development of the **InstaPulse** module into actionable tasks, organized into logical milestones. Each task represents a concrete step towards implementing the architecture defined in `02_Vision_and_Architecture.md`. This roadmap will serve as our guide during the implementation phase.

## 2. Milestone 1: Backend Foundation & API Scaffolding

**Goal:** To build the core data structures and server-side logic. At the end of this milestone, our database will be ready and our APIs will be functional (testable with tools like Postman).

| Task ID | Description                                                                                             | Status      |
|---------|---------------------------------------------------------------------------------------------------------|-------------|
| T-01    | **DB Schema:** Implement the `TrackedInstagramPage` and `InstagramReel` models in `schema.prisma`.      | To Do       |
| T-02    | **DB Migration:** Generate and apply the database migration to create the new tables.                     | To Do       |
| T-03    | **API - Pages:** Create the API route (`/api/instapulse/pages`) for `GET`, `POST`, and `DELETE` operations. | To Do       |
| T-04    | **API - Save Result:** Create the internal API route (`/api/instapulse/save-result`) for the n8n workflow.  | To Do       |
| T-05    | **API Security:** Secure the `save-result` endpoint using a secret API key.                               | To Do       |
| T-06    | **API - Reels:** Create the API route (`/api/instapulse/reels`) for fetching data with filtering & sorting. | To Do       |

## 3. Milestone 2: Frontend Implementation (The Dashboard)

**Goal:** To build the user interface that allows users to interact with the system. At the end of this milestone, the InstaPulse page will be fully functional and integrated with the backend APIs.

| Task ID | Description                                                                                             | Status      |
|---------|---------------------------------------------------------------------------------------------------------|-------------|
| T-07    | **UI Layout:** Create the main page layout for InstaPulse under a new route (e.g., `/dashboard/instapulse`). | To Do       |
| T-08    | **UI Component - Page Manager:** Develop a component (e.g., a Dialog/Modal) to add and list/delete tracked pages. | To Do       |
| T-09    | **UI State - Pages:** Integrate the Page Manager component with the `/pages` API using TanStack Query.      | To Do       |
| T-10    | **UI Component - Reels Grid:** Develop the main component to display Reels in a card-based grid format.     | To Do       |
| T-11    | **UI Component - Filters:** Add UI controls for date range filtering and sorting options.                   | To Do       |
| T-12    | **UI State - Reels:** Integrate the Reels Grid and filters with the `/reels` API using TanStack Query.      | To Do       |
| T-13    | **UI Polish:** Ensure the UI is fully responsive and consistent with the existing design system.            | To Do       |

## 4. Milestone 3: Automation & Integration (The n8n Workflow)

**Goal:** To automate the data collection pipeline. At the end of this milestone, the system will be fully autonomous, fetching and saving new data daily.

| Task ID | Description                                                                                             | Status      |
|---------|---------------------------------------------------------------------------------------------------------|-------------|
| T-14    | **n8n Setup:** Install and configure the self-hosted n8n instance.                                      | To Do       |
| T-15    | **n8n Workflow - Trigger:** Create a new workflow with a Cron node to run daily.                          | To Do       |
| T-16    | **n8n Workflow - Fetch Pages:** Add a node to call our `GET /api/instapulse/pages` endpoint.                | To Do       |
| T-17    | **n8n Workflow - Loop:** Add a node to loop through each page returned from the previous step.            | To Do       |
| T-18    | **n8n Workflow - Call Apify:** Configure a node to call the Apify API for the current page in the loop.    | To Do       |
| T-19    | **n8n Workflow - Save Data:** Configure a node to call our `POST /api/instapulse/save-result` with the data.| To Do       |
| T-20    | **n8n Workflow - Error Handling:** Implement basic error handling and notification (e.g., email on failure).| To Do       |
| T-21    | **End-to-End Test:** Run the entire workflow and verify that data appears correctly in the UI.              | To Do       |