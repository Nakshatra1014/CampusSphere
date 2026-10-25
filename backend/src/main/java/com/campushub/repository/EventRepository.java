package com.campushub.repository;

import com.campushub.entity.Event;
import com.campushub.entity.Event.EventStatus;
import com.campushub.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(EventStatus status);
    List<Event> findByStatusOrderByEventDateAscStartTimeAsc(EventStatus status);
    List<Event> findByOrganizerOrderByCreatedAtDesc(User organizer);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT e FROM Event e WHERE e.status = :status AND " +
           "(:category IS NULL OR LOWER(e.category) = LOWER(:category)) AND " +
           "(:query IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.venue) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:fromDate IS NULL OR e.eventDate >= :fromDate) " +
           "ORDER BY e.eventDate ASC, e.startTime ASC")
    List<Event> searchApprovedEvents(
            @Param("status") EventStatus status,
            @Param("category") String category,
            @Param("query") String query,
            @Param("fromDate") LocalDate fromDate
    );

    long countByStatus(EventStatus status);
}
