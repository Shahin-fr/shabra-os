# **Product Design Document: Manager UX**

## Shabra OS - v1.0

### **1. Introduction & Objectives**

This document outlines the user experience (UX) strategy and architecture for the **"Manager"** persona within the Shabra OS. The primary objective of this design is to empower managers with the tools needed for **effective monitoring, rapid decision-making, and unblocking their teams**. The Manager Dashboard is envisioned as a "Command Center," providing a holistic, at-a-glance view of team and project health.

**Core Design Principles:**

- **Action-Oriented:** Information is presented in a way that prompts and guides the manager toward the next logical action.
    
- **Transparency:** Provide a clear and unobstructed view of team activities, workload distribution, and project progress.
    
- **Control:** Furnish managers with the necessary tools to allocate resources, manage workflows, and steer projects effectively.
    
- **Efficiency:** Streamline frequent administrative tasks, such as approving requests, to minimize friction and save time.
    

---

### **2. Information Architecture & Navigation**

The global navigation structure (i.e., sidebar, header) will remain consistent with the employee UX to maintain a unified platform experience. However, the links and content presented will be tailored and optimized for the manager's needs.

- **Sidebar:** In addition to standard links, the sidebar will feature direct navigation to manager-specific sections, such as **Reports** and **Team Management**.
    
- **Quick Actions:** The primary + New button in the sidebar will house a contextual menu with manager-centric actions, including "Create New Project," "Assign New Task," and "Post Announcement."
    

---

### **3. Key Screen Designs (Desktop-First Focus)**

The manager experience is prioritized for desktop, as monitoring and complex management tasks are most effectively performed on a larger screen.

#### **3.1. Manager Dashboard**

The dashboard is the manager's primary tool, meticulously designed to answer three critical questions instantly: **"What needs my immediate attention?"**, **"How is my team doing?"**, and **"What is the status of our projects?"**.

- **Layout:** A three-column layout is utilized for optimal information density and scannability (Left Navigation Sidebar, Main Content Column, Right Informational Column).
    
- **Main Column (Center):**
    
    - **Action Center Widget:** (Top Priority)
        
        - A concise, high-priority list of all pending approvals (e.g., leave requests, expense reports).
            
        - Each item clearly displays the requestor's name and the request type. Clicking an item reveals full details in a modal or an inline expansion, allowing the manager to make an informed decision without navigating away.
            
    - **Today's Team Activity Widget:**
        
        - Directly addresses the question, "Is my team engaged and making progress?"
            
        - It displays a list of team members. Next to each name, it shows the **most recently updated task** or the **task they are currently working on**.
            
        - A simple presence indicator (e.g., a green dot for Active, grey for Idle) provides a rapid visual summary of team engagement.
            
    - **Tasks at Risk Widget:**
        
        - An intelligent, filtered list that surfaces only the most critical tasks: those that are **Overdue** or **approaching their deadline and have not yet been started**. This widget is a proactive tool for identifying and mitigating potential bottlenecks.
            
- **Right-hand Column (Sidebar):**
    
    - **Team Presence Widget:** (Top Priority in this column)
        
        - A quick, high-level overview of the team's attendance status, broken down into three clear categories: Clocked In, On Leave, and Absent.
            
        - Includes a direct link to the full attendance report for deeper analysis.
            
    - **Team Workload Widget:**
        
        - A simple bar chart or a list that visualizes the number of active tasks assigned to each team member. This helps managers instantly identify who may be under-utilized or overburdened, facilitating smarter task allocation.
            
    - **Quick Links Widget:**
        
        - Provides one-click access to the most common manager-initiated actions, such as "Assign a New Task" and "Post a Team Announcement."
            

#### **3.2. Team Management Page**

- **Objective:** To provide a comprehensive, 360-degree view of each team member.
    
- **Key Features:**
    
    - A manager-facing profile for each employee.
        
    - A complete view of the individual's active and completed tasks.
        
    - Access to their request history (leave, expenses, etc.).
        
    - Individual performance metrics and reports.
        

---

### **4. Key User Flows**

1. **The Morning Check-in Scenario:** A manager logs in. The **Action Center** immediately flags two pending leave requests. The **Tasks at Risk** widget shows that a critical task is overdue from yesterday. Glancing at the **Team Workload** widget, they notice one developer has no active tasks. With these three insights gained in under a minute, the manager has a clear action plan for the morning: approve the requests, follow up on the overdue task, and assign a new task to the available developer.
    
2. **The Intelligent Task Assignment Flow:** A manager creates a new task. When it's time to assign it, the system displays the current number of active tasks for each team member directly within the assignment interface (pulling data from the **Team Workload** logic). This contextual information empowers the manager to make the best possible assignment decision based on real-time data, ensuring a balanced workload across the team.