package com.syncclinic.appointmentservice.dto.events;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentCancelledEvent {

	private String appointmentId;
	private String patientId;
	private String doctorId;
	private LocalDate appointmentDate;
	private LocalTime appointmentTime;
	private String reason;

	public AppointmentCancelledEvent() {
	}

	public AppointmentCancelledEvent(String appointmentId, String patientId, String doctorId,
			LocalDate appointmentDate, LocalTime appointmentTime, String reason) {
		this.appointmentId = appointmentId;
		this.patientId = patientId;
		this.doctorId = doctorId;
		this.appointmentDate = appointmentDate;
		this.appointmentTime = appointmentTime;
		this.reason = reason;
	}

	public String getAppointmentId() {
		return appointmentId;
	}

	public void setAppointmentId(String appointmentId) {
		this.appointmentId = appointmentId;
	}

	public String getPatientId() {
		return patientId;
	}

	public void setPatientId(String patientId) {
		this.patientId = patientId;
	}

	public String getDoctorId() {
		return doctorId;
	}

	public void setDoctorId(String doctorId) {
		this.doctorId = doctorId;
	}

	public LocalDate getAppointmentDate() {
		return appointmentDate;
	}

	public void setAppointmentDate(LocalDate appointmentDate) {
		this.appointmentDate = appointmentDate;
	}

	public LocalTime getAppointmentTime() {
		return appointmentTime;
	}

	public void setAppointmentTime(LocalTime appointmentTime) {
		this.appointmentTime = appointmentTime;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}
}