# **Product Design Document: Employee UX**

## Shabra OS - v1.0

### **1. Introduction & Objectives**

This document details the user experience (UX) strategy and architecture for the **"Employee"** persona within the Shabra OS. The primary goal of this design is to foster a **transparent, efficient, and low-friction** work environment. This will empower employees to focus on their core responsibilities while handling administrative tasks with minimal effort.

**Core Design Principles:**

- **Clarity:** The user must understand what to do at a glance.
    
- **Efficiency:** Repetitive tasks should be achievable with the fewest clicks possible.
    
- **Personalization:** The system should feel like a personal assistant, anticipating the user's needs.
    
- **Motivation:** The design should instill a sense of progress and accomplishment.
    

---

### **2. Information Architecture & Navigation (Mobile)**

The mobile application's navigation is structured to provide rapid access to key sections while maintaining a clean and uncluttered user interface.

#### **2.1. Bottom Tab Bar**

This primary navigation component features four main hubs of user activity:

1. **Home:** The daily dashboard and starting point.
    
2. **Tasks:** A comprehensive center for managing all tasks (Today, Upcoming, Completed).
    
3. **Calendar:** A unified view of the content calendar, meetings, and company events.
    
4. **Inbox:** A consolidated hub for all asynchronous communication, including requests, messages, and announcements.
    

#### **2.2. Header**

The header remains persistent across all primary screens and includes:

- **Left:** A hamburger icon (☰) to open the full navigation drawer.
    
- **Center:** The title of the current page (e.g., "Home" or "My Tasks").
    
- **Right:** A notification icon (🔔) for urgent alerts and updates.
    

#### **2.3. Navigation Drawer (Sidebar)**

A comprehensive menu providing access to all areas of the system:

- **User Profile:** Featuring the user's name and avatar.
    
- **Core Sections:** Home, Tasks, Calendar, Inbox, Projects.
    
- **Resources:** Knowledge Base (ShabraLog), My Documents.
    
- **Account:** Settings and Logout.
    

---

### **3. Key Screen Designs**

#### **3.1. Employee Dashboard (Home Screen)**

The dashboard functions as a smart daily assistant, designed with the following principles:

- **Primary Goal:** To answer the user's questions: "What should I focus on today?" and "What's new?".
    
- **Visual Structure (Mobile):**
    
    - **Greeting:** A friendly, personalized welcome message.
        
    - **Smart Status Card:** The primary widget for Clocking In/Out, which also displays the current status and work session duration.
        
    - **Today's Focus Widget:** A checklist of key tasks scheduled for the current day, allowing for quick completion.
        
    - **Next Up Widget:** (Conditionally displayed) Shows the very next event or meeting from the user's calendar.
        
    - **My Requests Widget:** (Conditionally displayed) Shows the status of the user's most recent submissions.
        
- **Visual Structure (Desktop):**
    
    - **Layout:** A three-column layout (Left Navigation Sidebar, Main Content Column, Right Informational Column).
        
    - **Main Column:** Features expanded versions of the "Today's Focus" widget (with more detail and tabs) and a "My Active Projects" widget.
        
    - **Right Column:** Houses the "Smart Status," "Next Up," "Who's Out Today?," and "Announcements" widgets.
        

#### **3.2. Tasks Screen**

- **Objective:** To provide a complete and manageable view of all tasks assigned to the user.
    
- **Key Features:**
    
    - **List View:** A clear, scannable list of all tasks.
        
    - **Filtering Capabilities:** Filter tasks by project, due date, priority, and status (e.g., To-Do, Done).
        
    - **Sorting Options:** Sort tasks by date, priority, etc.
        
    - **Entry Point to Details:** Each list item is clickable, opening a dedicated "Task Details" screen.
        

#### **3.3. Inbox Screen**

- **Objective:** To consolidate all communications and requests into a single, unified hub.
    
- **Key Features:**
    
    - **Tabbed Interface:** Separate tabs for "Requests," "Announcements," and "Messages" to keep information organized.
        
    - **Quick Action:** A Floating Action Button (FAB) to initiate a "New Request."
        
    - **Status Indicators:** Each item in the requests list clearly displays its current status (e.g., Pending, Approved, Rejected).
        

---

### **4. Visual Design Direction (UI Direction)**

Based on the finalized mockups, the product's visual identity is defined as follows:

- **Overall Style:** Modern, clean, friendly, and minimalist.
    
- **Key Elements:**
    
    - **Rounded Cards:** Use of cards with soft shadows to create a clear visual hierarchy and separate content blocks.
        
    - **White Space:** Generous use of white space to prevent clutter and enhance readability.
        
    - **Illustrations:** Thoughtful integration of illustrations to add personality and a friendly tone.
        
- **Typography:** **Vazirmatn** is the designated primary font for all Persian text.
    
- **Color Palette:** A restrained palette featuring a neutral background, white for surfaces/cards, and a single, vibrant **Accent Color** for buttons, links, and other interactive elements.
    

---

This document will serve as the guiding blueprint for the development of the Employee User Experience.