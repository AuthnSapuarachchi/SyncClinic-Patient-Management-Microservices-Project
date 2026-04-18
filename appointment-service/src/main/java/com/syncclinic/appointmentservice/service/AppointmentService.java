package com.syncclinic.appointmentservice.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.stereotype.Service;

import com.syncclinic.appointmentservice.dto.events.AppointmentBookedEvent;
import com.syncclinic.appointmentservice.dto.events.AppointmentCancelledEvent;
import com.syncclinic.appointmentservice.model.Appointment;
import com.syncclinic.appointmentservice.model.AppointmentStatus;
import com.syncclinic.appointmentservice.model.AppointmentStatusHistory;
import com.syncclinic.appointmentservice.repository.AppointmentRepository;
import com.syncclinic.appointmentservice.repository.AppointmentStatusHistoryRepository;

// Service layer for appointment operations
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentStatusHistoryRepository statusHistoryRepository;
    private final AppointmentEventPublisher eventPublisher;
    private final org.springframework.web.client.RestTemplate restTemplate;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            AppointmentStatusHistoryRepository statusHistoryRepository,
            AppointmentEventPublisher eventPublisher,
            org.springframework.web.client.RestTemplate restTemplate
    ) {
        this.appointmentRepository = appointmentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.eventPublisher = eventPublisher;
        this.restTemplate = restTemplate;
    }

    // Create a new appointment
    public Appointment createAppointment(Appointment appointment) {

        // Default appointment status when booking
        appointment.setStatus(AppointmentStatus.PENDING);

        Appointment saved = appointmentRepository.save(appointment);

        String patientEmail = "patient@syncclinic.com";
        String doctorName = "Dr. Unknown";

        try {
            java.util.Map<String, Object> patient = restTemplate.getForObject("http://syncclinic-patient:8082/api/patients/" + saved.getPatientId(), java.util.Map.class);
            if (patient != null && patient.containsKey("email")) {
                patientEmail = (String) patient.get("email");
            }
        } catch (Exception e) {
            System.err.println("Could not fetch patient info: " + e.getMessage());
        }

        try {
            java.util.Map<String, Object> doctor = restTemplate.getForObject("http://syncclinic-doctor:8083/api/doctors/" + saved.getDoctorId(), java.util.Map.class);
            if (doctor != null && doctor.containsKey("fullName")) {
                doctorName = (String) doctor.get("fullName");
            } else if (doctor != null && doctor.containsKey("name")) {
                doctorName = (String) doctor.get("name");
            }
        } catch (Exception e) {
            System.err.println("Could not fetch doctor info: " + e.getMessage());
        }

        eventPublisher.publishAppointmentBooked(new AppointmentBookedEvent(
                String.valueOf(saved.getId()),
                patientEmail,
                doctorName,
                String.valueOf(saved.getAppointmentDate()),
                String.valueOf(saved.getAppointmentTime())));

        return saved;
    }

    // Get all appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Get appointments by patient ID
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    // Get appointments by doctor ID
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // Update appointment status
    public Appointment updateAppointmentStatus(Long appointmentId, AppointmentStatus status) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Appointment not found with ID: " + appointmentId
                ));

        AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);
        saveHistory(appointment, oldStatus, status);

        if (status == AppointmentStatus.CANCELLED) {
            eventPublisher.publishAppointmentCancelled(new AppointmentCancelledEvent(
                    String.valueOf(appointment.getId()),
                    String.valueOf(appointment.getPatientId()),
                    String.valueOf(appointment.getDoctorId()),
                    appointment.getAppointmentDate(),
                    appointment.getAppointmentTime(),
                    appointment.getReason()));
        }

        return appointment;
    }

    // Cancel an appointment.
    public Appointment cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Appointment not found with ID: " + appointmentId
                ));

        AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);
        saveHistory(appointment, oldStatus, AppointmentStatus.CANCELLED);

        eventPublisher.publishAppointmentCancelled(new AppointmentCancelledEvent(
            String.valueOf(appointment.getId()),
            String.valueOf(appointment.getPatientId()),
            String.valueOf(appointment.getDoctorId()),
            appointment.getAppointmentDate(),
            appointment.getAppointmentTime(),
            appointment.getReason()));

        return appointment;
    }

    // Reschedule by replacing date/time and moving status back to PENDING.
    public Appointment rescheduleAppointment(Long appointmentId, Appointment newAppointmentDetails) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Appointment not found with ID: " + appointmentId
                ));

        appointment.setAppointmentDate(newAppointmentDetails.getAppointmentDate());
        appointment.setAppointmentTime(newAppointmentDetails.getAppointmentTime());

        AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment = appointmentRepository.save(appointment);
        saveHistory(appointment, oldStatus, AppointmentStatus.PENDING);
        return appointment;
    }

    // Get all status history records.
    public List<AppointmentStatusHistory> getAllStatusHistory() {
        return statusHistoryRepository.findAll();
    }

    // Get doctor appointments filtered by status.
    public List<Appointment> getAppointmentsByDoctorAndStatus(Long doctorId, AppointmentStatus status) {
        return appointmentRepository.findByDoctorIdAndStatus(doctorId, status);
    }

    // Get patient appointments filtered by status.
    public List<Appointment> getAppointmentsByPatientAndStatus(Long patientId, AppointmentStatus status) {
        return appointmentRepository.findByPatientIdAndStatus(patientId, status);
    }

    private void saveHistory(Appointment appointment, AppointmentStatus oldStatus, AppointmentStatus newStatus) {
        AppointmentStatusHistory history = AppointmentStatusHistory.builder()
                .appointment(appointment)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedAt(LocalDateTime.now(ZoneOffset.UTC))
                .build();
        statusHistoryRepository.save(history);
    }
}
