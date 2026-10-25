package com.campushub.dto.lostfound;

import com.campushub.dto.user.UserSummaryDto;
import com.campushub.entity.LostFoundItem.ItemType;
import com.campushub.entity.LostFoundItem.LostFoundStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostFoundItemResponse {
    private Long id;
    private UserSummaryDto reportedBy;
    private ItemType itemType;
    private String title;
    private String description;
    private String category;
    private String location;
    private LocalDate incidentDate;
    private String imageUrl;
    private String contactInfo;
    private LostFoundStatus status;
    private UserSummaryDto claimedBy;
    private String claimNote;
    private boolean isUserReporter;
    private LocalDateTime createdAt;
}
