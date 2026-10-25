package com.campushub.repository;

import com.campushub.entity.Event;
import com.campushub.entity.EventRegistration;
import com.campushub.entity.EventRegistration.RegistrationStatus;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    Optional<EventRegistration> findByEventAndUser(Event event, User user);
    Optional<EventRegistration> findByEventIdAndUserId(Long eventId, Long userId);
    List<EventRegistration> findByUserOrderByRegisteredAtDesc(User user);
    List<EventRegistration> findByEventOrderByRegisteredAtAsc(Event event);
    List<EventRegistration> findByEventAndStatusOrderByRegisteredAtAsc(Event event, RegistrationStatus status);

    @Query("SELECT COUNT(er) FROM EventRegistration er WHERE er.event = :event AND er.status = :status")
    long countByEventAndStatus(@Param("event") Event event, @Param("status") RegistrationStatus status);

    boolean existsByEventAndUserAndStatus(Event event, User user, RegistrationStatus status);
}
