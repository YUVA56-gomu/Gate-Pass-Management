# Smart Gate Pass Management System
## Complete Project Documentation
### VTU DBMS Mini Project Report

---

> **Document Version:** 1.0  
> **Prepared For:** VTU DBMS Mini Project Report  
> **Project Type:** Full-Stack Web Application  
> **Database:** MySQL 8+  
> **Architecture:** Client-Server (REST API)

---

## Table of Contents

1. [Project Information](#1-project-information)
2. [Technology Stack](#2-technology-stack)
3. [Project Architecture](#3-project-architecture)
4. [Database Documentation](#4-database-documentation)
5. [ER Diagram Information](#5-er-diagram-information)
6. [SQL Documentation](#6-sql-documentation)
7. [API Documentation](#7-api-documentation)
8. [Authentication System](#8-authentication-system)
9. [User Roles & Features](#9-user-roles--features)
10. [Business Workflow](#10-business-workflow)
11. [Dashboard Documentation](#11-dashboard-documentation)
12. [Notification System](#12-notification-system)
13. [PDF Generation System](#13-pdf-generation-system)
14. [QR Code System](#14-qr-code-system)
15. [Dependencies](#15-dependencies)
16. [UI Pages Documentation](#16-ui-pages-documentation)
17. [Testing & Validation](#17-testing--validation)
18. [Challenges Faced](#18-challenges-faced)
19. [Future Enhancements](#19-future-enhancements)
20. [References](#20-references)
21. [Report Assets Checklist](#21-report-assets-checklist)

---

## 1. Project Information

### 1.1 Project Name
**Smart Gate Pass Management System**

### 1.2 Project Objective
To design and develop a fully digital, role-based gate pass management system for college hostels that eliminates paper-based processes, enforces multi-stage approval workflows, and provides real-time tracking of student movements through QR code scanning at the campus gate.

### 1.3 Problem Statement
Traditional college hostel gate pass systems rely on physical paper forms, manual signatures, and manual record-keeping. This leads to:
- Loss or forgery of paper passes
- Delays in multi-stage approvals (Coordinator → Hostel Staff)
- No real-time visibility of students currently outside campus
- Inability to generate reports or audit trails
- Difficulty in verifying pass authenticity at the gate
- No automated notifications to students about approval status

### 1.4 Project Description
The Smart Gate Pass Management System is a full-stack web application that digitizes the entire gate pass lifecycle for college hostel students. Students apply for passes online, which are routed through a configurable approval chain (Coordinator for long leave, Hostel Staff for daily passes). Upon final approval, a QR code is generated and embedded in a downloadable PDF. Security guards scan the QR code at the gate to log student entry and exit. Administrators have a complete dashboard for user management, reporting, and system oversight.

### 1.5 Major Features
- **Student Registration & Profile Management** — Students register, complete their academic and hostel profile
- **Two Pass Types** — Daily Pass (same-day) and Long Leave (multi-day with coordinator approval)
- **Multi-Stage Approval Workflow** — Coordinator approval (Long Leave only) → Hostel Staff approval
- **QR Code Generation** — UUID-based QR token generated upon final approval
- **PDF Pass Generation** — Professional A4 PDF with student details, approval info, and embedded QR code
- **Security Gate Scanning** — QR scan logs OUT (exit) and IN (return) with timestamp
- **Real-Time Notifications** — In-app notifications for every status change
- **Role-Based Dashboards** — Separate dashboards for Student, Coordinator, Hostel Staff, Security, Admin
- **Admin Reports** — Department-wise, monthly, pass-type, coordinator/hostel staff performance reports
- **CSV Export** — All reports exportable as CSV
- **Activity Logs** — Full audit trail of all system actions
- **User Management** — Admin can create, activate, deactivate, and reset passwords for staff accounts

### 1.6 User Roles
| Role | Description |
|------|-------------|
| STUDENT | Hostel resident who applies for gate passes |
| COORDINATOR | Faculty coordinator who approves long leave requests |
| HOSTEL_STAFF | Hostel warden/staff who approves daily and long leave passes |
| SECURITY | Gate security guard who scans QR codes |
| ADMIN | System administrator with full access |

### 1.7 Target Users
- College hostel students (UG and PG)
- Faculty coordinators assigned to departments
- Hostel wardens and staff
- Campus security personnel
- College administration

### 1.8 Real-World Use Case
A hostel student at a VTU-affiliated engineering college wants to go home for a weekend. They log in, select "Long Leave", fill in the dates, reason, destination, parent contact, and select their coordinator and hostel warden. The coordinator receives a notification, reviews and approves. The hostel warden then approves. The student receives a notification, downloads the PDF with QR code, and presents it at the gate. The security guard scans the QR — the system logs the exit. On return, the guard scans again — the system logs the entry and marks the pass as completed.

---

## 2. Technology Stack

### 2.1 Frontend

| Category | Technology | Version | Details |
|----------|-----------|---------|---------|
| Framework | React | 18.2.0 | Component-based UI library |
| Build Tool | Vite | 5.0.0 | Fast dev server and bundler |
| Routing | React Router DOM | 6.20.0 | Client-side routing with nested routes |
| State Management | React Context API | Built-in | AuthContext, NotificationContext |
| HTTP Client | Axios | 1.6.0 | REST API calls with interceptors |
| Form Handling | React Hook Form | 7.48.0 | Form validation and state |
| Styling | Tailwind CSS | 3.3.0 | Utility-first CSS framework |
| PDF Generation | jsPDF | 2.5.1 | Client-side PDF generation |
| QR Display | qrcode.react | 4.2.0 | QR code rendering component |
| PostCSS | PostCSS + Autoprefixer | 8.4.31 | CSS processing |
| Font | Inter (Google Fonts) | — | Primary UI font |

### 2.2 Backend

| Category | Technology | Version | Details |
|----------|-----------|---------|---------|
| Runtime | Node.js | LTS | JavaScript server runtime |
| Framework | Express.js | 4.18.2 | Web application framework |
| ORM | Sequelize | 6.35.0 | MySQL ORM with model associations |
| Database Driver | mysql2 | 3.6.0 | MySQL connection driver |
| Authentication | jsonwebtoken (JWT) | 9.0.3 | Token-based authentication |
| Password Hashing | bcrypt | 6.0.0 | Password hashing with salt rounds |
| Password Hashing (alt) | bcryptjs | 2.4.3 | Pure JS bcrypt fallback |
| Validation | express-validator | 7.0.0 | Request validation middleware |
| PDF Generation | PDFKit | 0.13.0 | Server-side PDF generation |
| QR Code | qrcode | 1.5.3 | QR code generation (PNG/Base64) |
| File Upload | multer | 1.4.5-lts.1 | Multipart form data handling |
| CORS | cors | 2.8.5 | Cross-Origin Resource Sharing |
| Environment | dotenv | 16.3.1 | Environment variable management |
| Dev Server | nodemon | 3.0.1 | Auto-restart on file changes |

### 2.3 Database

| Category | Technology | Details |
|----------|-----------|---------|
| Database Type | MySQL 8+ | Relational DBMS |
| ORM | Sequelize v6 | Model-based query builder |
| Connection Method | Connection Pool | max: 5, min: 0, acquire: 30s, idle: 10s |
| Host | localhost | Port 3306 |
| Database Name | smart_gate_pass | |
| Charset | UTF-8 | Default MySQL charset |

### 2.4 Development Tools

| Tool | Purpose |
|------|---------|
| VS Code | Primary IDE |
| Git | Version control |
| npm | Package manager (both client and server) |
| Vite Dev Server | Frontend development server (port 5173) |
| Node --watch | Backend development server (port 5000) |
| MySQL Workbench / CLI | Database management |
| Postman | API testing |

### 2.5 Environment Configuration

**Server `.env` variables:**
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<password>
DB_NAME=smart_gate_pass
DB_PORT=3306
JWT_SECRET=<256-bit hex secret>
JWT_EXPIRE=7d
UPLOAD_DIR=./uploads
```

---

## 3. Project Architecture

### 3.1 Complete Folder Structure

```
Gate-Pass-Management/
├── client/                          # React Frontend Application
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite build configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── src/
│       ├── main.jsx                 # React app entry point
│       ├── App.jsx                  # Root component (Router + Providers)
│       ├── index.css                # Global styles
│       ├── api/                     # API layer (Axios calls)
│       │   ├── axios.js             # Axios instance + interceptors
│       │   ├── auth.api.js          # Authentication API calls
│       │   ├── pass.api.js          # Pass management API calls
│       │   ├── student.api.js       # Student profile API calls
│       │   ├── coordinator.api.js   # Coordinator/hostel staff listing
│       │   ├── hostel.api.js        # Hostel staff API calls
│       │   ├── security.api.js      # Security/QR scan API calls
│       │   ├── admin.api.js         # Admin management API calls
│       │   ├── notification.api.js  # Notification API calls
│       │   ├── qr.api.js            # QR code API calls
│       │   ├── pdf.api.js           # PDF generation API calls
│       │   ├── report.api.js        # Reports API calls
│       │   ├── approval.api.js      # Approval workflow API calls
│       │   └── user.api.js          # User management API calls
│       ├── context/                 # React Context (Global State)
│       │   ├── AuthContext.jsx      # Authentication state + actions
│       │   └── NotificationContext.jsx  # Toast notification state
│       ├── hooks/                   # Custom React Hooks
│       │   ├── useAuth.js           # Auth context consumer hook
│       │   └── useNotification.js   # Notification context consumer hook
│       ├── routes/                  # Routing configuration
│       │   ├── AppRoutes.jsx        # All application routes
│       │   ├── PrivateRoute.jsx     # Authentication guard
│       │   └── RoleRoute.jsx        # Role-based access guard
│       ├── components/              # Reusable UI Components
│       │   ├── common/
│       │   │   ├── Navbar.jsx       # Top navigation bar
│       │   │   ├── Sidebar.jsx      # Side navigation menu
│       │   │   ├── Notification.jsx # Notification bell component
│       │   │   └── QRModal.jsx      # QR code display modal
│       │   ├── dashboard/
│       │   │   ├── DashboardHeader.jsx
│       │   │   ├── StatsCard.jsx
│       │   │   ├── QuickActionsPanel.jsx
│       │   │   ├── RecentActivityTable.jsx
│       │   │   ├── RoleNavigation.jsx
│       │   │   └── InstructionsPanel.jsx
│       │   ├── landing/
│       │   │   ├── HeroSection.jsx
│       │   │   ├── FeaturesSection.jsx
│       │   │   ├── WorkflowSection.jsx
│       │   │   ├── StatisticsSection.jsx
│       │   │   ├── PortalCards.jsx
│       │   │   ├── SystemOverview.jsx
│       │   │   ├── SystemPreview.jsx
│       │   │   ├── WhyChooseSection.jsx
│       │   │   ├── GlassCard.jsx
│       │   │   ├── BubbleDecorations.jsx
│       │   │   ├── Navbar.jsx
│       │   │   └── Footer.jsx
│       │   ├── layouts/
│       │   │   ├── DashboardShell.jsx   # Common dashboard wrapper
│       │   │   └── StudentLayout.jsx    # Student-specific layout
│       │   └── ui/
│       │       ├── DataTable.jsx        # Reusable data table
│       │       ├── StatsCard.jsx        # Statistics card
│       │       ├── StatusBadge.jsx      # Status indicator badge
│       │       ├── Modal.jsx            # Generic modal dialog
│       │       ├── PageHeader.jsx       # Page title + back button
│       │       └── LoadingScreen.jsx    # Full-screen loading
│       ├── pages/                   # Page Components (by role)
│       │   ├── Auth/
│       │   │   ├── Landing.jsx      # Public landing page
│       │   │   ├── Login.jsx        # Login form
│       │   │   └── Register.jsx     # Student registration form
│       │   ├── Student/
│       │   │   ├── Dashboard.jsx    # Student home dashboard
│       │   │   ├── ApplyPass.jsx    # Pass application form
│       │   │   ├── MyPasses.jsx     # Pass history list
│       │   │   ├── Notifications.jsx # Notification inbox
│       │   │   └── Profile.jsx      # Student profile editor
│       │   ├── Coordinator/
│       │   │   ├── Dashboard.jsx    # Coordinator home
│       │   │   ├── PendingRequests.jsx # Long leave approvals
│       │   │   └── History.jsx      # Approval history
│       │   ├── Hostel/
│       │   │   ├── Dashboard.jsx    # Hostel staff home
│       │   │   ├── PendingRequests.jsx # Pass approvals
│       │   │   ├── AllPasses.jsx    # All passes view
│       │   │   ├── Students.jsx     # Student directory
│       │   │   └── Profile.jsx      # Staff profile
│       │   ├── Security/
│       │   │   ├── Dashboard.jsx    # Security home
│       │   │   ├── QRScanner.jsx    # QR scan interface
│       │   │   ├── ScanLogs.jsx     # Gate log history
│       │   │   └── NewDashboard.jsx # Alternative dashboard
│       │   └── Admin/
│       │       ├── Dashboard.jsx    # Admin home
│       │       ├── UserManagement.jsx # User CRUD
│       │       ├── Users.jsx        # Users list
│       │       ├── Reports.jsx      # Analytics reports
│       │       ├── Settings.jsx     # System settings
│       │       └── ActivityLogs.jsx # Audit trail
│       └── styles/
│           ├── animations.css       # CSS animations
│           └── designSystem.css     # Design tokens and utilities
│
├── server/                          # Express Backend Application
│   ├── package.json                 # Backend dependencies
│   ├── .env                         # Environment variables
│   ├── migrations/                  # Database migrations
│   │   ├── add_pass_type_fields.js  # Pass type redesign migration
│   │   └── fix_pass_date_columns.js # Date column fix migration
│   └── src/
│       ├── server.js                # Express app entry point
│       ├── config/
│       │   └── db.js                # Sequelize database connection
│       ├── models/                  # Sequelize ORM Models
│       │   ├── index.js             # Model associations
│       │   ├── User.js              # User model
│       │   ├── Student.js           # Student profile model
│       │   ├── Department.js        # Department model
│       │   ├── Pass.js              # Gate pass model
│       │   ├── Approval.js          # Approval record model
│       │   ├── QRToken.js           # QR token model
│       │   ├── GateLog.js           # Gate entry/exit log model
│       │   ├── Notification.js      # Notification model
│       │   └── ActivityLog.js       # Activity audit log model
│       ├── controllers/             # Request handlers
│       │   ├── auth.controller.js
│       │   ├── student.controller.js
│       │   ├── pass.controller.js
│       │   ├── approval.controller.js
│       │   ├── coordinator.controller.js
│       │   ├── hostel.controller.js
│       │   ├── security.controller.js
│       │   ├── admin.controller.js
│       │   ├── notification.controller.js
│       │   ├── report.controller.js
│       │   ├── qr.controller.js
│       │   ├── pdf.controller.js
│       │   └── user.controller.js
│       ├── services/                # Business logic layer
│       │   ├── auth.service.js
│       │   ├── pass.service.js
│       │   ├── approval.service.js
│       │   ├── coordinator.service.js
│       │   ├── hostel.service.js
│       │   ├── security.service.js
│       │   ├── admin.service.js
│       │   ├── notification.service.js
│       │   ├── report.service.js
│       │   ├── qr.service.js
│       │   ├── pdf.service.js
│       │   └── student.service.js
│       ├── repositories/            # Data access layer
│       │   ├── pass.repository.js
│       │   ├── approval.repository.js
│       │   ├── gateLog.repository.js
│       │   └── user.repository.js
│       ├── routes/                  # Express route definitions
│       │   ├── auth.routes.js
│       │   ├── student.routes.js
│       │   ├── pass.routes.js
│       │   ├── approval.routes.js
│       │   ├── coordinator.routes.js
│       │   ├── hostel.routes.js
│       │   ├── security.routes.js
│       │   ├── admin.routes.js
│       │   ├── notification.routes.js
│       │   ├── report.routes.js
│       │   ├── qr.routes.js
│       │   ├── pdf.routes.js
│       │   └── user.routes.js
│       ├── middleware/              # Express middleware
│       │   ├── auth.middleware.js   # JWT verification
│       │   ├── role.middleware.js   # Role-based access control
│       │   └── error.middleware.js  # Global error handler
│       ├── utils/                   # Utility functions
│       │   ├── jwt.js               # JWT generate/verify/decode
│       │   ├── bcrypt.js            # Password hash/compare
│       │   ├── response.js          # Standardized API responses
│       │   ├── generatePDF.js       # PDF utility
│       │   └── generateQRCode.js    # QR utility
│       ├── scripts/                 # Admin/setup scripts
│       │   ├── create-admin.js      # Create admin user
│       │   ├── seed-departments.js  # Seed department data
│       │   ├── fix-student-schema.js
│       │   └── repair-student-records.js
│       └── pdf/                     # Generated PDF storage
│           ├── PASS_2.pdf
│           └── PASS_3.pdf
│
├── DATABASE_QUERIES.sql             # Complex SQL query reference
├── DATABASE_TABLES.sql              # Table creation SQL
├── README.md                        # Project overview
└── [150+ documentation .md files]  # Development documentation
```

### 3.2 Frontend Architecture

The frontend follows a layered architecture:

```
App.jsx (BrowserRouter)
  └── AuthProvider (AuthContext)
        └── NotificationProvider (NotificationContext)
              └── AppRoutes
                    ├── Public Routes (Landing, Login, Register)
                    └── PrivateRoute (JWT check)
                          └── RoleRoute (role check)
                                └── Role-specific Pages
                                      └── DashboardShell (layout)
                                            ├── Sidebar
                                            ├── Navbar
                                            └── Page Content
                                                  └── UI Components
```

**Data Flow:**
1. User action triggers API call via `src/api/*.api.js`
2. Axios interceptor attaches JWT from `localStorage`
3. Response updates local component state via `useState`/`useEffect`
4. Global state (auth, toasts) managed via Context API

### 3.3 Backend Architecture

The backend follows a layered MVC + Repository pattern:

```
HTTP Request
  └── Express Router (routes/*.routes.js)
        └── Middleware (auth + role check)
              └── Controller (controllers/*.controller.js)
                    └── Service (services/*.service.js)
                          └── Repository (repositories/*.repository.js)
                                └── Sequelize Model (models/*.js)
                                      └── MySQL Database
```

**Response Format (standardized):**
```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

### 3.4 API Architecture

- **Base URL:** `http://localhost:5000`
- **Protocol:** REST over HTTP
- **Authentication:** Bearer JWT in `Authorization` header
- **Content-Type:** `application/json`
- **Route Prefixes:**
  - `/auth` — Authentication
  - `/student` — Student profile
  - `/passes` — Pass management
  - `/approvals` — Coordinator approvals
  - `/hostel` — Hostel staff operations
  - `/security` — Security gate operations
  - `/admin` — Admin management
  - `/coordinators` — Coordinator/hostel staff listing
  - `/notifications` — Notification management
  - `/reports` — Analytics and reports
  - `/qr` — QR code operations
  - `/pdf` — PDF generation and download
  - `/users` — User profile management

---

## 4. Database Documentation

**Database Name:** `smart_gate_pass`  
**DBMS:** MySQL 8+  
**ORM:** Sequelize v6  
**Total Tables:** 9

---

### 4.1 Table: `users`

**Purpose:** Stores all system users across all roles (Student, Coordinator, Hostel Staff, Security, Admin).

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| name | VARCHAR(255) | NO | — | Full name of the user |
| email | VARCHAR(255) | NO | — | Unique email address (login credential) |
| password | VARCHAR(255) | NO | — | bcrypt-hashed password |
| role | ENUM | NO | 'STUDENT' | Role: STUDENT, COORDINATOR, HOSTEL_STAFF, SECURITY, ADMIN |
| phone | VARCHAR(255) | YES | NULL | Contact phone number |
| is_active | BOOLEAN | YES | true | Account active/inactive flag |
| last_login | DATETIME | YES | NULL | Timestamp of last successful login |
| createdAt | DATETIME | YES | NOW() | Record creation timestamp |
| updatedAt | DATETIME | YES | NOW() | Record last update timestamp |

**Primary Key:** `id`  
**Unique Constraints:** `email`  
**Indexes:** `email` (unique index for fast login lookup)

---

### 4.2 Table: `students`

**Purpose:** Stores academic and hostel profile information for users with STUDENT role. One-to-one with `users`.

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| user_id | INT | NO | — | FK → users.id (CASCADE DELETE) |
| usn | VARCHAR(255) | YES | NULL | University Seat Number (unique) |
| department_id | INT | YES | NULL | FK → departments.id |
| program_type | ENUM('UG','PG') | YES | NULL | Undergraduate or Postgraduate |
| year_of_study | INT | YES | NULL | Current year (1–4 for UG, 1–2 for PG) |
| semester | INT | YES | NULL | Current semester number |
| gender | ENUM('MALE','FEMALE','OTHER') | YES | NULL | Student gender |
| hostel_name | VARCHAR(255) | YES | NULL | Name of hostel block |
| hostel_type | ENUM('BOYS','GIRLS') | YES | NULL | Hostel type |
| room_number | VARCHAR(255) | YES | NULL | Room number in hostel |
| parent_phone | VARCHAR(255) | YES | NULL | Parent/guardian phone number |
| emergency_contact | VARCHAR(255) | YES | NULL | Emergency contact number |
| createdAt | DATETIME | YES | NOW() | Record creation timestamp |
| updatedAt | DATETIME | YES | NOW() | Record last update timestamp |

**Primary Key:** `id`  
**Foreign Keys:** `user_id` → `users(id)` ON DELETE CASCADE, `department_id` → `departments(id)` ON DELETE RESTRICT  
**Unique Constraints:** `user_id`, `usn`

---

### 4.3 Table: `departments`

**Purpose:** Stores academic department information used for student classification and coordinator assignment.

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| name | VARCHAR(255) | NO | — | Full department name (e.g., Computer Science) |
| code | VARCHAR(255) | NO | — | Short department code (e.g., CSE) |
| description | TEXT | YES | NULL | Optional department description |
| createdAt | DATETIME | YES | NOW() | Record creation timestamp |
| updatedAt | DATETIME | YES | NOW() | Record last update timestamp |

**Primary Key:** `id`  
**Unique Constraints:** `name`, `code`

---

### 4.4 Table: `passes`

**Purpose:** Core table storing all gate pass applications with type, dates, status, and approval assignments.

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| student_id | INT | NO | — | FK → students.id (CASCADE DELETE) |
| pass_type | ENUM('DAILY','LONG_LEAVE') | NO | 'DAILY' | Type of pass |
| reason | TEXT | NO | — | Reason for the pass request |
| destination | VARCHAR(255) | NO | — | Destination (home, hospital, etc.) |
| pass_date | DATE | YES | NULL | For DAILY: the date of the pass |
| from_date | DATE | YES | NULL | For LONG_LEAVE: leaving date (legacy) |
| to_date | DATE | YES | NULL | For LONG_LEAVE: returning date (legacy) |
| leaving_date | DATE | YES | NULL | For LONG_LEAVE: leaving date (new) |
| returning_date | DATE | YES | NULL | For LONG_LEAVE: returning date (new) |
| exit_time | TIME | YES | NULL | For DAILY: optional planned exit time |
| expected_return_time | TIME | YES | NULL | For DAILY: optional expected return time |
| parent_contact | VARCHAR(255) | YES | NULL | For LONG_LEAVE: parent phone number |
| coordinator_id | INT | YES | NULL | FK → users.id (SET NULL) — assigned coordinator |
| hostel_staff_id | INT | YES | NULL | FK → users.id (SET NULL) — selected hostel staff |
| status | ENUM | NO | 'PENDING_HOSTEL' | Pass status (see below) |
| pdf_path | VARCHAR(255) | YES | NULL | Relative path to generated PDF file |
| createdAt | DATETIME | YES | NOW() | Record creation timestamp |
| updatedAt | DATETIME | YES | NOW() | Record last update timestamp |

**Pass Status ENUM Values:**
- `PENDING_COORDINATOR` — Awaiting coordinator approval (Long Leave only)
- `PENDING_HOSTEL` — Awaiting hostel staff approval
- `APPROVED` — Fully approved, QR can be generated
- `REJECTED` — Rejected by coordinator or hostel staff
- `CANCELLED` — Cancelled by student
- `COMPLETED` — Student has exited and returned (both gate scans done)

**Primary Key:** `id`  
**Foreign Keys:**
- `student_id` → `students(id)` ON DELETE CASCADE
- `coordinator_id` → `users(id)` ON DELETE SET NULL
- `hostel_staff_id` → `users(id)` ON DELETE SET NULL

---

### 4.5 Table: `approvals`

**Purpose:** Stores individual approval records for each stage of the pass approval workflow.

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| pass_id | INT | NO | — | FK → passes.id (CASCADE DELETE) |
| approved_by | INT | YES | NULL | FK → users.id (SET NULL) — approver user |
| stage | ENUM('COORDINATOR','HOSTEL_STAFF') | NO | — | Approval stage |
| status | ENUM('PENDING','APPROVED','REJECTED') | YES | 'PENDING' | Approval decision |
| remarks | TEXT | YES | NULL | Approver's comments or rejection reason |
| approved_at | DATETIME | YES | NULL | Timestamp of approval/rejection action |
| createdAt | DATETIME | YES | NOW() | Record creation timestamp |
| updatedAt | DATETIME | YES | NOW() | Record last update timestamp |

**Primary Key:** `id`  
**Foreign Keys:**
- `pass_id` → `passes(id)` ON DELETE CASCADE
- `approved_by` → `users(id)` ON DELETE SET NULL

---

### 4.6 Table: `qr_tokens`

**Purpose:** Stores UUID-based QR tokens generated for approved passes. One-to-one with `passes`.

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| pass_id | INT | NO | — | FK → passes.id (CASCADE DELETE) — unique |
| token | VARCHAR(500) | NO | — | UUID token string (unique) |
| is_active | BOOLEAN | YES | true | Whether token is currently valid |
| generated_at | DATETIME | YES | NOW() | When token was generated |
| expires_at | DATETIME | YES | NULL | Optional expiry timestamp |
| createdAt | DATETIME | YES | NOW() | Record creation timestamp |

**Primary Key:** `id`  
**Foreign Keys:** `pass_id` → `passes(id)` ON DELETE CASCADE  
**Unique Constraints:** `pass_id`, `token`  
**Timestamps:** `timestamps: false` (manual createdAt only)

---

### 4.7 Table: `gate_logs`

**Purpose:** Records every QR scan event at the campus gate, tracking student exit (OUT) and return (IN).

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| pass_id | INT | NO | — | FK → passes.id (CASCADE DELETE) |
| action | ENUM('IN','OUT') | NO | — | Gate action: OUT = exit, IN = return |
| scan_status | ENUM('VALID','INVALID','EXPIRED') | YES | 'VALID' | QR scan validity status |
| scanned_by | INT | YES | NULL | FK → users.id (SET NULL) — security guard |
| scanned_at | DATETIME | YES | NOW() | Timestamp of the scan |
| createdAt | DATETIME | YES | NOW() | Record creation timestamp |

**Primary Key:** `id`  
**Foreign Keys:**
- `pass_id` → `passes(id)` ON DELETE CASCADE
- `scanned_by` → `users(id)` ON DELETE SET NULL  
**Timestamps:** `timestamps: false`

---

### 4.8 Table: `notifications`

**Purpose:** Stores in-app notifications for all users about pass status changes and system events.

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| user_id | INT | NO | — | FK → users.id (CASCADE DELETE) — recipient |
| type | ENUM | NO | — | Notification type (see below) |
| title | VARCHAR(255) | NO | — | Short notification title |
| message | TEXT | NO | — | Full notification message |
| related_pass_id | INT | YES | NULL | FK → passes.id (SET NULL) — linked pass |
| is_read | BOOLEAN | YES | false | Read/unread status |
| read_at | DATETIME | YES | NULL | Timestamp when notification was read |
| createdAt | DATETIME | YES | NOW() | Record creation timestamp |

**Notification Type ENUM Values:**
- `PASS_SUBMITTED` — Student submitted a pass request
- `COORDINATOR_APPROVED` — Coordinator approved the pass
- `COORDINATOR_REJECTED` — Coordinator rejected the pass
- `HOSTEL_APPROVED` — Hostel staff approved the pass
- `HOSTEL_REJECTED` — Hostel staff rejected the pass
- `QR_GENERATED` — QR code is ready for the student
- `PASS_COMPLETED` — Pass journey completed (both scans done)
- `NEW_REQUEST` — New request pending for coordinator/hostel staff
- `SYSTEM` — System-wide broadcast notification

**Primary Key:** `id`  
**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `related_pass_id` → `passes(id)` ON DELETE SET NULL  
**Timestamps:** `timestamps: false`

---

### 4.9 Table: `activity_logs`

**Purpose:** Audit trail recording all significant user actions in the system for admin review.

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | Primary key |
| user_id | INT | NO | — | FK → users.id (CASCADE DELETE) — actor |
| action | VARCHAR(255) | NO | — | Description of the action performed |
| entity_type | VARCHAR(255) | YES | NULL | Type of entity affected (e.g., 'Pass', 'User') |
| entity_id | INT | YES | NULL | ID of the affected entity |
| old_values | JSON | YES | NULL | Previous values before change |
| new_values | JSON | YES | NULL | New values after change |
| ip_address | VARCHAR(255) | YES | NULL | IP address of the request |
| user_agent | VARCHAR(255) | YES | NULL | Browser/client user agent string |
| createdAt | DATETIME | YES | NOW() | Timestamp of the action |

**Primary Key:** `id`  
**Foreign Keys:** `user_id` → `users(id)` ON DELETE CASCADE  
**Timestamps:** `timestamps: false`

---

## 5. ER Diagram Information

### 5.1 Entities and Attributes

| Entity | Primary Key | Key Attributes |
|--------|-------------|----------------|
| User | id | name, email, password, role, phone, is_active |
| Student | id | user_id, usn, department_id, program_type, year_of_study, hostel_name, room_number |
| Department | id | name, code, description |
| Pass | id | student_id, pass_type, reason, destination, status, coordinator_id, hostel_staff_id |
| Approval | id | pass_id, approved_by, stage, status, remarks, approved_at |
| QRToken | id | pass_id, token, is_active, expires_at |
| GateLog | id | pass_id, action, scan_status, scanned_by, scanned_at |
| Notification | id | user_id, type, title, message, related_pass_id, is_read |
| ActivityLog | id | user_id, action, entity_type, entity_id, old_values, new_values |

### 5.2 Relationships

#### One-to-One Relationships
| Entity A | Relationship | Entity B | Description |
|----------|-------------|----------|-------------|
| User | has one | Student | Each user with STUDENT role has exactly one student profile |
| Pass | has one | QRToken | Each approved pass has at most one active QR token |

#### One-to-Many Relationships
| Entity A (One) | Relationship | Entity B (Many) | Description |
|----------------|-------------|-----------------|-------------|
| Department | has many | Student | A department has many students |
| User | has many | Approval | A user (coordinator/hostel staff) makes many approvals |
| User | has many | GateLog | A security guard creates many gate logs |
| User | has many | Notification | A user receives many notifications |
| User | has many | ActivityLog | A user generates many activity log entries |
| User | has many | Pass (as coordinator) | A coordinator is assigned to many passes |
| User | has many | Pass (as hostelStaff) | A hostel staff member is assigned to many passes |
| Student | has many | Pass | A student can apply for many passes |
| Pass | has many | Approval | A pass has multiple approval records (one per stage) |
| Pass | has many | GateLog | A pass can have multiple gate scan logs (OUT + IN) |
| Pass | has many | Notification | A pass can trigger many notifications |

#### Many-to-Many Relationships
There are no direct many-to-many relationships. The `approvals` table acts as a junction/bridge between `passes` and `users` (approvers), but it is modeled as a one-to-many from both sides.

### 5.3 Cardinalities Summary

```
Department (1) ──────────── (N) Student
User (1) ────────────────── (1) Student
Student (1) ─────────────── (N) Pass
Pass (1) ────────────────── (N) Approval
Pass (1) ────────────────── (1) QRToken
Pass (1) ────────────────── (N) GateLog
Pass (1) ────────────────── (N) Notification
User (1) ────────────────── (N) Approval [as approver]
User (1) ────────────────── (N) GateLog [as scanner]
User (1) ────────────────── (N) Notification [as recipient]
User (1) ────────────────── (N) ActivityLog
User (1) ────────────────── (N) Pass [as coordinator]
User (1) ────────────────── (N) Pass [as hostelStaff]
```

### 5.4 ER Diagram Description (Textual)

```
[DEPARTMENT] ──(1:N)──> [STUDENT] ──(1:N)──> [PASS]
                              |                   |
                         (1:1)                (1:N)──> [APPROVAL] <──(N:1)── [USER]
                              |                   |
                         [USER]               (1:1)──> [QR_TOKEN]
                              |                   |
                         (1:N)──> [NOTIFICATION]  (1:N)──> [GATE_LOG] <──(N:1)── [USER]
                              |
                         (1:N)──> [ACTIVITY_LOG]
```

---

## 6. SQL Documentation

### 6.1 CREATE TABLE Statements

```sql
-- Table: users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('STUDENT','COORDINATOR','HOSTEL_STAFF','SECURITY','ADMIN') NOT NULL DEFAULT 'STUDENT',
  phone VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  createdAt DATETIME DEFAULT NOW(),
  updatedAt DATETIME DEFAULT NOW()
);

-- Table: departments
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  createdAt DATETIME DEFAULT NOW(),
  updatedAt DATETIME DEFAULT NOW()
);

-- Table: students
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  usn VARCHAR(255) UNIQUE,
  department_id INT,
  program_type ENUM('UG','PG'),
  year_of_study INT,
  semester INT,
  gender ENUM('MALE','FEMALE','OTHER'),
  hostel_name VARCHAR(255),
  hostel_type ENUM('BOYS','GIRLS'),
  room_number VARCHAR(255),
  parent_phone VARCHAR(255),
  emergency_contact VARCHAR(255),
  createdAt DATETIME DEFAULT NOW(),
  updatedAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

-- Table: passes
CREATE TABLE passes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  pass_type ENUM('DAILY','LONG_LEAVE') NOT NULL DEFAULT 'DAILY',
  reason TEXT NOT NULL,
  destination VARCHAR(255) NOT NULL,
  pass_date DATE,
  from_date DATE,
  to_date DATE,
  leaving_date DATE,
  returning_date DATE,
  exit_time TIME,
  expected_return_time TIME,
  parent_contact VARCHAR(255),
  coordinator_id INT,
  hostel_staff_id INT,
  status ENUM('PENDING_COORDINATOR','PENDING_HOSTEL','APPROVED','REJECTED','CANCELLED','COMPLETED')
         DEFAULT 'PENDING_HOSTEL',
  pdf_path VARCHAR(255),
  createdAt DATETIME DEFAULT NOW(),
  updatedAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (hostel_staff_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: approvals
CREATE TABLE approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pass_id INT NOT NULL,
  approved_by INT,
  stage ENUM('COORDINATOR','HOSTEL_STAFF') NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  remarks TEXT,
  approved_at DATETIME,
  createdAt DATETIME DEFAULT NOW(),
  updatedAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: qr_tokens
CREATE TABLE qr_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pass_id INT NOT NULL UNIQUE,
  token VARCHAR(500) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  generated_at DATETIME DEFAULT NOW(),
  expires_at DATETIME,
  createdAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE CASCADE
);

-- Table: gate_logs
CREATE TABLE gate_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pass_id INT NOT NULL,
  action ENUM('IN','OUT') NOT NULL,
  scan_status ENUM('VALID','INVALID','EXPIRED') DEFAULT 'VALID',
  scanned_by INT,
  scanned_at DATETIME DEFAULT NOW(),
  createdAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE CASCADE,
  FOREIGN KEY (scanned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: notifications
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('PASS_SUBMITTED','COORDINATOR_APPROVED','COORDINATOR_REJECTED',
            'HOSTEL_APPROVED','HOSTEL_REJECTED','QR_GENERATED',
            'PASS_COMPLETED','NEW_REQUEST','SYSTEM') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_pass_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  createdAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_pass_id) REFERENCES passes(id) ON DELETE SET NULL
);

-- Table: activity_logs
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(255),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(255),
  user_agent VARCHAR(255),
  createdAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 6.2 INSERT Examples

```sql
-- Insert a department
INSERT INTO departments (name, code, description)
VALUES ('Computer Science and Engineering', 'CSE', 'B.E. and M.Tech programs');

-- Insert an admin user
INSERT INTO users (name, email, password, role, is_active)
VALUES ('Admin User', 'admin@college.edu', '$2b$10$hashedpassword', 'ADMIN', TRUE);

-- Insert a student user
INSERT INTO users (name, email, password, role, phone, is_active)
VALUES ('Rahul Kumar', 'rahul@student.edu', '$2b$10$hashedpassword', 'STUDENT', '9876543210', TRUE);

-- Insert student profile
INSERT INTO students (user_id, usn, department_id, program_type, year_of_study, semester,
                      gender, hostel_name, hostel_type, room_number, parent_phone)
VALUES (2, '1VB21CS001', 1, 'UG', 3, 5, 'MALE', 'Block A', 'BOYS', 'A-204', '9876543211');

-- Insert a daily pass
INSERT INTO passes (student_id, pass_type, reason, destination, pass_date,
                    hostel_staff_id, status)
VALUES (1, 'DAILY', 'Medical appointment', 'City Hospital', '2026-06-05', 3, 'PENDING_HOSTEL');

-- Insert a long leave pass
INSERT INTO passes (student_id, pass_type, reason, destination, leaving_date, returning_date,
                    parent_contact, coordinator_id, hostel_staff_id, status)
VALUES (1, 'LONG_LEAVE', 'Festival holidays', 'Home - Bangalore', '2026-06-10', '2026-06-15',
        '9876543211', 2, 3, 'PENDING_COORDINATOR');

-- Insert an approval record
INSERT INTO approvals (pass_id, approved_by, stage, status, remarks, approved_at)
VALUES (1, 3, 'HOSTEL_STAFF', 'APPROVED', 'Approved for medical visit', NOW());

-- Insert a QR token
INSERT INTO qr_tokens (pass_id, token, is_active, generated_at)
VALUES (1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', TRUE, NOW());

-- Insert a gate log (exit)
INSERT INTO gate_logs (pass_id, action, scan_status, scanned_by, scanned_at)
VALUES (1, 'OUT', 'VALID', 5, NOW());

-- Insert a notification
INSERT INTO notifications (user_id, type, title, message, related_pass_id, is_read)
VALUES (2, 'HOSTEL_APPROVED', 'Pass Approved',
        'Your pass request has been approved by hostel staff.', 1, FALSE);
```

### 6.3 SELECT Queries

```sql
-- Get all passes for a student with status
SELECT p.id, p.pass_type, p.reason, p.destination, p.status, p.createdAt
FROM passes p
JOIN students s ON p.student_id = s.id
WHERE s.user_id = 2
ORDER BY p.createdAt DESC;

-- Get pending passes for hostel staff
SELECT p.id, u.name AS student_name, s.usn, p.pass_type, p.reason,
       p.destination, p.pass_date, p.createdAt
FROM passes p
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE p.status = 'PENDING_HOSTEL' AND p.hostel_staff_id = 3
ORDER BY p.createdAt ASC;

-- Get pending long leave requests for coordinator
SELECT p.id, u.name AS student_name, s.usn, p.reason, p.destination,
       p.leaving_date, p.returning_date, p.parent_contact, p.createdAt
FROM passes p
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE p.status = 'PENDING_COORDINATOR' AND p.coordinator_id = 2
ORDER BY p.createdAt ASC;

-- Get unread notifications for a user
SELECT id, type, title, message, related_pass_id, createdAt
FROM notifications
WHERE user_id = 2 AND is_read = FALSE
ORDER BY createdAt DESC;

-- Get today's gate logs
SELECT gl.id, u.name AS student_name, s.usn, gl.action, gl.scanned_at,
       sec.name AS scanned_by
FROM gate_logs gl
JOIN passes p ON gl.pass_id = p.id
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
LEFT JOIN users sec ON gl.scanned_by = sec.id
WHERE DATE(gl.scanned_at) = CURDATE()
ORDER BY gl.scanned_at DESC;
```

### 6.4 UPDATE Queries

```sql
-- Approve a pass (hostel staff)
UPDATE passes SET status = 'APPROVED', updatedAt = NOW()
WHERE id = 1;

UPDATE approvals SET status = 'APPROVED', approved_by = 3,
       remarks = 'Approved', approved_at = NOW(), updatedAt = NOW()
WHERE pass_id = 1 AND stage = 'HOSTEL_STAFF';

-- Reject a pass
UPDATE passes SET status = 'REJECTED', updatedAt = NOW()
WHERE id = 2;

UPDATE approvals SET status = 'REJECTED', approved_by = 3,
       remarks = 'Insufficient reason provided', approved_at = NOW()
WHERE pass_id = 2 AND stage = 'HOSTEL_STAFF';

-- Mark notification as read
UPDATE notifications SET is_read = TRUE, read_at = NOW()
WHERE id = 5 AND user_id = 2;

-- Mark all notifications as read
UPDATE notifications SET is_read = TRUE, read_at = NOW()
WHERE user_id = 2 AND is_read = FALSE;

-- Deactivate a QR token
UPDATE qr_tokens SET is_active = FALSE
WHERE pass_id = 1;

-- Update student profile
UPDATE students SET usn = '1VB21CS001', department_id = 1,
       program_type = 'UG', year_of_study = 3, semester = 5,
       hostel_name = 'Block A', room_number = 'A-204', updatedAt = NOW()
WHERE user_id = 2;

-- Update last login
UPDATE users SET last_login = NOW(), updatedAt = NOW()
WHERE id = 2;
```

### 6.5 DELETE Queries

```sql
-- Delete a pass (cascades to approvals, qr_tokens, gate_logs, notifications)
DELETE FROM passes WHERE id = 1 AND student_id = 1;

-- Delete a notification
DELETE FROM notifications WHERE id = 5 AND user_id = 2;

-- Delete all notifications for a user
DELETE FROM notifications WHERE user_id = 2;

-- Deactivate user (soft delete)
UPDATE users SET is_active = FALSE, updatedAt = NOW() WHERE id = 10;
```

### 6.6 JOIN Queries

```sql
-- Full pass details with student, department, and approvals
SELECT
    p.id AS pass_id, s.usn, u.name AS student_name,
    d.name AS department, p.pass_type, p.reason, p.destination,
    p.leaving_date, p.returning_date, p.pass_date, p.status,
    GROUP_CONCAT(CONCAT(a.stage, ':', a.status) SEPARATOR ' | ') AS approvals,
    p.createdAt
FROM passes p
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
JOIN departments d ON s.department_id = d.id
LEFT JOIN approvals a ON p.id = a.pass_id
GROUP BY p.id, s.usn, u.name, d.name, p.pass_type, p.reason,
         p.destination, p.leaving_date, p.returning_date, p.pass_date,
         p.status, p.createdAt
ORDER BY p.createdAt DESC;

-- Approval workflow status for a specific pass
SELECT
    p.id AS pass_id, u.name AS student_name, p.pass_type, p.status,
    MAX(CASE WHEN a.stage='COORDINATOR' THEN a.status END) AS coordinator_status,
    MAX(CASE WHEN a.stage='COORDINATOR' THEN u1.name END) AS coordinator_name,
    MAX(CASE WHEN a.stage='COORDINATOR' THEN a.approved_at END) AS coord_approved_at,
    MAX(CASE WHEN a.stage='HOSTEL_STAFF' THEN a.status END) AS hostel_status,
    MAX(CASE WHEN a.stage='HOSTEL_STAFF' THEN u2.name END) AS hostel_staff_name,
    MAX(CASE WHEN a.stage='HOSTEL_STAFF' THEN a.approved_at END) AS hostel_approved_at
FROM passes p
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
LEFT JOIN approvals a ON p.id = a.pass_id
LEFT JOIN users u1 ON a.approved_by = u1.id AND a.stage = 'COORDINATOR'
LEFT JOIN users u2 ON a.approved_by = u2.id AND a.stage = 'HOSTEL_STAFF'
WHERE p.id = 1
GROUP BY p.id, u.name, p.pass_type, p.status;
```

### 6.7 GROUP BY and Aggregation Queries

```sql
-- Department-wise pass statistics
SELECT
    d.name AS department, d.code,
    COUNT(DISTINCT s.id) AS total_students,
    COUNT(DISTINCT p.id) AS total_passes,
    SUM(CASE WHEN p.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved,
    SUM(CASE WHEN p.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected,
    SUM(CASE WHEN p.status LIKE 'PENDING%' THEN 1 ELSE 0 END) AS pending,
    ROUND(SUM(CASE WHEN p.status='APPROVED' THEN 1 ELSE 0 END) /
          NULLIF(COUNT(DISTINCT p.id), 0) * 100, 2) AS approval_rate_pct
FROM departments d
LEFT JOIN students s ON d.id = s.department_id
LEFT JOIN passes p ON s.id = p.student_id
GROUP BY d.id, d.name, d.code
ORDER BY total_passes DESC;

-- Monthly pass statistics (MySQL-compatible)
SELECT
    DATE_FORMAT(createdAt, '%Y-%m') AS month_key,
    DATE_FORMAT(createdAt, '%M %Y') AS month_name,
    COUNT(*) AS total_passes,
    SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved,
    SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected,
    SUM(CASE WHEN status LIKE 'PENDING%' THEN 1 ELSE 0 END) AS pending
FROM passes
GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
ORDER BY month_key DESC;

-- Pass type distribution
SELECT
    pass_type,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved,
    SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected
FROM passes
GROUP BY pass_type;

-- Gate activity summary by hour
SELECT
    HOUR(scanned_at) AS hour_of_day,
    COUNT(CASE WHEN action = 'OUT' THEN 1 END) AS exits,
    COUNT(CASE WHEN action = 'IN' THEN 1 END) AS entries,
    COUNT(*) AS total_scans
FROM gate_logs
WHERE DATE(scanned_at) = CURDATE()
GROUP BY HOUR(scanned_at)
ORDER BY hour_of_day;
```

### 6.8 Statistics Queries

```sql
-- Admin dashboard overview statistics
SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') AS total_students,
    (SELECT COUNT(*) FROM users WHERE role = 'COORDINATOR') AS total_coordinators,
    (SELECT COUNT(*) FROM users WHERE role = 'HOSTEL_STAFF') AS total_hostel_staff,
    (SELECT COUNT(*) FROM users WHERE role = 'SECURITY') AS total_security,
    (SELECT COUNT(*) FROM passes) AS total_passes,
    (SELECT COUNT(*) FROM passes WHERE status = 'APPROVED') AS approved_passes,
    (SELECT COUNT(*) FROM passes WHERE status = 'REJECTED') AS rejected_passes,
    (SELECT COUNT(*) FROM passes WHERE status LIKE 'PENDING%') AS pending_passes,
    (SELECT COUNT(*) FROM passes WHERE status = 'COMPLETED') AS completed_passes,
    (SELECT COUNT(*) FROM gate_logs WHERE DATE(scanned_at) = CURDATE()) AS today_scans;

-- Students currently outside campus
SELECT COUNT(DISTINCT gl_out.pass_id) AS students_outside
FROM gate_logs gl_out
WHERE gl_out.action = 'OUT'
  AND DATE(gl_out.scanned_at) = CURDATE()
  AND NOT EXISTS (
    SELECT 1 FROM gate_logs gl_in
    WHERE gl_in.pass_id = gl_out.pass_id
      AND gl_in.action = 'IN'
      AND DATE(gl_in.scanned_at) = CURDATE()
  );

-- Coordinator performance statistics
SELECT
    u.name AS coordinator_name,
    COUNT(CASE WHEN a.status = 'APPROVED' THEN 1 END) AS total_approvals,
    COUNT(CASE WHEN a.status = 'REJECTED' THEN 1 END) AS total_rejections,
    AVG(TIMESTAMPDIFF(MINUTE, a.createdAt, a.approved_at)) AS avg_processing_minutes
FROM users u
LEFT JOIN approvals a ON u.id = a.approved_by AND a.stage = 'COORDINATOR'
WHERE u.role = 'COORDINATOR'
GROUP BY u.id, u.name
ORDER BY total_approvals DESC;
```

### 6.9 Notification Queries

```sql
-- Get all unread notifications for a user with pass details
SELECT n.id, n.type, n.title, n.message, n.createdAt,
       p.pass_type, p.status AS pass_status
FROM notifications n
LEFT JOIN passes p ON n.related_pass_id = p.id
WHERE n.user_id = 2 AND n.is_read = FALSE
ORDER BY n.createdAt DESC
LIMIT 20;

-- Get notification count by type
SELECT type, COUNT(*) AS total,
       SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) AS unread
FROM notifications
WHERE user_id = 2
GROUP BY type;
```

### 6.10 Pass Approval Queries

```sql
-- Get passes pending coordinator approval with days pending
SELECT a.id AS approval_id, p.id AS pass_id,
       u.name AS student_name, s.usn, p.reason, p.destination,
       p.leaving_date, p.returning_date,
       DATEDIFF(NOW(), a.createdAt) AS days_pending
FROM approvals a
JOIN passes p ON a.pass_id = p.id
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE a.stage = 'COORDINATOR' AND a.status = 'PENDING'
ORDER BY a.createdAt ASC;

-- Get passes pending hostel staff approval
SELECT a.id AS approval_id, p.id AS pass_id,
       u.name AS student_name, s.usn, p.pass_type, p.reason,
       p.destination, p.pass_date, p.leaving_date, p.returning_date,
       DATEDIFF(NOW(), a.createdAt) AS days_pending
FROM approvals a
JOIN passes p ON a.pass_id = p.id
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE a.stage = 'HOSTEL_STAFF' AND a.status = 'PENDING'
ORDER BY a.createdAt ASC;
```

---

## 7. API Documentation

### 7.1 Authentication APIs (`/auth`)

| Method | URL | Purpose | Auth Required | Request Body | Response |
|--------|-----|---------|--------------|-------------|----------|
| POST | /auth/register | Register new student | No | `{name, email, password, phone}` | `{user, student, token}` |
| POST | /auth/login | Login user | No | `{email, password}` | `{user, token}` |
| GET | /auth/me | Get current user | Yes (any) | — | `{user}` |
| POST | /auth/logout | Logout user | Yes (any) | — | `{message}` |
| POST | /auth/change-password | Change password | Yes (any) | `{oldPassword, newPassword}` | `{message}` |
| POST | /auth/users | Create staff user | Yes (ADMIN) | `{name, email, password, role, phone}` | `{user}` |
| GET | /auth/users | Get all users | Yes (ADMIN) | — | `[users]` |
| GET | /auth/users/:id | Get user by ID | Yes (ADMIN) | — | `{user}` |
| PUT | /auth/users/:id | Update user | Yes (ADMIN) | `{name, phone, is_active, role}` | `{user}` |
| POST | /auth/users/:id/deactivate | Deactivate user | Yes (ADMIN) | — | `{message}` |
| POST | /auth/users/:id/activate | Activate user | Yes (ADMIN) | — | `{message}` |

### 7.2 Student APIs (`/student`)

| Method | URL | Purpose | Auth Required | Request Body | Response |
|--------|-----|---------|--------------|-------------|----------|
| GET | /student/profile | Get student profile | Yes (STUDENT) | — | `{student, department}` |
| POST | /student/profile | Create student profile | Yes (STUDENT) | `{usn, department_id, program_type, year_of_study, semester, gender, hostel_name, hostel_type, room_number, parent_phone, emergency_contact}` | `{student}` |
| PUT | /student/profile | Update student profile | Yes (STUDENT) | Same as POST | `{student}` |
| GET | /student/profile/check | Check profile completion | Yes (STUDENT) | — | `{isComplete, missingFields}` |

### 7.3 Pass APIs (`/passes`)

| Method | URL | Purpose | Auth Required | Request Body | Response |
|--------|-----|---------|--------------|-------------|----------|
| POST | /passes | Create new pass | Yes (STUDENT) | `{pass_type, reason, destination, pass_date OR leaving_date+returning_date, hostel_staff_id, coordinator_id, parent_contact, exit_time, expected_return_time}` | `{pass}` |
| GET | /passes/my | Get my passes | Yes (STUDENT) | — | `[passes]` |
| GET | /passes/:id | Get pass by ID | Yes (any) | — | `{pass, student, approvals}` |
| DELETE | /passes/:passId | Delete a pass | Yes (STUDENT) | — | `{message}` |

### 7.4 Coordinator APIs (`/approvals`, `/coordinators`)

| Method | URL | Purpose | Auth Required | Request Body | Response |
|--------|-----|---------|--------------|-------------|----------|
| GET | /approvals/pending | Get pending long leave requests | Yes (COORDINATOR) | — | `[passes]` |
| PUT | /approvals/:id/approve | Approve long leave request | Yes (COORDINATOR) | `{remarks}` | `{approval}` |
| PUT | /approvals/:id/reject | Reject long leave request | Yes (COORDINATOR) | `{remarks}` | `{approval}` |
| GET | /approvals/history | Get approval history | Yes (COORDINATOR) | — | `[approvals]` |
| GET | /coordinators | Get all active coordinators | Yes (any) | — | `[coordinators]` |
| GET | /coordinators/department/:id | Get coordinators by department | Yes (any) | — | `[coordinators]` |
| GET | /coordinators/hostel-staff | Get all active hostel staff | Yes (any) | — | `[hostelStaff]` |

### 7.5 Hostel Staff APIs (`/hostel`)

| Method | URL | Purpose | Auth Required | Request Body | Response |
|--------|-----|---------|--------------|-------------|----------|
| GET | /hostel/pending | Get pending passes | Yes (HOSTEL_STAFF) | — | `[passes]` |
| PUT | /hostel/passes/:id/approve | Approve pass | Yes (HOSTEL_STAFF) | `{remarks}` | `{approval}` |
| PUT | /hostel/passes/:id/reject | Reject pass | Yes (HOSTEL_STAFF) | `{remarks}` | `{approval}` |
| GET | /hostel/passes | Get all passes | Yes (HOSTEL_STAFF) | `?filter=ALL\|DAILY\|LONG_LEAVE\|APPROVED\|REJECTED` | `[passes]` |
| GET | /hostel/students | Get students directory | Yes (HOSTEL_STAFF) | `?search=query` | `[students]` |
| GET | /hostel/dashboard | Get dashboard statistics | Yes (HOSTEL_STAFF) | — | `{stats, recentActivity}` |
| GET | /hostel/approved | Get approved passes | Yes (HOSTEL_STAFF) | — | `[passes]` |
| GET | /hostel/students-outside | Get students currently outside | Yes (HOSTEL_STAFF) | — | `[students]` |
| GET | /hostel/today-overview | Get today's overview | Yes (HOSTEL_STAFF) | — | `{entries, exits, outside, expected}` |

### 7.6 Security APIs (`/security`)

| Method | URL | Purpose | Auth Required | Request Body | Response |
|--------|-----|---------|--------------|-------------|----------|
| POST | /security/scan | Scan QR token | Yes (SECURITY) | `{token}` | `{scanResult, studentDetails, passDetails, scanDetails}` |
| GET | /security/logs/today | Get today's gate logs | Yes (SECURITY) | — | `[logs]` |
| GET | /security/logs | Get all gate logs | Yes (SECURITY) | `?filter=ALL\|OUT\|IN\|TODAY` | `[logs]` |
| GET | /security/dashboard | Get dashboard statistics | Yes (SECURITY) | — | `{todayScans, studentsOutside, completedPasses, recentActivity}` |

### 7.7 Admin APIs (`/admin`)

| Method | URL | Purpose | Auth Required | Request Body | Response |
|--------|-----|---------|--------------|-------------|----------|
| GET | /admin/dashboard | Get dashboard statistics | Yes (ADMIN) | — | `{users, passes, security}` |
| GET | /admin/users | Get all users | Yes (ADMIN) | `?filter=ALL\|STUDENT\|COORDINATOR\|...` | `[users]` |
| GET | /admin/users/:id | Get user by ID | Yes (ADMIN) | — | `{user}` |
| POST | /admin/users | Create new user | Yes (ADMIN) | `{name, email, password, role, phone}` | `{user}` |
| PUT | /admin/users/:id | Update user | Yes (ADMIN) | `{name, phone, is_active, role}` | `{user}` |
| PUT | /admin/users/:id/activate | Activate user | Yes (ADMIN) | — | `{message}` |
| PUT | /admin/users/:id/deactivate | Deactivate user | Yes (ADMIN) | — | `{message}` |
| PUT | /admin/users/:id/reset-password | Reset user password | Yes (ADMIN) | — | `{message, newPassword}` |
| GET | /admin/activity-logs | Get activity logs | Yes (ADMIN) | `?limit=50` | `[logs]` |

### 7.8 Notification APIs (`/notifications`)

| Method | URL | Purpose | Auth Required | Request Body | Response |
|--------|-----|---------|--------------|-------------|----------|
| GET | /notifications | Get all notifications | Yes (any) | `?limit=20&offset=0&unreadOnly=false` | `[notifications]` |
| GET | /notifications/unread/count | Get unread count | Yes (any) | — | `{count}` |
| PUT | /notifications/:id/read | Mark as read | Yes (any) | — | `{notification}` |
| PUT | /notifications/read-all | Mark all as read | Yes (any) | — | `{count}` |
| DELETE | /notifications/:id | Delete notification | Yes (any) | — | `{message}` |
| DELETE | /notifications | Delete all notifications | Yes (any) | — | `{count}` |

### 7.9 Report APIs (`/reports`)

| Method | URL | Purpose | Auth Required | Response |
|--------|-----|---------|--------------|----------|
| GET | /reports/overview | Overall system statistics | Yes (ADMIN) | `{users, passes, security}` |
| GET | /reports/departments | Department-wise statistics | Yes (ADMIN) | `[deptStats]` |
| GET | /reports/monthly | Monthly pass statistics | Yes (ADMIN) | `[monthlyStats]` |
| GET | /reports/pass-types | Pass type statistics | Yes (ADMIN) | `[passTypeStats]` |
| GET | /reports/security | Security statistics | Yes (ADMIN) | `{scans, outside, completed}` |
| GET | /reports/coordinators | Coordinator performance | Yes (ADMIN) | `[coordStats]` |
| GET | /reports/hostel-staff | Hostel staff performance | Yes (ADMIN) | `[hostelStats]` |
| GET | /reports/export/csv | Export report as CSV | Yes (ADMIN) | CSV file blob |
| GET | /reports/export/pdf | Export report as PDF data | Yes (ADMIN) | `{reportType, data}` |

### 7.10 QR Code APIs (`/qr`)

| Method | URL | Purpose | Auth Required | Request Body | Response |
|--------|-----|---------|--------------|-------------|----------|
| POST | /qr/generate/:passId | Generate QR token | Yes (HOSTEL_STAFF, ADMIN) | — | `{qrToken}` |
| POST | /qr/code | Generate QR image | Yes (STUDENT, HOSTEL_STAFF, ADMIN, SECURITY) | `{token}` | `{qrImage}` (Base64) |
| POST | /qr/verify | Verify QR token | Yes (SECURITY, ADMIN) | `{token}` | `{passDetails, studentDetails, approvalDetails, qrMetadata}` |
| GET | /qr/pass/:passId | Get QR for pass | Yes (STUDENT, HOSTEL_STAFF, ADMIN) | — | `{token, qrImage, generatedAt}` |
| PUT | /qr/deactivate/:passId | Deactivate QR | Yes (HOSTEL_STAFF, ADMIN) | — | `{deactivatedCount}` |
| GET | /qr/token/:token | Get QR token details | Yes (SECURITY, ADMIN) | — | `{qrToken}` |

### 7.11 PDF APIs (`/pdf`)

| Method | URL | Purpose | Auth Required | Response |
|--------|-----|---------|--------------|----------|
| POST | /pdf/generate/:passId | Generate PDF | Yes (STUDENT, HOSTEL_STAFF, ADMIN) | `{passId, fileName, generatedAt}` |
| GET | /pdf/download/:passId | Download PDF file | Yes (STUDENT, HOSTEL_STAFF, ADMIN) | PDF binary stream |
| GET | /pdf/:passId | Get PDF metadata | Yes (STUDENT, HOSTEL_STAFF, ADMIN) | `{exists, fileSize, generatedAt}` |

---

## 8. Authentication System

### 8.1 Login Flow

```
1. User submits email + password to POST /auth/login
2. Server normalizes email (trim + lowercase)
3. Server validates email format (regex)
4. Server queries users table: SELECT * FROM users WHERE email = ?
5. If user not found → "Invalid email or password" (generic error)
6. If user.is_active = false → "User account is inactive"
7. bcrypt.compare(password, user.password) → if false → "Invalid email or password"
8. UPDATE users SET last_login = NOW() WHERE id = ?
9. generateToken(user.id, user.role, user.email) → JWT signed with HS256
10. Return { user: {id, name, email, role, ...}, token }
```

### 8.2 JWT Flow

**Token Generation:**
```javascript
jwt.sign(
  { id: userId, role: role, email: email },
  JWT_SECRET,           // 256-bit hex secret from .env
  { expiresIn: '7d' }   // 7-day expiry
)
```

**Token Verification (every protected request):**
```
1. Extract token from Authorization header: "Bearer <token>"
2. jwt.verify(token, JWT_SECRET) → decoded payload
3. Attach decoded payload to req.user
4. Role middleware checks req.user.role against allowed roles
```

**Token Storage (Frontend):**
- Token stored in `localStorage` under key `'token'`
- User object stored in `localStorage` under key `'user'`
- Axios request interceptor automatically attaches token to every request
- Axios response interceptor clears localStorage and redirects to `/login` on 401

**Token Validation on App Load:**
```
1. App starts → AuthContext.initializeAuth() runs
2. Read token + user from localStorage
3. Call GET /auth/me with stored token
4. If valid → restore session (setUser, setToken)
5. If invalid/expired → clear localStorage, redirect to login
```

### 8.3 Protected Routes

**Backend Middleware Chain:**
```
authenticate (JWT verify) → authorize/isRole (role check) → controller
```

**Frontend Route Guards:**
```
<PrivateRoute>  → checks isAuthenticated() → redirects to /login if false
  <RoleRoute allowedRoles={['STUDENT']}>  → checks hasRole() → redirects to correct dashboard
    <StudentDashboard />
  </RoleRoute>
</PrivateRoute>
```

### 8.4 Role-Based Access Control

| Role | Accessible Routes |
|------|------------------|
| STUDENT | `/student/*` |
| COORDINATOR | `/coordinator/*` |
| HOSTEL_STAFF | `/hostel/*` |
| SECURITY | `/security/*` |
| ADMIN | `/admin/*` |

**Backend Role Middleware Functions:**
- `authenticate` — Verifies JWT, attaches `req.user`
- `authorize(...roles)` — Checks `req.user.role` against allowed roles array
- `isStudent` — Checks role === 'STUDENT'
- `isCoordinator` — Checks role === 'COORDINATOR'
- `isHostelStaff` — Checks role === 'HOSTEL_STAFF'
- `isSecurity` — Checks role === 'SECURITY'
- `isAdmin` — Checks role === 'ADMIN'
- `isAdminOrCoordinator` — Checks role in ['ADMIN', 'COORDINATOR']
- `isAdminOrHostelStaff` — Checks role in ['ADMIN', 'HOSTEL_STAFF']

### 8.5 Password Security

- Passwords hashed with **bcrypt** using **10 salt rounds**
- Password strength requirements enforced at registration:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Passwords never returned in API responses (excluded from SELECT)
- Admin password reset generates a new random password

---

## 9. User Roles & Features

### 9.1 Student Role

**Registration & Profile:**
- Register with name, email, password, phone
- Complete academic profile: USN, department, program type, year, semester, gender
- Complete hostel profile: hostel name, hostel type, room number, parent phone, emergency contact
- Profile completion check before allowing pass application

**Pass Application:**
- Apply for **Daily Pass**: Select date, reason, destination, hostel staff; optional exit/return times
- Apply for **Long Leave**: Select leaving/returning dates, reason, destination, parent contact, coordinator, hostel staff
- View workflow banner showing approval steps for selected pass type
- Form validation: date cannot be in past, returning date must be after leaving date, valid phone number

**Pass Management:**
- View all submitted passes with status badges
- View pass details including approval history
- Delete pending passes (before approval)
- Download approved pass as PDF
- View QR code for approved passes

**Notifications:**
- Receive notifications for: pass submitted, coordinator approved/rejected, hostel approved/rejected, QR generated, pass completed
- Mark individual or all notifications as read
- Delete notifications

**Dashboard Statistics:**
- Total passes count
- Approved passes count
- Pending passes count
- Rejected passes count
- Recent 5 pass applications table

### 9.2 Coordinator Role

**Approval Management:**
- View all pending long leave requests assigned to them
- View student details: name, USN, department, year, hostel
- View pass details: reason, destination, leaving/returning dates, parent contact
- Approve with optional remarks
- Reject with mandatory remarks (reason required)

**History:**
- View all previously processed approvals
- Filter by approved/rejected status
- View approval timestamps and remarks

**Dashboard:**
- Count of pending requests
- Count of approved/rejected this month
- Recent approval activity

### 9.3 Hostel Staff Role

**Approval Management:**
- View all pending passes (both DAILY and LONG_LEAVE after coordinator approval)
- Approve or reject with remarks
- View student hostel details (room number, hostel name)

**Pass Management:**
- View all passes with filter: ALL, DAILY, LONG_LEAVE, APPROVED, REJECTED, PENDING_HOSTEL
- View approved passes list
- View students currently outside campus

**Student Directory:**
- Search students by name, USN, or department
- View student hostel details

**Dashboard:**
- Pending passes count
- Approved passes count
- Students currently outside
- Today's overview: entries, exits, expected returns

**Profile:**
- View and update personal profile

### 9.4 Security Role

**QR Scanning:**
- Scan QR code via hardware scanner (auto-focused input) or manual token entry
- 2-second cooldown to prevent duplicate scans
- First scan → logs OUT (student exiting)
- Second scan → logs IN (student returning)
- Third scan → shows "Pass Completed" message

**Scan Result Display:**
- Student name, USN, department, program, year/semester, hostel, room
- Pass ID, type, destination, dates
- Scan action (OUT/IN) and timestamp

**Gate Logs:**
- View today's gate logs
- View all logs with filter: ALL, OUT, IN, TODAY
- Each log shows: student name, USN, action, timestamp, scanned by

**Dashboard:**
- Today's total scans
- Students currently outside
- Completed passes today
- Recent 10 scan activity

### 9.5 Admin Role

**Dashboard:**
- Total students, coordinators, hostel staff, security guards
- Total passes, approved, rejected, pending
- Active users count
- Today's passes count
- User list with search and role filter

**User Management:**
- Create staff accounts (COORDINATOR, HOSTEL_STAFF, SECURITY)
- View all users with role filter
- Edit user details (name, phone, role)
- Activate/deactivate user accounts
- Reset user passwords

**Reports:**
- Overall system statistics
- Department-wise pass statistics
- Monthly pass trends
- Pass type distribution (Daily vs Long Leave)
- Security statistics (scans, outside, completed)
- Coordinator performance (approvals, rejections, avg processing time)
- Hostel staff performance
- Export any report as CSV

**Activity Logs:**
- View full audit trail of all system actions
- Filter by user, action type, date

**Settings:**
- System configuration management

---

## 10. Business Workflow

### 10.1 Daily Pass Workflow

```
Step 1: Student submits Daily Pass
  - Student fills: reason, destination, pass_date, hostel_staff_id
  - Optional: exit_time, expected_return_time
  - System creates Pass record with status = 'PENDING_HOSTEL'
  - System creates Approval record: stage='HOSTEL_STAFF', status='PENDING'
  - Notification sent to student: PASS_SUBMITTED
  - Notification sent to all hostel staff: NEW_REQUEST

Step 2: Hostel Staff reviews and approves/rejects
  - Hostel staff sees pass in pending list
  - APPROVE:
    → Approval record updated: status='APPROVED', approved_by=staff_id, approved_at=NOW()
    → Pass status updated: 'APPROVED'
    → QR token generated automatically (UUID)
    → Notification sent to student: HOSTEL_APPROVED + QR_GENERATED
  - REJECT:
    → Approval record updated: status='REJECTED', remarks=reason
    → Pass status updated: 'REJECTED'
    → Notification sent to student: HOSTEL_REJECTED

Step 3: Student downloads PDF
  - Student views approved pass
  - Clicks "Download PDF" → POST /pdf/generate/:passId
  - Server generates A4 PDF with student info, pass details, approval info, QR code
  - PDF saved to server/src/pdf/PASS_<id>.pdf
  - Student downloads PDF

Step 4: Security scans QR at gate exit
  - Security guard scans QR code
  - POST /security/scan with token
  - System verifies: token valid, pass APPROVED, no previous OUT log
  - GateLog created: action='OUT', scanned_by=security_id
  - Response: scanResult='OUT', student details, pass details

Step 5: Security scans QR at gate entry (return)
  - Student returns, security scans QR again
  - System verifies: token valid, pass APPROVED, one OUT log exists
  - GateLog created: action='IN', scanned_by=security_id
  - Pass status updated: 'COMPLETED'
  - Notification sent to student: PASS_COMPLETED
  - Response: scanResult='IN'
```

### 10.2 Long Leave Workflow

```
Step 1: Student submits Long Leave
  - Student fills: reason, destination, leaving_date, returning_date,
                   parent_contact, coordinator_id, hostel_staff_id
  - System creates Pass record with status = 'PENDING_COORDINATOR'
  - System creates TWO Approval records:
    → stage='COORDINATOR', status='PENDING'
    → stage='HOSTEL_STAFF', status='PENDING'
  - Notification sent to student: PASS_SUBMITTED
  - Notification sent to all coordinators: NEW_REQUEST

Step 2: Coordinator reviews and approves/rejects
  - Coordinator sees pass in pending list
  - APPROVE:
    → Coordinator Approval record: status='APPROVED', approved_by=coord_id
    → Pass status updated: 'PENDING_HOSTEL'
    → Notification sent to student: COORDINATOR_APPROVED
    → Notification sent to hostel staff: NEW_REQUEST
  - REJECT:
    → Coordinator Approval record: status='REJECTED', remarks=reason
    → Pass status updated: 'REJECTED'
    → Notification sent to student: COORDINATOR_REJECTED

Step 3: Hostel Staff reviews and approves/rejects
  - Hostel staff sees pass in pending list (after coordinator approval)
  - APPROVE:
    → Hostel Approval record: status='APPROVED', approved_by=staff_id
    → Pass status updated: 'APPROVED'
    → QR token generated automatically
    → Notification sent to student: HOSTEL_APPROVED + QR_GENERATED
  - REJECT:
    → Hostel Approval record: status='REJECTED', remarks=reason
    → Pass status updated: 'REJECTED'
    → Notification sent to student: HOSTEL_REJECTED

Steps 4–5: Same as Daily Pass (PDF download, gate exit scan, gate entry scan)
```

### 10.3 Pass Status Transitions

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
DAILY PASS:         │                                         ▼
  [PENDING_HOSTEL] ──► [APPROVED] ──► [COMPLETED]
                    │
                    └──► [REJECTED]

LONG LEAVE:
  [PENDING_COORDINATOR] ──► [PENDING_HOSTEL] ──► [APPROVED] ──► [COMPLETED]
                         │                    │
                         └──► [REJECTED]      └──► [REJECTED]

Any status ──► [CANCELLED]  (student cancels before approval)
```

### 10.4 QR Code Lifecycle

```
1. Pass reaches APPROVED status
2. Hostel staff approval triggers QR generation
3. UUID token generated: uuidv4()
4. QRToken record created: {pass_id, token, is_active=true}
5. QR image generated: QRCode.toDataURL(JSON.stringify({token}))
6. QR embedded in PDF
7. Student scans QR at gate → OUT logged
8. Student scans QR at gate → IN logged → Pass COMPLETED
9. QR token remains active (can be deactivated by admin/hostel staff)
```

---

## 11. Dashboard Documentation

### 11.1 Student Dashboard

**Route:** `/student/dashboard`  
**Component:** `src/pages/Student/Dashboard.jsx`  
**Purpose:** Student home page showing pass statistics and quick actions

**Statistics Displayed:**
| Stat | Source | Query |
|------|--------|-------|
| Total Passes | GET /passes/my | `passes.length` |
| Approved | GET /passes/my | `passes.filter(p => p.status === 'APPROVED').length` |
| Pending | GET /passes/my | `passes.filter(p => p.status?.includes('PENDING')).length` |
| Rejected | GET /passes/my | `passes.filter(p => p.status === 'REJECTED').length` |

**API Calls:** `GET /passes/my`  
**Features:** Welcome banner with greeting, Quick Actions panel (Apply Pass, My Passes, Notifications, Profile), Important Rules panel, Recent 5 applications table

### 11.2 Coordinator Dashboard

**Route:** `/coordinator/dashboard`  
**Component:** `src/pages/Coordinator/Dashboard.jsx`  
**Purpose:** Coordinator home showing pending long leave requests

**Statistics Displayed:** Pending requests count, approved this month, rejected this month  
**API Calls:** `GET /approvals/pending`, `GET /approvals/history`

### 11.3 Hostel Staff Dashboard

**Route:** `/hostel/dashboard`  
**Component:** `src/pages/Hostel/Dashboard.jsx`  
**Purpose:** Hostel staff home with pass management overview

**Statistics Displayed:**
| Stat | Source |
|------|--------|
| Pending Passes | GET /hostel/pending |
| Approved Passes | GET /hostel/approved |
| Students Outside | GET /hostel/students-outside |
| Today's Overview | GET /hostel/today-overview |

**API Calls:** `GET /hostel/dashboard`, `GET /hostel/today-overview`  
**Features:** Pending passes list, students outside list, today's entry/exit counts

### 11.4 Security Dashboard

**Route:** `/security/dashboard`  
**Component:** `src/pages/Security/Dashboard.jsx`  
**Purpose:** Security guard home with real-time gate activity

**Statistics Displayed:**
| Stat | Source | Calculation |
|------|--------|-------------|
| Today's Scans | GET /security/dashboard | COUNT(*) FROM gate_logs WHERE DATE(scanned_at) = TODAY |
| Students Outside | GET /security/dashboard | OUT logs without matching IN logs today |
| Completed Passes | GET /security/dashboard | Passes with both OUT and IN logs today |

**API Calls:** `GET /security/dashboard`  
**Features:** Recent 10 scan activity, quick access to QR Scanner

### 11.5 Admin Dashboard

**Route:** `/admin/dashboard`  
**Component:** `src/pages/Admin/Dashboard.jsx`  
**Purpose:** System-wide overview for administrators

**Statistics Displayed:**
| Stat | Source |
|------|--------|
| Total Students | GET /admin/dashboard → users.totalStudents |
| Total Coordinators | GET /admin/dashboard → users.totalCoordinators |
| Total Hostel Staff | GET /admin/dashboard → users.totalHostelStaff |
| Security Guards | GET /admin/dashboard → totalSecurityGuards |
| Total Passes | GET /admin/dashboard → passes.totalPasses |
| Approved Passes | GET /admin/dashboard → passes.approvedPasses |
| Rejected Passes | GET /admin/dashboard → passes.rejectedPasses |
| Pending Passes | GET /admin/dashboard → pendingPasses |
| Active Users | GET /admin/dashboard → activeUsers |
| Today's Passes | GET /admin/dashboard → todaysPasses |

**API Calls:** `GET /admin/dashboard`, `GET /admin/users?filter=ALL`  
**Features:** User list with search and role filter, Quick Actions panel, System Status panel

---

## 12. Notification System

### 12.1 Notification Table Structure
See Section 4.8 for full table documentation.

### 12.2 Notification Types and Trigger Points

| Type | Trigger | Recipient | Message |
|------|---------|-----------|---------|
| PASS_SUBMITTED | Student submits pass | Student | "Your pass request has been submitted successfully." |
| COORDINATOR_APPROVED | Coordinator approves | Student | "Your pass request has been approved by the coordinator." |
| COORDINATOR_REJECTED | Coordinator rejects | Student | "Your pass request has been rejected by the coordinator. Reason: {remarks}" |
| HOSTEL_APPROVED | Hostel staff approves | Student | "Your pass request has been approved by hostel staff." |
| HOSTEL_REJECTED | Hostel staff rejects | Student | "Your pass request has been rejected by hostel staff. Reason: {remarks}" |
| QR_GENERATED | Pass fully approved | Student | "Your gate pass QR code is ready." |
| PASS_COMPLETED | Both gate scans done | Student | "Your gate pass journey has been completed successfully." |
| NEW_REQUEST | Pass submitted (LONG_LEAVE) | All Coordinators | "A new pass request is pending your approval." |
| NEW_REQUEST | Pass reaches PENDING_HOSTEL | All Hostel Staff | "A new pass request is pending your approval." |
| SYSTEM | Admin broadcast | All Users | Custom message |

### 12.3 Notification Flow

```
Pass Event Occurs
      │
      ▼
Service Layer (e.g., approval.service.js)
      │
      ▼
notification.service.js → createNotification(userId, type, title, message, passId)
      │
      ▼
Notification.create({user_id, type, title, message, related_pass_id, is_read: false})
      │
      ▼
Frontend polls GET /notifications/unread/count
      │
      ▼
Notification bell shows badge count
      │
      ▼
User clicks bell → GET /notifications → list displayed
      │
      ▼
User clicks notification → PUT /notifications/:id/read
```

### 12.4 Notification Service Functions

| Function | Purpose |
|----------|---------|
| `createNotification(userId, type, title, message, passId)` | Core function to create any notification |
| `getUserNotifications(userId, {limit, offset, unreadOnly})` | Paginated notification list |
| `getUnreadCount(userId)` | Count of unread notifications |
| `markAsRead(notificationId, userId)` | Mark single notification as read (with ownership check) |
| `markAllAsRead(userId)` | Mark all user's notifications as read |
| `deleteNotification(notificationId, userId)` | Delete single notification (with ownership check) |
| `deleteAllNotifications(userId)` | Delete all user's notifications |
| `notifyPassSubmitted(studentId, passId)` | Trigger PASS_SUBMITTED notification |
| `notifyCoordinatorApproved(studentId, passId)` | Trigger COORDINATOR_APPROVED notification |
| `notifyCoordinatorRejected(studentId, passId, reason)` | Trigger COORDINATOR_REJECTED notification |
| `notifyHostelApproved(studentId, passId)` | Trigger HOSTEL_APPROVED notification |
| `notifyHostelRejected(studentId, passId, reason)` | Trigger HOSTEL_REJECTED notification |
| `notifyQRGenerated(studentId, passId)` | Trigger QR_GENERATED notification |
| `notifyPassCompleted(studentId, passId)` | Trigger PASS_COMPLETED notification |
| `notifyNewCoordinatorRequests(passId)` | Notify ALL coordinators of new request |
| `notifyNewHostelRequests(passId)` | Notify ALL hostel staff of new request |
| `sendSystemNotification(title, message)` | Broadcast to ALL users |

---

## 13. PDF Generation System

### 13.1 PDF Library
- **Server-side:** PDFKit v0.13.0 (`pdfkit` npm package)
- **Client-side:** jsPDF v2.5.1 (for any client-side generation)
- **Storage:** `server/src/pdf/PASS_<id>.pdf`

### 13.2 PDF Generation Flow

```
Student/Admin requests PDF
      │
      ▼
POST /pdf/generate/:passId
      │
      ▼
pdf.service.js → generatePDF(passId)
      │
      ▼
fetchPassData(passId):
  - Pass.findByPk(passId, {include: [Student, User, Department, coordinator, hostelStaff]})
  - Approval.findAll({where: {pass_id: passId}})
  - QRToken.findOne({where: {pass_id: passId, is_active: true}})
  - If no QR token → qrService.generateQRToken(passId)
  - qrService.generateQRCodeBuffer(token) → PNG buffer
      │
      ▼
buildPDF(filePath, drawFn):
  - Creates PDFDocument (A4, margin: 0)
  - Pipes to fs.createWriteStream(filePath)
  - Calls drawFn(doc) based on pass_type:
    → DAILY: buildDailyPassPDF(doc, pass, approvals, qrBuffer)
    → LONG_LEAVE: buildLongLeavePDF(doc, pass, approvals, qrBuffer)
      │
      ▼
PDF saved to server/src/pdf/PASS_<id>.pdf
Pass.update({pdf_path: 'pdf/PASS_<id>.pdf'})
      │
      ▼
GET /pdf/download/:passId
  - Reads file from disk
  - Streams as application/pdf response
```

### 13.3 PDF Structure

**Daily Pass PDF (A4):**
1. **Header Band** (blue, #1e40af) — "SMART GATE PASS SYSTEM", "Official Daily Pass Document", Pass ID + Generated timestamp
2. **Approved Badge** (green) — "✓ APPROVED — DAILY PASS"
3. **Student Information Section** — Name, USN, Department, Program, Year/Semester, Hostel, Room, Email, Phone
4. **Pass Details Section** — Pass Type, Reason, Destination, Pass Date, Exit Time, Expected Return Time, Hostel Staff, Status
5. **Approval Information Section** — Approved By, Approved On, Remarks
6. **QR Code Section** — 140×140px QR code centered, instruction text
7. **Footer** (light gray) — "Computer-generated document", system name, generation timestamp

**Long Leave PDF (A4):**
1. **Header Band** — "SMART GATE PASS SYSTEM", "Official Long Leave Permission Letter"
2. **Approved Badge** — "✓ APPROVED — LONG LEAVE"
3. **Student Information Section** — Same as Daily Pass
4. **Leave Details Section** — Pass Type, Reason, Destination, Leaving Date, Returning Date, Leave Duration (calculated), Parent Contact, Status
5. **Coordinator Approval Section** — Coordinator name, Status, Approved On, Remarks
6. **Hostel Staff Approval Section** — Staff name, Status, Approved On, Remarks
7. **Signature Area** — "Authorized Approval" line
8. **QR Code Section** — 200×200px QR code centered
9. **Footer** — Same as Daily Pass

### 13.4 Source Files Involved

| File | Role |
|------|------|
| `server/src/services/pdf.service.js` | Core PDF generation logic |
| `server/src/controllers/pdf.controller.js` | HTTP request handling |
| `server/src/routes/pdf.routes.js` | Route definitions |
| `server/src/services/qr.service.js` | QR buffer generation for embedding |
| `server/src/pdf/` | PDF file storage directory |
| `client/src/api/pdf.api.js` | Frontend API calls |
| `client/src/pages/Student/MyPasses.jsx` | Download button UI |

---

## 14. QR Code System

### 14.1 QR Generation Process

```
1. Pass reaches APPROVED status (after hostel staff approval)
2. qrService.generateQRToken(passId) called:
   a. Begin database transaction (with row lock)
   b. Check if active QR already exists → return existing if found
   c. Deactivate any previous QR tokens for this pass
   d. Generate UUID: uuidv4() → e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   e. Create QRToken record: {pass_id, token, is_active: true}
   f. Commit transaction
3. qrService.generateQRCode(token):
   a. Create QR data: JSON.stringify({token: "uuid-string"})
   b. QRCode.toDataURL(qrData, {errorCorrectionLevel: 'H', width: 400})
   c. Returns Base64 PNG data URL
4. QR image embedded in PDF via qrService.generateQRCodeBuffer(token)
```

### 14.2 QR Payload Structure

The QR code encodes only the token (no sensitive data):
```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### 14.3 QR Verification Workflow

```
Security guard scans QR code
      │
      ▼
POST /security/scan { token: "uuid-string" }
      │
      ▼
securityService.scanQRToken(token, securityUserId):
  1. Find QRToken WHERE token = ?
  2. Validate: token exists, is_active = true, not expired
  3. Find Pass WHERE id = qrToken.pass_id (with row lock)
  4. Validate: pass exists, status = 'APPROVED'
  5. Count existing GateLog records for this pass
  6. Determine action:
     - 0 logs → action = 'OUT' (first scan, student exiting)
     - 1 log (OUT) → action = 'IN' (second scan, student returning)
     - 2+ logs → return COMPLETED (pass already done)
  7. Create GateLog: {pass_id, action, scan_status: 'VALID', scanned_by, scanned_at}
  8. Commit transaction
  9. Return: {scanResult, studentDetails, passDetails, scanDetails}
```

### 14.4 Security Validations

| Validation | Check |
|-----------|-------|
| Token exists | QRToken.findOne({where: {token}}) |
| Token active | qrToken.is_active === true |
| Token not expired | qrToken.expires_at === null OR expires_at > NOW() |
| Pass exists | Pass.findByPk(qrToken.pass_id) |
| Pass approved | pass.status === 'APPROVED' |
| No duplicate OUT | existingLogs.length === 0 before creating OUT |
| Valid IN sequence | existingLogs[0].action === 'OUT' before creating IN |
| Race condition prevention | Database transaction with row-level lock |

---

## 15. Dependencies

### 15.1 Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | Core UI library |
| react-dom | ^18.2.0 | React DOM rendering |
| react-router-dom | ^6.20.0 | Client-side routing (v6 with nested routes) |
| axios | ^1.6.0 | HTTP client with interceptors |
| react-hook-form | ^7.48.0 | Form state management and validation |
| jspdf | ^2.5.1 | Client-side PDF generation |
| qrcode.react | ^4.2.0 | QR code rendering as React component |
| i | ^0.3.7 | Utility package |

**Frontend Dev Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^5.0.0 | Build tool and dev server |
| @vitejs/plugin-react | ^4.2.0 | Vite React plugin (Babel/SWC) |
| tailwindcss | ^3.3.0 | Utility-first CSS framework |
| postcss | ^8.4.31 | CSS transformation tool |
| autoprefixer | ^10.4.16 | CSS vendor prefix automation |

### 15.2 Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web application framework |
| sequelize | ^6.35.0 | MySQL ORM with model associations |
| mysql2 | ^3.6.0 | MySQL database driver |
| jsonwebtoken | ^9.0.3 | JWT token generation and verification |
| bcrypt | ^6.0.0 | Password hashing (native bindings) |
| bcryptjs | ^2.4.3 | Password hashing (pure JS fallback) |
| dotenv | ^16.3.1 | Environment variable loading |
| cors | ^2.8.5 | Cross-Origin Resource Sharing middleware |
| express-validator | ^7.0.0 | Request body validation |
| pdfkit | ^0.13.0 | Server-side PDF generation |
| qrcode | ^1.5.3 | QR code generation (PNG/SVG/Base64) |
| multer | ^1.4.5-lts.1 | Multipart form data / file upload handling |
| i | ^0.3.7 | Utility package |

**Backend Dev Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| nodemon | ^3.0.1 | Auto-restart server on file changes |

---

## 16. UI Pages Documentation

### 16.1 Landing Page
**Route:** `/`  
**Component:** `src/pages/Auth/Landing.jsx`  
**Purpose:** Public marketing page introducing the system  
**Features:** Hero section, Features section, Workflow section, Statistics section, Portal cards (login links per role), System overview, Why Choose section, Footer  
**Sub-components:** HeroSection, FeaturesSection, WorkflowSection, StatisticsSection, PortalCards, SystemOverview, SystemPreview, WhyChooseSection, GlassCard, BubbleDecorations, Navbar, Footer  
**API Calls:** None (public page)

### 16.2 Login Page
**Route:** `/login`  
**Component:** `src/pages/Auth/Login.jsx`  
**Purpose:** User authentication form  
**Features:** Email/password form, validation, error display, redirect to role-specific dashboard after login  
**API Calls:** `POST /auth/login`

### 16.3 Register Page
**Route:** `/register`  
**Component:** `src/pages/Auth/Register.jsx`  
**Purpose:** New student account registration  
**Features:** Name, email, password, phone fields; password strength validation; redirect to login after success  
**API Calls:** `POST /auth/register`

### 16.4 Student Dashboard
**Route:** `/student/dashboard`  
**Component:** `src/pages/Student/Dashboard.jsx`  
**Purpose:** Student home page  
**Features:** Welcome banner, stats cards (total/approved/pending/rejected), quick actions, important rules, recent applications table  
**API Calls:** `GET /passes/my`

### 16.5 Apply Pass Page
**Route:** `/student/apply-pass`  
**Component:** `src/pages/Student/ApplyPass.jsx`  
**Purpose:** Gate pass application form  
**Features:** Pass type toggle (Daily/Long Leave), dynamic form fields, workflow banner, profile completion check, coordinator/hostel staff dropdowns, form validation  
**API Calls:** `GET /student/profile/check`, `GET /coordinators`, `GET /coordinators/hostel-staff`, `POST /passes`

### 16.6 My Passes Page
**Route:** `/student/my-passes`  
**Component:** `src/pages/Student/MyPasses.jsx`  
**Purpose:** Student's pass history and management  
**Features:** Pass list with status badges, view details modal, download PDF, view QR code, delete pending passes  
**API Calls:** `GET /passes/my`, `GET /passes/:id`, `POST /pdf/generate/:id`, `GET /pdf/download/:id`, `GET /qr/pass/:id`, `DELETE /passes/:id`

### 16.7 Student Notifications Page
**Route:** `/student/notifications`  
**Component:** `src/pages/Student/Notifications.jsx`  
**Purpose:** Notification inbox for students  
**Features:** Notification list with type icons, read/unread status, mark as read, mark all as read, delete notifications  
**API Calls:** `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all`, `DELETE /notifications/:id`, `DELETE /notifications`

### 16.8 Student Profile Page
**Route:** `/student/profile`  
**Component:** `src/pages/Student/Profile.jsx`  
**Purpose:** Student academic and hostel profile editor  
**Features:** View/edit USN, department, program type, year, semester, gender, hostel details, parent phone, emergency contact  
**API Calls:** `GET /student/profile`, `POST /student/profile`, `PUT /student/profile`

### 16.9 Coordinator Dashboard
**Route:** `/coordinator/dashboard`  
**Component:** `src/pages/Coordinator/Dashboard.jsx`  
**Purpose:** Coordinator home with pending requests overview  
**API Calls:** `GET /approvals/pending`, `GET /approvals/history`

### 16.10 Coordinator Pending Requests
**Route:** `/coordinator/requests`  
**Component:** `src/pages/Coordinator/PendingRequests.jsx`  
**Purpose:** List and process pending long leave requests  
**Features:** Pass list, student details, approve/reject with remarks modal  
**API Calls:** `GET /approvals/pending`, `PUT /approvals/:id/approve`, `PUT /approvals/:id/reject`

### 16.11 Coordinator History
**Route:** `/coordinator/history`  
**Component:** `src/pages/Coordinator/History.jsx`  
**Purpose:** View past approval decisions  
**API Calls:** `GET /approvals/history`

### 16.12 Hostel Dashboard
**Route:** `/hostel/dashboard`  
**Component:** `src/pages/Hostel/Dashboard.jsx`  
**Purpose:** Hostel staff home with pass management overview  
**API Calls:** `GET /hostel/dashboard`, `GET /hostel/today-overview`

### 16.13 Hostel Pending Requests
**Route:** `/hostel/requests`  
**Component:** `src/pages/Hostel/PendingRequests.jsx`  
**Purpose:** Approve or reject pending passes  
**API Calls:** `GET /hostel/pending`, `PUT /hostel/passes/:id/approve`, `PUT /hostel/passes/:id/reject`

### 16.14 Hostel All Passes
**Route:** `/hostel/all-passes`  
**Component:** `src/pages/Hostel/AllPasses.jsx`  
**Purpose:** View all passes with filter options  
**API Calls:** `GET /hostel/passes?filter=...`

### 16.15 Hostel Students Directory
**Route:** `/hostel/students`  
**Component:** `src/pages/Hostel/Students.jsx`  
**Purpose:** Browse student directory with search  
**API Calls:** `GET /hostel/students?search=...`

### 16.16 Security Dashboard
**Route:** `/security/dashboard`  
**Component:** `src/pages/Security/Dashboard.jsx`  
**Purpose:** Security guard home with gate activity stats  
**API Calls:** `GET /security/dashboard`

### 16.17 QR Scanner Page
**Route:** `/security/scanner`  
**Component:** `src/pages/Security/QRScanner.jsx`  
**Purpose:** QR code scanning interface for gate entry/exit  
**Features:** Auto-focused input for hardware scanner, scan result display (student + pass details), 2-second cooldown, OUT/IN/COMPLETED result states  
**API Calls:** `POST /security/scan`

### 16.18 Scan Logs Page
**Route:** `/security/logs`  
**Component:** `src/pages/Security/ScanLogs.jsx`  
**Purpose:** View gate log history with filters  
**API Calls:** `GET /security/logs?filter=ALL|OUT|IN|TODAY`

### 16.19 Admin Dashboard
**Route:** `/admin/dashboard`  
**Component:** `src/pages/Admin/Dashboard.jsx`  
**Purpose:** System-wide admin overview  
**Features:** User and pass statistics, user list with search/filter, quick actions, system status  
**API Calls:** `GET /admin/dashboard`, `GET /admin/users?filter=ALL`

### 16.20 User Management Page
**Route:** `/admin/users`  
**Component:** `src/pages/Admin/UserManagement.jsx`  
**Purpose:** Full CRUD for system users  
**Features:** Create staff accounts, edit users, activate/deactivate, reset passwords, role filter  
**API Calls:** `GET /admin/users`, `POST /admin/users`, `PUT /admin/users/:id`, `PUT /admin/users/:id/activate`, `PUT /admin/users/:id/deactivate`, `PUT /admin/users/:id/reset-password`

### 16.21 Admin Reports Page
**Route:** `/admin/reports`  
**Component:** `src/pages/Admin/Reports.jsx`  
**Purpose:** Analytics and reporting dashboard  
**Features:** Overview stats, department stats, monthly trends, pass type distribution, coordinator/hostel staff performance, CSV export  
**API Calls:** `GET /reports/overview`, `GET /reports/departments`, `GET /reports/monthly`, `GET /reports/pass-types`, `GET /reports/coordinators`, `GET /reports/hostel-staff`, `GET /reports/export/csv`

### 16.22 Admin Settings Page
**Route:** `/admin/settings`  
**Component:** `src/pages/Admin/Settings.jsx`  
**Purpose:** System configuration management  
**API Calls:** Various settings endpoints

### 16.23 Activity Logs Page
**Route:** `/admin/activity-logs` (via Admin Dashboard)  
**Component:** `src/pages/Admin/ActivityLogs.jsx`  
**Purpose:** Audit trail of all system actions  
**API Calls:** `GET /admin/activity-logs?limit=50`

---

## 17. Testing & Validation

### 17.1 Functional Testing

| Test Case | Input | Expected Output | Status |
|-----------|-------|----------------|--------|
| Student Registration | Valid name, email, password | User created, JWT returned | ✓ |
| Student Registration - Duplicate Email | Existing email | "Email already registered" error | ✓ |
| Student Registration - Weak Password | Password < 8 chars | Validation error | ✓ |
| Login - Valid Credentials | Correct email + password | JWT token returned | ✓ |
| Login - Invalid Password | Wrong password | "Invalid email or password" | ✓ |
| Login - Inactive Account | Deactivated user | "User account is inactive" | ✓ |
| Apply Daily Pass | Valid form data | Pass created, status=PENDING_HOSTEL | ✓ |
| Apply Daily Pass - Past Date | Date in past | "Pass date cannot be in the past" | ✓ |
| Apply Long Leave - Invalid Dates | Return before leaving | "Returning date must be after leaving date" | ✓ |
| Hostel Staff Approve | Valid pass ID | Pass status=APPROVED, QR generated | ✓ |
| Hostel Staff Reject | Valid pass ID + remarks | Pass status=REJECTED | ✓ |
| QR Scan - First Scan | Valid token | OUT log created | ✓ |
| QR Scan - Second Scan | Same valid token | IN log created, pass COMPLETED | ✓ |
| QR Scan - Invalid Token | Random string | "Invalid QR token" error | ✓ |
| QR Scan - Inactive Token | Deactivated token | "QR token is inactive" error | ✓ |
| PDF Generation | Approved pass ID | PDF file created and downloadable | ✓ |
| Role Access - Student accessing Admin | Student JWT | 403 Forbidden | ✓ |
| Notification - Mark as Read | Own notification ID | is_read=true, read_at set | ✓ |
| Notification - Mark Other's | Different user's notification | "Unauthorized" error | ✓ |

### 17.2 Database Testing

| Test | Query | Expected |
|------|-------|---------|
| Cascade Delete - User | DELETE FROM users WHERE id=? | Student, notifications, activity_logs deleted |
| Cascade Delete - Pass | DELETE FROM passes WHERE id=? | Approvals, QR tokens, gate logs, notifications deleted |
| Unique Constraint - Email | INSERT duplicate email | SequelizeUniqueConstraintError |
| Unique Constraint - USN | INSERT duplicate USN | SequelizeUniqueConstraintError |
| Foreign Key - Invalid dept | INSERT student with invalid dept_id | Foreign key constraint error |
| Transaction Rollback | QR generation failure mid-transaction | No partial records created |

### 17.3 API Testing (Sample Test Cases)

```
POST /auth/login
  Body: { "email": "student@test.com", "password": "Test@1234" }
  Expected: 200 OK, { success: true, data: { user: {...}, token: "eyJ..." } }

POST /passes
  Headers: Authorization: Bearer <student_token>
  Body: { "pass_type": "DAILY", "reason": "Medical", "destination": "Hospital",
          "pass_date": "2026-06-10", "hostel_staff_id": 3 }
  Expected: 201 Created, { success: true, data: { pass: { id: 1, status: "PENDING_HOSTEL" } } }

PUT /hostel/passes/1/approve
  Headers: Authorization: Bearer <hostel_staff_token>
  Body: { "remarks": "Approved for medical visit" }
  Expected: 200 OK, { success: true, data: { approval: { status: "APPROVED" } } }

POST /security/scan
  Headers: Authorization: Bearer <security_token>
  Body: { "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }
  Expected: 200 OK, { success: true, data: { scanResult: "OUT", studentDetails: {...} } }
```

### 17.4 User Acceptance Testing

| Scenario | Actor | Steps | Expected Result |
|----------|-------|-------|----------------|
| Complete Daily Pass Journey | Student + Hostel Staff + Security | Apply → Approve → Scan OUT → Scan IN | Pass status = COMPLETED |
| Complete Long Leave Journey | Student + Coordinator + Hostel Staff + Security | Apply → Coord Approve → Hostel Approve → Scan OUT → Scan IN | Pass status = COMPLETED |
| Admin creates coordinator | Admin | POST /admin/users with role=COORDINATOR | Coordinator can login and approve passes |
| Student downloads PDF | Student | Apply pass → Get approved → Download PDF | PDF with QR code downloaded |
| Notification flow | Student | Submit pass → Check notifications | PASS_SUBMITTED notification received |

---

## 18. Challenges Faced

### 18.1 Authentication & Session Management
- **Challenge:** Maintaining JWT session across page refreshes without re-login
- **Solution:** Store token in `localStorage`, validate with backend on app startup via `GET /auth/me`, clear on 401 response via Axios interceptor

### 18.2 Role-Based Access Control
- **Challenge:** Preventing users from accessing routes of other roles
- **Solution:** Dual-layer protection — `PrivateRoute` (authentication check) + `RoleRoute` (role check) on frontend; `authenticate` + `authorize` middleware on backend

### 18.3 Database Schema Evolution
- **Challenge:** Adding new columns (`pass_type`, `pass_date`, `leaving_date`, `returning_date`, `hostel_staff_id`) to existing tables without data loss
- **Solution:** Sequelize migrations with transaction support; server startup runs migrations automatically; `ALTER TABLE` statements for nullable columns

### 18.4 QR Code Race Conditions
- **Challenge:** Multiple simultaneous scans of the same QR code could create duplicate gate logs
- **Solution:** Database transactions with row-level locking (`lock: true` in Sequelize), 2-second cooldown on frontend, validation of existing logs before creating new ones

### 18.5 PDF Generation with QR Embedding
- **Challenge:** Embedding QR code image into server-generated PDF
- **Solution:** Generate QR as PNG buffer (`QRCode.toBuffer()`), pass buffer directly to PDFKit's `doc.image()` method

### 18.6 Multi-Stage Approval Workflow
- **Challenge:** Different pass types require different approval chains (Daily: hostel only; Long Leave: coordinator + hostel)
- **Solution:** Pass type determines initial status (`PENDING_HOSTEL` vs `PENDING_COORDINATOR`); separate approval records per stage; status transitions enforced in service layer

### 18.7 Notification ENUM Consistency
- **Challenge:** Notification type ENUM values were inconsistent between model definition and database (lowercase vs uppercase)
- **Solution:** Standardized all ENUM values to uppercase; added migration to update database ENUM definition; used `NOTIFICATION_TYPES` constants object

### 18.8 Student Profile Completion
- **Challenge:** Students could apply for passes without completing their profile, causing null reference errors in PDF generation
- **Solution:** `GET /student/profile/check` endpoint returns `isComplete` flag; frontend blocks pass application form if profile incomplete

### 18.9 Date Handling Across Timezones
- **Challenge:** Date comparisons failing due to timezone differences between client and server
- **Solution:** Custom `getTodayDate()` function using local timezone arithmetic; `DATEONLY` type in Sequelize for date-only fields; `parseDate()` handles both YYYY-MM-DD and MM/DD/YYYY formats

### 18.10 Sequelize Model Associations
- **Challenge:** Complex associations (User has many Passes as coordinator AND as hostelStaff) causing alias conflicts
- **Solution:** Named aliases (`as: 'coordinator'`, `as: 'hostelStaff'`, `as: 'hostelPasses'`) in both `hasMany` and `belongsTo` definitions

---

## 19. Future Enhancements

### 19.1 Technical Enhancements
- **Real-time Notifications:** Replace polling with WebSocket (Socket.io) for instant push notifications
- **Mobile App:** React Native app for students and security guards with native camera QR scanning
- **Email Notifications:** Send email alerts for pass approvals/rejections using Nodemailer + SMTP
- **SMS Notifications:** Integrate Twilio or MSG91 for SMS alerts to parents on long leave approval
- **Redis Caching:** Cache frequently accessed data (department list, coordinator list) to reduce database load
- **Rate Limiting:** Add express-rate-limit to prevent API abuse
- **File Upload:** Allow students to attach supporting documents (medical certificates) with pass applications

### 19.2 Feature Enhancements
- **Pass Templates:** Save frequently used pass details as templates for quick reapplication
- **Bulk Approval:** Allow coordinators/hostel staff to approve multiple passes at once
- **Pass Calendar:** Visual calendar view showing all approved passes and their dates
- **Parent Portal:** Read-only portal for parents to track their child's pass status
- **Biometric Integration:** Fingerprint or face recognition at gate instead of QR scanning
- **Geofencing:** GPS-based automatic check-in when student returns to campus
- **Analytics Dashboard:** Advanced charts and graphs for pass trends, peak times, department comparisons
- **Automated Reminders:** Remind students to return before pass expiry

### 19.3 Administrative Enhancements
- **Department Management:** Admin UI to add/edit/delete departments
- **Hostel Management:** Admin UI to manage hostel blocks and room assignments
- **Academic Year Reset:** Bulk update student year/semester at start of new academic year
- **Audit Report Export:** Export activity logs as PDF/Excel for compliance
- **System Health Dashboard:** Monitor database connections, API response times, error rates
- **Backup & Restore:** Automated database backup scheduling

---

## 20. References

1. **React Documentation** — Official React 18 documentation  
   https://react.dev/

2. **React Router v6 Documentation** — Nested routes, Outlet, Navigate  
   https://reactrouter.com/en/main

3. **Node.js Documentation** — Node.js v20 LTS runtime  
   https://nodejs.org/en/docs/

4. **Express.js Documentation** — Web framework for Node.js  
   https://expressjs.com/

5. **MySQL 8.0 Reference Manual** — SQL syntax, data types, constraints  
   https://dev.mysql.com/doc/refman/8.0/en/

6. **Sequelize v6 Documentation** — ORM for Node.js  
   https://sequelize.org/docs/v6/

7. **JSON Web Tokens (JWT)** — RFC 7519 specification and jsonwebtoken library  
   https://jwt.io/ | https://github.com/auth0/node-jsonwebtoken

8. **bcrypt Documentation** — Password hashing library  
   https://github.com/kelektiv/node.bcrypt.js

9. **QRCode npm Package** — QR code generation for Node.js  
   https://github.com/soldair/node-qrcode

10. **PDFKit Documentation** — PDF generation library for Node.js  
    https://pdfkit.org/

11. **Tailwind CSS Documentation** — Utility-first CSS framework  
    https://tailwindcss.com/docs

12. **Vite Documentation** — Frontend build tool  
    https://vitejs.dev/guide/

13. **Axios Documentation** — Promise-based HTTP client  
    https://axios-http.com/docs/intro

14. **React Hook Form Documentation** — Form management library  
    https://react-hook-form.com/

15. **qrcode.react Documentation** — QR code React component  
    https://github.com/zpao/qrcode.react

16. **jsPDF Documentation** — Client-side PDF generation  
    https://artskydj.github.io/jsPDF/docs/

17. **VTU DBMS Lab Manual** — Database Management System laboratory guidelines  
    Visvesvaraya Technological University, Belagavi

18. **uuid npm Package** — UUID generation (v4)  
    https://github.com/uuidjs/uuid

---

## 21. Report Assets Checklist

### 21.1 Database Schema Images Needed
- [ ] ER Diagram (Entity-Relationship Diagram) — all 9 entities with relationships
- [ ] Database schema screenshot from MySQL Workbench showing all tables
- [ ] Individual table structure screenshots (DESCRIBE table_name)
- [ ] Foreign key relationship diagram

### 21.2 Screenshots Needed

**Authentication:**
- [ ] Landing page (full page)
- [ ] Login page
- [ ] Student registration page

**Student Module:**
- [ ] Student dashboard (with stats)
- [ ] Apply Pass form — Daily Pass tab
- [ ] Apply Pass form — Long Leave tab
- [ ] My Passes page (with status badges)
- [ ] Pass details view
- [ ] Student notifications page
- [ ] Student profile page

**Coordinator Module:**
- [ ] Coordinator dashboard
- [ ] Pending requests list
- [ ] Approve/reject modal with remarks
- [ ] Approval history page

**Hostel Staff Module:**
- [ ] Hostel dashboard
- [ ] Pending passes list
- [ ] All passes view with filter
- [ ] Students directory

**Security Module:**
- [ ] Security dashboard
- [ ] QR Scanner page (before scan)
- [ ] QR Scanner page (after successful OUT scan)
- [ ] QR Scanner page (after successful IN scan)
- [ ] Scan logs page

**Admin Module:**
- [ ] Admin dashboard (full stats)
- [ ] User management page
- [ ] Create user form
- [ ] Reports page — overview stats
- [ ] Reports page — department stats
- [ ] Reports page — monthly trends
- [ ] Activity logs page

**PDF & QR:**
- [ ] Generated Daily Pass PDF
- [ ] Generated Long Leave PDF
- [ ] QR code display modal

### 21.3 SQL Query Screenshots Needed
- [ ] CREATE TABLE statements execution
- [ ] INSERT sample data
- [ ] SELECT with JOIN query result
- [ ] GROUP BY aggregation query result
- [ ] UPDATE query (approval)
- [ ] DELETE query
- [ ] Dashboard statistics query result

### 21.4 API Screenshots Needed (Postman/Thunder Client)
- [ ] POST /auth/login — success response
- [ ] POST /auth/register — success response
- [ ] POST /passes — create pass response
- [ ] PUT /hostel/passes/:id/approve — approval response
- [ ] POST /security/scan — scan result response
- [ ] GET /reports/overview — statistics response

### 21.5 Database Table Screenshots Needed
- [ ] users table data (SELECT * FROM users LIMIT 10)
- [ ] students table data
- [ ] passes table data
- [ ] approvals table data
- [ ] qr_tokens table data
- [ ] gate_logs table data
- [ ] notifications table data
- [ ] departments table data
- [ ] activity_logs table data

### 21.6 Available Generated Files
The following PDF files are already generated and stored in the project:
- `server/src/pdf/PASS_2.pdf` — Sample Daily Pass PDF
- `server/src/pdf/PASS_3.pdf` — Sample Long Leave PDF

---

## Appendix A: Database Connection Configuration

```javascript
// server/src/config/db.js
const sequelize = new Sequelize(
  process.env.DB_NAME,      // 'smart_gate_pass'
  process.env.DB_USER,      // 'root'
  process.env.DB_PASSWORD,  // configured in .env
  {
    host: process.env.DB_HOST,  // 'localhost'
    port: process.env.DB_PORT,  // 3306
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,       // Maximum connections in pool
      min: 0,       // Minimum connections in pool
      acquire: 30000, // Max time (ms) to acquire connection
      idle: 10000   // Time (ms) before idle connection released
    }
  }
)
```

## Appendix B: Server Startup Sequence

```
1. Load environment variables (dotenv)
2. Initialize Express app
3. Register middleware (CORS, JSON parser, URL encoder)
4. Serve static files from /uploads
5. Register all route handlers
6. Register error handler middleware
7. Connect to MySQL (sequelize.authenticate())
8. Run schema fixes (ALTER TABLE students - make fields nullable)
9. Run pass type migration (add pass_type, pass_date, etc.)
10. Run hostel staff migration (add hostel_staff_id to passes)
11. Run notification ENUM migration (uppercase values)
12. Sync Sequelize models (force: false, alter: false)
13. Start HTTP server on PORT 5000
```

## Appendix C: Frontend Route Map

| Path | Component | Role Required |
|------|-----------|--------------|
| / | Landing | Public |
| /login | Login | Public |
| /register | Register | Public |
| /student | StudentDashboard | STUDENT |
| /student/dashboard | StudentDashboard | STUDENT |
| /student/apply-pass | ApplyPass | STUDENT |
| /student/my-passes | MyPasses | STUDENT |
| /student/notifications | StudentNotifications | STUDENT |
| /student/profile | StudentProfile | STUDENT |
| /coordinator | CoordinatorDashboard | COORDINATOR |
| /coordinator/dashboard | CoordinatorDashboard | COORDINATOR |
| /coordinator/requests | CoordinatorRequests | COORDINATOR |
| /coordinator/history | CoordinatorHistory | COORDINATOR |
| /hostel | HostelDashboard | HOSTEL_STAFF |
| /hostel/dashboard | HostelDashboard | HOSTEL_STAFF |
| /hostel/requests | HostelRequests | HOSTEL_STAFF |
| /hostel/students | HostelStudents | HOSTEL_STAFF |
| /hostel/all-passes | HostelAllPasses | HOSTEL_STAFF |
| /hostel/profile | HostelProfile | HOSTEL_STAFF |
| /security | SecurityDashboard | SECURITY |
| /security/dashboard | SecurityDashboard | SECURITY |
| /security/scanner | QRScanner | SECURITY |
| /security/logs | ScanLogs | SECURITY |
| /admin | AdminDashboard | ADMIN |
| /admin/dashboard | AdminDashboard | ADMIN |
| /admin/users | UserManagement | ADMIN |
| /admin/reports | AdminReports | ADMIN |
| /admin/settings | AdminSettings | ADMIN |
| * | Redirect to / | — |

---

*End of PROJECT_DOCUMENTATION.md*  
*Generated for VTU DBMS Mini Project Report*  
*Smart Gate Pass Management System*
