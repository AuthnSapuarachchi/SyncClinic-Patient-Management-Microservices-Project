package com.SyncClinic.identity_service.controller;

import com.SyncClinic.identity_service.dto.AuthRequest;
import com.SyncClinic.identity_service.entity.UserCredentials;
import com.SyncClinic.identity_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public Map<String, String> addNewUser(@RequestBody UserCredentials user) {
        return service.saveUser(user);
    }

    @PostMapping("/login")
    public Map<String, String> getToken(@RequestBody AuthRequest authRequest) {
        // 1. THE BOUNCER: Check the email and password against the database
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        // 2. THE ID PRINTER: Only generate the token IF the bouncer approves
        if (authenticate.isAuthenticated()) {

            String token = service.generateToken(authRequest);

            return Map.of("token", token);
        } else {
            throw new RuntimeException("Invalid login credentials!");
        }
    }

}
