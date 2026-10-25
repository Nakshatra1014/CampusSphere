package com.campushub.dto.user;

import com.campushub.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDto {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String department;
    private String academicYear;
    private String phone;
    private String profileImageUrl;
}
