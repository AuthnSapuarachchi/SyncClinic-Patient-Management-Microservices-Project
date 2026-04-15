package com.syncclinic.appointmentservice.service;

import com.syncclinic.appointmentservice.dto.DoctorDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

// Service to communicate with Doctor Service
@Service
public class DoctorClientService {

    private final RestTemplate restTemplate;

    public DoctorClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Get doctor details from Doctor Service by ID
    public DoctorDto getDoctorById(Long doctorId) {

        try {
            String doctorServiceUrl = "http://localhost:8082/api/doctors/" + doctorId;

            return restTemplate.getForObject(doctorServiceUrl, DoctorDto.class);

        } catch (HttpClientErrorException.NotFound ex) {
            return null;

        } catch (HttpServerErrorException.InternalServerError ex) {
            return null;
        }
    }
}