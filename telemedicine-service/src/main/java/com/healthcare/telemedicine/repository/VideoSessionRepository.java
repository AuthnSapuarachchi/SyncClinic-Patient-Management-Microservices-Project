package com.healthcare.telemedicine.repository;

import com.healthcare.telemedicine.model.VideoSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoSessionRepository extends MongoRepository<VideoSession, String> {

	Optional<VideoSession> findByAppointmentId(String appointmentId);

	List<VideoSession> findByDoctorId(String doctorId);

	List<VideoSession> findByDoctorIdAndStatus(String doctorId, VideoSession.SessionStatus status);

	List<VideoSession> findByPatientId(String patientId);

	List<VideoSession> findByPatientIdAndStatus(String patientId, VideoSession.SessionStatus status);

	List<VideoSession> findByStatus(VideoSession.SessionStatus status);

}
