package com.campushub;

import com.campushub.dto.resource.AcademicResourceResponse;
import com.campushub.dto.resource.ResourceRequest;
import com.campushub.entity.AcademicResource;
import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ForbiddenException;
import com.campushub.repository.AcademicResourceRepository;
import com.campushub.repository.UserRepository;
import com.campushub.security.CustomUserDetailsService;
import com.campushub.service.AcademicResourceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AcademicResourceModuleTests {

    @Autowired
    private AcademicResourceService resourceService;

    @Autowired
    private AcademicResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        if (userRepository.findByEmail("faculty2@campushub.edu").isEmpty()) {
            userRepository.save(User.builder()
                    .email("faculty2@campushub.edu")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Prof. Marcus Vance")
                    .role(Role.ROLE_FACULTY)
                    .department("Electrical Engineering")
                    .academicYear("Faculty")
                    .active(true)
                    .build());
        }
    }

    private void authenticateAs(String email) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @Transactional
    @DisplayName("TEST 1: Faculty Uploads test_notes.pdf -> Saved with Metadata in Database")
    void test1_facultyUploadResource() {
        authenticateAs("faculty@campushub.edu");

        byte[] content = "%PDF-1.4 Mock PDF Content For Testing Units".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test_notes.pdf",
                "application/pdf",
                content
        );

        AcademicResourceResponse response = resourceService.uploadResource(
                file,
                "Data Structures Unit 1 Notes",
                "Complete notes for Unit 1.",
                "Data Structures",
                "Computer Science & Engineering",
                5,
                "Lecture Notes",
                "DSA, Trees, Graphs"
        );

        assertNotNull(response.getId());
        assertEquals("Data Structures Unit 1 Notes", response.getTitle());
        assertEquals("test_notes.pdf", response.getFileName());
        assertEquals(content.length, response.getFileSize());
        assertNotNull(response.getFileUrl());
        assertEquals(0, response.getDownloadCount());
        assertEquals("faculty@campushub.edu", response.getUploadedBy().getEmail());
    }

    @Test
    @Transactional
    @DisplayName("TEST 2: Student Views & Searches Resources -> test_notes.pdf Appears")
    void test2_studentViewResources() {
        // Faculty uploads first
        authenticateAs("faculty@campushub.edu");
        byte[] content = "PDF Content".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test_notes.pdf",
                "application/pdf",
                content
        );
        AcademicResourceResponse uploaded = resourceService.uploadResource(
                file,
                "Data Structures Unit 1 Notes",
                "Complete notes for Unit 1.",
                "Data Structures",
                "Computer Science & Engineering",
                5,
                "Lecture Notes",
                "DSA, Trees, Graphs"
        );

        // Student searches
        authenticateAs("student@campushub.edu");
        List<AcademicResourceResponse> list = resourceService.searchResources(
                "Computer Science & Engineering",
                5,
                "Lecture Notes",
                "Data Structures",
                "Trees"
        );

        assertFalse(list.isEmpty());
        assertTrue(list.stream().anyMatch(r -> r.getId().equals(uploaded.getId())));
    }

    @Test
    @Transactional
    @DisplayName("TEST 3: Student Downloads Actual File -> Preserves Original File Content & Filename")
    void test3_studentDownloadResource() {
        // Faculty uploads
        authenticateAs("faculty@campushub.edu");
        byte[] originalBytes = "Actual binary PDF stream bytes 123456789".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test_notes.pdf",
                "application/pdf",
                originalBytes
        );
        AcademicResourceResponse uploaded = resourceService.uploadResource(
                file,
                "Data Structures Unit 1 Notes",
                "Complete notes for Unit 1.",
                "Data Structures",
                "Computer Science & Engineering",
                5,
                "Lecture Notes",
                "DSA"
        );

        // Student downloads
        authenticateAs("student@campushub.edu");
        byte[] downloadedBytes = resourceService.downloadResourceFile(uploaded.getId());

        assertNotNull(downloadedBytes);
        assertArrayEquals(originalBytes, downloadedBytes);

        // Verify entity filename is preserved
        AcademicResource entity = resourceService.getResourceEntity(uploaded.getId());
        assertEquals("test_notes.pdf", entity.getFileName());
    }

    @Test
    @Transactional
    @DisplayName("TEST 4: Student Attempts Upload -> 403 Forbidden")
    void test4_studentCannotUpload() {
        authenticateAs("student@campushub.edu");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "student_cheat.pdf",
                "application/pdf",
                "PDF".getBytes()
        );

        assertThrows(ForbiddenException.class, () -> {
            resourceService.uploadResource(
                    file,
                    "Student Notes",
                    "Description",
                    "Subject",
                    "Computer Science & Engineering",
                    3,
                    "Lecture Notes",
                    "Tag"
            );
        });
    }

    @Test
    @Transactional
    @DisplayName("TEST 5: Student Attempts Delete -> 403 Forbidden")
    void test5_studentCannotDelete() {
        // Faculty uploads
        authenticateAs("faculty@campushub.edu");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "fac_notes.pdf",
                "application/pdf",
                "PDF".getBytes()
        );
        AcademicResourceResponse uploaded = resourceService.uploadResource(
                file,
                "Faculty Notes",
                "Description",
                "Subject",
                "Computer Science & Engineering",
                4,
                "Lecture Notes",
                "Tag"
        );

        // Student attempts delete
        authenticateAs("student@campushub.edu");
        assertThrows(ForbiddenException.class, () -> {
            resourceService.deleteResource(uploaded.getId());
        });
    }

    @Test
    @Transactional
    @DisplayName("TEST 6: Faculty A Uploads, Faculty B Attempts Delete -> 403 Forbidden")
    void test6_crossFacultyCannotDelete() {
        // Faculty A uploads
        authenticateAs("faculty@campushub.edu");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "faculty_a_notes.pdf",
                "application/pdf",
                "PDF".getBytes()
        );
        AcademicResourceResponse uploaded = resourceService.uploadResource(
                file,
                "Faculty A Notes",
                "Description",
                "Subject",
                "Computer Science & Engineering",
                4,
                "Lecture Notes",
                "Tag"
        );

        // Faculty B attempts delete
        authenticateAs("faculty2@campushub.edu");
        assertThrows(ForbiddenException.class, () -> {
            resourceService.deleteResource(uploaded.getId());
        });
    }

    @Test
    @Transactional
    @DisplayName("TEST 7: Faculty A Deletes Own Resource -> Successfully Removed From DB")
    void test7_facultyDeleteOwnResource() {
        authenticateAs("faculty@campushub.edu");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "faculty_a_own_notes.pdf",
                "application/pdf",
                "PDF".getBytes()
        );
        AcademicResourceResponse uploaded = resourceService.uploadResource(
                file,
                "Faculty A Own Notes",
                "Description",
                "Subject",
                "Computer Science & Engineering",
                4,
                "Lecture Notes",
                "Tag"
        );

        Long resourceId = uploaded.getId();
        assertTrue(resourceRepository.findById(resourceId).isPresent());

        // Delete own resource
        resourceService.deleteResource(resourceId);

        // Verify removed
        assertFalse(resourceRepository.findById(resourceId).isPresent());
    }

    @Test
    @Transactional
    @DisplayName("TEST 8: Upload Invalid Executable File (test.exe) -> Rejected with 400 Bad Request")
    void test8_rejectInvalidFileType() {
        authenticateAs("faculty@campushub.edu");

        MockMultipartFile exeFile = new MockMultipartFile(
                "file",
                "test.exe",
                "application/octet-stream",
                "MZ executable header".getBytes()
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            resourceService.uploadResource(
                    exeFile,
                    "Malicious File",
                    "Description",
                    "Subject",
                    "Computer Science & Engineering",
                    4,
                    "Lecture Notes",
                    "Tag"
            );
        });

        assertEquals("File type is not supported.", ex.getMessage());
    }

    @Test
    @Transactional
    @DisplayName("TEST 9: Upload File Exceeding Max Configured Limit -> Rejected with 400 Bad Request")
    void test9_rejectFileSizeExceeded() {
        authenticateAs("faculty@campushub.edu");

        // 11 MB (> 10 MB limit)
        byte[] oversized = new byte[11 * 1024 * 1024];
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large_file.pdf",
                "application/pdf",
                oversized
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            resourceService.uploadResource(
                    largeFile,
                    "Large Resource",
                    "Description",
                    "Subject",
                    "Computer Science & Engineering",
                    4,
                    "Lecture Notes",
                    "Tag"
            );
        });

        assertEquals("File size exceeds the allowed limit.", ex.getMessage());
    }

    @Test
    @Transactional
    @DisplayName("TEST 10: Download Count Increments ONLY on Download, NOT on View Details")
    void test10_downloadCountIncrementOnlyOnDownload() {
        authenticateAs("faculty@campushub.edu");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "count_test.pdf",
                "application/pdf",
                "PDF Sample Content".getBytes()
        );
        AcademicResourceResponse uploaded = resourceService.uploadResource(
                file,
                "Download Counter Test Notes",
                "Description",
                "Subject",
                "Computer Science & Engineering",
                4,
                "Lecture Notes",
                "Tag"
        );

        Long resourceId = uploaded.getId();
        assertEquals(0, uploaded.getDownloadCount());

        // 1. Student views details -> downloadCount MUST NOT increment
        authenticateAs("student@campushub.edu");
        AcademicResourceResponse details = resourceService.getResourceById(resourceId);
        assertEquals(0, details.getDownloadCount());

        AcademicResource inDbAfterView = resourceRepository.findById(resourceId).orElseThrow();
        assertEquals(0, inDbAfterView.getDownloadCount());

        // 2. Student downloads file -> downloadCount MUST increment by 1
        resourceService.downloadResourceFile(resourceId);

        AcademicResource inDbAfterDownload = resourceRepository.findById(resourceId).orElseThrow();
        assertEquals(1, inDbAfterDownload.getDownloadCount());

        // 3. Second download -> increments to 2
        resourceService.downloadResourceFile(resourceId);
        AcademicResource inDbAfterSecondDownload = resourceRepository.findById(resourceId).orElseThrow();
        assertEquals(2, inDbAfterSecondDownload.getDownloadCount());
    }

    @Test
    @Transactional
    @DisplayName("TEST 11: Faculty Updates Only Title -> Preserves File URL, Filename, and Cloudinary Metadata")
    void test11_facultyUpdatesOnlyTitle_preservesFileUrlAndCloudinaryMetadata() {
        authenticateAs("faculty@campushub.edu");

        // 1. Upload initial file with Cloudinary URL
        byte[] content = "%PDF-1.4 Mock Upload For Faculty Edit".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "original_lecture_notes.pdf",
                "application/pdf",
                content
        );

        AcademicResourceResponse uploaded = resourceService.uploadResource(
                file,
                "Original Lecture Notes Title",
                "Original Description",
                "Operating Systems",
                "Computer Science & Engineering",
                4,
                "Lecture Notes",
                "OS, Threads, Memory"
        );

        Long resourceId = uploaded.getId();
        String originalFileUrl = uploaded.getFileUrl();
        String originalFileName = uploaded.getFileName();
        Long originalFileSize = uploaded.getFileSize();
        assertNotNull(originalFileUrl);
        assertEquals("original_lecture_notes.pdf", originalFileName);

        // 2. Faculty edits ONLY the resource title (and optionally description)
        ResourceRequest updateRequest = ResourceRequest.builder()
                .title("Updated Operating Systems Compendium (Revised)")
                .build();

        AcademicResourceResponse updated = resourceService.updateResource(resourceId, updateRequest);

        // 3. Verify title changed, but fileUrl, fileName, fileSize, publicId are completely preserved
        assertEquals("Updated Operating Systems Compendium (Revised)", updated.getTitle());
        assertEquals("Original Description", updated.getDescription()); // Preserved omitted description
        assertEquals(originalFileUrl, updated.getFileUrl());
        assertEquals(originalFileName, updated.getFileName());
        assertEquals(originalFileSize, updated.getFileSize());
        assertEquals("Operating Systems", updated.getSubject());
        assertEquals("Computer Science & Engineering", updated.getDepartment());

        // 4. Verify in DB entity
        AcademicResource inDb = resourceRepository.findById(resourceId).orElseThrow();
        assertEquals("Updated Operating Systems Compendium (Revised)", inDb.getTitle());
        assertEquals(originalFileUrl, inDb.getFileUrl());
        assertEquals(originalFileName, inDb.getFileName());
        assertEquals(originalFileSize, inDb.getFileSize());

        // 5. Verify student can view and download using the preserved Cloudinary asset
        authenticateAs("student@campushub.edu");
        AcademicResourceResponse studentView = resourceService.getResourceById(resourceId);
        assertEquals("Updated Operating Systems Compendium (Revised)", studentView.getTitle());
        assertEquals(originalFileUrl, studentView.getFileUrl());
        assertEquals(originalFileName, studentView.getFileName());

        byte[] downloaded = resourceService.downloadResourceFile(resourceId);
        assertNotNull(downloaded);
        assertArrayEquals(content, downloaded);
    }

    @Test
    @Transactional
    @DisplayName("TEST 12: Title-Only Update With Omitted Fields -> Does Not Overwrite DB Fields With Null")
    void test12_titleUpdateWithOmittedFields_doesNotOverwriteWithNull() {
        authenticateAs("faculty@campushub.edu");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "embedded_systems.pdf",
                "application/pdf",
                "Sample embedded systems content".getBytes()
        );

        AcademicResourceResponse uploaded = resourceService.uploadResource(
                file,
                "Embedded Systems Initial",
                "Detailed overview of ARM Cortex microcontrollers",
                "Embedded Systems",
                "Electrical Engineering",
                5,
                "Lab Manual",
                "ARM, Microcontroller, C"
        );

        Long resourceId = uploaded.getId();

        // Send request with ONLY title
        ResourceRequest titleOnlyReq = new ResourceRequest();
        titleOnlyReq.setTitle("Embedded Systems Advanced Handout");

        AcademicResourceResponse result = resourceService.updateResource(resourceId, titleOnlyReq);

        // Verify none of the omitted fields became null in the DB
        assertEquals("Embedded Systems Advanced Handout", result.getTitle());
        assertEquals("Detailed overview of ARM Cortex microcontrollers", result.getDescription());
        assertEquals("Embedded Systems", result.getSubject());
        assertEquals("Electrical Engineering", result.getDepartment());
        assertEquals(5, result.getSemester());
        assertEquals("Lab Manual", result.getResourceType());
        assertEquals("ARM, Microcontroller, C", result.getTags());
        assertNotNull(result.getFileUrl());
        assertEquals("embedded_systems.pdf", result.getFileName());
    }

    @Test
    @Transactional
    @DisplayName("TEST 13: Non-Owner Faculty Cannot Edit Resource -> 403 Forbidden")
    void test13_nonOwnerFacultyCannotEdit() {
        // Faculty 1 uploads
        authenticateAs("faculty@campushub.edu");
        MockMultipartFile file = new MockMultipartFile("file", "f1.pdf", "application/pdf", "data".getBytes());
        AcademicResourceResponse uploaded = resourceService.uploadResource(
                file, "Faculty 1 Resource", "Desc", "Sub", "CSE", 3, "Notes", "Tag"
        );

        // Faculty 2 tries to edit
        authenticateAs("faculty2@campushub.edu");
        ResourceRequest req = ResourceRequest.builder().title("Hacked Title").build();
        assertThrows(ForbiddenException.class, () -> resourceService.updateResource(uploaded.getId(), req));
    }
}
