package com.healthcare.notification.config;

import com.twilio.Twilio;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
@Slf4j
public class TwilioConfig {

	@Value("${twilio.account-sid}")
	private String accountSid;

	@Value("${twilio.auth-token}")
	private String authToken;

	@Value("${twilio.phone-number}")
	private String twilioPhoneNumber;

	@PostConstruct
	public void initTwilio() {
		try {
			Twilio.init(accountSid, authToken);
			log.info("Twilio initialized successfully with account: {}", accountSid);
		} catch (Exception e) {
			log.error("Failed to initialize Twilio", e);
		}
	}

	public String getAccountSid() {
		return accountSid;
	}

	public String getAuthToken() {
		return authToken;
	}

	public String getTwilioPhoneNumber() {
		return twilioPhoneNumber;
	}

}
