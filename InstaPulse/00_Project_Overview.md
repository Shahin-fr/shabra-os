# Project InstaPulse - Overview & Goals

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

---



```mermaid
graph TD
    subgraph "User's Browser"
        A[React Frontend - InstaPulse Page]
    end

    subgraph "Your Next.js Platform (Vercel)"
        B["API: /api/instapulse/pages (CRUD)"]
        C["API: /api/instapulse/top-posts (GET)"]
        D["Cron Job: /api/cron/fetch-pulse"]
        E[(PostgreSQL Database)]
    end

    subgraph "External Services"
        F[Apify API]
        G[Instagram Platform]
    end

    %% User Flows
    A -- "Manages pages" --> B
    B -- "Saves/Updates Pages" --> E
    A -- "Requests top 10 posts" --> C
    C -- "Queries DB for posts in last 24h" --> E
    E -- "Returns data" --> C
    C -- "Sends JSON to frontend" --> A

    %% Data Fetching Flow (Daily Automated)
    D -- "1. Triggers daily"
    D -- "2. Calls Apify API" --> F
    F -- "3. Scrapes new posts" --> G
    F -- "5. Sends results back" --> D
    D -- "6. Processes & saves posts/views" --> E
```