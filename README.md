# CampusSphere — Smart College Campus Management Platform

**CampusSphere** is a production-ready, full-stack centralized college management portal built with **React.js (Material UI)** and **Java Spring Boot 3 (REST APIs & JPA)** backed by **MySQL** and **Cloudinary**.

Designed with a clean, official **White and Blue** university theme, CampusSphere integrates essential academic, career, and community activities into a unified experience for **Students**, **Faculty**, and **Administrators**.

---

## 🏛️ System Architecture & Data Flow

```
[ React 18 + Material UI + Vite ]
               │
               ▼  (JWT Bearer Authentication, JSON REST)
 [ Spring Boot 3 + Spring Security 6 ]
   ├── Controllers (REST Controllers)
   ├── Services (Business Services + Cloudinary Service + Concurrency Control)
   ├── Repositories (JPA Repositories with DB Pessimistic Locking)
   ├── File Storage ────► Cloudinary (Upload PDFs & Images ➔ Secure URLs)
   └── Relational Database ────► MySQL (`campushub` / `campushub_db`)
```

---

## 🚀 Core Functional Modules

1. **Notes / Academic Resources (Module 1)**:
   - Only Faculty & Admin can upload course notes, lab manuals, and previous question papers (PDF format).
   - Validates file format, size limits, and uploads to Cloudinary (`campussphere/resources`).
   - Students search, filter by department/semester/type, view download statistics, and download PDFs.
   - Faculty can manage, edit, and delete their own uploads at `/resources/my`.

2. **Ride Sharing (Module 2)**:
   - Users create rides (origin, destination, date, time, vehicle, total seats).
   - Seat booking with database-level row locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) to prevent concurrent seat overbooking.
   - Cancel booking returns seats to the pool and updates status back to `ACTIVE` if was `FULL`.
   - Dedicated tabbed `/rides/my` view for created trips and passenger reservations.

3. **Campus Marketplace (Module 3)**:
   - Buy and sell educational items (Books, calculators, lab gear, study notes).
   - Images uploaded directly to Cloudinary (`campussphere/marketplace`).
   - Sellers can update listing, delete, or mark as `SOLD`.
   - Contact seller info without online payment gateway fees.

4. **Event Management (Module 4)**:
   - Student/Faculty submission $\rightarrow$ `PENDING` $\rightarrow$ Admin review (`APPROVE` or `REJECT` with mandatory reason) $\rightarrow$ `APPROVED` (Public listing).
   - Concurrency-safe registration with database row locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) preventing overcapacity.
   - Unique registrations: Cancelling registration updates status to `CANCELLED`; re-registering reactivates the record.
   - Event organizers and admins can access the participant roster at `/events/:id/participants`.

5. **Internship Board & Aggregator (Module 5)**:
   - Unified hub combining campus-posted internships and real-time **Internshala** corporate openings.
   - **Internshala Aggregation (Upscrape API)**:
     - Automatically aggregates internship listings directly from Internshala using the verified `POST https://data.upscrape.com/execute` endpoint (`internshala.internships.list`).
     - Clear distinction between campus-direct listings and externally imported Internshala listings.
     - External listings feature a branded **Internshala** chip and direct "Apply on Internshala" links.
     - Campus-direct listings preserve internal application flow with pre-authenticated profile and Cloudinary resume uploads.
     - Robust deduplication preventing duplicate records via external IDs and canonical URLs without overwriting manual postings.
     - Scheduled background synchronization (default 2:00 AM daily) + Admin manual sync trigger button.
   - Internship posters manage applicants at `/internships/:id/applications` with status updates (`APPLIED`, `UNDER_REVIEW`, `SELECTED`, `REJECTED`, `WITHDRAWN`).

6. **Notification System (Module 6)**:
   - Automatic notifications on event submissions, approvals, rejections, registrations, cancellations; internship applications & status changes; ride bookings & cancellations.
   - Badged unread counters in the navigation header, toast alerts, and mark-all-read controls.

7. **Audit Logging (Module 7)**:
   - Centralized logging of critical actions (`EVENT_CREATED`, `EVENT_APPROVED`, `EVENT_REJECTED`, `EVENT_CANCELLED`, `INTERNSHIP_CREATED`, `INTERNSHIP_APPLICATION_CREATED`, `RESOURCE_UPLOADED`, `MARKETPLACE_ITEM_CREATED`, `RIDE_CREATED`, `RIDE_BOOKED`).
   - Admin audit trail viewer at `/admin/audit-logs`.

---

## 🌐 Internshala Aggregation Architecture (Upscrape API)

### 1. Integration Overview
The Internshala integration connects CampusSphere to the official **Upscrape** data extraction service over JSON REST.
- **Endpoint**: `POST https://data.upscrape.com/execute` (or `/v1/execute`)
- **Capability**: `internshala.internships.list`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <UPSCRAPE_API_KEY>`
  - `Content-Type: application/json`
  - `Prefer: wait=30` (synchronous execution waiting up to 30 seconds)
- **Extensible Provider Abstraction**:
  All aggregation logic is decoupled behind the `InternshipProvider` interface (`com.campushub.service.internship.aggregator.InternshipProvider`), allowing future providers (e.g. Unstop) to be added without modifying the core sync engine.

### 2. Environment Variables & Configuration
Credentials are kept strictly on the backend and never exposed to the frontend, browser, or Git history.
Copy `.env.example` to configure your environment:

```properties
# Upscrape API Key (Read from environment variable)
app.upscrape.api-key=${UPSCRAPE_API_KEY:}
app.upscrape.base-url=${UPSCRAPE_BASE_URL:https://data.upscrape.com}
app.upscrape.connect-timeout-ms=${UPSCRAPE_CONNECT_TIMEOUT_MS:5000}
app.upscrape.read-timeout-ms=${UPSCRAPE_READ_TIMEOUT_MS:35000}
app.upscrape.wait-seconds=${UPSCRAPE_WAIT_SECONDS:30}

# Aggregator Synchronization Settings
app.internshala.sync.enabled=${INTERNSHALA_SYNC_ENABLED:true}
app.internshala.sync.cron=${INTERNSHALA_SYNC_CRON:0 0 2 * * ?}
app.internshala.sync.default-limit=${INTERNSHALA_SYNC_LIMIT:15}
app.internshala.sync.default-keywords=${INTERNSHALA_SYNC_KEYWORDS:computer science,software engineering,web development}
```

### 3. Credit Consumption & Free Trial Limits
- **Upscrape Free Trial**: New accounts receive up to **100 free trial credits** (valid for 60 days, no credit card required).
- **Cost**: Every successful Internshala API call consumes exactly **1 credit**. Failed calls are **free** (0 credits).
- **Credit Safety**: Automated test suites mock all API interactions using Mockito — tests **never** consume real Upscrape credits.

### 4. Database Migration Instructions
When running against MySQL, apply the non-destructive migration script:
```powershell
# In MySQL CLI or Workbench:
mysql -u root -p campushub < d:\CampusSphere\campushub_internshala_migration.sql
```
*(When running with the default H2 profile, Hibernate auto-updates the schema on startup without manual intervention).*

### 5. Deduplication & Data Safety Strategy
1. **Primary Key Deduplication**: Verified against `source_platform` + `external_id`.
2. **Canonical URL Deduplication**: Fallback check against canonical `external_url` and `application_link`.
3. **Manual Internship Preservation**: Synchronization checks `is_external`. Manually created campus internships are protected and will never be overwritten, renamed, or deleted by the aggregator.
4. **Application Separation**: Applying to an external Internshala internship directs the student to the official Internshala application link. Internal resume submissions are rejected with a clear guidance message.

### 6. Synchronization Schedule & Manual Trigger
- **Automatic**: Runs once daily at 2:00 AM (`0 0 2 * * ?`) via Spring `@Scheduled` task.
- **Manual Trigger (Admin only)**:
  - **REST Endpoint**: `POST /api/internships/sync/trigger` (Requires `ROLE_ADMIN` JWT token).
  - **Frontend UI**: Click the **Sync Internshala** button in the header of the Internship Board while logged in as Administrator (`admin@campushub.edu`).
  - **Status Endpoint**: `GET /api/internships/sync/status` (Returns operational metrics: fetched, imported, updated, skipped, duration).

### 7. Testing Instructions
Run the dedicated Internshala aggregation test suite:
```powershell
cd d:\CampusSphere\backend
& "d:\CampusSphere\tools\apache-maven-3.9.6\bin\mvn.cmd" test -Dtest=InternshalaAggregationTests
```
The test suite validates:
1. Successful API response and data mapping
2. Empty API response handling
3. External API failure resilience (5xx / network down)
4. Malformed JSON response resilience
5. Duplicate listing prevention
6. Missing optional fields with resilient fallbacks
7. Preservation of existing manual internships
8. Rejection of internal resume submissions on external listings
9. Source platform filtering (`INTERNSHALA` vs `CAMPUSSPHERE` / `INTERNAL`)

### 8. Known Limitations & Troubleshooting
- **Missing API Key**: If `UPSCRAPE_API_KEY` is not provided, the sync service logs an informational warning and skips live API calls without crashing the application. The Internship Board remains 100% operational with existing and manual listings.
- **Rate Limits / 429**: Upscrape rate-limits are logged cleanly; sync will retry on the next daily schedule.
- **Credit Balance Exhausted**: HTTP 402 is caught and logged as "credit balance exhausted"; previously synchronized listings remain intact.

---

## 🔑 Demo Quick-Access Accounts

All accounts use password: `password123`

| Role | Email | Description |
| :--- | :--- | :--- |
| 👨‍🎓 **Student** | `student@campushub.edu` | Enrolled Computer Science student account. |
| 👩‍🏫 **Faculty** | `faculty@campushub.edu` | Faculty member with resource upload and event hosting access. |
| 🛡️ **Administrator** | `admin@campushub.edu` | University administrator with event approval desk, user moderation, and Internshala sync control. |

---

## 🛠️ Running Locally

### 1. Database Configuration (MySQL)
The database script `campushub_mysql_init.sql` initializes all required tables and seed data in MySQL.
Ensure MySQL is running on port 3306.

### 2. Environment Variables (.env)
Set your `UPSCRAPE_API_KEY` in your environment or launch command:
```powershell
$env:UPSCRAPE_API_KEY="your_api_key_here"
```

### 3. Backend (Spring Boot 3)
```powershell
# In Windows PowerShell:
cd d:\CampusSphere\backend
& "d:\CampusSphere\tools\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run

# Or run with the MySQL profile directly:
& "d:\CampusSphere\tools\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run -Dspring-boot.run.profiles=mysql
```
*Backend server runs on port 8080 (`http://localhost:8080`).*

### 4. Frontend (React + MUI + Vite)
```powershell
cd d:\CampusSphere\frontend
cmd /c npm install
cmd /c npm run dev
```
*Frontend dev server runs on port 3000 (`http://localhost:3000`).*

---

## 📄 Documentation

- [DATABASE_SCHEMA.md](file:///d:/CampusSphere/docs/DATABASE_SCHEMA.md): Complete relational schema, foreign keys, and indexes.
- [API_DOCUMENTATION.md](file:///d:/CampusSphere/docs/API_DOCUMENTATION.md): RESTful endpoint contracts for all modules.
- [ROLE_PERMISSIONS.md](file:///d:/CampusSphere/docs/ROLE_PERMISSIONS.md): Security matrix across Student, Faculty, and Admin.
- [MODULE_ARCHITECTURE.md](file:///d:/CampusSphere/docs/MODULE_ARCHITECTURE.md): Service decoupling and design patterns.

