package com.campushub.dto.user;

import com.campushub.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private String department;
    private String academicYear;
    private String phone;
    private String college;
    private String profileImageUrl;
    private String bio;
    private String skills;
    private boolean active;
    private LocalDateTime createdAt;
}
