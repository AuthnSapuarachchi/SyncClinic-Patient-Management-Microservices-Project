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

    // 1. Updated to Map<String, Object> to handle the Enum/String Role
    @PostMapping("/register")
    public Map<String, Object> addNewUser(@RequestBody UserCredentials user) {
        return service.saveUser(user);
    }

    @PostMapping("/login")
    public Map<String, Object> getToken(@RequestBody AuthRequest authRequest) {
        // We moved the AuthenticationManager logic into the service
        // to keep this controller lean and mean.
        return service.login(authRequest);
    }

}
