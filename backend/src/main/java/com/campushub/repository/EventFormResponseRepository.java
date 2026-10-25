package com.campushub.repository;

import com.campushub.entity.EventFormResponse;
import com.campushub.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventFormResponseRepository extends JpaRepository<EventFormResponse, Long> {
    List<EventFormResponse> findByRegistration(EventRegistration registration);
    List<EventFormResponse> findByRegistrationIn(List<EventRegistration> registrations);
    void deleteByRegistration(EventRegistration registration);
}
