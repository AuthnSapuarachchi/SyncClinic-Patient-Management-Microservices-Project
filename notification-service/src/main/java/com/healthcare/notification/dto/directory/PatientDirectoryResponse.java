package com.healthcare.notification.dto.directory;

import lombok.Data;

@Data
public class PatientDirectoryResponse {

	private Long id;
	private String firstName;
	private String lastName;
	private String email;
	private String phone;

	public String getFullName() {
		StringBuilder builder = new StringBuilder();
		if (firstName != null && !firstName.isBlank()) {
			builder.append(firstName);
		}
		if (lastName != null && !lastName.isBlank()) {
			if (builder.length() > 0) {
				builder.append(' ');
			}
			builder.append(lastName);
		}
		return builder.length() > 0 ? builder.toString() : "Patient";
	}
}