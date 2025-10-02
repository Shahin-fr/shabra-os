# Phase 4: Testing & Deployment Guide

**Document Version:** 1.0
**Date:** 2025-09-14
**Status:** Completed

## 1. Local Development & Testing

### 1.1. Running the Application
The Next.js application can be run locally using the standard command:
```bash
npm run dev
````

Ensure that your local .env file is properly configured with the DATABASE_URL and a development N8N_SECRET_TOKEN.

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
    -   [ ] Can you manually execute the n8n workflow (`Execute Workflow`)?
    -   [ ] Does it run to completion without errors?
    -   [ ] After a successful run, are new reels visible in the dashboard after a refresh?

## 2. Deployment

### 2.1. Vercel Application
The Next.js application is configured for **Continuous Deployment** with Vercel. Any push to the `main` branch of the connected GitHub repository will automatically trigger a new deployment.

**Post-Deployment Checks:**
1.  Verify that all environment variables (especially `DATABASE_URL` and `N8N_SECRET_TOKEN`) are correctly set in the Vercel project settings.
2.  Navigate to the `/dashboard/instapulse` page to ensure the module is operational.

### 2.2. n8n Workflow
The n8n workflow must be **Saved** and set to **Active** in the n8n dashboard to run on its schedule.

**Important:** If the application's domain changes, the URLs in the n8n workflow's HTTP Request nodes must be updated manually.

