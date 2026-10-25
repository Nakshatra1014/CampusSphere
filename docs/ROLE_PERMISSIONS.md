# CampusHub - Role Permissions Matrix

## 1. User Roles
CampusHub defines three system roles:
- `ROLE_STUDENT`: Enrolled student user.
- `ROLE_FACULTY`: University faculty/staff member.
- `ROLE_ADMIN`: Platform administrator/moderator.

---

## 2. Permissions Matrix

| Feature / Action | STUDENT | FACULTY | ADMIN | Notes |
|---|:---:|:---:|:---:|---|
| **Authentication & Profile** |
| Register / Login | ✅ | ✅ | ✅ | Standard JWT credentials |
| Edit Own Profile | ✅ | ✅ | ✅ | Name, phone, department, skills, bio |
| View Other User Profiles | ✅ | ✅ | ✅ | Public safe profile view |
| **Events** |
| Submit Event Request | ✅ | ✅ | ✅ | Starts in `PENDING` status |
| Review / Approve / Reject Event | ❌ | ❌ | ✅ | Rejection requires reason |
| Register for Approved Event | ✅ | ✅ | ✅ | One-click using logged-in profile |
| Cancel Event Registration | ✅ | ✅ | ✅ | Status updated to `CANCELLED` |
| View Event Participants | ❌ (Unless Organizer) | ❌ (Unless Organizer) | ✅ | Backend enforces organizer check |
| **Internship Board** |
| Post Internship Opportunity | ✅ | ✅ | ✅ | Students and Faculty can post |
| Browse & Apply to Internships | ✅ | ✅ | ✅ | Unique application check |
| Manage Posted Internships | ✅ (Own) | ✅ (Own) | ✅ (All) | Edit/delete capabilities |
| **Notes & Academic Resources** |
| Upload Notes/Resources | ❌ | ✅ | ✅ | **Only Faculty/Admin can upload** |
| Browse & Download Resources | ✅ | ✅ | ✅ | Open to all authenticated users |
| AI Notes Optimizer | ✅ | ✅ | ✅ | Summarize, key points, topics |
| **Ride Sharing** |
| Post Ride | ✅ | ✅ | ✅ | Sets departure, destination, seats |
| Book Seat | ✅ | ✅ | ✅ | Decrements seat counter |
| View Passengers / Manage Ride | ✅ (Creator) | ✅ (Creator) | ✅ (All) | |
| **Team Finder** |
| Create Team | ✅ | ✅ | ✅ | Hackathon / project team creation |
| Request to Join Team | ✅ | ✅ | ✅ | Leader receives notification |
| Accept / Reject Join Request | ✅ (Leader) | ✅ (Leader) | ✅ (All) | Leader-controlled |
| **Marketplace** |
| Post Items for Sale | ✅ | ✅ | ✅ | Books, electronics, stationery |
| Mark as Sold / Edit / Delete | ✅ (Seller) | ✅ (Seller) | ✅ (All) | |
| **Lost & Found** |
| Report Lost / Found Item | ✅ | ✅ | ✅ | With location, category, image |
| Claim Found Item | ✅ | ✅ | ✅ | Contact reporter workflow |
| Moderate Reports | ❌ | ❌ | ✅ | Flag or remove inappropriate items |
| **Roommate Finder** |
| Create / Edit Roommate Profile | ✅ | ✅ | ❌ | Budget, lifestyle, preferences |
| Browse & Connect | ✅ | ✅ | ❌ | |
| **Student Community** |
| Create Post & Comment | ✅ | ✅ | ✅ | Categorized discussions |
| Moderate / Delete Inappropriate Post | ❌ (Own only) | ❌ (Own only) | ✅ (All) | |
| **System & Administration** |
| Receive Notifications | ✅ | ✅ | ✅ | Auto-generated on platform events |
| View Audit Logs | ❌ | ❌ | ✅ | Administrative traceability |
| User Management | ❌ | ❌ | ✅ | Enable/disable accounts, view logs |
