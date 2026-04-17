package com.syncclinic.appointmentservice.service;

import com.syncclinic.appointmentservice.dto.events.AppointmentBookedEvent;
import com.syncclinic.appointmentservice.dto.events.AppointmentCancelledEvent;
import com.syncclinic.appointmentservice.model.Appointment;
import com.syncclinic.appointmentservice.model.AppointmentStatus;
import com.syncclinic.appointmentservice.model.AppointmentStatusHistory;
import com.syncclinic.appointmentservice.repository.AppointmentRepository;
import com.syncclinic.appointmentservice.repository.AppointmentStatusHistoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

// Service layer for appointment operations
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentStatusHistoryRepository statusHistoryRepository;
    private final AppointmentEventPublisher eventPublisher;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            AppointmentStatusHistoryRepository statusHistoryRepository,
            AppointmentEventPublisher eventPublisher
    ) {
        this.appointmentRepository = appointmentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.eventPublisher = eventPublisher;
    }

    // Create a new appointment
    public Appointment createAppointment(Appointment appointment) {

        // Default appointment status when booking
        appointment.setStatus(AppointmentStatus.PENDING);

        Appointment saved = appointmentRepository.save(appointment);
        eventPublisher.publishAppointmentBooked(new AppointmentBookedEvent(
                String.valueOf(saved.getId()),
                String.valueOf(saved.getPatientId()),
                String.valueOf(saved.getDoctorId()),
                saved.getAppointmentDate(),
                saved.getAppointmentTime(),
                saved.getReason()));

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
                .changedAt(LocalDateTime.now())
                .build();
        statusHistoryRepository.save(history);
    }
}
