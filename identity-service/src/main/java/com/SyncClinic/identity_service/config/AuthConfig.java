package com.SyncClinic.identity_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class AuthConfig {

    // 1. Tell Spring Security to use BCrypt for hashing passwords
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2. Configure our endpoint security
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable()) // Disable CSRF since we will use JWTs later
                .authorizeHttpRequests(auth -> auth
                        // Allow ANYONE to access the register and login endpoints
                        .requestMatchers("/auth/register", "/auth/login").permitAll()
                        // Require a token for everything else
                        .anyRequest().authenticated()
                )
                .build();
    }

}
