package com.SyncClinic.identity_service.controller;

import com.SyncClinic.identity_service.entity.UserCredentials;
import com.SyncClinic.identity_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/register")
    public String addNewUser(@RequestBody UserCredentials user) {
        return service.saveUser(user);
    }

}
