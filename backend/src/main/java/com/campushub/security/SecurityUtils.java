package com.campushub.security;

import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.UnauthorizedException;
import com.campushub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public UserPrincipal getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new UnauthorizedException("Authentication required to perform this action.");
        }
        return (UserPrincipal) authentication.getPrincipal();
    }

    public Long getCurrentUserId() {
        return getCurrentUserPrincipal().getId();
    }

    public User getCurrentUser() {
        Long userId = getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user record not found."));
    }

    public boolean isCurrentUserAdmin() {
        return getCurrentUserPrincipal().getRole() == Role.ROLE_ADMIN;
    }
}
