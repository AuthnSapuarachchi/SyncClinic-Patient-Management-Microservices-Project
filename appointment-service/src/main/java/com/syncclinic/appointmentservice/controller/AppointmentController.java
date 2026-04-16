package com.syncclinic.appointmentservice.controller;

import com.syncclinic.appointmentservice.model.Appointment;
import com.syncclinic.appointmentservice.model.AppointmentStatus;
import com.syncclinic.appointmentservice.model.AppointmentStatusHistory;
import com.syncclinic.appointmentservice.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.syncclinic.appointmentservice.model.AppointmentStatusHistory;

import java.util.List;

// REST controller for appointment APIs
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // Create a new appointment
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return appointmentService.createAppointment(appointment);
    }

    // Get all appointments
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // Get appointments by patient ID
    @GetMapping("/patient/{patientId}")
    public List<Appointment> getAppointmentsByPatient(@PathVariable Long patientId) {
        return appointmentService.getAppointmentsByPatient(patientId);
    }

    // Get appointments by doctor ID
    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        return appointmentService.getAppointmentsByDoctor(doctorId);
    }

    // Update appointment status
    @PutMapping("/{appointmentId}/status")
    public Appointment updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestParam AppointmentStatus status
    ) {
        return appointmentService.updateAppointmentStatus(appointmentId, status);
    }

    // Get all appointment status history records
    @GetMapping("/history")
    public List<AppointmentStatusHistory> getAllStatusHistory() {
        return appointmentService.getAllStatusHistory();
    }

    // Cancel an appointment
    @PutMapping("/{appointmentId}/cancel")
    public Appointment cancelAppointment(@PathVariable Long appointmentId) {
        return appointmentService.cancelAppointment(appointmentId);
    }

    // Get doctor appointments filtered by status
    @GetMapping("/doctor/{doctorId}/status")
    public List<Appointment> getAppointmentsByDoctorAndStatus(
            @PathVariable Long doctorId,
            @RequestParam AppointmentStatus status
    ) {
        return appointmentService.getAppointmentsByDoctorAndStatus(doctorId, status);
    }

    // Reschedule an appointment
    @PutMapping("/{appointmentId}/reschedule")
    public Appointment rescheduleAppointment(
            @PathVariable Long appointmentId,
            @RequestBody Appointment newAppointmentDetails
    ) {
        return appointmentService.rescheduleAppointment(
                appointmentId,
                newAppointmentDetails
        );
    }

    // Get patient appointments filtered by status
    @GetMapping("/patient/{patientId}/status")
    public List<Appointment> getAppointmentsByPatientAndStatus(
            @PathVariable Long patientId,
            @RequestParam AppointmentStatus status
    ) {
        return appointmentService.getAppointmentsByPatientAndStatus(patientId, status);
    }
}