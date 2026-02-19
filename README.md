# NewsPress Backend - Advanced News Management API

A high-performance, scalable, and secure RESTful API built to power the NewsPress ecosystem. This backend handles complex data relationships, real-time analytics, and secure administrative operations for a modern news platform.

---

## 🚀 Key Technical Features

This project implements professional-grade backend logic with a focus on data integrity and performance:

### 📰 1. Dynamic Content & Slug Management
* **Smart Slug Generation:** Automated, SEO-friendly slug generation with built-in support for Bengali (Unicode) and English characters.
* **Timestamp Salting:** Implements unique suffixing logic using `Date.now()` to prevent slug collisions during concurrent post creation.

### 📈 2. Real-time Analytics & View Tracking
* **Atomic Increments:** Utilizes Prisma's atomic update operations for `viewCount` to ensure accuracy even under high traffic.
* **Optimized Fetching:** Implements a fail-safe mechanism in news retrieval where data is served via `findUnique` if an update operation encounters a database lock.

### 🛡️ 3. Role-Based Access Control (RBAC)
* **Multi-Level Authentication:** Granular permission system for `ADMIN` and `USER` roles.
* **Protected Routes:** Sensitive operations like news creation, updates, and deletions are strictly guarded by custom middleware.

### 📂 4. Complex Data Modeling (Prisma & PostgreSQL)
* **Relational Integrity:** Manages deep-level relations between Posts, Categories, Authors, and Comments.
* **Eager Loading:** Uses optimized `include` and `select` queries to fetch nested data (like author profiles and user comments) in a single database round-trip.

### 💬 5. Interactive Commenting System
* **Threaded Metadata:** Efficiently serves comments along with user identity (names/images) while maintaining high performance using PostgreSQL indexing.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Language** | TypeScript |
| **Authentication** | Custom Auth Middleware (JWT/Session based) |

---

## ⚙️ Core Architecture

* **Service-Controller Pattern:** Decoupled architecture where the `Controller` handles HTTP requests and the `Service` layer manages business logic and database interactions.
* **Error Handling:** Centralized global error handling for consistent API responses.
* **Sanitization:** Regex-based sanitization for URLs and Titles to maintain clean data entry.

---

**Engineered for Speed, Scalability, and Clean Content Delivery.**