package com.syncclinic.doctorservice.model;

// Enum to track doctor approval status
public enum DoctorStatus {

    // Waiting for admin verification
    PENDING,

    // Doctor is approved and active
    VERIFIED,

    // Doctor registration rejected
    REJECTED
}