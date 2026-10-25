# CampusHub - REST API Documentation

## 1. Authentication & User Profile

### Base URL: `/api`
All endpoints (except `/auth/**`) require `Authorization: Bearer <JWT_TOKEN>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user (Student / Faculty) |
| `POST` | `/auth/login` | Public | Authenticate user and receive JWT + profile |
| `GET` | `/users/me` | Authenticated | Retrieve current authenticated user profile |
| `PUT` | `/users/me` | Authenticated | Update user profile (name, phone, skills, bio, year, dept) |
| `GET` | `/users/{id}` | Authenticated | View public profile of a user |

---

## 2. Event Management & Registrations

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/events` | Authenticated | List all `APPROVED` published events (filters: category, search, date) |
| `GET` | `/events/{id}` | Authenticated | Get full details of an event |
| `POST` | `/events` | Student / Faculty | Submit new event request (starts in `PENDING` status) |
| `PUT` | `/events/{id}` | Organizer / Admin | Update event details |
| `DELETE` | `/events/{id}` | Organizer / Admin | Delete event |
| `GET` | `/events/my-organized` | Student / Faculty | Get events organized by current user |
| `GET` | `/events/my-registrations`| Authenticated | Get active & past event registrations for current user |
| `POST` | `/events/{id}/register` | Authenticated | Register for an event using current user profile |
| `PUT` | `/events/{id}/cancel-registration` | Authenticated | Cancel user registration (sets status `CANCELLED`) |
| `GET` | `/events/{id}/participants` | Event Organizer / Admin | View participant list for an organized event |

### Admin Event Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/events/pending` | ADMIN | View all pending event approval requests |
| `PUT` | `/admin/events/{id}/approve` | ADMIN | Approve event and publish to campus |
| `PUT` | `/admin/events/{id}/reject` | ADMIN | Reject event request with reason |
| `PUT` | `/admin/events/{id}/cancel` | ADMIN | Administratively cancel an event |

---

## 3. Internship Board

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/internships` | Authenticated | List active internships (filters: workMode, company, search, eligibility) |
| `GET` | `/internships/{id}` | Authenticated | Get internship details |
| `POST` | `/internships` | Student / Faculty | Post new internship opportunity |
| `PUT` | `/internships/{id}` | Poster / Admin | Update internship listing |
| `DELETE` | `/internships/{id}` | Poster / Admin | Delete internship listing |
| `POST` | `/internships/{id}/apply` | Authenticated | Apply to internship (with resume URL / note) |
| `GET` | `/internships/my-posts` | Authenticated | Get internships posted by current user |
| `GET` | `/internships/my-applications` | Authenticated | Get applications submitted by current user |

---

## 4. Academic Resources / Notes & AI Optimizer

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/resources` | Authenticated | Browse academic resources (filters: subject, semester, department, type) |
| `GET` | `/resources/{id}` | Authenticated | Get resource details and increment download count |
| `POST` | `/resources` | FACULTY | Upload academic resource with file (Cloudinary/storage) |
| `PUT` | `/resources/{id}` | Uploader / Admin | Update resource metadata |
| `DELETE` | `/resources/{id}` | Uploader / Admin | Delete resource |
| `POST` | `/ai/optimize-notes` | Authenticated | AI/LLM note optimization (modes: summarize, key_points, topics, simplify) |

---

## 5. Ride Sharing

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/rides` | Authenticated | List available rides (filters: startLocation, destination, date) |
| `GET` | `/rides/{id}` | Authenticated | Get ride details and passenger list (if creator) |
| `POST` | `/rides` | Authenticated | Post a ride offer |
| `POST` | `/rides/{id}/book` | Authenticated | Book seat(s) on a ride |
| `PUT` | `/rides/{id}/cancel-booking` | Authenticated | Cancel a booked seat |
| `PUT` | `/rides/{id}/cancel-ride` | Creator / Admin | Cancel the entire ride |
| `GET` | `/rides/my-rides` | Authenticated | Get rides created by current user |
| `GET` | `/rides/my-bookings` | Authenticated | Get rides booked by current user |

---

## 6. Team Finder

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/teams` | Authenticated | List open teams (filters: category, skills, search) |
| `GET` | `/teams/{id}` | Authenticated | Get team details, members, and requests (if leader) |
| `POST` | `/teams` | Authenticated | Create a project/hackathon team |
| `POST` | `/teams/{id}/join` | Authenticated | Submit request to join team |
| `PUT` | `/teams/{id}/requests/{requestId}/respond` | Team Leader | Accept or reject join request |
| `DELETE` | `/teams/{id}/members/{userId}` | Team Leader | Remove a member from team |
| `GET` | `/teams/my-teams` | Authenticated | Teams where user is leader or member |

---

## 7. Marketplace

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/marketplace` | Authenticated | List items for sale (filters: category, price range, condition, search) |
| `GET` | `/marketplace/{id}` | Authenticated | Get item details and seller contact info |
| `POST` | `/marketplace` | Authenticated | Create new sale listing with image |
| `PUT` | `/marketplace/{id}` | Seller / Admin | Update listing details |
| `PUT` | `/marketplace/{id}/sold` | Seller | Mark item as sold |
| `DELETE` | `/marketplace/{id}` | Seller / Admin | Delete listing |
| `GET` | `/marketplace/my-listings` | Authenticated | Listings created by current user |

---

## 8. Lost & Found

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/lost-found` | Authenticated | List active lost/found items (filters: type, category, location, date) |
| `GET` | `/lost-found/{id}` | Authenticated | Get item details |
| `POST` | `/lost-found` | Authenticated | Report a lost or found item |
| `PUT` | `/lost-found/{id}/claim` | Authenticated | Submit claim on a found item |
| `PUT` | `/lost-found/{id}/resolve` | Reporter / Admin | Mark item as resolved/returned |
| `PUT` | `/admin/lost-found/{id}/moderate` | ADMIN | Moderate/approve/reject suspicious reports |

---

## 9. Roommate Finder

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/roommates` | Authenticated | Browse active roommate profiles (filters: budget, location, lifestyle) |
| `GET` | `/roommates/me` | Authenticated | Get current user's roommate profile |
| `POST` | `/roommates` | Authenticated | Create / Update roommate preference profile |
| `PUT` | `/roommates/toggle-status` | Authenticated | Toggle profile active/inactive |

---

## 10. Student Community

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/community/posts` | Authenticated | Browse community posts (filters: category, search) |
| `GET` | `/community/posts/{id}` | Authenticated | Get post and comment thread |
| `POST` | `/community/posts` | Authenticated | Create a new community discussion post |
| `POST` | `/community/posts/{id}/comments` | Authenticated | Add a comment/reply to a post |
| `POST` | `/community/posts/{id}/like` | Authenticated | Like/unlike a post |
| `DELETE` | `/community/posts/{id}` | Author / Admin | Delete post |

---

## 11. Notifications & Alerts

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | Authenticated | Get notifications for current user (pagination + unread count) |
| `PUT` | `/notifications/{id}/read` | Authenticated | Mark single notification as read |
| `PUT` | `/notifications/read-all` | Authenticated | Mark all notifications as read |

---

## 12. File Uploads (Cloudinary)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/upload/file` | Authenticated | Upload file (document/image) $\rightarrow$ returns secure URL & public ID |

---

## 13. Admin Management & Audit Logs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | ADMIN | Overview statistics (users, events, resources, activities) |
| `GET` | `/admin/users` | ADMIN | Manage users (search, role update, active toggle) |
| `GET` | `/admin/audit-logs` | ADMIN | Paginated system audit log trail |
