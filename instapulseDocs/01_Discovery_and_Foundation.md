# Phase 0: Discovery & Foundation

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
| **Frontend**  | Next.js (App Router)        | `15.5.2`                                             |
|               | React                       | `19.1.0`                                             |
|               | TypeScript                  | `5.x` (Strict Mode)                                  |
|               | UI Library                  | Tailwind CSS `3.4`, Shadcn/UI, Radix UI              |
|               | State Management            | Zustand `5.0`, TanStack Query `5.8`                  |
|               | Animations / Icons          | Framer Motion, Lucide React                          |
| **Backend**   | Runtime / Framework         | Node.js with Next.js API Routes                      |
|               | Language                    | TypeScript                                           |
|               | API Architecture            | RESTful via Serverless Functions                     |
| **Database**  | System                      | PostgreSQL                                           |
|               | ORM                         | Prisma `6.14.0`                                      |
| **Auth**      | Framework / Method          | NextAuth.js `5.0` (JWT-based)                        |
| **DevOps**    | Deployment / Hosting        | Vercel (CI/CD from GitHub)                           |
|               | Bundler                     | Next.js (Webpack)                                    |
|               | Testing                     | Vitest (Unit), Playwright (E2E)                      |

### 2.2. Architectural Findings

-   **Monorepo with Serverless Functions:** The architecture is a monolith, which simplifies development and deployment. The use of serverless functions for the backend is cost-effective and highly scalable.
-   **Component-Driven UI:** The use of Shadcn/UI and a clear component directory structure (`src/components`) allows for rapid development of new UI features that are consistent with the existing design system.
-   **Type-Safe Data Layer:** The combination of PostgreSQL and Prisma provides a robust, type-safe interface for all database operations, reducing the likelihood of runtime data errors.
-   **Integrated Authentication:** The existing NextAuth.js implementation with Role-Based Access Control (RBAC) can be easily extended to secure the new InstaPulse routes and pages.

## 3. Integration Strategy Conclusion

Based on this analysis, the integration of the InstaPulse module will be a "native extension" rather than a separate service. We will leverage all aspects of the current stack:
-   **UI:** New pages will be built in the `src/app` directory using existing Shadcn/UI components.
-   **API:** New endpoints will be created as Next.js API Routes (e.g., `/api/instapulse/...`).
-   **Database:** New tables will be added to the existing PostgreSQL database via a Prisma schema migration.
-   **Automation:** Scheduled tasks will be implemented using an external workflow automation tool (**n8n Cloud** or a self-hosted instance), which will call our application's API endpoints. This provides greater flexibility and control over the data collection pipeline.

This approach minimizes technical complexity, ensures consistency, and accelerates the development lifecycle.

---
