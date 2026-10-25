package com.campushub.service;

import com.campushub.dto.auth.AuthRequest;
import com.campushub.dto.auth.AuthResponse;
import com.campushub.dto.auth.RegisterRequest;
import com.campushub.dto.user.UserProfileDto;
import com.campushub.entity.Role;
import com.campushub.entity.User;
import com.campushub.exception.BadRequestException;
import com.campushub.exception.ConflictException;
import com.campushub.repository.UserRepository;
import com.campushub.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ConflictException("An account with email " + request.getEmail() + " already exists.");
        }

        // Prevent registration of ADMIN role directly from public endpoint for security
        Role assignedRole = request.getRole() == Role.ROLE_ADMIN ? Role.ROLE_STUDENT : request.getRole();

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(assignedRole)
                .department(request.getDepartment())
                .academicYear(request.getAcademicYear())
                .phone(request.getPhone())
                .bio(request.getBio())
                .skills(request.getSkills())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Authenticate new user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(userService.mapToProfileDto(savedUser))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadRequestException("User not found."));

        if (!user.isActive()) {
            throw new BadRequestException("Your account is deactivated. Please contact campus admin.");
        }

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(userService.mapToProfileDto(user))
                .build();
    }
}
