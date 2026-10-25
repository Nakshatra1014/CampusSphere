package com.campushub.dto.marketplace;

import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.MarketplaceItem.ItemCondition;
import com.campushub.entity.MarketplaceItem.ItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceItemResponse {
    private Long id;
    private UserSummaryDto seller;
    private String title;
    private String description;
    private String category;
    private BigDecimal price;
    private ItemCondition itemCondition;
    private String imageUrl;
    private String contactPhone;
    private ItemStatus status;
    private boolean isUserSeller;
    private LocalDateTime createdAt;
}
