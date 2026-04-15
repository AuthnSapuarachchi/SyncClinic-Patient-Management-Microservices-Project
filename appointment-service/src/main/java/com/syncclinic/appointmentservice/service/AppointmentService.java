package com.syncclinic.appointmentservice.service;

import com.syncclinic.appointmentservice.dto.DoctorAvailabilityDto;
import java.time.DayOfWeek;
import java.time.LocalTime;

import com.syncclinic.appointmentservice.model.Appointment;
import com.syncclinic.appointmentservice.model.AppointmentStatus;
import com.syncclinic.appointmentservice.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

// import statements for appointment status history
import com.syncclinic.appointmentservice.model.AppointmentStatusHistory;
import com.syncclinic.appointmentservice.repository.AppointmentStatusHistoryRepository;
import java.time.LocalDateTime;

//DTO imports
import com.syncclinic.appointmentservice.dto.DoctorDto;

import java.util.List;

// Service layer for appointment operations
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    // Repository for appointment status history
    private final AppointmentStatusHistoryRepository statusHistoryRepository;

    // Client service to communicate with Doctor Service
    private final DoctorClientService doctorClientService;

    // Constructor injection for repositories
   public AppointmentService(
            AppointmentRepository appointmentRepository,
            AppointmentStatusHistoryRepository statusHistoryRepository,
            DoctorClientService doctorClientService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.doctorClientService = doctorClientService;
    }

    // Create a new appointment
    public Appointment createAppointment(Appointment appointment) {

        // Check whether doctor exists in Doctor Service
        DoctorDto doctor = doctorClientService.getDoctorById(appointment.getDoctorId());

        if (doctor == null) {
            throw new RuntimeException("Doctor not found with ID: " + appointment.getDoctorId());
        }

        // Check whether doctor is verified
        if (!"VERIFIED".equalsIgnoreCase(doctor.getStatus())) {
            throw new RuntimeException(
                    "Doctor is not verified for appointments. Current status: " + doctor.getStatus()
            );
        }

        // Get doctor availability records
    DoctorAvailabilityDto[] availabilityList =
            doctorClientService.getDoctorAvailability(appointment.getDoctorId());

    // Get appointment day name such as MONDAY
    String appointmentDay =
            appointment.getAppointmentDate().getDayOfWeek().name();

    // Check whether doctor is available on the selected day and time
    boolean isAvailable = false;

    for (DoctorAvailabilityDto availability : availabilityList) {

        if (availability.getDayOfWeek().equalsIgnoreCase(appointmentDay)) {

            LocalTime startTime = LocalTime.parse(availability.getStartTime());
            LocalTime endTime = LocalTime.parse(availability.getEndTime());
            LocalTime appointmentTime = appointment.getAppointmentTime();

            if (!appointmentTime.isBefore(startTime)
                    && !appointmentTime.isAfter(endTime)) {

                isAvailable = true;
                break;
            }
        }
    }

    // Reject appointment if doctor is unavailable
    if (!isAvailable) {
        throw new RuntimeException(
                "Doctor is not available on " + appointmentDay +
                " at " + appointment.getAppointmentTime()
        );
    }

    boolean alreadyBooked =
        appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                appointment.getDoctorId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime()
        );

    if (alreadyBooked) {
        throw new RuntimeException(
            "Doctor already has an appointment at this date and time"
    );
}

        // Default appointment status when booking
        appointment.setStatus(AppointmentStatus.PENDING);

        return appointmentRepository.save(appointment);
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

        // Store previous status before updating
        AppointmentStatus oldStatus = appointment.getStatus();

        appointment.setStatus(status);

        // Save updated appointment
        appointment = appointmentRepository.save(appointment);

        // Save appointment status change history
        AppointmentStatusHistory history = AppointmentStatusHistory.builder()
                .appointment(appointment)
                .oldStatus(oldStatus)
                .newStatus(status)
                .changedAt(LocalDateTime.now())
                .build();

        statusHistoryRepository.save(history);

        return appointment;
    }

    // Get all status history records for all appointments
    public List<AppointmentStatusHistory> getAllStatusHistory() {
        return statusHistoryRepository.findAll();
    }

    // Cancel an appointment
    public Appointment cancelAppointment(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Appointment not found with ID: " + appointmentId
                ));

        // Store previous status
        AppointmentStatus oldStatus = appointment.getStatus();

        // Update status to cancelled
        appointment.setStatus(AppointmentStatus.CANCELLED);

        // Save appointment
        appointment = appointmentRepository.save(appointment);

        // Save history record
        AppointmentStatusHistory history = AppointmentStatusHistory.builder()
                .appointment(appointment)
                .oldStatus(oldStatus)
                .newStatus(AppointmentStatus.CANCELLED)
                .changedAt(LocalDateTime.now())
                .build();

        statusHistoryRepository.save(history);

        return appointment;
    }

    // Get appointments for a doctor filtered by status
    public List<Appointment> getAppointmentsByDoctorAndStatus(
            Long doctorId,
            AppointmentStatus status
    ) {
        return appointmentRepository.findByDoctorIdAndStatus(doctorId, status);
    }

    // Get appointments for a patient filtered by status
    public List<Appointment> getAppointmentsByPatientAndStatus(
            Long patientId,
            AppointmentStatus status
    ) {
        return appointmentRepository.findByPatientIdAndStatus(patientId, status);
    }
}