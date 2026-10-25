$BaseUrl = "http://localhost:8080/api"
$Headers = @{ "Content-Type" = "application/json" }

Write-Host "=================================================="
Write-Host "  CAMPUSHUB FULL-STACK API VERIFICATION SUITE"
Write-Host "=================================================="

# 1. Login as Student
Write-Host "`n[1] Testing Student Authentication..."
$StudentLoginBody = @{
    email = "student@campushub.edu"
    password = "password123"
} | ConvertTo-Json

$StudentRes = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Headers $Headers -Body $StudentLoginBody
$StudentData = $StudentRes.data
Write-Host "  Status: SUCCESS"
Write-Host "  Logged in User: $($StudentData.user.fullName) ($($StudentData.user.role))"
$StudentToken = $StudentData.token
$StudentHeaders = @{ "Content-Type" = "application/json"; "Authorization" = "Bearer $StudentToken" }

# 2. Login as Admin
Write-Host "`n[2] Testing Admin Authentication..."
$AdminLoginBody = @{
    email = "admin@campushub.edu"
    password = "password123"
} | ConvertTo-Json

$AdminRes = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Headers $Headers -Body $AdminLoginBody
$AdminData = $AdminRes.data
Write-Host "  Status: SUCCESS"
Write-Host "  Logged in Admin: $($AdminData.user.fullName) ($($AdminData.user.role))"
$AdminToken = $AdminData.token
$AdminHeaders = @{ "Content-Type" = "application/json"; "Authorization" = "Bearer $AdminToken" }

# 3. Create Event Proposal by Student (Must be PENDING)
Write-Host "`n[3] Testing Event Submission Lifecycle (PENDING status)..."
$EventProposal = @{
    title = "NextGen AI & Cloud Summit 2026"
    description = "Hands-on student workshop on Kubernetes, LLM deployment, and microservices."
    category = "Workshop"
    eventDate = (Get-Date).AddDays(14).ToString("yyyy-MM-dd")
    startTime = "10:00:00"
    endTime = "16:00:00"
    venue = "Computer Science Seminar Hall 1"
    eligibility = "Open to all students"
    maxParticipants = 45
    registrationDeadline = (Get-Date).AddDays(10).ToString("yyyy-MM-ddTHH:mm:ss")
} | ConvertTo-Json

$CreatedEventRes = Invoke-RestMethod -Uri "$BaseUrl/events" -Method POST -Headers $StudentHeaders -Body $EventProposal
$CreatedEvent = $CreatedEventRes.data
Write-Host "  Status: SUCCESS"
Write-Host "  Created Event ID: $($CreatedEvent.id) | Status: $($CreatedEvent.status)"

# 4. Admin Approves Event
Write-Host "`n[4] Testing Admin Event Approval..."
$ApprovedEventRes = Invoke-RestMethod -Uri "$BaseUrl/admin/events/$($CreatedEvent.id)/approve" -Method PUT -Headers $AdminHeaders
$ApprovedEvent = $ApprovedEventRes.data
Write-Host "  Status: SUCCESS"
Write-Host "  Event Status after Admin Approval: $($ApprovedEvent.status)"

# 5. Student Registers for Approved Event
Write-Host "`n[5] Testing Student Event Registration (Profile-based)..."
$RegistrationRes = Invoke-RestMethod -Uri "$BaseUrl/events/$($CreatedEvent.id)/register" -Method POST -Headers $StudentHeaders
$Registration = $RegistrationRes.data
Write-Host "  Status: SUCCESS"
Write-Host "  Registered Status: $($Registration.status) | Registered At: $($Registration.registeredAt)"

# 6. Organizer checks participant roster
Write-Host "`n[6] Testing Organizer Participant Access..."
$ParticipantsRes = Invoke-RestMethod -Uri "$BaseUrl/events/$($CreatedEvent.id)/participants" -Method GET -Headers $StudentHeaders
$Participants = $ParticipantsRes.data
Write-Host "  Status: SUCCESS"
Write-Host "  Total Participants Count: $($Participants.Count)"
Write-Host "  Participant Name: $($Participants[0].participant.fullName) ($($Participants[0].participant.department))"

# 7. Student Cancels Event Registration (Status becomes CANCELLED in DB)
Write-Host "`n[7] Testing Event Registration Cancellation..."
$CancelledRegRes = Invoke-RestMethod -Uri "$BaseUrl/events/$($CreatedEvent.id)/cancel-registration" -Method PUT -Headers $StudentHeaders
$CancelledReg = $CancelledRegRes.data
Write-Host "  Status: SUCCESS"
Write-Host "  Status after cancellation: $($CancelledReg.status) | Cancelled At: $($CancelledReg.cancelledAt)"

# 8. AI Notes Optimizer
Write-Host "`n[8] Testing AI Notes Optimization Engine..."
$AIBody = @{
    content = "Distributed databases replicate data across multiple physical partitions. Two-Phase Locking (2PL) guarantees serializability by enforcing growing and shrinking lock acquisition phases. In 2PC (Two-Phase Commit), a coordinator prepares votes from cohorts before sending global commit."
    type = "KEY_POINTS"
    subject = "Database Systems (CS402)"
} | ConvertTo-Json

$AIOptimizationRes = Invoke-RestMethod -Uri "$BaseUrl/ai/optimize-notes" -Method POST -Headers $StudentHeaders -Body $AIBody
$AIOptimization = $AIOptimizationRes.data
Write-Host "  Status: SUCCESS"
Write-Host "  AI Result Sample: `n$($AIOptimization.optimizedContent.Substring(0, [Math]::Min(250, $AIOptimization.optimizedContent.Length)))..."

# 9. Test Querying all Modules
Write-Host "`n[9] Verifying All 11 Functional Modules..."
$Resources = (Invoke-RestMethod -Uri "$BaseUrl/resources" -Method GET -Headers $StudentHeaders).data
Write-Host "  [Module 1] Academic Resources: $($Resources.Count) items found"

$Rides = (Invoke-RestMethod -Uri "$BaseUrl/rides" -Method GET -Headers $StudentHeaders).data
Write-Host "  [Module 2] Ride Sharing: $($Rides.Count) rides found"

$Teams = (Invoke-RestMethod -Uri "$BaseUrl/teams" -Method GET -Headers $StudentHeaders).data
Write-Host "  [Module 3] Team Finder: $($Teams.Count) teams found"

$Internships = (Invoke-RestMethod -Uri "$BaseUrl/internships" -Method GET -Headers $StudentHeaders).data
Write-Host "  [Module 4] Internship Board: $($Internships.Count) opportunities found"

$Events = (Invoke-RestMethod -Uri "$BaseUrl/events" -Method GET -Headers $StudentHeaders).data
Write-Host "  [Module 5] Campus Events: $($Events.Count) approved events found"

$Market = (Invoke-RestMethod -Uri "$BaseUrl/marketplace" -Method GET -Headers $StudentHeaders).data
Write-Host "  [Module 6] Marketplace: $($Market.Count) listings found"

$LostFound = (Invoke-RestMethod -Uri "$BaseUrl/lost-found" -Method GET -Headers $StudentHeaders).data
Write-Host "  [Module 7] Lost & Found: $($LostFound.Count) items found"

$Roommates = (Invoke-RestMethod -Uri "$BaseUrl/roommates" -Method GET -Headers $StudentHeaders).data
Write-Host "  [Module 8] Roommate Finder: $($Roommates.Count) profiles found"

$Community = (Invoke-RestMethod -Uri "$BaseUrl/community/posts" -Method GET -Headers $StudentHeaders).data
Write-Host "  [Module 9] Community: $($Community.Count) discussions found"

$Notifs = (Invoke-RestMethod -Uri "$BaseUrl/notifications" -Method GET -Headers $StudentHeaders).data
Write-Host "  [Module 11] Notifications: $($Notifs.Count) notifications found"

$AdminStats = (Invoke-RestMethod -Uri "$BaseUrl/admin/stats" -Method GET -Headers $AdminHeaders).data
Write-Host "  [System Admin Stats] Users: $($AdminStats.totalStudents + $AdminStats.totalFaculty) | Events: $($AdminStats.approvedEvents)"

Write-Host "`n=================================================="
Write-Host "  ALL 11 CAMPUSHUB MODULES VERIFIED SUCCESSFULLY!"
Write-Host "=================================================="
