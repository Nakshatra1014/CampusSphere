package com.campushub.repository;

import com.campushub.entity.LostFoundItem;
import com.campushub.entity.LostFoundItem.ItemType;
import com.campushub.entity.LostFoundItem.LostFoundStatus;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LostFoundItemRepository extends JpaRepository<LostFoundItem, Long> {
    List<LostFoundItem> findByReportedByOrderByCreatedAtDesc(User reportedBy);
    List<LostFoundItem> findByStatusOrderByCreatedAtDesc(LostFoundStatus status);

    @Query("SELECT l FROM LostFoundItem l WHERE " +
           "(:itemType IS NULL OR l.itemType = :itemType) AND " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:category IS NULL OR LOWER(l.category) = LOWER(:category)) AND " +
           "(:location IS NULL OR LOWER(l.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:fromDate IS NULL OR l.incidentDate >= :fromDate) AND " +
           "(:query IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY l.incidentDate DESC, l.createdAt DESC")
    List<LostFoundItem> searchItems(
            @Param("itemType") ItemType itemType,
            @Param("status") LostFoundStatus status,
            @Param("category") String category,
            @Param("location") String location,
            @Param("fromDate") LocalDate fromDate,
            @Param("query") String query
    );
}
