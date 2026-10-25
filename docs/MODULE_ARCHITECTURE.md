# CampusHub - Module Architecture & Integration Specifications

## 1. System Architecture
CampusHub follows a clean 3-tier decoupled architecture:
1. **Presentation Tier**: React 18+ SPA with Material-UI (MUI v5/v6) component library, React Router v6, Axios interceptors, responsive viewport handling, and centralized Context API for Auth and Notifications.
2. **Application Tier**: Spring Boot 3 REST API with Spring Security (Stateless JWT Filter), Controller-Service-Repository pattern, global Bean Validation, centralized exception handling, and modular external integrations (Cloudinary SDK, AI Service).
3. **Data Tier**: MySQL 8 relational persistence via Spring Data JPA / Hibernate ORM with connection pooling (HikariCP), schema constraints, and audit logging.

---

## 2. Module Boundaries & Team Separation

```
src/main/java/com/campushub/
├── config/             # Spring Security, Cloudinary, WebMvc, Jackson
├── security/           # JWT Provider, Auth Filter, UserPrincipal, SecurityUtils
├── exception/          # GlobalExceptionHandler, Custom exceptions
├── util/               # Constants, DateTime formatters
├── entity/             # JPA Entities (All 11 modules + User + Audit)
├── repository/         # Spring Data JPA Repositories
├── dto/                # Request / Response DTO models
├── service/
│   ├── ai/             # AIService, LLMService, MockAIService
│   ├── storage/        # FileStorageService, CloudinaryService
│   ├── AuthService.java
│   ├── UserService.java
│   ├── EventService.java
│   ├── InternshipService.java
│   ├── AcademicResourceService.java
│   ├── RideService.java
│   ├── TeamService.java
│   ├── MarketplaceService.java
│   ├── LostFoundService.java
│   ├── RoommateService.java
│   ├── CommunityService.java
│   ├── NotificationService.java
│   └── AuditLogService.java
└── controller/         # REST Controllers mapped to API contracts
```

---

## 3. Shared Services & Cross-Cutting Concerns

### A. Centralized Notification Engine
The `NotificationService` is an event-driven internal service invoked by all business services:
- **Event Lifecycle**: Triggered upon submission (to Admins), approval/rejection (to Organizer), registration (to Participant), and cancellation.
- **Team Finder**: Triggered when a user requests to join (to Team Leader) and when the leader accepts/rejects.
- **Ride Sharing**: Triggered when a passenger books a seat (to Driver) and when a ride is cancelled.
- **Lost & Found / Marketplace**: Triggered when claims or inquiries are submitted.

### B. Modular AI Service (`AIService`)
Interface `AIService` defines:
```java
String optimizeNotes(String content, OptimizationMode mode);
```
Implementations:
- `LLMService`: Calls configured OpenAI/Gemini-compatible endpoint via `RestClient` / `WebClient` using securely injected API keys.
- `MockAIService`: Active whenever API keys are not provided, performing high-quality deterministic NLP extraction, bullet point summarization, topic tagging, and simplification.

### C. File & Image Storage (`FileStorageService`)
- Interface `FileStorageService` with `CloudinaryService` implementation for production cloud storage and fallback local storage handler for offline/isolated runtime environments.
