package com.campushub.repository;

import com.campushub.entity.Event;
import com.campushub.entity.EventFormField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventFormFieldRepository extends JpaRepository<EventFormField, Long> {
    List<EventFormField> findByEventOrderByFieldOrderAsc(Event event);
    List<EventFormField> findByEventIdOrderByFieldOrderAsc(Long eventId);
    void deleteByEvent(Event event);
}
