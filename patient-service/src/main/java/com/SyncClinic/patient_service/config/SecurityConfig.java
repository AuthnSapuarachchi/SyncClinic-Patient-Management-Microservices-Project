package com.SyncClinic.patient_service.config;

import com.SyncClinic.patient_service.filter.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // 1. MUST DISABLE CSRF for REST APIs!
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Lock down the Patient endpoints
                .authorizeHttpRequests(auth -> auth
                    // Internal service-to-service email lookup used by payment-service
                    .requestMatchers(HttpMethod.GET, "/api/patients/internal/*/email").permitAll()
                        // In the future, you can do things like:
                        // .requestMatchers("/api/patients/delete").hasRole("ADMIN")

                        // For now, require ANY valid authentication for the patient routes
                        .requestMatchers("/api/patients/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // We don't need a login form because the Gateway handles the tokens!
                .build();
    }

}
