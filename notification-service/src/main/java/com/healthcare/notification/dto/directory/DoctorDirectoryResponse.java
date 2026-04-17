package com.healthcare.notification.dto.directory;

import lombok.Data;

@Data
public class DoctorDirectoryResponse {

	private Long id;
	private String fullName;
	private String email;
	private String phone;
	private String specialty;
}