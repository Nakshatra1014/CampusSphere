package com.campushub.repository;

import com.campushub.entity.MarketplaceItem;
import com.campushub.entity.MarketplaceItem.ItemCondition;
import com.campushub.entity.MarketplaceItem.ItemStatus;
import com.campushub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MarketplaceItemRepository extends JpaRepository<MarketplaceItem, Long> {
    List<MarketplaceItem> findBySellerOrderByCreatedAtDesc(User seller);
    List<MarketplaceItem> findByStatusOrderByCreatedAtDesc(ItemStatus status);

    @Query("SELECT m FROM MarketplaceItem m WHERE " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:category IS NULL OR LOWER(m.category) = LOWER(:category)) AND " +
           "(:condition IS NULL OR m.itemCondition = :condition) AND " +
           "(:maxPrice IS NULL OR m.price <= :maxPrice) AND " +
           "(:query IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY m.createdAt DESC")
    List<MarketplaceItem> searchItems(
            @Param("status") ItemStatus status,
            @Param("category") String category,
            @Param("condition") ItemCondition condition,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("query") String query
    );
}
