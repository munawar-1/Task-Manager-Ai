# Full-Stack Task Manager

A lightning-fast, modern, full-stack Task Manager application built with React, Spring Boot, MySQL, and Firebase Authentication.

> Made with Antigravity 🚀

## Overview

This application allows users to securely log in, manage daily/monthly/yearly tasks, categorize them, and track subtasks. It is designed to be highly responsive and feels instantaneous thanks to **Optimistic UI Updates** on the frontend.

## Architecture & Tech Stack

This project is built using a modern, decoupled cloud architecture completely hosted on free-tier services. 

* **Frontend (React + Vercel):** The user interface is built with React and Vite. It handles all visual elements and interactions. Hosted on Vercel for lightning-fast edge delivery.
* **Authentication (Google Firebase):** Securely manages user accounts and passwords. It issues JSON Web Tokens (JWT) to the frontend, which are used to authorize backend requests.
* **Backend (Java Spring Boot + Render):** The core API logic. It securely verifies Firebase JWTs, processes business logic, and communicates with the database. Hosted on a Render web service.
* **Database (MySQL + Aiven):** The persistent storage layer. A fully managed MySQL database hosted on Aiven, sitting in the same geographic region as the backend to minimize latency.

## Key Features

- **Secure Authentication:** Powered by Firebase, ensuring user data is private and secure.
- **Optimistic UI:** When users interact with the app (e.g., adding or moving a task), the UI updates instantly (0.01s latency), completely masking backend network delays.
- **Categorization & Prioritization:** Organize tasks by custom categories and assign High/Medium/Low priority.
- **Dark Mode:** Built-in theme toggling for eye strain reduction.
- **Subtasks:** Break down larger goals into manageable checklist items.
- **Responsive Design:** Works seamlessly on both desktop and mobile devices.

## Local Development

### Prerequisites
- Node.js & npm (for Frontend)
- Java 21 & Maven (for Backend)
- A local MySQL database (or cloud equivalent)
- A Firebase Project

### Running the Backend
1. Navigate to `backend/task-manager-backend`
2. Update `src/main/resources/application.properties` with your database credentials.
3. Run the Spring Boot application using Maven or your IDE.

### Running the Frontend
1. Navigate to the root directory.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Deployment

- **Frontend:** Automatically deployed via Vercel when pushed to the `main` branch.
- **Backend:** Configured for PaaS deployment (Render/Railway) with environment variables for database connection (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`).

---
*This project was developed with the assistance of Antigravity.*
