package com.campushub.config;

import com.campushub.entity.*;
import com.campushub.entity.Event.EventStatus;
import com.campushub.entity.EventFormField.FieldType;
import com.campushub.entity.EventRegistration.RegistrationStatus;
import com.campushub.entity.Internship.InternshipStatus;
import com.campushub.entity.Internship.WorkMode;
import com.campushub.entity.LostFoundItem.ItemType;
import com.campushub.entity.LostFoundItem.LostFoundStatus;
import com.campushub.entity.MarketplaceItem.ItemCondition;
import com.campushub.entity.MarketplaceItem.ItemStatus;
import com.campushub.entity.Notification.NotificationType;
import com.campushub.entity.Ride.RideStatus;
import com.campushub.entity.RideBooking.BookingStatus;
import com.campushub.entity.Team.TeamStatus;
import com.campushub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventFormFieldRepository eventFormFieldRepository;
    private final InternshipRepository internshipRepository;
    private final AcademicResourceRepository resourceRepository;
    private final RideRepository rideRepository;
    private final RideBookingRepository rideBookingRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final MarketplaceItemRepository marketplaceRepository;
    private final LostFoundItemRepository lostFoundRepository;
    private final RoommateProfileRepository roommateRepository;
    private final StudentPostRepository postRepository;
    private final PostCommentRepository commentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    @Override
    public void run(String... args) {
        log.info("Checking and seeding 10+ records across all CampusHub modules...");
        seedAllModules();
        refreshOrAddScenarioData();
        log.info("CampusHub data initialization complete with 10+ records per module.");
    }

    private void seedAllModules() {
        String defaultPassword = passwordEncoder.encode("password123");
        LocalDate today = LocalDate.now(clock);
        LocalDateTime now = LocalDateTime.now(clock);

        // -------------------------------------------------------------
        // MODULE 1: USERS (11 core users across all roles)
        // -------------------------------------------------------------
        User student = getOrCreateUser("student@campushub.edu", "Aarav Sharma", Role.ROLE_STUDENT,
                "Computer Science & Engineering", "Year 3", "+1 (555) 234-5678",
                "CS Undergraduate passionate about Full-Stack Web Development, Distributed Systems, and AI.",
                "React, Java, Spring Boot, MySQL, Python, Git",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", defaultPassword);

        User student2 = getOrCreateUser("priya.patel@campushub.edu", "Priya Patel", Role.ROLE_STUDENT,
                "Information Technology", "Year 2", "+1 (555) 876-5432",
                "IT sophomore eager to participate in hackathons and open-source campus initiatives.",
                "JavaScript, UI/UX Design, Figma, CSS, Node.js",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", defaultPassword);

        User student3 = getOrCreateUser("rohan.gupta@campushub.edu", "Rohan Gupta", Role.ROLE_STUDENT,
                "Mechanical Engineering", "Year 3", "+1 (555) 333-1122",
                "Robotics enthusiast, CAD design specialist, and 3D printing hobbyist.",
                "SolidWorks, AutoCAD, Python, C++, ROS",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", defaultPassword);

        User student4 = getOrCreateUser("ananya.deshmukh@campushub.edu", "Ananya Deshmukh", Role.ROLE_STUDENT,
                "Electronics & Communication", "Year 3", "+1 (555) 444-2233",
                "Embedded systems and IoT device developer exploring microcontrollers and edge intelligence.",
                "C, Embedded C, Verilog, Arduino, Raspberry Pi",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", defaultPassword);

        User student5 = getOrCreateUser("vikram.singh@campushub.edu", "Vikram Singh", Role.ROLE_STUDENT,
                "Civil Engineering", "Year 4", "+1 (555) 555-3344",
                "Final-year civil engineering student focusing on smart structural modeling and GIS.",
                "Revit, STAAD Pro, ArcGIS, MATLAB",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", defaultPassword);

        User student6 = getOrCreateUser("sneha.reddy@campushub.edu", "Sneha Reddy", Role.ROLE_STUDENT,
                "Data Science & AI", "Year 2", "+1 (555) 666-4455",
                "Data Science major interested in computer vision, deep learning, and predictive models.",
                "Python, TensorFlow, PyTorch, Pandas, SQL, Tableau",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", defaultPassword);

        User student7 = getOrCreateUser("rahul.verma@campushub.edu", "Rahul Verma", Role.ROLE_STUDENT,
                "Computer Science & Engineering", "Year 2", "+1 (555) 777-5566",
                "Competitive programmer, data structures enthusiast, and open-source contributor.",
                "C++, Java, Algorithms, Git, Linux",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", defaultPassword);

        User student8 = getOrCreateUser("tanya.sengupta@campushub.edu", "Tanya Sengupta", Role.ROLE_STUDENT,
                "Architecture & Design", "Year 3", "+1 (555) 888-6677",
                "Sustainable architecture student and 3D environment concept artist.",
                "SketchUp, Rhino, Blender, Photoshop",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150", defaultPassword);

        User student9 = getOrCreateUser("karan.mehra@campushub.edu", "Karan Mehra", Role.ROLE_STUDENT,
                "Biotechnology", "Year 4", "+1 (555) 999-7788",
                "Bioinformatics and computational genomics research assistant.",
                "Python, R, Biopython, Molecular Modeling",
                "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150", defaultPassword);

        User student10 = getOrCreateUser("meera.nair@campushub.edu", "Meera Nair", Role.ROLE_STUDENT,
                "Management & Business Studies", "Year 1", "+1 (555) 111-8899",
                "MBA candidate passionate about product management and tech startups.",
                "Agile, Scrum, Product Roadmapping, Market Research",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", defaultPassword);

        User faculty = getOrCreateUser("faculty@campushub.edu", "Dr. Evelyn Reed", Role.ROLE_FACULTY,
                "Computer Science & Engineering", "Faculty", "+1 (555) 345-6789",
                "Associate Professor in Computer Science. Research focus: Cloud Computing and Distributed Systems.",
                "Distributed Systems, Cloud Architecture, Algorithms, Java Enterprise",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", defaultPassword);

        User faculty2 = getOrCreateUser("faculty2@campushub.edu", "Prof. Marcus Vance", Role.ROLE_FACULTY,
                "Electrical Engineering", "Faculty", "+1 (555) 456-7890",
                "Professor in Electrical & Electronics Engineering.",
                "Embedded Systems, IoT, Microcontrollers",
                "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150", defaultPassword);

        User faculty3 = getOrCreateUser("faculty.kapoor@campushub.edu", "Dr. Alok Kapoor", Role.ROLE_FACULTY,
                "Mechanical Engineering", "Faculty", "+1 (555) 567-8901",
                "Head of Department, Mechanical Engineering. Thermal sciences and propulsion systems.",
                "Thermodynamics, Fluid Dynamics, CFD",
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150", defaultPassword);

        User admin = getOrCreateUser("admin@campushub.edu", "Campus Admin", Role.ROLE_ADMIN,
                "University Central Administration", "Staff", "+1 (555) 100-0001",
                "CampusHub Central Platform Administration and Content Moderation Desk.",
                "System Administration, Moderation, Academic Policies",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", defaultPassword);

        // -------------------------------------------------------------
        // MODULE 2: EVENTS (10 events)
        // -------------------------------------------------------------
        if (eventRepository.count() < 10) {
            Event e1 = eventRepository.save(Event.builder()
                    .organizer(faculty)
                    .title("Campus CodeSprint 2026: 24h Hackathon")
                    .description("Annual university-wide 24-hour hackathon focused on sustainable smart campus applications, AI automation, and cloud tooling.")
                    .category("Hackathon")
                    .eventDate(today.plusDays(10))
                    .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(18, 0))
                    .venue("Main University Auditorium & CS Labs")
                    .eligibility("All Undergraduate & Postgraduate Students")
                    .maxParticipants(120)
                    .registrationDeadline(now.plusDays(8))
                    .imageUrl("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600")
                    .status(EventStatus.APPROVED).build());

            Event e2 = eventRepository.save(Event.builder()
                    .organizer(faculty)
                    .title("Workshop: Advanced Spring Boot & Microservices")
                    .description("Hands-on 4-hour workshop covering REST architecture, JPA best practices, Spring Security with JWT, and Docker containerization.")
                    .category("Workshop")
                    .eventDate(today.plusDays(4))
                    .startTime(LocalTime.of(14, 0)).endTime(LocalTime.of(18, 0))
                    .venue("Seminar Hall 3B, CSE Block")
                    .eligibility("Year 2, 3, and 4 CSE/IT Students")
                    .maxParticipants(60)
                    .registrationDeadline(now.minusHours(12)) // Closed!
                    .imageUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600")
                    .status(EventStatus.APPROVED).build());

            Event e3 = eventRepository.save(Event.builder()
                    .organizer(faculty2)
                    .title("Cybersecurity CTF & Ethical Hacking Lab")
                    .description("Competitive Capture The Flag challenges covering web vulnerabilities, reverse engineering, and cryptography.")
                    .category("Competition")
                    .eventDate(today.plusDays(6))
                    .startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(16, 0))
                    .venue("Cyber Lab 1, Tech Building")
                    .eligibility("All enrolled students")
                    .maxParticipants(2)
                    .registrationDeadline(now.plusDays(4))
                    .imageUrl("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600")
                    .status(EventStatus.APPROVED).build());

            eventRegistrationRepository.save(EventRegistration.builder()
                    .event(e3).user(student).status(RegistrationStatus.REGISTERED).registeredAt(now.minusDays(1)).build());
            eventRegistrationRepository.save(EventRegistration.builder()
                    .event(e3).user(student2).status(RegistrationStatus.REGISTERED).registeredAt(now.minusDays(1)).build());

            eventRepository.save(Event.builder()
                    .organizer(student)
                    .title("RoboWars & Autonomous Drone Racing Expo")
                    .description("Exhibition and speed competition for campus robotics enthusiasts and autonomous drone builders.")
                    .category("Competition")
                    .eventDate(today.plusDays(25))
                    .startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(17, 0))
                    .venue("Open Ground Complex")
                    .eligibility("Open to all departments")
                    .maxParticipants(200)
                    .registrationDeadline(now.plusDays(20))
                    .imageUrl("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600")
                    .status(EventStatus.PENDING).build());

            eventRepository.save(Event.builder()
                    .organizer(faculty)
                    .title("AI & Machine Learning Innovation Summit")
                    .description("Keynote sessions and paper presentations on LLMs, Generative AI in education, and autonomous robotics.")
                    .category("Seminar")
                    .eventDate(today.plusDays(15))
                    .startTime(LocalTime.of(9, 30)).endTime(LocalTime.of(16, 30))
                    .venue("Auditorium Hall 2")
                    .eligibility("All students and faculty members")
                    .maxParticipants(150)
                    .registrationDeadline(now.plusDays(12))
                    .imageUrl("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600")
                    .status(EventStatus.APPROVED).build());

            eventRepository.save(Event.builder()
                    .organizer(student2)
                    .title("Annual University Cultural Fest: Rhythm 2026")
                    .description("The largest annual inter-college celebration featuring live band music, choreography contests, theatre, and food stalls.")
                    .category("Cultural")
                    .eventDate(today.plusDays(30))
                    .startTime(LocalTime.of(16, 0)).endTime(LocalTime.of(22, 0))
                    .venue("Campus Amphitheatre & Central Lawns")
                    .eligibility("All University Students & Guests")
                    .maxParticipants(500)
                    .registrationDeadline(now.plusDays(26))
                    .imageUrl("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600")
                    .status(EventStatus.APPROVED).build());

            eventRepository.save(Event.builder()
                    .organizer(faculty3)
                    .title("Industry Career Fair & Placement Connect")
                    .description("Meet talent acquisition leaders from 40+ leading tech, finance, and engineering companies for on-campus interviews.")
                    .category("Career")
                    .eventDate(today.plusDays(18))
                    .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(17, 0))
                    .venue("Indoor Sports Complex Exhibition Area")
                    .eligibility("Pre-final and Final Year Students")
                    .maxParticipants(300)
                    .registrationDeadline(now.plusDays(14))
                    .imageUrl("https://images.unsplash.com/photo-1511578314322-379afb476865?w=600")
                    .status(EventStatus.APPROVED).build());

            eventRepository.save(Event.builder()
                    .organizer(student7)
                    .title("Campus Esports Championship: Valorant & FIFA")
                    .description("Competitive collegiate gaming tournament with bracket elimination, live shoutcasting, and hardware prizes.")
                    .category("Sports")
                    .eventDate(today.plusDays(8))
                    .startTime(LocalTime.of(13, 0)).endTime(LocalTime.of(20, 0))
                    .venue("Student Recreation Center - eSports Arena")
                    .eligibility("All enrolled university gamers")
                    .maxParticipants(64)
                    .registrationDeadline(now.plusDays(5))
                    .imageUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600")
                    .status(EventStatus.APPROVED).build());

            eventRepository.save(Event.builder()
                    .organizer(student8)
                    .title("Photography & Visual Arts Gallery Exhibition")
                    .description("Showcase of outstanding student architectural renders, landscape photography, and oil paintings.")
                    .category("Exhibition")
                    .eventDate(today.plusDays(12))
                    .startTime(LocalTime.of(11, 0)).endTime(LocalTime.of(18, 0))
                    .venue("Fine Arts Gallery & Architecture Atrium")
                    .eligibility("Open to all campus visitors")
                    .maxParticipants(80)
                    .registrationDeadline(now.plusDays(10))
                    .imageUrl("https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600")
                    .status(EventStatus.APPROVED).build());

            eventRepository.save(Event.builder()
                    .organizer(student9)
                    .title("Red Cross Campus Blood Donation Drive")
                    .description("Annual humanitarian blood donation drive organized in partnership with City Central Blood Bank and Red Cross.")
                    .category("Community")
                    .eventDate(today.plusDays(5))
                    .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(15, 0))
                    .venue("Health Center Activity Wing")
                    .eligibility("Healthy students and faculty aged 18+")
                    .maxParticipants(100)
                    .registrationDeadline(now.plusDays(3))
                    .imageUrl("https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600")
                    .status(EventStatus.APPROVED).build());

            eventRepository.save(Event.builder()
                    .organizer(faculty)
                    .title("Full-Stack Cloud & WebDev Masterclass")
                    .description("Interactive Saturday workshop on modern full-stack development with Next.js, Spring Boot, and cloud deployment.")
                    .category("Workshop")
                    .eventDate(today.plusDays(16))
                    .startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(16, 0))
                    .venue("CS Seminar Hall A")
                    .eligibility("Open to all CS & IT students")
                    .maxParticipants(80)
                    .registrationDeadline(now.plusDays(13))
                    .imageUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600")
                    .status(EventStatus.APPROVED).build());
        }

        // -------------------------------------------------------------
        // MODULE 3: INTERNSHIPS (10 internships)
        // -------------------------------------------------------------
        if (internshipRepository.count() < 10) {
            internshipRepository.save(Internship.builder()
                    .postedBy(faculty)
                    .title("Software Engineering Intern - Cloud Platforms")
                    .companyName("Nexus Cloud Technologies")
                    .description("Looking for motivated student interns to assist in backend REST API engineering, distributed caching, and automated integration testing.")
                    .location("Seattle, WA (or Remote)")
                    .workMode(WorkMode.REMOTE)
                    .stipend("$1,500 / month")
                    .duration("3 Months (Summer 2026)")
                    .eligibility("Pre-final & Final Year Students with Java/C++ background")
                    .skillsRequired("Java, Spring Boot, MySQL, REST APIs, Git")
                    .applicationDeadline(today) // Deadline is today! Open through 23:59:59
                    .applicationLink("https://careers.nexuscloud.io/internships/se-2026")
                    .status(InternshipStatus.ACTIVE).build());

            internshipRepository.save(Internship.builder()
                    .postedBy(student)
                    .title("Frontend Developer & UI/UX Intern")
                    .companyName("InnovateEdu Labs")
                    .description("Collaborate with our product team to build responsive educational dashboards using React.js and Material UI components.")
                    .location("Campus Innovation Park")
                    .workMode(WorkMode.HYBRID)
                    .stipend("$1,000 / month")
                    .duration("6 Months")
                    .eligibility("CGPA > 7.0, Portfolio of React web apps")
                    .skillsRequired("React, JavaScript, Material UI, CSS3, Responsive Design")
                    .applicationDeadline(today.plusDays(20))
                    .applicationLink("https://innovateedu.io/apply")
                    .status(InternshipStatus.ACTIVE).build());

            internshipRepository.save(Internship.builder()
                    .postedBy(faculty2)
                    .title("Embedded Systems Research Assistant")
                    .companyName("IoT Innovation Lab")
                    .description("Assist in firmware development for sensor networks and microcontrollers.")
                    .location("Electrical Engineering Block")
                    .workMode(WorkMode.ON_SITE)
                    .stipend("$800 / month")
                    .duration("4 Months")
                    .eligibility("EE and ECE students")
                    .skillsRequired("C, C++, RTOS, Arduino")
                    .applicationDeadline(today.minusDays(2)) // Closed!
                    .applicationLink("")
                    .status(InternshipStatus.ACTIVE).build());

            internshipRepository.save(Internship.builder()
                    .postedBy(faculty)
                    .title("Machine Learning & NLP Research Intern")
                    .companyName("CognitiveAI Research Labs")
                    .description("Train fine-tuned Transformer models, build RAG pipelines, and curate evaluation datasets for scientific literature summarization.")
                    .location("San Francisco, CA (Remote Option)")
                    .workMode(WorkMode.REMOTE)
                    .stipend("$1,800 / month")
                    .duration("3 Months")
                    .eligibility("Strong Python skills and background in ML/PyTorch")
                    .skillsRequired("Python, PyTorch, Hugging Face, NLP, Vector DBs")
                    .applicationDeadline(today.plusDays(15))
                    .applicationLink("https://cognitiveai.example.com/apply")
                    .status(InternshipStatus.ACTIVE).build());

            internshipRepository.save(Internship.builder()
                    .postedBy(faculty3)
                    .title("Data Analyst & Business Intelligence Intern")
                    .companyName("FinTech Global Solutions")
                    .description("Analyze student financial patterns, automate metric dashboards, and generate KPI reporting pipelines.")
                    .location("New York, NY")
                    .workMode(WorkMode.HYBRID)
                    .stipend("$1,200 / month")
                    .duration("4 Months")
                    .eligibility("Proficiency in SQL and Data Visualization")
                    .skillsRequired("SQL, PowerBI, Tableau, Python, Excel")
                    .applicationDeadline(today.plusDays(25))
                    .applicationLink("https://fintechglobal.example.com/careers")
                    .status(InternshipStatus.ACTIVE).build());

            internshipRepository.save(Internship.builder()
                    .postedBy(faculty)
                    .title("Cybersecurity Defense & Pen Testing Intern")
                    .companyName("SecureNet Defense")
                    .description("Participate in network traffic monitoring, vulnerability scanning, and security audit remediation on enterprise systems.")
                    .location("Austin, TX")
                    .workMode(WorkMode.REMOTE)
                    .stipend("$1,400 / month")
                    .duration("3 Months")
                    .eligibility("Knowledge of TCP/IP, Linux, and web vulnerabilities (OWASP)")
                    .skillsRequired("Linux, Wireshark, Burp Suite, Python, Bash")
                    .applicationDeadline(today.plusDays(18))
                    .applicationLink("https://securenet.example.com/interns")
                    .status(InternshipStatus.ACTIVE).build());

            internshipRepository.save(Internship.builder()
                    .postedBy(faculty2)
                    .title("Cloud Infrastructure & DevOps Intern")
                    .companyName("Skyline Cloud Services")
                    .description("Build CI/CD pipelines, configure Kubernetes clusters, and automate cloud provisioning with Terraform.")
                    .location("Seattle, WA")
                    .workMode(WorkMode.HYBRID)
                    .stipend("$1,300 / month")
                    .duration("6 Months")
                    .eligibility("Familiarity with Docker, Linux, and AWS/GCP basics")
                    .skillsRequired("Docker, Kubernetes, GitHub Actions, AWS, Terraform")
                    .applicationDeadline(today.plusDays(22))
                    .applicationLink("https://skylinecloud.example.com/devops-intern")
                    .status(InternshipStatus.ACTIVE).build());

            internshipRepository.save(Internship.builder()
                    .postedBy(student)
                    .title("Mobile Application Developer (Flutter/React Native)")
                    .companyName("Pulse HealthTech")
                    .description("Build mobile features for health vitals tracking and telemedicine scheduling on iOS and Android.")
                    .location("Boston, MA")
                    .workMode(WorkMode.REMOTE)
                    .stipend("$1,100 / month")
                    .duration("4 Months")
                    .eligibility("Prior app development experience in Flutter or React Native")
                    .skillsRequired("Flutter, Dart, React Native, REST APIs, Firebase")
                    .applicationDeadline(today.plusDays(30))
                    .applicationLink("https://pulsehealth.example.com/jobs")
                    .status(InternshipStatus.ACTIVE).build());

            internshipRepository.save(Internship.builder()
                    .postedBy(faculty3)
                    .title("Robotics & Firmware Engineering Intern")
                    .companyName("Apex Robotics Corporation")
                    .description("Develop motor control algorithms and CAN bus telemetry for autonomous ground exploration vehicles.")
                    .location("Detroit, MI")
                    .workMode(WorkMode.ON_SITE)
                    .stipend("$1,250 / month")
                    .duration("5 Months")
                    .eligibility("Mechanical or Mechatronics students with C++ experience")
                    .skillsRequired("C++, ROS2, Control Systems, MATLAB, Git")
                    .applicationDeadline(today.plusDays(14))
                    .applicationLink("https://apexrobotics.example.com/careers")
                    .status(InternshipStatus.ACTIVE).build());

            internshipRepository.save(Internship.builder()
                    .postedBy(student2)
                    .title("Product Design & UI/UX Strategy Intern")
                    .companyName("CraftUX Studios")
                    .description("Conduct user research, design wireframes and high-fidelity prototypes, and build scalable design systems.")
                    .location("San Jose, CA")
                    .workMode(WorkMode.REMOTE)
                    .stipend("$950 / month")
                    .duration("3 Months")
                    .eligibility("Design portfolio demonstrating Figma wireframes and prototypes")
                    .skillsRequired("Figma, User Research, Wireframing, Prototyping, Design Systems")
                    .applicationDeadline(today.plusDays(28))
                    .applicationLink("https://craftux.example.com/apply")
                    .status(InternshipStatus.ACTIVE).build());

            internshipRepository.save(Internship.builder()
                    .postedBy(faculty)
                    .title("Site Reliability & Cloud DevOps Intern")
                    .companyName("Vanguard Cloud Systems")
                    .description("Assist in container orchestration, Prometheus monitoring, and automated incident triage on cloud clusters.")
                    .location("San Francisco, CA (or Remote)")
                    .workMode(WorkMode.REMOTE)
                    .stipend("$1,600 / month")
                    .duration("4 Months")
                    .eligibility("Students passionate about Linux, Kubernetes, and Golang/Python")
                    .skillsRequired("Linux, Kubernetes, Docker, Prometheus, Python, Go")
                    .applicationDeadline(today.plusDays(24))
                    .applicationLink("https://vanguardcloud.example.com/careers")
                    .status(InternshipStatus.ACTIVE).build());
        }

        // -------------------------------------------------------------
        // MODULE 4: ACADEMIC RESOURCES (10 resources)
        // -------------------------------------------------------------
        if (resourceRepository.count() < 10) {
            resourceRepository.save(AcademicResource.builder()
                    .uploadedBy(faculty)
                    .title("Distributed Systems & Consensus Protocols - Lecture Modules")
                    .description("Complete semester notes covering Paxos, Raft consensus algorithm, Vector Clocks, Byzantine Fault Tolerance, and CAP Theorem.")
                    .subject("Distributed Systems (CS601)")
                    .department("Computer Science & Engineering")
                    .semester(6)
                    .resourceType("Lecture Notes")
                    .tags("Distributed Systems, Raft, Consensus, CAP Theorem")
                    .fileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                    .fileName("CS601_Distributed_Systems_Complete_Notes.pdf")
                    .fileSize(4500000L).downloadCount(42).build());

            resourceRepository.save(AcademicResource.builder()
                    .uploadedBy(faculty)
                    .title("Data Structures and Algorithms - Complete Handout & Code Samples")
                    .description("Comprehensive guide to BSTs, AVL Trees, Red-Black Trees, Graphs, Dijkstra, Dynamic Programming, and Amortized Analysis.")
                    .subject("Data Structures & Algorithms (CS201)")
                    .department("Computer Science & Engineering")
                    .semester(3)
                    .resourceType("Lecture Notes")
                    .tags("DSA, Trees, Graphs, Dynamic Programming, Java")
                    .fileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                    .fileName("CS201_DSA_Complete_Compendium.pdf")
                    .fileSize(6200000L).downloadCount(89).build());

            resourceRepository.save(AcademicResource.builder()
                    .uploadedBy(faculty2)
                    .title("Digital Signal Processing - End-Term Previous Question Papers (2023-2025)")
                    .description("Compiled university exam question papers with step-by-step solutions for FFT, Z-Transforms, and FIR/IIR filter design.")
                    .subject("Digital Signal Processing (EC401)")
                    .department("Electronics & Communication")
                    .semester(4)
                    .resourceType("Question Paper")
                    .tags("DSP, FFT, Filters, Previous Papers, Solutions")
                    .fileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                    .fileName("EC401_DSP_Previous_Exam_Papers_Solved.pdf")
                    .fileSize(3800000L).downloadCount(65).build());

            resourceRepository.save(AcademicResource.builder()
                    .uploadedBy(faculty)
                    .title("Database Management Systems Lab Manual & SQL Schema Guides")
                    .description("Laboratory experiments covering ER modeling, Relational Algebra, complex SQL joins, indexing, and PL/SQL procedures.")
                    .subject("Database Systems (CS302)")
                    .department("Computer Science & Engineering")
                    .semester(4)
                    .resourceType("Lab Manual")
                    .tags("DBMS, SQL, Relational Algebra, Indexes, Stored Procedures")
                    .fileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                    .fileName("CS302_DBMS_Lab_Manual_2026.pdf")
                    .fileSize(2900000L).downloadCount(114).build());

            resourceRepository.save(AcademicResource.builder()
                    .uploadedBy(faculty)
                    .title("Machine Learning & Pattern Recognition Course Compendium")
                    .description("Mathematical formulations for Linear Regression, SVMs, Neural Networks, PCA, Decision Forests, and Gradient Boosting.")
                    .subject("Machine Learning (DS501)")
                    .department("Data Science & AI")
                    .semester(5)
                    .resourceType("Reference Material")
                    .tags("Machine Learning, Mathematics, SVM, Neural Networks, PCA")
                    .fileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                    .fileName("DS501_Machine_Learning_Theory_Reference.pdf")
                    .fileSize(5400000L).downloadCount(78).build());

            resourceRepository.save(AcademicResource.builder()
                    .uploadedBy(faculty3)
                    .title("Thermodynamics & Heat Transfer Fundamentals Notes")
                    .description("First and Second Laws of Thermodynamics, Carnot cycle, entropy balances, heat exchangers, and conduction/convection.")
                    .subject("Thermodynamics (ME301)")
                    .department("Mechanical Engineering")
                    .semester(3)
                    .resourceType("Lecture Notes")
                    .tags("Thermodynamics, Carnot, Entropy, Heat Transfer")
                    .fileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                    .fileName("ME301_Thermodynamics_Full_Notes.pdf")
                    .fileSize(4100000L).downloadCount(33).build());

            resourceRepository.save(AcademicResource.builder()
                    .uploadedBy(faculty)
                    .title("Computer Networks Lab Guide: Packet Tracer & Wireshark Labs")
                    .description("Hands-on lab experiments for IP subnetting, VLAN configuration, OSPF routing, DNS, DHCP, and HTTP packet inspection.")
                    .subject("Computer Networks (IT402)")
                    .department("Information Technology")
                    .semester(4)
                    .resourceType("Lab Manual")
                    .tags("Networking, Wireshark, Packet Tracer, Subnetting, Routing")
                    .fileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                    .fileName("IT402_Computer_Networks_Lab_Manual.pdf")
                    .fileSize(3300000L).downloadCount(57).build());

            resourceRepository.save(AcademicResource.builder()
                    .uploadedBy(faculty3)
                    .title("Structural Analysis & RCC Design Previous Exam Question Papers")
                    .description("5-year question bank with numerical solutions for bending moment diagrams, shear forces, and reinforced concrete beam design.")
                    .subject("Structural Analysis (CE501)")
                    .department("Civil Engineering")
                    .semester(5)
                    .resourceType("Question Paper")
                    .tags("Civil, RCC, Structural Analysis, Question Bank")
                    .fileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                    .fileName("CE501_Structural_Analysis_Exam_Bank.pdf")
                    .fileSize(4800000L).downloadCount(41).build());

            resourceRepository.save(AcademicResource.builder()
                    .uploadedBy(faculty)
                    .title("Object-Oriented Software Engineering - UML Diagrams & Design Patterns")
                    .description("Design patterns catalogue (Creational, Structural, Behavioral) with real-world case studies and PlantUML diagrams.")
                    .subject("Software Engineering (CS403)")
                    .department("Computer Science & Engineering")
                    .semester(4)
                    .resourceType("Lecture Notes")
                    .tags("UML, Design Patterns, SOLID Principles, Architecture")
                    .fileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                    .fileName("CS403_OOSE_Design_Patterns_Guide.pdf")
                    .fileSize(3600000L).downloadCount(92).build());

            resourceRepository.save(AcademicResource.builder()
                    .uploadedBy(faculty)
                    .title("Operating Systems Architecture - Virtual Memory & Scheduling Manual")
                    .description("Deep dive into Linux kernel scheduling (CFS), paging, TLB translation, synchronization primitives (mutexes, semaphores).")
                    .subject("Operating Systems (CS301)")
                    .department("Computer Science & Engineering")
                    .semester(3)
                    .resourceType("Lecture Notes")
                    .tags("Operating Systems, Virtual Memory, Kernel, Scheduling, Threads")
                    .fileUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                    .fileName("CS301_Operating_Systems_Core_Architecture.pdf")
                    .fileSize(5100000L).downloadCount(120).build());
        }

        // -------------------------------------------------------------
        // MODULE 5: RIDES (10 rides)
        // -------------------------------------------------------------
        if (rideRepository.count() < 10) {
            Ride r1 = rideRepository.save(Ride.builder()
                    .creator(student)
                    .startLocation("Campus North Gate Gatehouse")
                    .destination("Central Train & Bus Terminal")
                    .rideDate(today.plusDays(2))
                    .rideTime(LocalTime.of(17, 30))
                    .totalSeats(3).availableSeats(2)
                    .vehicleInfo("Silver Honda Civic (Plate: ABC-4589)")
                    .notes("Splitting highway toll. Leaving right after CS lab finishes at 5:15 PM.")
                    .status(RideStatus.ACTIVE).build());

            rideBookingRepository.save(RideBooking.builder()
                    .ride(r1).passenger(student2).seatsBooked(1).status(BookingStatus.CONFIRMED).build());

            rideRepository.save(Ride.builder()
                    .creator(student3)
                    .startLocation("University Main Gate")
                    .destination("International Airport Terminal 2")
                    .rideDate(today.plusDays(3))
                    .rideTime(LocalTime.of(8, 0))
                    .totalSeats(4).availableSeats(3)
                    .vehicleInfo("White Toyota Camry (Plate: DEF-1029)")
                    .notes("Direct ride to airport for weekend flights. Plenty of trunk space for luggage.")
                    .status(RideStatus.ACTIVE).build());

            rideRepository.save(Ride.builder()
                    .creator(student4)
                    .startLocation("Engineering Block Bus Bay")
                    .destination("Downtown Tech Park")
                    .rideDate(today.plusDays(1))
                    .rideTime(LocalTime.of(9, 15))
                    .totalSeats(3).availableSeats(1)
                    .vehicleInfo("Blue Hyundai Elantra (Plate: GHI-3341)")
                    .notes("Daily commute to tech park for morning research meetings. 2 seats already booked.")
                    .status(RideStatus.ACTIVE).build());

            rideRepository.save(Ride.builder()
                    .creator(student5)
                    .startLocation("South Campus Hostel Complex")
                    .destination("Metro Central Station")
                    .rideDate(today.plusDays(4))
                    .rideTime(LocalTime.of(16, 45))
                    .totalSeats(4).availableSeats(4)
                    .vehicleInfo("Grey Volkswagen Jetta (Plate: JKL-7720)")
                    .notes("Comfortable AC ride. Playing upbeat road trip playlist.")
                    .status(RideStatus.ACTIVE).build());

            Ride r5 = rideRepository.save(Ride.builder()
                    .creator(student7)
                    .startLocation("City Center Mall")
                    .destination("Campus Student Housing")
                    .rideDate(today.plusDays(1))
                    .rideTime(LocalTime.of(21, 0))
                    .totalSeats(3).availableSeats(0)
                    .vehicleInfo("Black Honda Accord (Plate: MNO-9012)")
                    .notes("Night return trip from shopping center. Fully booked.")
                    .status(RideStatus.FULL).build());

            rideBookingRepository.save(RideBooking.builder()
                    .ride(r5).passenger(student6).seatsBooked(2).status(BookingStatus.CONFIRMED).build());
            rideBookingRepository.save(RideBooking.builder()
                    .ride(r5).passenger(student8).seatsBooked(1).status(BookingStatus.CONFIRMED).build());

            rideRepository.save(Ride.builder()
                    .creator(student8)
                    .startLocation("Campus West Gate")
                    .destination("Railway Station Junction")
                    .rideDate(today.plusDays(5))
                    .rideTime(LocalTime.of(6, 30))
                    .totalSeats(4).availableSeats(2)
                    .vehicleInfo("Red Kia Forte (Plate: PQR-5561)")
                    .notes("Early morning ride to catch intercity express train. Punctual departure guaranteed.")
                    .status(RideStatus.ACTIVE).build());

            rideRepository.save(Ride.builder()
                    .creator(student9)
                    .startLocation("North Campus Library")
                    .destination("Silicon Suburb Business Hub")
                    .rideDate(today.plusDays(2))
                    .rideTime(LocalTime.of(13, 0))
                    .totalSeats(3).availableSeats(3)
                    .vehicleInfo("White Nissan Altima (Plate: STU-8834)")
                    .notes("Mid-day trip for internship interviews.")
                    .status(RideStatus.ACTIVE).build());

            rideRepository.save(Ride.builder()
                    .creator(student10)
                    .startLocation("University Sports Complex")
                    .destination("Old Town Farmers Market")
                    .rideDate(today.plusDays(3))
                    .rideTime(LocalTime.of(10, 0))
                    .totalSeats(4).availableSeats(2)
                    .vehicleInfo("Silver Mazda 3 (Plate: VWX-2219)")
                    .notes("Weekend grocery and organic market trip. Welcome to join!")
                    .status(RideStatus.ACTIVE).build());

            rideRepository.save(Ride.builder()
                    .creator(student)
                    .startLocation("Campus Innovation Park")
                    .destination("Expressway Toll Plaza")
                    .rideDate(today.plusDays(4))
                    .rideTime(LocalTime.of(18, 0))
                    .totalSeats(3).availableSeats(1)
                    .vehicleInfo("Dark Grey Ford Focus (Plate: YZA-4401)")
                    .notes("Splitting expressway toll fare evenly.")
                    .status(RideStatus.ACTIVE).build());

            rideRepository.save(Ride.builder()
                    .creator(student3)
                    .startLocation("Student Union Building")
                    .destination("Lakeview Residential District")
                    .rideDate(today.plusDays(2))
                    .rideTime(LocalTime.of(19, 30))
                    .totalSeats(4).availableSeats(4)
                    .vehicleInfo("Blue Chevrolet Cruze (Plate: BCD-6650)")
                    .notes("Evening ride dropping passengers along Lakeview boulevard.")
                    .status(RideStatus.ACTIVE).build());

            rideRepository.save(Ride.builder()
                    .creator(student4)
                    .startLocation("Campus East Gate")
                    .destination("North Suburb IT Corridor")
                    .rideDate(today.plusDays(3))
                    .rideTime(LocalTime.of(8, 45))
                    .totalSeats(4).availableSeats(3)
                    .vehicleInfo("Silver Honda City (Plate: EFG-8890)")
                    .notes("Comfortable daily morning carpool to tech offices and IT corridor.")
                    .status(RideStatus.ACTIVE).build());
        }

        // -------------------------------------------------------------
        // MODULE 6: MARKETPLACE (10 items)
        // -------------------------------------------------------------
        if (marketplaceRepository.count() < 10) {
            marketplaceRepository.save(MarketplaceItem.builder()
                    .seller(student)
                    .title("Introduction to Algorithms (CLRS 4th Edition) - Hardcover")
                    .description("Excellent condition, zero pen marks or highlights. Essential textbook for Algorithms and Competitive Programming courses.")
                    .category("Books")
                    .price(new BigDecimal("45.00"))
                    .itemCondition(ItemCondition.LIKE_NEW)
                    .imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400")
                    .contactPhone("+1 (555) 234-5678")
                    .status(ItemStatus.AVAILABLE).build());

            marketplaceRepository.save(MarketplaceItem.builder()
                    .seller(student2)
                    .title("Texas Instruments TI-84 Plus CE Graphing Calculator")
                    .description("Color screen, rechargeable battery, cable included. Perfect for calculus, statistics, and linear algebra.")
                    .category("Calculator")
                    .price(new BigDecimal("75.00"))
                    .itemCondition(ItemCondition.LIKE_NEW)
                    .imageUrl("https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400")
                    .contactPhone("+1 (555) 876-5432")
                    .status(ItemStatus.AVAILABLE).build());

            marketplaceRepository.save(MarketplaceItem.builder()
                    .seller(student3)
                    .title("Dell UltraSharp 24-inch Full HD IPS Monitor (1080p, 75Hz)")
                    .description("Pivot, tilt, and height adjustable stand. HDMI and DisplayPort inputs. Great dual-monitor setup for coding.")
                    .category("Electronics")
                    .price(new BigDecimal("110.00"))
                    .itemCondition(ItemCondition.GOOD)
                    .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400")
                    .contactPhone("+1 (555) 333-1122")
                    .status(ItemStatus.AVAILABLE).build());

            marketplaceRepository.save(MarketplaceItem.builder()
                    .seller(student4)
                    .title("Full Engineering Lab Coat (Size L) & Protective Safety Goggles")
                    .description("Clean 100% white cotton lab coat with safety goggles. Compliant with university chemistry and mechanical labs.")
                    .category("College Accessories")
                    .price(new BigDecimal("18.00"))
                    .itemCondition(ItemCondition.LIKE_NEW)
                    .imageUrl("https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400")
                    .contactPhone("+1 (555) 444-2233")
                    .status(ItemStatus.AVAILABLE).build());

            marketplaceRepository.save(MarketplaceItem.builder()
                    .seller(student5)
                    .title("Rotring Rapidograph Technical Drawing Pen & Compass Drafting Kit")
                    .description("Complete architectural drawing set with 0.25mm, 0.35mm, and 0.50mm pens plus precision extension compass.")
                    .category("Stationery")
                    .price(new BigDecimal("32.00"))
                    .itemCondition(ItemCondition.GOOD)
                    .imageUrl("https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400")
                    .contactPhone("+1 (555) 555-3344")
                    .status(ItemStatus.AVAILABLE).build());

            marketplaceRepository.save(MarketplaceItem.builder()
                    .seller(student6)
                    .title("Arduino Mega 2560 Ultimate Starter Kit with 45+ Sensors")
                    .description("Original Arduino Mega microcontroller board, breadboard, LCD display, ultrasonic sensors, motors, and jumper cables.")
                    .category("Study Material")
                    .price(new BigDecimal("40.00"))
                    .itemCondition(ItemCondition.LIKE_NEW)
                    .imageUrl("https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400")
                    .contactPhone("+1 (555) 666-4455")
                    .status(ItemStatus.AVAILABLE).build());

            marketplaceRepository.save(MarketplaceItem.builder()
                    .seller(student7)
                    .title("Sony WH-1000XM4 Noise-Cancelling Bluetooth Headphones")
                    .description("Industry-leading active noise cancellation. 30-hour battery life. Includes original hard carry case and aux cord.")
                    .category("Electronics")
                    .price(new BigDecimal("160.00"))
                    .itemCondition(ItemCondition.GOOD)
                    .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400")
                    .contactPhone("+1 (555) 777-5566")
                    .status(ItemStatus.AVAILABLE).build());

            marketplaceRepository.save(MarketplaceItem.builder()
                    .seller(student8)
                    .title("Ergonomic Mesh Desk Chair with Lumbar Support")
                    .description("Breathable black mesh back, adjustable armrests, and smooth casters. Kept in clean non-smoking room.")
                    .category("College Accessories")
                    .price(new BigDecimal("65.00"))
                    .itemCondition(ItemCondition.GOOD)
                    .imageUrl("https://images.unsplash.com/photo-1580481077195-c9441113b2c9?w=400")
                    .contactPhone("+1 (555) 888-6677")
                    .status(ItemStatus.AVAILABLE).build());

            marketplaceRepository.save(MarketplaceItem.builder()
                    .seller(student9)
                    .title("Clean Campus Commuter Bicycle with Helmet and Combination Lock")
                    .description("Single-speed lightweight aluminum commuter bike. Front and rear handbrakes, new tires, includes sturdy U-lock.")
                    .category("College Accessories")
                    .price(new BigDecimal("85.00"))
                    .itemCondition(ItemCondition.GOOD)
                    .imageUrl("https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400")
                    .contactPhone("+1 (555) 999-7788")
                    .status(ItemStatus.AVAILABLE).build());

            marketplaceRepository.save(MarketplaceItem.builder()
                    .seller(student10)
                    .title("Clean Code & Clean Architecture Books Bundle (Robert C. Martin)")
                    .description("Classic software engineering book set. Pristine condition with no folded pages. Essential reading for developers.")
                    .category("Books")
                    .price(new BigDecimal("38.00"))
                    .itemCondition(ItemCondition.LIKE_NEW)
                    .imageUrl("https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=400")
                    .contactPhone("+1 (555) 111-8899")
                    .status(ItemStatus.AVAILABLE).build());
        }

        // -------------------------------------------------------------
        // MODULE 7: TEAMS (10 teams)
        // -------------------------------------------------------------
        if (teamRepository.count() < 10) {
            Team t1 = teamRepository.save(Team.builder()
                    .leader(student)
                    .teamName("CampusAI Solvers")
                    .projectName("Smart Automated Attendance & Resource Allocator")
                    .description("Building an edge AI based campus resource scheduling and attendance verification portal for the upcoming University Hackathon.")
                    .requiredSkills("Python, Computer Vision, React, REST APIs")
                    .membersRequired(3).currentMembersCount(2)
                    .deadline(today.plusDays(12))
                    .category("Hackathon")
                    .status(TeamStatus.RECRUITING).build());

            teamMemberRepository.save(TeamMember.builder().team(t1).user(student).roleInTeam("Team Leader").build());
            teamMemberRepository.save(TeamMember.builder().team(t1).user(student2).roleInTeam("Frontend Developer").build());

            Team t2 = teamRepository.save(Team.builder()
                    .leader(student2)
                    .teamName("CyberShield Squad")
                    .projectName("Zero-Trust Campus Security & Vulnerability Scanner")
                    .description("Developing automated container vulnerability scanners and identity access auditing for campus lab servers.")
                    .requiredSkills("Go, Docker, Linux Security, Penetration Testing")
                    .membersRequired(4).currentMembersCount(1)
                    .deadline(today.plusDays(15))
                    .category("Competition")
                    .status(TeamStatus.RECRUITING).build());
            teamMemberRepository.save(TeamMember.builder().team(t2).user(student2).roleInTeam("Security Analyst & Lead").build());

            Team t3 = teamRepository.save(Team.builder()
                    .leader(student3)
                    .teamName("GreenCampus Tech")
                    .projectName("IoT Solar Power & Energy Consumption Optimizer")
                    .description("Deploying wireless IoT sensor nodes across campus rooftops to monitor real-time solar inverter efficiency.")
                    .requiredSkills("Embedded C, ESP32, MQTT, Time-Series Databases")
                    .membersRequired(3).currentMembersCount(1)
                    .deadline(today.plusDays(18))
                    .category("Academic Project")
                    .status(TeamStatus.RECRUITING).build());
            teamMemberRepository.save(TeamMember.builder().team(t3).user(student3).roleInTeam("Hardware Architect").build());

            Team t4 = teamRepository.save(Team.builder()
                    .leader(student4)
                    .teamName("FinTrack Pioneers")
                    .projectName("Micro-Investment & Budgeting App for College Students")
                    .description("Mobile banking assistant offering automated round-up savings, peer bill splitting, and campus meal voucher management.")
                    .requiredSkills("Flutter, Node.js, PostgreSQL, Plaid API")
                    .membersRequired(4).currentMembersCount(1)
                    .deadline(today.plusDays(20))
                    .category("Hackathon")
                    .status(TeamStatus.RECRUITING).build());
            teamMemberRepository.save(TeamMember.builder().team(t4).user(student4).roleInTeam("Lead Mobile Dev").build());

            Team t5 = teamRepository.save(Team.builder()
                    .leader(student6)
                    .teamName("NeuroVision Labs")
                    .projectName("Medical Imaging & Diagnostic Assistance with Deep Learning")
                    .description("Research collaboration building 3D Convolutional networks for lung CT nodule classification and report generation.")
                    .requiredSkills("PyTorch, DICOM, Computer Vision, FastAPI")
                    .membersRequired(3).currentMembersCount(1)
                    .deadline(today.plusDays(22))
                    .category("Research")
                    .status(TeamStatus.RECRUITING).build());
            teamMemberRepository.save(TeamMember.builder().team(t5).user(student6).roleInTeam("AI Researcher").build());

            Team t6 = teamRepository.save(Team.builder()
                    .leader(student3)
                    .teamName("Autonomous Rover Devs")
                    .projectName("University Rover Challenge 2026 Navigation Module")
                    .description("Designing autonomous waypoint traversal, obstacle avoidance with LiDAR, and robotic arm inverse kinematics.")
                    .requiredSkills("ROS2, C++, SLAM, Python, OpenCV")
                    .membersRequired(5).currentMembersCount(2)
                    .deadline(today.plusDays(25))
                    .category("Competition")
                    .status(TeamStatus.RECRUITING).build());
            teamMemberRepository.save(TeamMember.builder().team(t6).user(student3).roleInTeam("Mechanical Lead").build());
            teamMemberRepository.save(TeamMember.builder().team(t6).user(student4).roleInTeam("Electronics Lead").build());

            Team t7 = teamRepository.save(Team.builder()
                    .leader(student8)
                    .teamName("EduVR Innovators")
                    .projectName("Interactive 3D Virtual Anatomy & Science Lab Simulator")
                    .description("Creating WebXR and Oculus experiences allowing medical and biology students to dissect virtual specimens.")
                    .requiredSkills("Unity, C#, Blender, WebXR, Three.js")
                    .membersRequired(3).currentMembersCount(1)
                    .deadline(today.plusDays(24))
                    .category("Academic Project")
                    .status(TeamStatus.RECRUITING).build());
            teamMemberRepository.save(TeamMember.builder().team(t7).user(student8).roleInTeam("3D Artist & Lead").build());

            Team t8 = teamRepository.save(Team.builder()
                    .leader(student7)
                    .teamName("CampusRide Express")
                    .projectName("Dynamic Carpooling & Micro-Mobility Dispatch Platform")
                    .description("Algorithmic route grouping and safety tracking for student carpools and electric scooter fleets.")
                    .requiredSkills("Spring Boot, Graphhopper, Redis, React Native")
                    .membersRequired(4).currentMembersCount(1)
                    .deadline(today.plusDays(14))
                    .category("Hackathon")
                    .status(TeamStatus.RECRUITING).build());
            teamMemberRepository.save(TeamMember.builder().team(t8).user(student7).roleInTeam("Backend Architect").build());

            Team t9 = teamRepository.save(Team.builder()
                    .leader(student)
                    .teamName("OpenSource Guild")
                    .projectName("University Open Source Documentation & Tooling Suite")
                    .description("Building developer productivity CLI tools, campus documentation portals, and automated syllabus scrapers.")
                    .requiredSkills("TypeScript, Go, Markdown, GitHub Actions")
                    .membersRequired(2).currentMembersCount(1)
                    .deadline(today.plusDays(30))
                    .category("Academic Project")
                    .status(TeamStatus.RECRUITING).build());
            teamMemberRepository.save(TeamMember.builder().team(t9).user(student).roleInTeam("Maintainer").build());

            Team t10 = teamRepository.save(Team.builder()
                    .leader(student7)
                    .teamName("GameCraft Studio")
                    .projectName("2D Pixel Art Roguelike Adventure Game for Global Game Jam")
                    .description("Developing a procedural dungeon crawler with retro 16-bit chiptune audio and emergent physics mechanics.")
                    .requiredSkills("Godot, GDScript, Pixel Art, Audio Design")
                    .membersRequired(4).currentMembersCount(1)
                    .deadline(today.plusDays(10))
                    .category("Competition")
                    .status(TeamStatus.RECRUITING).build());
            teamMemberRepository.save(TeamMember.builder().team(t10).user(student7).roleInTeam("Game Programmer").build());
        }

        // -------------------------------------------------------------
        // MODULE 8: LOST & FOUND (10 items)
        // -------------------------------------------------------------
        if (lostFoundRepository.count() < 10) {
            lostFoundRepository.save(LostFoundItem.builder()
                    .reportedBy(student2)
                    .itemType(ItemType.FOUND)
                    .title("Sony Noise Cancelling Headphones (Black Case)")
                    .description("Found on desk 14 on the 2nd floor of the central library next to the silent study area.")
                    .category("Electronics")
                    .location("Central Library - 2nd Floor Silent Zone")
                    .incidentDate(today.minusDays(1))
                    .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400")
                    .contactInfo("Library Helpdesk / priya.patel@campushub.edu")
                    .status(LostFoundStatus.ACTIVE).build());

            lostFoundRepository.save(LostFoundItem.builder()
                    .reportedBy(student)
                    .itemType(ItemType.LOST)
                    .title("Navy Blue Herschel Backpack with Notebooks")
                    .description("Left behind in auditorium row G after 11 AM calculus lecture. Contains blue spiral notebook and laptop charger.")
                    .category("Bags")
                    .location("Main Auditorium Hall A")
                    .incidentDate(today.minusDays(2))
                    .imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400")
                    .contactInfo("aarav.sharma@campushub.edu / +1 (555) 234-5678")
                    .status(LostFoundStatus.ACTIVE).build());

            lostFoundRepository.save(LostFoundItem.builder()
                    .reportedBy(student3)
                    .itemType(ItemType.FOUND)
                    .title("Casio FX-991EX Scientific Calculator")
                    .description("Found on the second bench in Seminar Hall 3B following the afternoon mechanical engineering tutorial.")
                    .category("Electronics")
                    .location("Seminar Hall 3B")
                    .incidentDate(today.minusDays(1))
                    .imageUrl("https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400")
                    .contactInfo("rohan.gupta@campushub.edu")
                    .status(LostFoundStatus.ACTIVE).build());

            lostFoundRepository.save(LostFoundItem.builder()
                    .reportedBy(student4)
                    .itemType(ItemType.LOST)
                    .title("Campus ID Card & RFID Lanyard - Aarav Sharma")
                    .description("Lost student identity card with maroon computer science department lanyard near cafeteria counter.")
                    .category("ID Cards")
                    .location("Central Cafeteria Counter 2")
                    .incidentDate(today.minusDays(3))
                    .imageUrl("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400")
                    .contactInfo("Campus Security Office / student@campushub.edu")
                    .status(LostFoundStatus.ACTIVE).build());

            lostFoundRepository.save(LostFoundItem.builder()
                    .reportedBy(student5)
                    .itemType(ItemType.FOUND)
                    .title("Apple MacBook Air 67W USB-C Power Adapter & Cable")
                    .description("Found plugged into wall socket in Room 204 near the front whiteboard.")
                    .category("Electronics")
                    .location("Tech Building Room 204")
                    .incidentDate(today.minusDays(1))
                    .imageUrl("https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=400")
                    .contactInfo("vikram.singh@campushub.edu")
                    .status(LostFoundStatus.ACTIVE).build());

            lostFoundRepository.save(LostFoundItem.builder()
                    .reportedBy(student6)
                    .itemType(ItemType.LOST)
                    .title("Hydro Flask 32oz Water Bottle (Forest Green)")
                    .description("Dark green insulated water bottle with stickers of Python and NASA. Forgotten on bleachers during basketball game.")
                    .category("Water Bottles")
                    .location("Indoor Sports Complex - Gym Bleachers")
                    .incidentDate(today.minusDays(2))
                    .imageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400")
                    .contactInfo("sneha.reddy@campushub.edu")
                    .status(LostFoundStatus.ACTIVE).build());

            lostFoundRepository.save(LostFoundItem.builder()
                    .reportedBy(student7)
                    .itemType(ItemType.FOUND)
                    .title("Black Folding Windproof Umbrella")
                    .description("Sturdy compact umbrella with wooden handle left on umbrella rack near main foyer entrance.")
                    .category("Other")
                    .location("Student Union Porch")
                    .incidentDate(today.minusDays(1))
                    .imageUrl("https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=400")
                    .contactInfo("Union Security Desk")
                    .status(LostFoundStatus.ACTIVE).build());

            lostFoundRepository.save(LostFoundItem.builder()
                    .reportedBy(student8)
                    .itemType(ItemType.LOST)
                    .title("Brown Leather Bi-fold Wallet with Metro Card")
                    .description("Contains university bus pass, state driving license, and student discount coupons. Reward if returned!")
                    .category("Other")
                    .location("Campus North Gate Bus Stop")
                    .incidentDate(today.minusDays(3))
                    .imageUrl("https://images.unsplash.com/photo-1627123424574-724758594e93?w=400")
                    .contactInfo("tanya.sengupta@campushub.edu")
                    .status(LostFoundStatus.ACTIVE).build());

            lostFoundRepository.save(LostFoundItem.builder()
                    .reportedBy(student9)
                    .itemType(ItemType.FOUND)
                    .title("Apple AirPods Pro (2nd Gen) in White Charging Case")
                    .description("Handed to lab assistant after evening operating systems lab practical. Serial number verification required.")
                    .category("Electronics")
                    .location("CS Computer Lab 3")
                    .incidentDate(today.minusDays(2))
                    .imageUrl("https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400")
                    .contactInfo("karan.mehra@campushub.edu / Lab In-charge")
                    .status(LostFoundStatus.ACTIVE).build());

            lostFoundRepository.save(LostFoundItem.builder()
                    .reportedBy(student10)
                    .itemType(ItemType.LOST)
                    .title("Ray-Ban Matte Black Prescription Eyeglasses")
                    .description("Black rectangular frame with blue light filter coating inside leather case. Lost during study session.")
                    .category("Other")
                    .location("Central Library Quiet Study Cubicle 7")
                    .incidentDate(today.minusDays(1))
                    .imageUrl("https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400")
                    .contactInfo("meera.nair@campushub.edu")
                    .status(LostFoundStatus.ACTIVE).build());
        }

        // -------------------------------------------------------------
        // MODULE 9: ROOMMATE PROFILES (10 profiles)
        // -------------------------------------------------------------
        if (roommateRepository.count() < 10) {
            saveRoommateProfile(student, "North Campus Apartments", "$500 - $800", "Shared (2 people)",
                    "Night Owl", "Quiet environment", "Vegetarian", "1 AM - 8 AM",
                    "Coding, Tech Podcasts, Chess, PC Gaming",
                    "CS junior looking for a respectful and clean roommate within 10 minutes walking distance from campus.");

            saveRoommateProfile(student2, "Green View Residency", "$500 - $800", "Shared (2 people)",
                    "Balanced", "Group study", "Vegetarian", "11 PM - 7 AM",
                    "UI/UX Design, Coffee, Badminton, Photography",
                    "IT sophomore looking for a study-friendly apartment with reliable high-speed fiber internet.");

            saveRoommateProfile(student3, "University Heights", "< $500", "Shared (2 people)",
                    "Early Bird", "Quiet environment", "Any", "10 PM - 6 AM",
                    "Robotics, Gym, Cycling, Cooking",
                    "Mechanical engineering student who keeps things organized and enjoys cooking healthy meals.");

            saveRoommateProfile(student4, "Sunrise Towers", "$800+", "Single",
                    "Balanced", "Quiet environment", "Vegetarian", "11 PM - 7 AM",
                    "Hardware tinkering, Reading, Yoga, Painting",
                    "Looking for a quiet single room in a secure apartment with natural sunlight and balcony.");

            saveRoommateProfile(student5, "Campus West Enclave", "< $500", "Shared (3+ people)",
                    "Night Owl", "Music in background", "Any", "1 AM - 8 AM",
                    "Football, Hiking, Acoustic Guitar",
                    "Easygoing senior civil engineering major looking for shared housing near west gate.");

            saveRoommateProfile(student6, "Lakeview Suites", "$800+", "Single",
                    "Early Bird", "Quiet environment", "Vegetarian", "10 PM - 6 AM",
                    "Data Science, Classical Music, Running, Reading",
                    "Responsible sophomore seeking peaceful studio or 2BHK flat near Lakeview park.");

            saveRoommateProfile(student7, "Silicon Park Residences", "$500 - $800", "Shared (2 people)",
                    "Balanced", "Group study", "Non-Vegetarian", "Flexible",
                    "Competitive Coding, eSports, Table Tennis",
                    "Fun and focused roommate looking for a fellow coder or STEM major to split rent.");

            saveRoommateProfile(student8, "Downtown Lofts", "$500 - $800", "Shared (2 people)",
                    "Night Owl", "Music in background", "Any", "2 AM - 9 AM",
                    "Architecture, Sketching, Indie Films, Travel",
                    "Creative architecture student who values good aesthetics and friendly atmosphere.");

            saveRoommateProfile(student9, "University Metro Apartments", "< $500", "Shared (2 people)",
                    "Early Bird", "Quiet environment", "Vegetarian", "10 PM - 6 AM",
                    "Biotech, Swimming, Documentaries, Board Games",
                    "Punctual and tidy final-year student looking for housing right next to metro station.");

            saveRoommateProfile(student10, "Royal Palm Residency", "$800+", "Single",
                    "Balanced", "Quiet environment", "Any", "Flexible",
                    "Business Strategy, Networking, Tennis, Podcasting",
                    "First-year management student seeking modern, clean apartment with gym amenities.");
        }

        // -------------------------------------------------------------
        // MODULE 10: STUDENT COMMUNITY POSTS & COMMENTS (10 posts)
        // -------------------------------------------------------------
        if (postRepository.count() < 10) {
            StudentPost p1 = postRepository.save(StudentPost.builder()
                    .author(student)
                    .title("Tips for Cracking Technical Coding Interviews & OA Rounds in 2026")
                    .content("Here are the top 5 patterns that appeared frequently in campus placement assessments this semester: 1. Sliding Window & Two Pointers, 2. BFS/DFS on Graphs, 3. Dynamic Programming with memoization, 4. Monotonic Stacks, and 5. Trie lookups. Start solving Blind 75 early!")
                    .category("Technical")
                    .likesCount(28).commentsCount(3).build());
            commentRepository.save(PostComment.builder().post(p1).author(student2).content("Awesome summary Aarav! The graph cycle detection question caught a lot of people off guard last week.").build());
            commentRepository.save(PostComment.builder().post(p1).author(student7).content("Can confirm! Practice writing clean code on whiteboard too.").build());
            commentRepository.save(PostComment.builder().post(p1).author(student6).content("Thanks for sharing, really helpful for the upcoming career fair.").build());

            StudentPost p2 = postRepository.save(StudentPost.builder()
                    .author(student2)
                    .title("Best Study Spots with High-Speed WiFi & Power Outlets on Campus")
                    .content("Ranking the top study zones: 1. Central Library 3rd Floor Silent Cubicles (Ethernet ports!), 2. Tech Building Glass Atrium (lots of natural light), 3. Innovation Center Cafeteria booths (great coffee). What's your favorite spot?")
                    .category("Campus")
                    .likesCount(35).commentsCount(3).build());
            commentRepository.save(PostComment.builder().post(p2).author(student4).content("The Atrium is my go-to place between morning lectures!").build());
            commentRepository.save(PostComment.builder().post(p2).author(student3).content("Don't forget the Mechanical workshop mezzanine, surprisingly peaceful after 4 PM.").build());
            commentRepository.save(PostComment.builder().post(p2).author(student).content("Central Library 3rd floor is unbeatable during finals week.").build());

            StudentPost p3 = postRepository.save(StudentPost.builder()
                    .author(student)
                    .title("Guide: How to Contribute to Open Source Projects During Semester Breaks")
                    .content("Open source is the best way to get practical code review from senior engineers worldwide. Look for repositories with 'good-first-issue' tags, read CONTRIBUTING.md, and test your changes locally before submitting a PR.")
                    .category("Academics")
                    .likesCount(42).commentsCount(2).build());
            commentRepository.save(PostComment.builder().post(p3).author(student7).content("Found my first open-source bug fix through Apache Commons last winter! Highly recommended.").build());
            commentRepository.save(PostComment.builder().post(p3).author(student2).content("Also check out Google Summer of Code (GSoC) organizations.").build());

            StudentPost p4 = postRepository.save(StudentPost.builder()
                    .author(student7)
                    .title("Preparation Strategy for Distributed Systems & Microservices Exam")
                    .content("Prof. Reed's notes in the Academic Resources tab are gold. Make sure you understand the difference between Raft leader election and log replication, and be ready to draw vector clock diagrams.")
                    .category("Academics")
                    .likesCount(19).commentsCount(2).build());
            commentRepository.save(PostComment.builder().post(p4).author(student).content("The solved question papers helped a lot with the Byzantine fault numericals.").build());
            commentRepository.save(PostComment.builder().post(p4).author(student6).content("Good luck everyone on Thursday's exam!").build());

            StudentPost p5 = postRepository.save(StudentPost.builder()
                    .author(student2)
                    .title("University Hackathon 2026 Announced: Ideas, Mentor Hours & Team Formation")
                    .content("Registration is now officially open for Campus CodeSprint 2026! 24 hours of non-stop building, free meals, mentor sessions, and cash prizes for top solutions in smart campus and climate tech.")
                    .category("Events")
                    .likesCount(56).commentsCount(3).build());
            commentRepository.save(PostComment.builder().post(p5).author(student).content("Our team is building an AI resource scheduler. Looking forward to it!").build());
            commentRepository.save(PostComment.builder().post(p5).author(student3).content("RoboWars expo is also happening that week!").build());
            commentRepository.save(PostComment.builder().post(p5).author(student8).content("Looking forward to the UI design showcases.").build());

            StudentPost p6 = postRepository.save(StudentPost.builder()
                    .author(student6)
                    .title("Top Cloud Certifications (AWS / GCP / Azure) Worth Pursuing as a Student")
                    .content("If you're looking to stand out in backend or DevOps recruitment, AWS Certified Cloud Practitioner and Solutions Architect Associate are the most recognized. University students get 50% discount vouchers through AWS Educate!")
                    .category("Career")
                    .likesCount(47).commentsCount(2).build());
            commentRepository.save(PostComment.builder().post(p6).author(student).content("Got the voucher from university email, thanks for the reminder!").build());
            commentRepository.save(PostComment.builder().post(p6).author(student7).content("GCP Associate Cloud Engineer is also fantastic for Kubernetes.").build());

            StudentPost p7 = postRepository.save(StudentPost.builder()
                    .author(student3)
                    .title("Review of Elective Courses: Cloud Computing vs Machine Learning vs Cryptography")
                    .content("For anyone selecting semester 6 electives: Cloud Computing with Dr. Reed has great hands-on AWS lab assignments. Machine Learning is math-heavy but rewarding. Cryptography covers fascinating zero-knowledge proofs.")
                    .category("Academics")
                    .likesCount(31).commentsCount(2).build());
            commentRepository.save(PostComment.builder().post(p7).author(student4).content("Cryptography with modular arithmetic was super interesting.").build());
            commentRepository.save(PostComment.builder().post(p7).author(student2).content("Cloud Computing labs are definitely top tier.").build());

            StudentPost p8 = postRepository.save(StudentPost.builder()
                    .author(student)
                    .title("Recommended Resources & GitHub Repos for Modern Full-Stack Development")
                    .content("Curated list for React 18, Spring Boot 3, and containerized microservices: check out 'roadmap.sh/full-stack', official Spring documentation, and the Material UI component templates.")
                    .category("Technical")
                    .likesCount(64).commentsCount(2).build());
            commentRepository.save(PostComment.builder().post(p8).author(student2).content("Bookmarked! Material UI v5 documentation is also super comprehensive.").build());
            commentRepository.save(PostComment.builder().post(p8).author(student7).content("Vite + Spring Boot is a joy to work with.").build());

            StudentPost p9 = postRepository.save(StudentPost.builder()
                    .author(student5)
                    .title("Campus Shuttle Timings & Late Night Transportation Options")
                    .content("Reminder that the university night shuttle runs every 30 minutes between Central Library, Metro Station, and South Campus Hostels until 1:00 AM on weekdays.")
                    .category("General")
                    .likesCount(22).commentsCount(1).build());
            commentRepository.save(PostComment.builder().post(p9).author(student3).content("Super handy after late night project sessions in the lab.").build());

            StudentPost p10 = postRepository.save(StudentPost.builder()
                    .author(student9)
                    .title("Student Wellness & Mental Health Resources Available at University Health Center")
                    .content("Mid-semester exams can be stressful. Friendly reminder that the University Health Center offers free confidential counseling sessions, mindfulness workshops, and quiet meditation rooms every Tuesday and Thursday.")
                    .category("Campus")
                    .likesCount(51).commentsCount(2).build());
            commentRepository.save(PostComment.builder().post(p10).author(student2).content("Such an important resource. Take care of yourselves everyone!").build());
            commentRepository.save(PostComment.builder().post(p10).author(student).content("Thank you for sharing Karan, health always comes first.").build());
        }

        // -------------------------------------------------------------
        // MODULE 11: NOTIFICATIONS (10 notifications)
        // -------------------------------------------------------------
        if (notificationRepository.count() < 10) {
            notificationRepository.save(Notification.builder()
                    .user(student)
                    .title("Welcome to CampusHub Platform!")
                    .message("Explore events, internships, academic resources, and team finder across your campus.")
                    .type(NotificationType.SYSTEM_ALERT)
                    .targetEntityType("SYSTEM").targetEntityId(1L).isRead(true).build());

            notificationRepository.save(Notification.builder()
                    .user(student)
                    .title("Event Approved: Campus CodeSprint 2026")
                    .message("Your hackathon event submission has been approved by university administration.")
                    .type(NotificationType.EVENT_APPROVED)
                    .targetEntityType("EVENT").targetEntityId(1L).isRead(false).build());

            notificationRepository.save(Notification.builder()
                    .user(student)
                    .title("Registration Confirmed: Cybersecurity CTF")
                    .message("Your registration for Cybersecurity CTF & Ethical Hacking Lab has been confirmed.")
                    .type(NotificationType.EVENT_REGISTERED)
                    .targetEntityType("EVENT").targetEntityId(3L).isRead(false).build());

            notificationRepository.save(Notification.builder()
                    .user(student)
                    .title("New Internship: Software Engineering Intern")
                    .message("Nexus Cloud Technologies posted an internship matching your profile skills.")
                    .type(NotificationType.INTERNSHIP_POSTED)
                    .targetEntityType("INTERNSHIP").targetEntityId(1L).isRead(false).build());

            notificationRepository.save(Notification.builder()
                    .user(student)
                    .title("Ride Booking Confirmed")
                    .message("Priya Patel booked 1 seat on your ride to Central Train Terminal.")
                    .type(NotificationType.RIDE_BOOKED)
                    .targetEntityType("RIDE").targetEntityId(1L).isRead(true).build());

            notificationRepository.save(Notification.builder()
                    .user(student)
                    .title("Team Join Request Received")
                    .message("Priya Patel requested to join your hackathon team 'CampusAI Solvers'.")
                    .type(NotificationType.TEAM_JOIN_REQUEST)
                    .targetEntityType("TEAM").targetEntityId(1L).isRead(true).build());

            notificationRepository.save(Notification.builder()
                    .user(student)
                    .title("Marketplace Listing Inquiry")
                    .message("A buyer is interested in your 'Introduction to Algorithms' textbook listing.")
                    .type(NotificationType.MARKETPLACE_INQUIRY)
                    .targetEntityType("MARKETPLACE").targetEntityId(1L).isRead(false).build());

            notificationRepository.save(Notification.builder()
                    .user(student)
                    .title("New Comment on Your Community Post")
                    .message("Priya Patel replied to 'Tips for Cracking Technical Coding Interviews'.")
                    .type(NotificationType.COMMUNITY_COMMENT)
                    .targetEntityType("POST").targetEntityId(1L).isRead(false).build());

            notificationRepository.save(Notification.builder()
                    .user(student)
                    .title("Item Claim Resolved: Lost & Found")
                    .message("Your report for lost student ID card has an update from the security office.")
                    .type(NotificationType.LOST_FOUND_RESOLVED)
                    .targetEntityType("LOST_FOUND").targetEntityId(4L).isRead(false).build());

            notificationRepository.save(Notification.builder()
                    .user(student)
                    .title("Campus Library System Maintenance Alert")
                    .message("Campus portal network upgrades will occur Sunday midnight from 1:00 AM to 3:00 AM.")
                    .type(NotificationType.SYSTEM_ALERT)
                    .targetEntityType("SYSTEM").targetEntityId(2L).isRead(false).build());
        }

        // -------------------------------------------------------------
        // MODULE 12: AUDIT LOGS (10 audit logs)
        // -------------------------------------------------------------
        if (auditLogRepository.count() < 10) {
            auditLogRepository.save(AuditLog.builder().actor(admin).action("EVENT_APPROVED").entityType("EVENT").entityId(1L).details("Approved Campus CodeSprint 2026: 24h Hackathon").build());
            auditLogRepository.save(AuditLog.builder().actor(admin).action("EVENT_APPROVED").entityType("EVENT").entityId(2L).details("Approved Workshop: Advanced Spring Boot & Microservices").build());
            auditLogRepository.save(AuditLog.builder().actor(admin).action("EVENT_APPROVED").entityType("EVENT").entityId(3L).details("Approved Cybersecurity CTF & Ethical Hacking Lab").build());
            auditLogRepository.save(AuditLog.builder().actor(faculty).action("RESOURCE_UPLOADED").entityType("RESOURCE").entityId(1L).details("Uploaded CS601 Distributed Systems lecture notes").build());
            auditLogRepository.save(AuditLog.builder().actor(faculty).action("INTERNSHIP_CREATED").entityType("INTERNSHIP").entityId(1L).details("Posted Software Engineering Intern - Cloud Platforms").build());
            auditLogRepository.save(AuditLog.builder().actor(student).action("RIDE_CREATED").entityType("RIDE").entityId(1L).details("Created ride from Campus North Gate to Central Train Terminal").build());
            auditLogRepository.save(AuditLog.builder().actor(student2).action("RIDE_BOOKED").entityType("RIDE").entityId(1L).details("Booked 1 seat on ride #1").build());
            auditLogRepository.save(AuditLog.builder().actor(student).action("MARKETPLACE_ITEM_CREATED").entityType("MARKETPLACE").entityId(1L).details("Listed Introduction to Algorithms textbook for sale").build());
            auditLogRepository.save(AuditLog.builder().actor(student).action("TEAM_CREATED").entityType("TEAM").entityId(1L).details("Created team CampusAI Solvers for Hackathon").build());
            auditLogRepository.save(AuditLog.builder().actor(student2).action("LOST_FOUND_REPORTED").entityType("LOST_FOUND").entityId(1L).details("Reported found Sony headphones in central library").build());
        }
    }

    private User getOrCreateUser(String email, String fullName, Role role, String department,
                                 String academicYear, String phone, String bio, String skills,
                                 String profileImageUrl, String defaultPassword) {
        return userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                .email(email)
                .password(defaultPassword)
                .fullName(fullName)
                .role(role)
                .department(department)
                .academicYear(academicYear)
                .phone(phone)
                .bio(bio)
                .skills(skills)
                .profileImageUrl(profileImageUrl)
                .active(true)
                .build()));
    }

    private void saveRoommateProfile(User user, String location, String budget, String occupancy,
                                     String lifestyle, String study, String food, String sleep,
                                     String interests, String bio) {
        if (!roommateRepository.existsByUser(user)) {
            roommateRepository.save(RoommateProfile.builder()
                    .user(user)
                    .preferredLocation(location)
                    .budgetRange(budget)
                    .occupancyPreference(occupancy)
                    .lifestyle(lifestyle)
                    .studyHabits(study)
                    .foodPreference(food)
                    .sleepSchedule(sleep)
                    .interests(interests)
                    .bio(bio)
                    .active(true)
                    .build());
        }
    }

    private void refreshOrAddScenarioData() {
        // Ensure Event Form Fields exist for hackathon event
        List<Event> events = eventRepository.findAll();
        for (Event event : events) {
            if ("Campus CodeSprint 2026: 24h Hackathon".equalsIgnoreCase(event.getTitle()) || event.getId().equals(1L)) {
                if (eventFormFieldRepository.findByEventOrderByFieldOrderAsc(event).isEmpty()) {
                    eventFormFieldRepository.save(EventFormField.builder()
                            .event(event)
                            .fieldLabel("T-Shirt Size")
                            .fieldType(FieldType.DROPDOWN)
                            .required(true)
                            .fieldOrder(1)
                            .options("S, M, L, XL, XXL")
                            .build());

                    eventFormFieldRepository.save(EventFormField.builder()
                            .event(event)
                            .fieldLabel("Dietary Preference")
                            .fieldType(FieldType.DROPDOWN)
                            .required(false)
                            .fieldOrder(2)
                            .options("Vegetarian, Non-Vegetarian, Vegan, Gluten-Free")
                            .build());

                    eventFormFieldRepository.save(EventFormField.builder()
                            .event(event)
                            .fieldLabel("GitHub or Portfolio URL")
                            .fieldType(FieldType.TEXT)
                            .required(false)
                            .fieldOrder(3)
                            .options("")
                            .build());
                    log.info("Added default form fields for demo event #{}", event.getId());
                }
            }
        }
    }
}
