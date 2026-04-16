package com.syncclinic.appointmentservice.repository;

import com.syncclinic.appointmentservice.model.AppointmentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Repository interface for appointment status history
@Repository
public interface AppointmentStatusHistoryRepository extends JpaRepository<AppointmentStatusHistory, Long> {

}