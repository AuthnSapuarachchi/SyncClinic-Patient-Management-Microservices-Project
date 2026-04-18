package com.SyncClinic.identity_service.service;

import com.SyncClinic.identity_service.dto.AuthRequest;
import com.SyncClinic.identity_service.entity.Role;
import com.SyncClinic.identity_service.entity.UserCredentials;
import com.SyncClinic.identity_service.repository.UserCredentialsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserCredentialsRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public Map<String, Object> saveUser(UserCredentials credential) {
        // 1. Default to PATIENT if no role is provided
        if (credential.getRole() == null) {
            credential.setRole(Role.ROLE_PATIENT);
        }

        credential.setPassword(passwordEncoder.encode(credential.getPassword()));
        UserCredentials savedUser = repository.save(credential);

        // Kafka event
        String eventMessage = String.format("{\"email\": \"%s\"}", savedUser.getEmail());
        kafkaTemplate.send("user-registration-events", eventMessage);

        String token = jwtService.generateToken(savedUser.getEmail());

        return Map.of(
                "message", "User successfully registered!",
                "token", token,
                "role", savedUser.getRole().name() // Send the string name of the enum
        );
    }

    public Map<String, Object> login(AuthRequest authRequest) {
        // 1. Authenticate
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        // 2. Fetch User to get the Role
        UserCredentials user = repository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Generate Token
        String token = jwtService.generateToken(authRequest.getEmail());

        // 4. Pack it all up for the Controller
        return Map.of(
                "token", token,
                "role", user.getRole().name(), // .name() converts Enum to "ADMIN"
                "email", user.getEmail()
        );
    }

    public String generateToken(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(authRequest.getEmail());
        }

        throw new UsernameNotFoundException("Invalid user request");
    }

}
