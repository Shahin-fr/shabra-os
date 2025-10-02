<div align="center">
  <img src="![[instapulse-logo.png]]" alt="InstaPulse Logo" width="150">
  <h1>InstaPulse</h1>
  <p>An intelligent, automated dashboard for tracking viral Instagram Reels and discovering content trends.</p>
</div>

> InstaPulse was born from the need to replace time-consuming manual research with a data-driven, automated system. It empowers content teams to quickly identify high-performing content and make strategic decisions based on real-world engagement metrics.

---

### ✨ **Key Features**

-   **Automated Daily Tracking:** Automatically fetches the latest Reels from a curated list of Instagram pages every day.
-   **Viral Content Dashboard:** A clean, responsive UI that displays the top-performing Reels.
-   **Advanced Filtering & Sorting:** Filter reels by date range and sort by view count, publish date, or our custom "Virality Score".
-   **Dynamic Page Management:** Easily add or remove Instagram pages to track through a simple UI.
-   **Server-Side Image Proxy:** Utilizes Next.js Image Optimization to bypass Instagram's cross-origin restrictions and reliably display thumbnails.
-   **Decoupled Automation:** Leverages a robust n8n workflow for all data collection and processing, keeping the main application light and focused.

---

### 📸 **Screenshots**

<div align="center">
  <img src="[LINK_TO_YOUR_SCREENSHOT_1.png]" alt="InstaPulse Dashboard" width="700">
  <p><em>The main dashboard, displaying viral Reels in a clean, card-based grid.</em></p>
</div>
<br>
<div align="center">
  <img src="[LINK_TO_YOUR_SCREENSHOT_2.png]" alt="Page Management Dialog" width="500">
  <p><em>The simple dialog for managing tracked pages.</em></p>
</div>

---

### 🛠️ **Tech Stack & Architecture**

InstaPulse is a modern, full-stack TypeScript application built with a focus on scalability and maintainability.

-   **Frontend:** Next.js, React, Shadcn/UI, TanStack Query, Tailwind CSS
-   **Backend:** Next.js API Routes (Serverless)
-   **Database:** PostgreSQL with Prisma ORM
-   **Automation:** n8n (Cloud or Self-hosted)
-   **Data Scraping:** Apify API
-   **Deployment:** Vercel

The system is architected with a decoupled approach, where the Next.js application serves as the core UI and data layer, while a separate n8n instance handles all the heavy lifting of scheduled data collection. This makes the system resilient and easy to maintain.

[➡️ **Read the full architectural documentation here**](./docs/)

---

### 🚀 **Getting Started**

A complete, step-by-step guide for deploying this module on a new project is available in the documentation package.

[➡️ **View the Installation Guide**](./docs/installation-guide.md) 
*(نکته برای شما: فایل `README.md` که قبلاً برای دوستتان ساختیم را می‌توانید به این نام تغییر دهید و در پوشه `docs` قرار دهید)*

---

### 🗺️ **Future Roadmap**

This project was built with a long-term vision. The following features are planned for future versions:

-   **v1.1 (Enhancements):**
    -   Implement automated weekly updates for follower counts.
    -   Add functionality for manual follower count editing and logo uploads.
-   **v2.0 (Analytics & Intelligence):**
    -   Integrate an AI module for caption topic modeling and comment sentiment analysis.
    -   Add trend charts to visualize post performance over time.
    -   Implement a notification system for rapidly trending content.
-   **v3.0 (Platform Expansion):**
    -   Add support for tracking other platforms (e.g., TikTok).
    -   Introduce a competitor analysis dashboard.

---