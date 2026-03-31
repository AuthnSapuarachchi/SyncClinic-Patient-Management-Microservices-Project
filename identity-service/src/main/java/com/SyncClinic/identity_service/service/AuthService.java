package com.SyncClinic.identity_service.service;

import com.SyncClinic.identity_service.dto.AuthRequest;
import com.SyncClinic.identity_service.entity.UserCredentials;
import com.SyncClinic.identity_service.repository.UserCredentialsRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    public Map<String, String> saveUser(UserCredentials credential) {
        // Hash the plain-text password before saving it
        credential.setPassword(passwordEncoder.encode(credential.getPassword()));

        // Save the user to the database
        UserCredentials savedUser = repository.save(credential);

        String token = jwtService.generateToken(savedUser.getEmail());

        return Map.of(
                "message", "User successfully registered to SyncClinic!",
                "token", token
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
