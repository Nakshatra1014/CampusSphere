package com.campushub.config;

import com.campushub.security.CustomUserDetailsService;
import com.campushub.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/", "/api", "/api/auth/**", "/h2-console/**", "/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                        // Secured user-specific endpoints that might collide with public path patterns
                        .requestMatchers(HttpMethod.GET,
                                "/api/events/my",
                                "/api/events/my-organized",
                                "/api/events/my-registrations",
                                "/api/events/*/participants",
                                "/api/internships/my",
                                "/api/internships/my-posts",
                                "/api/internships/my-applications",
                                "/api/internships/applications/my",
                                "/api/internships/*/applications",
                                "/api/rides/my",
                                "/api/rides/my-rides",
                                "/api/rides/my-bookings",
                                "/api/rides/bookings/my",
                                "/api/resources/my",
                                "/api/resources/my-uploads",
                                "/api/marketplace/my",
                                "/api/marketplace/my-listings",
                                "/api/lost-found/my",
                                "/api/lost-found/my-items",
                                "/api/users/me/**"
                        ).authenticated()

                        // Public GET access for general board exploration
                        .requestMatchers(HttpMethod.GET,
                                "/api/events", "/api/events/{id:[0-9]+}",
                                "/api/internships", "/api/internships/{id:[0-9]+}",
                                "/api/marketplace", "/api/marketplace/{id:[0-9]+}",
                                "/api/resources", "/api/resources/{id:[0-9]+}",
                                "/api/rides", "/api/rides/{id:[0-9]+}",
                                "/api/lost-found", "/api/lost-found/{id:[0-9]+}",
                                "/api/roommates", "/api/roommates/{id:[0-9]+}",
                                "/api/teams", "/api/teams/{id:[0-9]+}",
                                "/api/community/**"
                        ).permitAll()

                        // Role-specific endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/internships/sync/trigger").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/internships/sync/status").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/resources/**").hasAnyRole("FACULTY", "ADMIN")

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // Required for H2 Console frame display
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
