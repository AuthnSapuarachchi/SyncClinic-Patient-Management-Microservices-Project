package com.SyncClinic.identity_service.service;

import com.SyncClinic.identity_service.entity.UserCredentials;
import com.SyncClinic.identity_service.repository.UserCredentialsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserCredentialsRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String saveUser(UserCredentials credential) {
        // Hash the plain-text password before saving it
        credential.setPassword(passwordEncoder.encode(credential.getPassword()));

        // Save the user to the database
        repository.save(credential);

        return "User successfully registered to SyncClinic!";
    }

}
