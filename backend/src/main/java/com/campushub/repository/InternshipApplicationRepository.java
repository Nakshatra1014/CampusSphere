package com.campushub.repository;

import com.campushub.entity.Internship;
import com.campushub.entity.InternshipApplication;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Long> {
    Optional<InternshipApplication> findByInternshipAndApplicant(Internship internship, User applicant);
    boolean existsByInternshipAndApplicant(Internship internship, User applicant);
    List<InternshipApplication> findByApplicantOrderByAppliedAtDesc(User applicant);
    List<InternshipApplication> findByInternshipOrderByAppliedAtDesc(Internship internship);
    long countByInternship(Internship internship);
}
