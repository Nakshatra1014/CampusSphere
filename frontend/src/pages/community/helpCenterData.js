// CampusSphere Help Center — Predefined Task Navigation Guides
// NO AI, NO LLM, NO external APIs — all data is static and deterministic.

export const HELP_CATEGORIES = [
  'Academics',
  'Events',
  'Internships',
  'Campus Life',
  'Marketplace',
  'Account & Notifications',
];

// Role constants (mirror ROLES in constants.js)
export const ROLE_STUDENT = 'ROLE_STUDENT';
export const ROLE_FACULTY = 'ROLE_FACULTY';
export const ROLE_ADMIN   = 'ROLE_ADMIN';

// ALL_ROLES — shorthand used in requiredRoles when any authenticated user may perform the task
export const ALL_ROLES = [ROLE_STUDENT, ROLE_FACULTY, ROLE_ADMIN];

/**
 * Predefined task list.
 * Each entry:
 *   id            — unique string identifier
 *   title         — short task name shown on cards and in search
 *   description   — one-sentence summary shown on card
 *   category      — one of HELP_CATEGORIES
 *   keywords      — lowercase words for local search matching
 *   module        — module display name
 *   route         — verified existing React Router route (from AppRoutes.jsx)
 *   routeLabel    — label for the primary CTA button
 *   requiredRoles — roles for which this guide is relevant (null = all roles)
 *   navigationPath — breadcrumb string
 *   steps         — ordered step strings
 *   expectedResult — what happens when the task succeeds
 *   commonIssues  — array of { issue, tip } objects
 *   note          — optional informational callout (string or null)
 */
export const HELP_TASKS = [
  // ── A. NOTES & RESOURCES ─────────────────────────────────────────────────

  {
    id: 'download-notes',
    title: 'Find and Download Notes',
    description: 'Browse the resource library, open a resource, and download the file.',
    category: 'Academics',
    keywords: ['download', 'notes', 'pdf', 'file', 'resource', 'lecture', 'study material', 'find', 'academic'],
    module: 'Notes & Resources',
    route: '/resources',
    routeLabel: 'Go to Notes & Resources',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Notes & Resources → Search / Filter → Open Resource → Download',
    steps: [
      'Click Notes & Resources in the sidebar.',
      'Use the search bar or available filters (subject, department, semester, type) to find the resource.',
      'Click on the resource card to open its details.',
      'Click the Download button.',
      'The file is saved to your browser\'s Downloads folder with its original filename and extension.',
    ],
    expectedResult: 'The file downloads with its original filename and extension.',
    commonIssues: [
      { issue: 'Download button not visible', tip: 'Make sure you are logged in. Some resources may require being in a specific department or semester group.' },
      { issue: 'File does not open after download', tip: 'Check your Downloads folder. You may need a PDF reader or Office suite to open the file.' },
    ],
    note: 'Students can view and download resources. Only Faculty and Admin can upload or delete resources.',
  },

  {
    id: 'upload-notes',
    title: 'Upload Academic Notes',
    description: 'Faculty can upload lecture notes, reference material, and other academic resources.',
    category: 'Academics',
    keywords: ['upload', 'notes', 'resource', 'share', 'publish', 'faculty', 'add notes'],
    module: 'Notes & Resources',
    route: '/resources/upload',
    routeLabel: 'Go to Upload Resource',
    requiredRoles: [ROLE_FACULTY, ROLE_ADMIN],
    navigationPath: 'Dashboard → Notes & Resources → Upload Resource',
    steps: [
      'Log in with a Faculty or Admin account.',
      'Click Notes & Resources in the sidebar.',
      'Click the Upload Resource button.',
      'Enter the title, subject, department, semester, resource type, and description.',
      'Select the file to upload.',
      'Click Upload to publish the resource.',
    ],
    expectedResult: 'The resource appears in the Notes & Resources listing and is available for students to download.',
    commonIssues: [
      { issue: 'Upload Resource button is not visible', tip: 'This action is available only to Faculty and Admin accounts. Students cannot upload resources.' },
      { issue: 'Upload fails', tip: 'Check that the file size is within the allowed limit and that the file format is supported.' },
    ],
    note: 'Students can view and download resources but cannot upload or delete them. Only Faculty and Admin have upload access.',
  },

  // ── B. EVENTS ─────────────────────────────────────────────────────────────

  {
    id: 'register-event',
    title: 'Register for an Event',
    description: 'Find an approved event, check seat availability, and complete your registration.',
    category: 'Events',
    keywords: ['register', 'event', 'sign up', 'join event', 'registration', 'book seat', 'attend', 'event form'],
    module: 'Events',
    route: '/events',
    routeLabel: 'Go to Events',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Events → Select Event → Event Details → Register Now',
    steps: [
      'Click Events in the sidebar.',
      'Search or filter the event listing to find the event you want to attend.',
      'Click Details on an approved event card.',
      'On the Event Details page, check the registration deadline and available seats.',
      'If registration is open, click Register Now.',
      'Complete the organizer\'s custom registration form.',
      'Submit the form.',
      'To confirm your registration, navigate to My Events → My Registrations.',
    ],
    expectedResult: 'Your registration is recorded and visible under My Registrations.',
    commonIssues: [
      { issue: 'Register Now button is missing or disabled', tip: 'Registration closes when the deadline passes, the event is full, the event has not been approved by Admin, or the event has already started.' },
      { issue: 'Event is not visible in the listing', tip: 'Only approved events appear in the public listing. A pending or rejected event will not be shown.' },
      { issue: 'Form fields look wrong', tip: 'Each organizer can create a custom registration form. The fields will vary per event.' },
    ],
    note: 'Registration stays open until the registration deadline, provided the event is approved, has not started, and seats are available.',
  },

  {
    id: 'organize-event',
    title: 'Organize an Event',
    description: 'Create and submit a new event for Admin approval.',
    category: 'Events',
    keywords: ['organize', 'create event', 'host', 'plan event', 'new event', 'event organizer', 'submit event'],
    module: 'Events',
    route: '/events/create',
    routeLabel: 'Organize an Event',
    requiredRoles: [ROLE_STUDENT, ROLE_FACULTY, ROLE_ADMIN],
    navigationPath: 'Dashboard → Events → Organize Event → Fill Event Form → Submit for Approval',
    steps: [
      'Click Events in the sidebar.',
      'Click the Organize Event button.',
      'Enter the event details: title, description, category, venue, and event date/time.',
      'Set the registration deadline and maximum participant limit.',
      'Add an event banner image if you have one.',
      'Click Submit.',
      'Monitor the event status under My Events.',
    ],
    expectedResult: 'Your event is created with PENDING status and submitted to Admin for review.',
    commonIssues: [
      { issue: 'Event does not appear in the public listing', tip: 'Your event must be approved by an Admin before it appears publicly. Check its status in My Events.' },
      { issue: 'Event rejected', tip: 'Admin may have rejected the event. Rejected events remain unpublished. Check the reason in My Events and resubmit if needed.' },
    ],
    note: 'New events start as PENDING. An Admin must approve the event before it appears in the public listing. Rejected events remain unpublished.',
  },

  {
    id: 'view-event-participants',
    title: 'View Event Participants',
    description: 'See who has registered for your event as the organizer or Admin.',
    category: 'Events',
    keywords: ['participants', 'attendees', 'registrations', 'who registered', 'event members', 'organizer view'],
    module: 'Events',
    route: '/events/my',
    routeLabel: 'Go to My Events',
    requiredRoles: [ROLE_STUDENT, ROLE_FACULTY, ROLE_ADMIN],
    navigationPath: 'Dashboard → Events → My Events → Select Event → Participants',
    steps: [
      'Click Events in the sidebar.',
      'Navigate to My Events.',
      'Click on the event whose participants you want to see.',
      'Open the Participants tab or section on the event details page.',
    ],
    expectedResult: 'A list of registered participants is displayed for your event.',
    commonIssues: [
      { issue: 'No Participants tab visible', tip: 'Participant details are only visible to the event organizer and Admin. This option will not appear on events you did not create.' },
    ],
    note: 'Participant information is available only to the event organizer and Admin users.',
  },

  // ── C. INTERNSHIP BOARD ───────────────────────────────────────────────────

  {
    id: 'apply-internship',
    title: 'Apply for an Internship',
    description: 'Search for open internships, review eligibility, and submit your application with a resume.',
    category: 'Internships',
    keywords: ['apply', 'internship', 'job', 'career', 'application', 'resume', 'cover letter', 'apply now', 'company'],
    module: 'Internship Board',
    route: '/internships',
    routeLabel: 'Go to Internship Board',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Internship Board → Search / Filter → Open Internship → Apply Now',
    steps: [
      'Click Internship Board in the sidebar.',
      'Search by title, company name, or required skills, or use the available filters.',
      'Open the internship listing you are interested in.',
      'Review the eligibility criteria and application deadline carefully.',
      'Click Apply Now while applications are open.',
      'Upload your resume (PDF recommended).',
      'Add an optional cover note.',
      'Click Submit Application.',
    ],
    expectedResult: 'Your application is submitted with status APPLIED and visible under My Internship Applications.',
    commonIssues: [
      { issue: 'Apply Now button is not visible or disabled', tip: 'Applications close when the deadline is reached. For a date-based deadline, applications are open through the deadline day (India time) and close at the start of the following day.' },
      { issue: 'Resume upload fails', tip: 'Make sure your resume is in PDF or DOCX format and within the file size limit.' },
    ],
    note: 'Application deadlines are enforced by the system. For a date deadline, the application window closes at the start of the day after the deadline date (Indian Standard Time).',
  },

  {
    id: 'track-applications',
    title: 'Track Internship Applications',
    description: 'Check the status of every internship application you have submitted.',
    category: 'Internships',
    keywords: ['track', 'application status', 'internship status', 'applied', 'selected', 'rejected', 'withdrawn', 'under review', 'my applications'],
    module: 'Internship Board',
    route: '/internships/my-applications',
    routeLabel: 'Go to My Applications',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Internship Board → My Internship Applications',
    steps: [
      'Click Internship Board in the sidebar.',
      'Click My Internship Applications.',
      'Find the application you want to check.',
      'Review its current status.',
    ],
    expectedResult: 'Each application shows one of: APPLIED, UNDER_REVIEW, SELECTED, REJECTED, or WITHDRAWN.',
    commonIssues: [
      { issue: 'Application not visible', tip: 'Make sure you are logged in with the same account used when applying. New applications may take a moment to appear.' },
      { issue: 'Status has not changed', tip: 'The internship poster or Admin updates application statuses manually. Check back later or contact the poster.' },
    ],
    note: null,
  },

  {
    id: 'post-internship',
    title: 'Post an Internship',
    description: 'Faculty and Admins can publish internship opportunities for students.',
    category: 'Internships',
    keywords: ['post', 'create internship', 'publish internship', 'new internship', 'list internship', 'add internship'],
    module: 'Internship Board',
    route: '/internships/post',
    routeLabel: 'Post an Internship',
    requiredRoles: [ROLE_FACULTY, ROLE_ADMIN],
    navigationPath: 'Dashboard → Internship Board → Post Internship',
    steps: [
      'Click Internship Board in the sidebar.',
      'Click Post Internship.',
      'Enter the internship title, company name, description, required skills, and work mode (Remote, On-Site, or Hybrid).',
      'Set the application deadline.',
      'Provide compensation details and any eligibility criteria.',
      'Submit the listing.',
    ],
    expectedResult: 'The internship appears in the public Internship Board listing for students to apply.',
    commonIssues: [
      { issue: 'Post Internship button not visible', tip: 'This feature is available to Faculty and Admin accounts only.' },
    ],
    note: 'Only Faculty and Admin roles can post internship listings.',
  },

  {
    id: 'review-applicants',
    title: 'Review Internship Applicants',
    description: 'View and manage applications received for an internship you posted.',
    category: 'Internships',
    keywords: ['review', 'applicants', 'resumes', 'manage applications', 'shortlist', 'my posts', 'internship applications'],
    module: 'Internship Board',
    route: '/internships/my',
    routeLabel: 'Go to My Posts',
    requiredRoles: [ROLE_FACULTY, ROLE_ADMIN],
    navigationPath: 'Dashboard → Internship Board → My Posts → Select Internship → Applications',
    steps: [
      'Click Internship Board in the sidebar.',
      'Go to My Posts (or My Internships).',
      'Click on the internship listing you want to manage.',
      'Open the Applications section.',
      'Review each applicant\'s profile and resume.',
      'Update the application status as needed (UNDER_REVIEW, SELECTED, REJECTED).',
    ],
    expectedResult: 'You can see all applicants for your listing and update their application statuses.',
    commonIssues: [
      { issue: 'Applications section not visible', tip: 'This view is only available to the internship poster or Admin.' },
    ],
    note: 'Only the internship poster and Admin can view applicant resumes and private details.',
  },

  // ── D. RIDE SHARING ───────────────────────────────────────────────────────

  {
    id: 'find-ride',
    title: 'Find and Book a Ride',
    description: 'Browse available rides, check journey details, and join a ride going your way.',
    category: 'Campus Life',
    keywords: ['ride', 'carpool', 'share ride', 'book ride', 'travel', 'commute', 'find ride', 'join ride'],
    module: 'Ride Sharing',
    route: '/rides',
    routeLabel: 'Go to Ride Sharing',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Ride Sharing → Browse Rides → Select Ride → Book / Join',
    steps: [
      'Click Ride Sharing in the sidebar.',
      'Browse the list of available rides.',
      'Review the departure location, destination, date, time, available seats, and any additional ride details.',
      'Click on a ride to open its details.',
      'Click Book / Join Ride if the ride matches your requirements and seats are available.',
    ],
    expectedResult: 'You are added to the ride and can see it listed under My Rides.',
    commonIssues: [
      { issue: 'No rides available for my route', tip: 'Try adjusting the filters or check back later. You can also create your own ride.' },
      { issue: 'Join button is disabled', tip: 'The ride may be full or the departure date may have passed.' },
    ],
    note: null,
  },

  {
    id: 'create-ride',
    title: 'Create a Ride',
    description: 'Publish a ride so other students can join and share the journey with you.',
    category: 'Campus Life',
    keywords: ['create ride', 'offer ride', 'publish ride', 'new ride', 'carpool', 'share seat'],
    module: 'Ride Sharing',
    route: '/rides/create',
    routeLabel: 'Create a Ride',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Ride Sharing → Create Ride',
    steps: [
      'Click Ride Sharing in the sidebar.',
      'Click Create Ride.',
      'Enter the departure location, destination, departure date and time, available seats, and any additional notes.',
      'Submit the ride listing.',
    ],
    expectedResult: 'Your ride appears in the Ride Sharing listing for others to discover and join.',
    commonIssues: [
      { issue: 'Ride does not appear in the listing', tip: 'Refresh the page. If the ride still does not appear, check that you completed all required fields.' },
    ],
    note: null,
  },

  // ── E. TEAM FINDER ────────────────────────────────────────────────────────

  {
    id: 'join-team',
    title: 'Find and Join a Team',
    description: 'Browse open project teams, check required skills, and request to join.',
    category: 'Campus Life',
    keywords: ['team', 'join team', 'project', 'collaborate', 'group', 'hackathon team', 'find team', 'request join'],
    module: 'Team Finder',
    route: '/teams',
    routeLabel: 'Go to Team Finder',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Team Finder → Browse Teams → Open Team → Request to Join',
    steps: [
      'Click Team Finder in the sidebar.',
      'Browse the list of open teams.',
      'Review the project name, required skills, team size limit, and application deadline.',
      'Click on a team to open its details.',
      'Click Request to Join if you meet the requirements and the deadline has not passed.',
    ],
    expectedResult: 'Your join request is sent to the team creator for review.',
    commonIssues: [
      { issue: 'Request to Join button is not visible', tip: 'The deadline may have passed or the team may be full.' },
      { issue: 'Request pending for a long time', tip: 'The team creator reviews requests manually. Contact them directly if urgency is needed.' },
    ],
    note: null,
  },

  {
    id: 'create-team',
    title: 'Create a Team',
    description: 'Start a new project team and invite others with the required skills to join.',
    category: 'Campus Life',
    keywords: ['create team', 'new team', 'start team', 'project team', 'form group', 'team lead'],
    module: 'Team Finder',
    route: '/teams/create',
    routeLabel: 'Create a Team',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Team Finder → Create Team',
    steps: [
      'Click Team Finder in the sidebar.',
      'Click Create Team.',
      'Enter the project name and description.',
      'List the skills you are looking for in team members.',
      'Set the maximum team size and the application deadline.',
      'Submit the team listing.',
    ],
    expectedResult: 'Your team appears in the Team Finder listing and other students can request to join.',
    commonIssues: [
      { issue: 'Team not visible after creation', tip: 'Refresh the page. Check My Teams to confirm the team was created successfully.' },
    ],
    note: null,
  },

  // ── F. MARKETPLACE ────────────────────────────────────────────────────────

  {
    id: 'buy-item',
    title: 'Buy an Item',
    description: 'Browse marketplace listings and contact a seller to purchase an item.',
    category: 'Marketplace',
    keywords: ['buy', 'purchase', 'marketplace', 'item', 'shop', 'find item', 'contact seller', 'book', 'second hand'],
    module: 'Marketplace',
    route: '/marketplace',
    routeLabel: 'Go to Marketplace',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Marketplace → Search Items → Open Listing → Contact Seller',
    steps: [
      'Click Marketplace in the sidebar.',
      'Search by item name or category, or browse the full listing.',
      'Click on an item card to open its details.',
      'Review the title, description, category, price, and condition.',
      'Use the Contact Seller option to reach the seller directly and arrange the transaction.',
    ],
    expectedResult: 'You can contact the seller to negotiate and complete the purchase.',
    commonIssues: [
      { issue: 'Item appears sold or unavailable', tip: 'The seller may have removed the listing. Contact information may still be visible to follow up.' },
    ],
    note: 'CampusSphere Marketplace facilitates contact between buyers and sellers. Online payment is not processed through the platform — transactions are arranged directly between students.',
  },

  {
    id: 'sell-item',
    title: 'Sell an Item',
    description: 'Create a marketplace listing for an item you want to sell to other students.',
    category: 'Marketplace',
    keywords: ['sell', 'list item', 'marketplace', 'publish listing', 'selling', 'create listing', 'put up for sale'],
    module: 'Marketplace',
    route: '/marketplace/sell',
    routeLabel: 'List an Item for Sale',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Marketplace → Sell / List Item',
    steps: [
      'Click Marketplace in the sidebar.',
      'Click Sell / List Item.',
      'Enter the item title, description, category, price, and condition.',
      'Upload an image of the item if available.',
      'Submit the listing.',
    ],
    expectedResult: 'Your item listing appears in the Marketplace for other students to discover.',
    commonIssues: [
      { issue: 'Image upload fails', tip: 'Try a smaller image file or a JPEG/PNG format.' },
      { issue: 'Listing not visible', tip: 'Refresh the page and check My Listings.' },
    ],
    note: null,
  },

  // ── G. LOST & FOUND ───────────────────────────────────────────────────────

  {
    id: 'report-lost-found',
    title: 'Report a Lost or Found Item',
    description: 'Submit a report for an item you have lost or found on campus.',
    category: 'Campus Life',
    keywords: ['lost', 'found', 'report', 'missing', 'item', 'lost and found', 'misplaced', 'campus lost'],
    module: 'Lost & Found',
    route: '/lost-found/report',
    routeLabel: 'Report an Item',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Lost & Found → Report Item',
    steps: [
      'Click Lost & Found in the sidebar.',
      'Click Report Item.',
      'Select whether you are reporting a Lost item or a Found item.',
      'Provide a detailed description: item name, category, color, and any identifying features.',
      'Enter the location where the item was lost or found.',
      'Enter the date the incident occurred.',
      'Attach a photo of the item if available.',
      'Submit the report.',
    ],
    expectedResult: 'Your report is published in the Lost & Found board for others to see.',
    commonIssues: [
      { issue: 'Image upload fails', tip: 'Try a smaller image file or a JPEG/PNG format.' },
    ],
    note: null,
  },

  {
    id: 'find-lost-item',
    title: 'Search for a Reported Item',
    description: 'Browse Lost & Found listings to see if your item has been reported.',
    category: 'Campus Life',
    keywords: ['find item', 'search lost', 'browse lost found', 'look for item', 'claimed', 'recovered'],
    module: 'Lost & Found',
    route: '/lost-found',
    routeLabel: 'Go to Lost & Found',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Lost & Found → Search or Filter Items → Open Listing',
    steps: [
      'Click Lost & Found in the sidebar.',
      'Search by item name, category, or location.',
      'Filter by Lost or Found as appropriate.',
      'Open a listing that matches your item.',
      'Use the contact information provided to reach the person who reported it.',
    ],
    expectedResult: 'You can identify and contact the person who found or reported your item.',
    commonIssues: [
      { issue: 'Item not listed', tip: 'It may not have been reported yet. You can submit your own Lost report so others can find it.' },
    ],
    note: null,
  },

  // ── H. ROOMMATE FINDER ────────────────────────────────────────────────────

  {
    id: 'find-roommate',
    title: 'Find a Roommate',
    description: 'Browse roommate profiles and connect with students whose preferences match yours.',
    category: 'Campus Life',
    keywords: ['roommate', 'find roommate', 'accommodation', 'housing', 'room', 'flatmate', 'rent'],
    module: 'Roommate Finder',
    route: '/roommates',
    routeLabel: 'Go to Roommate Finder',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Roommate Finder → Browse Profiles → Open Profile',
    steps: [
      'Click Roommate Finder in the sidebar.',
      'Browse available roommate profiles.',
      'Review each profile for preferences, budget range, preferred location, and lifestyle details.',
      'Click on a profile to see more details.',
      'Use the provided contact information to reach out.',
    ],
    expectedResult: 'You can identify potential roommates and contact them directly.',
    commonIssues: [
      { issue: 'No profiles match my preferences', tip: 'Filters may help narrow down results. You can also create your own profile so others can find you.' },
    ],
    note: null,
  },

  {
    id: 'create-roommate-profile',
    title: 'Create or Update Roommate Profile',
    description: 'Publish your roommate preferences so other students can find and contact you.',
    category: 'Campus Life',
    keywords: ['create profile', 'roommate profile', 'update profile', 'post roommate', 'housing preference', 'budget'],
    module: 'Roommate Finder',
    route: '/roommates/profile',
    routeLabel: 'My Roommate Profile',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Dashboard → Roommate Finder → My Profile / Create Profile',
    steps: [
      'Click Roommate Finder in the sidebar.',
      'Click My Profile or Create Profile.',
      'Enter your budget range, preferred location, move-in date, and lifestyle preferences (e.g., study habits, sleep schedule, pet policy).',
      'Add any additional notes for potential roommates.',
      'Save or update your profile.',
    ],
    expectedResult: 'Your profile is visible to other students browsing the Roommate Finder.',
    commonIssues: [
      { issue: 'Profile is not visible', tip: 'Make sure you saved the profile. Refresh the main listing page to confirm.' },
    ],
    note: null,
  },

  // ── I. NOTIFICATIONS ─────────────────────────────────────────────────────

  {
    id: 'check-notifications',
    title: 'Check Notifications',
    description: 'View system notifications for events, applications, approvals, and other updates.',
    category: 'Account & Notifications',
    keywords: ['notification', 'bell', 'alert', 'update', 'check notification', 'unread', 'messages'],
    module: 'Notifications',
    route: '/notifications',
    routeLabel: 'Go to Notifications',
    requiredRoles: ALL_ROLES,
    navigationPath: 'Top Navigation → Notification Bell → Select Notification',
    steps: [
      'Click the bell icon in the top navigation bar.',
      'A dropdown shows your recent notifications.',
      'Click a notification to navigate to the related content (e.g., an event, an application update).',
      'To see all notifications, click View All Notifications or go to the Notifications page from the sidebar or the dropdown.',
    ],
    expectedResult: 'You can see and act on all system notifications relevant to your account.',
    commonIssues: [
      { issue: 'No notifications appear', tip: 'You may not have any new notifications. All notifications are generated by system events such as event approvals, application status changes, or registrations.' },
      { issue: 'Clicking a notification does not navigate anywhere', tip: 'Some notifications are informational only and do not have a destination link.' },
    ],
    note: null,
  },

];

